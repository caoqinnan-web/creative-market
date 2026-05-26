"use client";

import { useEffect, useRef, useState } from "react";
import {
  DotDoodle,
  FlaskDoodle,
  HeartDoodle,
  LetterDoodle,
  SeedDoodle,
  SoundDoodle,
  SparkleDoodle,
  StarDoodle,
} from "@/components/doodles";
import { BoxAnimation } from "@/components/screens/AnimationScreen";
import type { Concept, ConceptIconKey } from "@/lib/concepts";
import { playUiSound } from "@/lib/sound-effects";

function textColorForAccent(accent: string): string {
  return accent === "#FFD93D" ? "#7A5C00" : "white";
}

function ConceptSticker({
  icon,
  accent,
  size = 28,
}: {
  icon: ConceptIconKey;
  accent: string;
  size?: number;
}) {
  const common = { size };

  if (icon === "seed") {
    return <SeedDoodle {...common} color={accent} />;
  }

  if (icon === "flask") {
    return <FlaskDoodle {...common} color={accent} />;
  }

  if (icon === "sound") {
    return <SoundDoodle {...common} color={accent} />;
  }

  if (icon === "letter") {
    return <LetterDoodle {...common} color={accent} />;
  }

  return <SparkleDoodle size={size} color={accent} />;
}

function normalizeGenerationError(error: string): string {
  if (error.includes("token limit")) {
    return "生成内容超出长度限制，已先保留当前结果。";
  }

  if (error.includes("stream") || error.includes("生成流")) {
    return "生成连接中断，已先保留当前结果。";
  }

  if (error.includes("API request failed")) {
    return "生成接口暂时没有响应，请稍后再试。";
  }

  if (error.includes("Missing DEEPSEEK_API_KEY")) {
    return "当前环境还没有配置生成接口，暂时无法生成新结果。";
  }

  return error;
}

export function ConceptCard({
  concept,
  index,
  total,
  compact = false,
}: {
  concept: Concept;
  index: number;
  total: number;
  compact?: boolean;
}) {
  const numText = textColorForAccent(concept.accent);

  return (
    <article className={compact ? "concept-card compact" : "concept-card"}>
      <div
        className="concept-card-corner"
        style={{ background: concept.accent }}
      />

      <div className="concept-card-head">
        <div
          className="concept-num"
          style={{
            background: concept.accent,
            color: numText,
            boxShadow: `0 6px 16px -8px ${concept.accent}`,
          }}
        >
          {index + 1}
        </div>
        <div className="concept-kicker">
          CONCEPT · {String(index + 1).padStart(2, "0")} /{" "}
          {String(total).padStart(2, "0")}
        </div>
        <div className="concept-icon">
          <ConceptSticker icon={concept.icon} accent={concept.accent} />
        </div>
      </div>

      <h2 className="concept-name">{concept.concept_name}</h2>
      <p className="concept-line">{concept.one_liner}</p>

      <div className="wave-divider">
        <svg width="100%" height="8" viewBox="0 0 280 8" preserveAspectRatio="none">
          <path
            d="M0 4 Q 14 0, 28 4 T 56 4 T 84 4 T 112 4 T 140 4 T 168 4 T 196 4 T 224 4 T 252 4 T 280 4"
            stroke={concept.accent}
            strokeWidth="1.5"
            fill="none"
            opacity="0.5"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {[
        {
          label: "核心互动",
          sub: "你和他人之间会发生什么",
          body: concept.core_interaction,
          dot: "#3ECFCF",
        },
        {
          label: "为什么是「你」",
          sub: "这个概念和你的连接点",
          body: concept.why_you,
          dot: "#FF8FA4",
        },
        {
          label: "他人带走的礼物",
          sub: "访客离开时带走什么",
          body: concept.takeaway,
          dot: "#FFD93D",
        },
      ].map((section) => (
        <section key={section.label} className="concept-section">
          <div className="concept-section-title">
            <span
              style={{
                background: section.dot,
                boxShadow: `0 0 0 3px ${section.dot}26`,
              }}
            />
            <strong>{section.label}</strong>
            <em>· {section.sub}</em>
          </div>
          <p>{section.body}</p>
        </section>
      ))}
    </article>
  );
}

function Loader({ conceptCount }: { conceptCount: number }) {
  return (
    <div className="loader">
      <div style={{ width: 160, height: 160, marginTop: 10 }}>
        <BoxAnimation size={160} />
      </div>
      <div className="status-pill">
        <div className="pulse-dot" />
        <span>
          {conceptCount > 0
            ? `已生成 ${conceptCount}/5 个创意，继续补全中……`
            : "正在为你摇盲盒……"}
        </span>
      </div>
      <div className="loader-bar">
        <div />
      </div>
    </div>
  );
}

function ErrorState({
  error,
  onBack,
  onRetry,
}: {
  error: string;
  onBack: () => void;
  onRetry: () => void;
}) {
  return (
    <div className="error-state">
      <div className="error-icon">!</div>
      <h2>盲盒暂时没摇出来</h2>
      <p>{error}</p>
      <div className="error-actions">
        <button
          className="cta-outline"
          onClick={() => {
            playUiSound("click");
            onBack();
          }}
        >
          返回修改
        </button>
        <button
          className="cta-primary"
          onClick={() => {
            playUiSound("open");
            onRetry();
          }}
        >
          再试一次
        </button>
      </div>
    </div>
  );
}

export function ResultScreen({
  concepts,
  loading,
  error,
  saving = false,
  saveMessage,
  shareImageUrl,
  onBack,
  onCloseShare,
  onReroll,
  onSave,
}: {
  concepts: Concept[];
  loading: boolean;
  error: string | null;
  saving?: boolean;
  saveMessage?: string | null;
  shareImageUrl?: string | null;
  onBack: () => void;
  onCloseShare: () => void;
  onReroll: () => void;
  onSave: () => void;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const expectedTotal = 5;
  const normalizedError = error ? normalizeGenerationError(error) : null;
  const hasPartialError = Boolean(normalizedError && concepts.length > 0);
  const complete = concepts.length >= expectedTotal && !loading && !error;
  const resultHeading =
    concepts.length === 0
      ? "正在拆你的创意盲盒"
      : complete
        ? "你的 5 个创意种子来了"
        : "先拆出这些创意种子";
  const resultSub =
    concepts.length === 0
      ? "正在把回答变成可落地的小摊位"
      : loading
        ? `已拆出 ${concepts.length}/${expectedTotal}，剩下的还在生成`
        : hasPartialError
          ? `已生成 ${concepts.length}/${expectedTotal}，可先保存或重新摇一次`
          : "这不是最终方案，而是属于你的起点";

  useEffect(() => {
    setActiveIndex((current) =>
      concepts.length > 0 ? Math.min(current, concepts.length - 1) : 0,
    );
  }, [concepts.length]);

  function handleScroll() {
    const element = scrollerRef.current;
    if (!element) {
      return;
    }

    const index = Math.round(element.scrollLeft / element.clientWidth);
    if (index !== activeIndex) {
      setActiveIndex(index);
    }
  }

  function goTo(index: number) {
    const element = scrollerRef.current;
    if (!element) {
      return;
    }

    element.scrollTo({ left: index * element.clientWidth, behavior: "smooth" });
  }

  return (
    <div className="h5">
      <div className="scroll-body result-body">
        <div className="doodle" style={{ top: 10, right: 22 }}>
          <StarDoodle size={18} color="#FFD93D" rotate={15} />
        </div>
        <div className="doodle" style={{ top: 30, left: 26 }}>
          <SparkleDoodle size={14} color="#FF8FA4" />
        </div>
        <div className="doodle" style={{ top: 76, right: 60 }}>
          <DotDoodle size={6} color="#3ECFCF" />
        </div>

        <div className="result-title">
          <div>
            <h1 className="page-title">{resultHeading}</h1>
            <p className="page-sub">{resultSub}</p>
          </div>
          <span className="result-title-icon">
            <SeedDoodle size={30} color="#7EDB73" />
          </span>
        </div>

        {error && concepts.length === 0 ? (
          <ErrorState
            error={normalizedError ?? error}
            onBack={onBack}
            onRetry={onReroll}
          />
        ) : (
          <>
            {concepts.length === 0 ? (
              <Loader conceptCount={concepts.length} />
            ) : (
              <>
                <div className="stream-status" aria-live="polite">
                  {loading
                    ? `正在生成：${concepts.length}/${expectedTotal}`
                    : hasPartialError
                      ? `生成中断：已保留 ${concepts.length}/${expectedTotal}`
                      : `已完成：${concepts.length}/${expectedTotal}`}
                </div>

                <div className="pager-dots">
                  {concepts.map((concept, index) => (
                    <button
                      key={`${concept.concept_name}-${index}`}
                      onClick={() => {
                        playUiSound("select");
                        goTo(index);
                      }}
                      aria-label={`查看第 ${index + 1} 个创意`}
                    >
                      <span
                        style={{
                          width: activeIndex === index ? 22 : 8,
                          background:
                            activeIndex === index ? concept.accent : "#E1E5EC",
                        }}
                      />
                    </button>
                  ))}
                </div>

                <div
                  ref={scrollerRef}
                  className="concept-scroller"
                  onScroll={handleScroll}
                >
                  {concepts.map((concept, index) => (
                    <div className="concept-slide" key={`${concept.concept_name}-${index}`}>
                      <ConceptCard
                        concept={concept}
                        index={index}
                        total={Math.max(concepts.length, expectedTotal)}
                      />
                    </div>
                  ))}
                </div>

                <div className="swipe-hint">
                  <span>←</span> 左右滑动看下一个 <span>→</span>
                </div>

                {normalizedError ? (
                  <div className="inline-error">{normalizedError}</div>
                ) : null}

                <div className="result-actions">
                  <button
                    className="cta-outline"
                    onClick={() => {
                      playUiSound("open");
                      onReroll();
                    }}
                  >
                    <span style={{ fontSize: 16 }}>↻</span>
                    重新摇一次
                  </button>
                  <button
                    className="cta-primary"
                    disabled={saving || concepts.length === 0}
                    onClick={() => {
                      playUiSound("click");
                      onSave();
                    }}
                  >
                    {saving ? "生成长图中" : "保存我的灵感"}
                    <HeartDoodle size={15} color="#fff" />
                  </button>
                </div>

                {saveMessage ? (
                  <div className="save-message" aria-live="polite">
                    {saveMessage}
                  </div>
                ) : null}
              </>
            )}
          </>
        )}
      </div>

      {shareImageUrl ? (
        <div className="share-preview" role="dialog" aria-modal="true">
          <div className="share-preview-panel">
            <div className="share-preview-head">
              <div>
                <strong>长图已生成</strong>
                <span>长按图片保存，或下载 PNG</span>
              </div>
              <button
                onClick={() => {
                  playUiSound("click");
                  onCloseShare();
                }}
                aria-label="关闭长图预览"
              >
                ×
              </button>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={shareImageUrl} alt="我的创意盲盒长图" />
            <a
              className="download-link"
              href={shareImageUrl}
              download="creative-blind-box.png"
            >
              下载 PNG
            </a>
          </div>
        </div>
      ) : null}
    </div>
  );
}
