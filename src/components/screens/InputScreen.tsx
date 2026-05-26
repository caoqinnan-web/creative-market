"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import {
  ArrowDoodle,
  DotDoodle,
  HeartDoodle,
  SparkleDoodle,
  StarDoodle,
  WaveDoodle,
} from "@/components/doodles";
import {
  EMPTY_ANSWERS,
  QUESTIONS,
  requiredAnswersComplete,
  type AnswerMap,
  type Question,
} from "@/lib/concepts";
import { playUiSound } from "@/lib/sound-effects";

type QuestionCardProps = {
  question: Question;
  index: number;
  value: string;
  focused: boolean;
  onChange: (value: string) => void;
  onFocus: () => void;
  onBlur: () => void;
};

const REQUIRED_QUESTION_COUNT = QUESTIONS.filter((question) => question.required)
  .length;
const OPTIONAL_QUESTION_COUNT = QUESTIONS.length - REQUIRED_QUESTION_COUNT;

function StepTrail() {
  return (
    <div className="step-trail" aria-label="使用步骤">
      {[
        { label: "回答", tone: "#3ECFCF" },
        { label: "摇盒", tone: "#FFD93D" },
        { label: "保存", tone: "#FF8FA4" },
      ].map((step, index) => (
        <div className="step-chip" key={step.label}>
          <span style={{ background: step.tone }}>{index + 1}</span>
          <strong>{step.label}</strong>
        </div>
      ))}
    </div>
  );
}

function QuestionCard({
  question,
  index,
  value,
  focused,
  onChange,
  onFocus,
  onBlur,
}: QuestionCardProps) {
  const textColorOnNum = question.color === "#FFD93D" ? "#7A5C00" : "white";

  return (
    <div className={`q-card${focused ? " focused" : ""}`}>
      <div className="q-head">
        <div
          className="q-num"
          style={{ background: question.color, color: textColorOnNum }}
        >
          {index + 1}
        </div>
        {question.required ? (
          <span className="tag required">必填</span>
        ) : (
          <span className="tag optional">选填</span>
        )}
        {index === 0 && (
          <div style={{ marginLeft: "auto" }}>
            <SparkleDoodle size={16} color="#FFD93D" />
          </div>
        )}
      </div>
      <label className="q-text" htmlFor={question.id}>
        {question.label}
      </label>
      {question.type === "textarea" ? (
        <textarea
          id={question.id}
          rows={question.rows}
          maxLength={question.max}
          placeholder={question.placeholder}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onFocus={onFocus}
          onBlur={onBlur}
        />
      ) : (
        <input
          id={question.id}
          type="text"
          maxLength={question.max}
          placeholder={question.placeholder}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onFocus={onFocus}
          onBlur={onBlur}
        />
      )}
      {value ? (
        <div className="char-count">
          {value.length} / {question.max}
        </div>
      ) : null}
    </div>
  );
}

export function InputScreen({
  initialAnswers,
  disabled = false,
  onSubmit,
}: {
  initialAnswers?: AnswerMap;
  disabled?: boolean;
  onSubmit: (answers: AnswerMap) => void;
}) {
  const [answers, setAnswers] = useState<AnswerMap>(
    initialAnswers ?? EMPTY_ANSWERS,
  );
  const [focusedId, setFocusedId] = useState<string | null>(null);

  const requiredOk = useMemo(() => requiredAnswersComplete(answers), [answers]);
  const filledCount = QUESTIONS.filter((question) =>
    answers[question.id].trim(),
  ).length;
  const requiredFilledCount = QUESTIONS.filter(
    (question) => question.required && answers[question.id].trim(),
  ).length;
  const optionalFilledCount = QUESTIONS.filter(
    (question) => !question.required && answers[question.id].trim(),
  ).length;
  const [optionalOpen, setOptionalOpen] = useState(
    QUESTIONS.some((question) => !question.required && initialAnswers?.[question.id]?.trim()),
  );

  function setAnswer(id: keyof AnswerMap, value: string) {
    setAnswers((previous) => ({ ...previous, [id]: value }));
  }

  return (
    <div className="h5">
      <div className="scroll-body input-body">
        <div className="doodle" style={{ top: 8, left: 18 }}>
          <StarDoodle size={20} color="#FFD93D" rotate={-15} />
        </div>
        <div className="doodle" style={{ top: 26, right: 18 }}>
          <SparkleDoodle size={18} color="#FF8FA4" />
        </div>
        <div className="doodle" style={{ top: 86, right: 30 }}>
          <DotDoodle size={6} color="#3ECFCF" />
        </div>
        <div className="doodle" style={{ top: 100, left: 26 }}>
          <DotDoodle size={5} color="#FF8FA4" />
        </div>
        <div className="doodle" style={{ top: 132, right: 14 }}>
          <WaveDoodle width={50} color="#3ECFCF" />
        </div>

        <div style={{ padding: "8px 24px 4px" }}>
          <div className="market-badge">
            <span>成长市集</span>
            <DotDoodle size={5} color="#FF8FA4" />
            <strong>2 分钟生成摊位灵感</strong>
          </div>
          <div className="hero-row">
            <div className="hero-copy">
              <h1 className="page-title">
                打开「我」的
                <br />
                <span style={{ position: "relative", display: "inline-block" }}>
                  创意盲盒
                  <svg
                    width="118"
                    height="10"
                    viewBox="0 0 118 10"
                    style={{ position: "absolute", left: 0, bottom: -4 }}
                    aria-hidden="true"
                  >
                    <path
                      d="M2 6 Q 20 1, 40 5 T 78 5 T 116 5"
                      stroke="#FFD93D"
                      strokeWidth="5"
                      fill="none"
                      strokeLinecap="round"
                      opacity="0.7"
                    />
                  </svg>
                </span>
                <span style={{ display: "inline-block", marginLeft: 6 }}>
                  <SparkleDoodle size={22} color="#FF8FA4" />
                </span>
              </h1>
              <p className="page-sub">
                回答几个小问题，帮你生成{" "}
                <b style={{ color: "var(--teal-deep)" }}>5 个</b>{" "}
                属于你的摊位灵感
              </p>
            </div>
            <div className="hero-sticker">
              <Image
                src="/images/creative-box-hero.png"
                alt="打开的创意盲盒"
                width={128}
                height={128}
                priority
              />
            </div>
          </div>
          <StepTrail />
        </div>

        <div className="progress-chips">
          <span>
            必填 {requiredFilledCount}/{REQUIRED_QUESTION_COUNT} · 已填 {filledCount}/5
          </span>
          <div className="progress-bars">
            {QUESTIONS.map((question) => {
              const done = answers[question.id].trim().length > 0;
              return (
                <div
                  key={question.id}
                  style={{
                    background: done ? question.color : "#E7EAF0",
                  }}
                />
              );
            })}
          </div>
        </div>

        <div className="question-stack">
          {QUESTIONS.filter((question) => question.required).map((question, index) => (
            <QuestionCard
              key={question.id}
              question={question}
              index={index}
              value={answers[question.id]}
              onChange={(value) => setAnswer(question.id, value)}
              focused={focusedId === question.id}
              onFocus={() => setFocusedId(question.id)}
              onBlur={() => setFocusedId(null)}
            />
          ))}

          <section className={`optional-block${optionalOpen ? " open" : ""}`}>
            <button
              className="optional-toggle"
              type="button"
              onClick={() => {
                playUiSound("select");
                setOptionalOpen((current) => !current);
              }}
              aria-expanded={optionalOpen}
            >
              <span>
                <strong>补充选填问题</strong>
                <em>
                  已补充 {optionalFilledCount}/{OPTIONAL_QUESTION_COUNT} · 让灵感更像你
                </em>
              </span>
              <span className="toggle-arrow">
                <ArrowDoodle size={16} color="#2BB5B5" />
              </span>
            </button>

            {optionalOpen ? (
              <div className="optional-stack">
                {QUESTIONS.filter((question) => !question.required).map(
                  (question, optionalIndex) => (
                    <QuestionCard
                      key={question.id}
                      question={question}
                      index={optionalIndex + REQUIRED_QUESTION_COUNT}
                      value={answers[question.id]}
                      onChange={(value) => setAnswer(question.id, value)}
                      focused={focusedId === question.id}
                      onFocus={() => setFocusedId(question.id)}
                      onBlur={() => setFocusedId(null)}
                    />
                  ),
                )}
              </div>
            ) : null}
          </section>
        </div>

        <div className="input-bottom-space" style={{ position: "relative" }}>
          <div className="doodle" style={{ top: -2, left: 36 }}>
            <StarDoodle size={16} color="#FFD93D" rotate={20} />
          </div>
          <div className="doodle" style={{ top: 6, right: 30 }}>
            <SparkleDoodle size={14} color="#FF8FA4" />
          </div>
        </div>
      </div>

      <div className="sticky-cta">
        <div className="sticky-cta-inner">
          <div className="sticky-copy">
            {requiredOk ? (
              <>
                {optionalFilledCount === OPTIONAL_QUESTION_COUNT
                  ? "信息很完整"
                  : "建议再补充一点"}
                <span>
                  {optionalFilledCount === OPTIONAL_QUESTION_COUNT
                    ? "可以开启你的创意盲盒"
                    : optionalFilledCount > 0
                      ? `已补充 ${optionalFilledCount}/3，越具体越像你`
                      : "补充物件、实验或隐藏技能会更准"}
                </span>
              </>
            ) : (
              <>
                还差 {REQUIRED_QUESTION_COUNT - requiredFilledCount} 个必填
                <span>完成前 2 题就能摇盲盒</span>
              </>
            )}
          </div>
          <button
            className="cta-primary"
            disabled={!requiredOk || disabled}
            onClick={() => {
              playUiSound("open");
              onSubmit(answers);
            }}
          >
            开启盲盒
            <span style={{ marginLeft: 2, display: "inline-flex" }}>
              <SparkleDoodle size={18} color={requiredOk ? "#FFD93D" : "#fff"} />
            </span>
          </button>
        </div>
        <div className="input-footnote">
          {requiredOk ? (
            <>
              结果是灵感草稿，不是最终方案 <HeartDoodle size={11} color="#FF8FA4" />
            </>
          ) : (
            "必填信息越具体，创意越容易落地"
          )}
        </div>
      </div>
    </div>
  );
}
