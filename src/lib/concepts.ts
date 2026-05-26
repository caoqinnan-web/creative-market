export type QuestionId = "q1" | "q2" | "q3" | "q4" | "q5";

export type Question = {
  id: QuestionId;
  required: boolean;
  color: string;
  label: string;
  placeholder: string;
  type: "textarea" | "text";
  rows?: number;
  max: number;
};

export type AnswerMap = Record<QuestionId, string>;

export type ApiConcept = {
  concept_name: string;
  one_liner: string;
  core_interaction: string;
  why_you: string;
  takeaway: string;
};

export type Concept = ApiConcept & {
  accent: string;
  icon: ConceptIconKey;
};

export type ConceptIconKey = "seed" | "spark" | "flask" | "sound" | "letter";

export const QUESTIONS: Question[] = [
  {
    id: "q1",
    required: true,
    color: "#3ECFCF",
    label: "想到要在成长市集展示自己，你脑子里第一个冒出来的是什么？",
    placeholder: "一个爱好、一项技能、一段故事……关键词也可以",
    type: "textarea",
    rows: 3,
    max: 120,
  },
  {
    id: "q2",
    required: true,
    color: "#FFD93D",
    label: "在这个入职夜，你希望给路过的伙伴带来什么微小的体验或礼物？",
    placeholder: "不用很宏大，比如“想让大家放松”",
    type: "textarea",
    rows: 3,
    max: 120,
  },
  {
    id: "q3",
    required: false,
    color: "#FF8FA4",
    label: "如果用一个具体的“物件”来代表你，或者作为摊位的核心道具，它会是什么？",
    placeholder: "一块吸水海绵、一把旧吉他……可以很奇怪",
    type: "text",
    max: 40,
  },
  {
    id: "q4",
    required: false,
    color: "#3ECFCF",
    label: "你有没有一个一直想做、但还没做的「人生实验」？",
    placeholder: "哪怕很小、很荒诞、不确定结果",
    type: "textarea",
    rows: 3,
    max: 120,
  },
  {
    id: "q5",
    required: false,
    color: "#FFD93D",
    label: "抛开专业技能，你有什么奇奇怪怪的「隐藏技能点」？",
    placeholder: "比如：很会记歌词、极度擅长倾听",
    type: "text",
    max: 40,
  },
];

export const EMPTY_ANSWERS = QUESTIONS.reduce((acc, question) => {
  acc[question.id] = "";
  return acc;
}, {} as AnswerMap);

const ACCENTS = ["#3ECFCF", "#FFD93D", "#FF8FA4", "#3ECFCF", "#FFD93D"];
const ICONS: ConceptIconKey[] = ["seed", "spark", "flask", "sound", "letter"];

export function serializeAnswers(answers: AnswerMap): string[] {
  return QUESTIONS.map((question) => {
    const value = answers[question.id].trim();
    return value || "（用户未填写）";
  });
}

export function requiredAnswersComplete(answers: AnswerMap): boolean {
  return QUESTIONS.filter((question) => question.required).every(
    (question) => answers[question.id].trim().length > 0,
  );
}

function readString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function normalizeConcept(raw: unknown, index: number): Concept | null {
  if (!raw || typeof raw !== "object") {
    return null;
  }

  const item = raw as Record<string, unknown>;
  const conceptName = readString(item.concept_name) ?? readString(item.name);
  const oneLiner = readString(item.one_liner) ?? readString(item.tagline);
  const coreInteraction =
    readString(item.core_interaction) ?? readString(item.interaction);
  const whyYou = readString(item.why_you) ?? readString(item.why);
  const takeaway = readString(item.takeaway) ?? readString(item.gift);

  if (!conceptName || !oneLiner || !coreInteraction || !whyYou || !takeaway) {
    return null;
  }

  return {
    concept_name: conceptName,
    one_liner: oneLiner,
    core_interaction: coreInteraction,
    why_you: whyYou,
    takeaway,
    accent: ACCENTS[index % ACCENTS.length],
    icon: ICONS[index % ICONS.length],
  };
}

function normalizeConceptList(value: unknown): Concept[] | null {
  if (!Array.isArray(value)) {
    return null;
  }

  const concepts = value
    .map((concept, index) => normalizeConcept(concept, index))
    .filter((concept): concept is Concept => Boolean(concept))
    .slice(0, 5);

  return concepts.length > 0 ? concepts : null;
}

function parseConceptPayload(rawText: string): Concept[] | null {
  try {
    const parsed = JSON.parse(rawText) as { concepts?: unknown };
    return normalizeConceptList(parsed.concepts);
  } catch {
    return null;
  }
}

function stripJsonFences(rawText: string): string {
  return rawText
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
}

function extractBalancedJsonObject(rawText: string): string | null {
  const conceptsKeyIndex = rawText.indexOf('"concepts"');
  const searchStart = conceptsKeyIndex === -1 ? 0 : conceptsKeyIndex;
  const objectStart = rawText.lastIndexOf("{", searchStart);

  if (objectStart === -1) {
    return null;
  }

  let depth = 0;
  let inString = false;
  let escaping = false;

  for (let index = objectStart; index < rawText.length; index += 1) {
    const char = rawText[index];

    if (inString) {
      if (escaping) {
        escaping = false;
      } else if (char === "\\") {
        escaping = true;
      } else if (char === '"') {
        inString = false;
      }
      continue;
    }

    if (char === '"') {
      inString = true;
      continue;
    }

    if (char === "{") {
      depth += 1;
      continue;
    }

    if (char === "}") {
      depth -= 1;

      if (depth === 0) {
        return rawText.slice(objectStart, index + 1);
      }
    }
  }

  return null;
}

export function parseCompleteConcepts(rawText: string): Concept[] | null {
  const cleanedText = stripJsonFences(rawText);

  const direct = parseConceptPayload(cleanedText);
  if (direct) {
    return direct;
  }

  const extracted = extractBalancedJsonObject(cleanedText);
  const extractedConcepts = extracted ? parseConceptPayload(extracted) : null;
  if (extractedConcepts) {
    return extractedConcepts;
  }

  const partialConcepts = parsePartialConcepts(cleanedText);
  return partialConcepts.length === 5 ? partialConcepts : null;
}

export function parsePartialConcepts(rawText: string): Concept[] {
  const complete = parseConceptPayload(stripJsonFences(rawText));

  if (complete) {
    return complete;
  }

  const conceptsKeyIndex = rawText.indexOf('"concepts"');

  if (conceptsKeyIndex === -1) {
    return [];
  }

  const arrayStartIndex = rawText.indexOf("[", conceptsKeyIndex);

  if (arrayStartIndex === -1) {
    return [];
  }

  const objects: unknown[] = [];
  let depth = 0;
  let objectStart = -1;
  let inString = false;
  let escaping = false;

  for (let index = arrayStartIndex + 1; index < rawText.length; index += 1) {
    const char = rawText[index];

    if (inString) {
      if (escaping) {
        escaping = false;
      } else if (char === "\\") {
        escaping = true;
      } else if (char === '"') {
        inString = false;
      }
      continue;
    }

    if (char === '"') {
      inString = true;
      continue;
    }

    if (char === "{") {
      if (depth === 0) {
        objectStart = index;
      }
      depth += 1;
      continue;
    }

    if (char === "}") {
      depth -= 1;

      if (depth === 0 && objectStart !== -1) {
        const objectText = rawText.slice(objectStart, index + 1);

        try {
          objects.push(JSON.parse(objectText));
        } catch {
          return objects
            .map((concept, conceptIndex) =>
              normalizeConcept(concept, conceptIndex),
            )
            .filter((concept): concept is Concept => Boolean(concept))
            .slice(0, 5);
        }

        objectStart = -1;
      }
    }
  }

  return objects
    .map((concept, index) => normalizeConcept(concept, index))
    .filter((concept): concept is Concept => Boolean(concept))
    .slice(0, 5);
}
