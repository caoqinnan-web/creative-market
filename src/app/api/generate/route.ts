import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

const DEEPSEEK_API_URL = "https://api.deepseek.com/chat/completions";
const DEEPSEEK_MODEL = "deepseek-v4-pro";
const EXPECTED_ANSWER_COUNT = 5;
const encoder = new TextEncoder();

const ANSWER_LABELS = [
  "想到要在成长市集展示自己，脑子里第一个冒出来的是什么",
  "希望给路过的伙伴带来什么微小的体验或礼物",
  "代表自己或作为摊位核心道具的具体物件",
  "一直想做但还没做的人生实验",
  "抛开专业技能的隐藏技能点",
];

const SYSTEM_PROMPT = `
你是“2026 美的星成长市集”的摊主创意共创助手。你要根据用户提交的 5 个回答，生成 5 个真正贴合用户本人的成长市集互动摊位概念。

活动背景：
1. 场景是美的集团迎接 26 届美的星新人的成长市集。
2. 新人报名成为摊主，用摊位做自我展示、创意表达、社交互动和成长故事分享。
3. 成长市集强调这是属于新人的舞台，不需要很厉害，但需要认真、有内容、有互动、有人能带走点什么。
4. 鼓励方向包括交友破冰、手作文创、兴趣爱好、理念表达、互动体验、全球或跨文化分享。
5. 现场也有 NPC 角色，但你生成的是摊主概念。

隐性约束：
1. 每个概念必须能在 2.5m x 2.5m 的摊位空间内落地。
2. 每个概念的物料预算必须控制在 300 元人民币以内。
3. 单次互动时长应在 1-15 分钟内，适合高流量市集场景。
4. 避免只能服务少数人的深度一对一形式。
5. 避免依赖极度安静的场域。
6. 不涉及食品或饮料。
7. 概念必须和用户输入真实相关，不能给通用模板。
8. 底层精神是：没有对错、实验心态、从我出发。
9. 团队人数默认不超过 8 人，可假设有创意伙伴和导师陪练，但不能依赖复杂设备。
10. 摊位不能是纯展示墙，必须让路过的人可以马上参与。
11. 提供的创意概念旨在给摊主启发性，而不是完全代替摊主思考完整版方案。

生成风格：
- 每个概念必须是可现场落地的小型互动摊位，不是抽象口号、课程、讲座或心理咨询。
- 优先写清楚摊位怎么摆、路人做什么动作、现场留下什么痕迹或交换什么。
- core_interaction 要像“你的实验设定”，必须包含具体道具、路人动作和互动结果。
- why_you 必须解释这个概念为什么来自用户的回答，不能只写“符合你的兴趣”。
- takeaway 要像“他人带走的礼物”，可以是纸条、贴纸、一句话、一次共鸣、一个小任务或一个新连接。
- 可以有轻微幽默和市集感，但不要油腻、空泛、鸡汤或企业宣传腔。

输出要求：
- 只输出合法 JSON，不要输出 Markdown，不要解释。
- 顶层必须是一个 JSON 对象，且只包含 concepts 字段。
- concepts 必须正好包含 5 个概念。
- 所有字段都只写一句话，不要编号，不要使用 Markdown。
- 每个概念必须包含以下字段：
  - concept_name：概念命名，4-12 个汉字，不要带“概念1”
  - one_liner：一句话概念，30 个汉字以内
  - core_interaction：核心互动，60 个汉字以内
  - why_you：为什么是「你」，绝不超过 30 个汉字
  - takeaway：他人带走的礼物，绝不超过 30 个汉字
`.trim();

type DeepSeekStreamChunk = {
  choices?: Array<{
    delta?: {
      content?: string;
    };
    finish_reason?: string | null;
  }>;
};

function parseDeepSeekChunk(raw: string): DeepSeekStreamChunk | null {
  try {
    return JSON.parse(raw) as DeepSeekStreamChunk;
  } catch {
    return null;
  }
}

function parseAnswers(payload: unknown): string[] | null {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const answers = (payload as { answers?: unknown }).answers;

  if (!Array.isArray(answers) || answers.length !== EXPECTED_ANSWER_COUNT) {
    return null;
  }

  const cleanedAnswers = answers.map((answer) =>
    typeof answer === "string" ? answer.trim() : "",
  );

  if (cleanedAnswers.some((answer) => answer.length === 0)) {
    return null;
  }

  return cleanedAnswers;
}

function encodeSse(event: string, data: unknown): Uint8Array {
  return encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
}

function buildUserPrompt(answers: string[]): string {
  return `
用户的 5 个回答如下，请只基于这些信息生成概念，不要忽略未填写以外的任何回答：

${answers
  .map((answer, index) => `${index + 1}. ${ANSWER_LABELS[index]}：${answer}`)
  .join("\n")}
`.trim();
}

export async function POST(request: Request) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body. Expected { answers: string[] }." },
      { status: 400 },
    );
  }

  const answers = parseAnswers(payload);

  if (!answers) {
    return NextResponse.json(
      { error: "Expected exactly 5 non-empty answers." },
      { status: 400 },
    );
  }

  const apiKey = process.env.DEEPSEEK_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "Missing DEEPSEEK_API_KEY environment variable." },
      { status: 500 },
    );
  }

  let deepSeekResponse: Response;

  try {
    deepSeekResponse = await fetch(DEEPSEEK_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: DEEPSEEK_MODEL,
        stream: true,
        messages: [
          {
            role: "system",
            content: SYSTEM_PROMPT,
          },
          {
            role: "user",
            content: buildUserPrompt(answers),
          },
        ],
        response_format: {
          type: "json_object",
        },
        temperature: 0.7,
        max_tokens: 2400,
      }),
    });
  } catch {
    return NextResponse.json(
      { error: "Generation API request failed." },
      { status: 502 },
    );
  }

  if (!deepSeekResponse.ok || !deepSeekResponse.body) {
    return NextResponse.json(
      { error: "Generation API request failed." },
      { status: 502 },
    );
  }

  const reader = deepSeekResponse.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let hasSentDone = false;

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        while (true) {
          const { done, value } = await reader.read();

          if (done) {
            break;
          }

          buffer += decoder.decode(value, { stream: true });
          const events = buffer.split("\n\n");
          buffer = events.pop() ?? "";

          for (const event of events) {
            const dataLines = event
              .split("\n")
              .filter((line) => line.startsWith("data:"))
              .map((line) => line.replace(/^data:\s*/, "").trim());

            for (const dataLine of dataLines) {
              if (!dataLine) {
                continue;
              }

              if (dataLine === "[DONE]") {
                hasSentDone = true;
                controller.enqueue(encodeSse("done", { done: true }));
                continue;
              }

              const chunk = parseDeepSeekChunk(dataLine);

              if (!chunk) {
                continue;
              }

              const choice = chunk.choices?.[0];
              const content = choice?.delta?.content;

              if (content) {
                controller.enqueue(encodeSse("chunk", { content }));
              }

              if (choice?.finish_reason === "length") {
                controller.enqueue(
                  encodeSse("error", {
                    error: "Generation response reached token limit.",
                  }),
                );
              }
            }
          }
        }

        if (!hasSentDone) {
          controller.enqueue(
            encodeSse("error", {
              error: "Generation stream ended before completion.",
            }),
          );
        }
      } catch {
        controller.enqueue(
          encodeSse("error", { error: "Generation stream interrupted." }),
        );
      } finally {
        controller.close();
        reader.releaseLock();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
