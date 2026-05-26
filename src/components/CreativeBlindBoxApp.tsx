"use client";

import { useEffect, useRef, useState } from "react";
import { AnimationScreen } from "@/components/screens/AnimationScreen";
import { InputScreen } from "@/components/screens/InputScreen";
import { ResultScreen } from "@/components/screens/ResultScreen";
import { createInspirationImage } from "@/lib/share-image";
import {
  EMPTY_ANSWERS,
  parseCompleteConcepts,
  parsePartialConcepts,
  serializeAnswers,
  type AnswerMap,
  type Concept,
} from "@/lib/concepts";
import { playUiSound, preloadUiSounds } from "@/lib/sound-effects";

type Stage = "input" | "animation" | "result";

function readSseEvents(buffer: string): {
  remaining: string;
  events: Array<{ event: string; data: string }>;
} {
  const blocks = buffer.split("\n\n");
  const remaining = blocks.pop() ?? "";
  const events = blocks.flatMap((block) => {
    const lines = block.split("\n");
    const eventName =
      lines.find((line) => line.startsWith("event:"))?.replace(/^event:\s*/, "") ??
      "message";
    const data = lines
      .filter((line) => line.startsWith("data:"))
      .map((line) => line.replace(/^data:\s*/, ""))
      .join("\n");

    return data ? [{ event: eventName, data }] : [];
  });

  return { remaining, events };
}

async function parseError(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as { error?: unknown };
    return typeof body.error === "string" ? body.error : "生成失败，请稍后再试。";
  } catch {
    return "生成失败，请稍后再试。";
  }
}

export function CreativeBlindBoxApp() {
  const [stage, setStage] = useState<Stage>("input");
  const [answers, setAnswers] = useState<AnswerMap>(EMPTY_ANSWERS);
  const [concepts, setConcepts] = useState<Concept[]>([]);
  const [rawStream, setRawStream] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [shareImageUrl, setShareImageUrl] = useState<string | null>(null);

  const requestIdRef = useRef(0);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    preloadUiSounds();
  }, []);

  async function generate(nextAnswers: AnswerMap) {
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    abortRef.current?.abort();

    const controller = new AbortController();
    abortRef.current = controller;

    setAnswers(nextAnswers);
    setConcepts([]);
    setRawStream("");
    setError(null);
    setSaveMessage(null);
    setShareImageUrl((currentUrl) => {
      if (currentUrl) {
        URL.revokeObjectURL(currentUrl);
      }
      return null;
    });
    setIsGenerating(true);
    setStage("animation");

    window.setTimeout(() => {
      if (requestIdRef.current === requestId) {
        setStage("result");
      }
    }, 1600);

    let accumulated = "";
    let sseBuffer = "";
    let streamError: string | null = null;

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          answers: serializeAnswers(nextAnswers),
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(await parseError(response));
      }

      if (!response.body) {
        throw new Error("浏览器没有收到可读取的生成流。");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          break;
        }

        sseBuffer += decoder.decode(value, { stream: true });
        const parsed = readSseEvents(sseBuffer);
        sseBuffer = parsed.remaining;

        for (const item of parsed.events) {
          if (item.event === "chunk") {
            const payload = JSON.parse(item.data) as { content?: unknown };
            if (typeof payload.content !== "string") {
              continue;
            }

            accumulated += payload.content;
            setRawStream(accumulated);

            const partialConcepts = parsePartialConcepts(accumulated);
            if (partialConcepts.length > 0) {
              setConcepts(partialConcepts);
            }
          }

          if (item.event === "error") {
            const payload = JSON.parse(item.data) as { error?: unknown };
            streamError =
              typeof payload.error === "string"
                ? payload.error
                : "生成连接中断。";
          }
        }
      }

      const completeConcepts = parseCompleteConcepts(accumulated);
      if (!completeConcepts || completeConcepts.length === 0) {
        throw new Error(streamError ?? "返回内容不是可用的创意结果。");
      }

      setConcepts(completeConcepts);
      playUiSound("reveal");
    } catch (caught) {
      if ((caught as Error).name === "AbortError") {
        return;
      }

      playUiSound("error");
      setError(caught instanceof Error ? caught.message : "生成失败，请稍后再试。");
      setStage("result");
    } finally {
      if (requestIdRef.current === requestId) {
        setIsGenerating(false);
      }
    }
  }

  async function saveInspiration() {
    if (concepts.length === 0) {
      return;
    }

    setIsSaving(true);
    setSaveMessage(null);

    try {
      const blob = await createInspirationImage(concepts);
      const objectUrl = URL.createObjectURL(blob);

      setShareImageUrl((currentUrl) => {
        if (currentUrl) {
          URL.revokeObjectURL(currentUrl);
        }
        return objectUrl;
      });
      setSaveMessage("长图已生成，可长按图片保存。");
      playUiSound("success");
    } catch {
      playUiSound("error");
      setSaveMessage("长图生成失败，可以先使用手机系统截图保存。");
    } finally {
      setIsSaving(false);
    }
  }

  if (stage === "input") {
    return (
      <main className="h5-app-shell">
        <InputScreen
          initialAnswers={answers}
          disabled={isGenerating}
          onSubmit={(nextAnswers) => {
            void generate(nextAnswers);
          }}
        />
      </main>
    );
  }

  if (stage === "animation") {
    return (
      <main className="h5-app-shell">
        <AnimationScreen
          done={!isGenerating}
          message={
            concepts.length > 0
              ? `已生成 ${concepts.length}/5 个创意种子……`
              : "正在为你摇盲盒……"
          }
        />
      </main>
    );
  }

  return (
    <main className="h5-app-shell">
      <ResultScreen
        concepts={concepts}
        loading={isGenerating}
        error={error}
        saving={isSaving}
        saveMessage={saveMessage}
        shareImageUrl={shareImageUrl}
        onBack={() => setStage("input")}
        onCloseShare={() => setShareImageUrl(null)}
        onReroll={() => {
          void generate(answers);
        }}
        onSave={() => {
          void saveInspiration();
        }}
      />
      <span className="sr-only" aria-live="polite">
        {rawStream ? "正在接收创意结果" : ""}
      </span>
    </main>
  );
}
