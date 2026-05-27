"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { SparkleDoodle, StarDoodle } from "@/components/doodles";

const FLOATING_STARS = [
  { top: "6%", left: "44%", color: "#FFD93D", size: 20, rotate: -8, delay: "0s" },
  { top: "18%", left: "76%", color: "#FF8FA4", size: 15, rotate: 18, delay: "0.22s" },
  { top: "34%", left: "10%", color: "#3ECFCF", size: 14, rotate: -12, delay: "0.42s" },
  { top: "70%", left: "78%", color: "#FFD93D", size: 12, rotate: 28, delay: "0.58s" },
];

export function BoxAnimation({ size = 200 }: { size?: number }) {
  return (
    <div
      className="boxwrap sticker-boxwrap"
      style={{ width: size, height: size }}
    >
      <div className="box-aura" />
      <div className="ground" />

      <div className="sticker-burst">
        {FLOATING_STARS.map((star) => (
          <div
            key={`${star.top}-${star.left}`}
            className="sticker-spark"
            style={{
              top: star.top,
              left: star.left,
              animationDelay: star.delay,
            }}
          >
            <StarDoodle
              size={star.size}
              color={star.color}
              rotate={star.rotate}
            />
          </div>
        ))}
        <div className="sticker-spark soft" style={{ top: "24%", left: "20%" }}>
          <SparkleDoodle size={18} color="#FF8FA4" />
        </div>
      </div>

      <div className="box-sticker">
        <Image
          src="/images/creative-box-hero.png"
          alt=""
          width={size}
          height={size}
          sizes={`${size}px`}
          priority
          unoptimized
        />
      </div>
    </div>
  );
}

export function AnimationScreen({
  message = "正在为你摇盲盒……",
  done = false,
}: {
  message?: string;
  done?: boolean;
}) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let frame = 0;
    const startedAt = performance.now();

    function tick(time: number) {
      const target = done ? 1 : 0.9;
      const elapsed = Math.min((time - startedAt) / 1800, 1);
      setProgress((previous) => Math.max(previous, elapsed * target));
      if (!done || elapsed < 1) {
        frame = requestAnimationFrame(tick);
      }
    }

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [done]);

  return (
    <div className="h5">
      <div className="scroll-body anim-body">
        <div className="doodle" style={{ top: 70, left: 24 }}>
          <StarDoodle size={18} color="#FFD93D" rotate={-12} />
        </div>
        <div className="doodle" style={{ top: 90, right: 30 }}>
          <SparkleDoodle size={20} color="#FF8FA4" />
        </div>
        <div className="doodle" style={{ top: 130, left: 50 }}>
          <StarDoodle size={12} color="#3ECFCF" rotate={20} />
        </div>
        <div className="doodle" style={{ top: 150, right: 60 }}>
          <StarDoodle size={10} color="#FFD93D" rotate={40} />
        </div>

        <div style={{ height: 60 }} />
        <h2 className="anim-title">摇一摇盲盒</h2>
        <p className="anim-sub">正在打开属于你的 5 个创意种子</p>

        <div style={{ marginTop: 30 }}>
          <BoxAnimation size={220} />
        </div>

        <div className="anim-status">
          <div className="status-pill">
            <div className="pulse-dot" />
            <span>{message}</span>
          </div>

          <div className="anim-progress">
            <div style={{ width: `${progress * 100}%` }} />
          </div>

          <div className="anim-footnote">先出先看，结果会继续补全</div>
        </div>
      </div>
    </div>
  );
}
