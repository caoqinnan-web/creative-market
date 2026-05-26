import type { CSSProperties } from "react";

type DoodleProps = {
  size?: number;
  color?: string;
};

export function StarDoodle({
  size = 22,
  color = "#FFD93D",
  rotate = 0,
  strokeOnly = false,
}: DoodleProps & { rotate?: number; strokeOnly?: boolean }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      style={{ transform: `rotate(${rotate}deg)` }}
      aria-hidden="true"
    >
      <path
        d="M12 2.5 L14.2 9 L20.8 9.3 L15.6 13.4 L17.4 19.8 L12 16.1 L6.6 19.8 L8.4 13.4 L3.2 9.3 L9.8 9 Z"
        fill={strokeOnly ? "none" : color}
        stroke={color}
        strokeWidth="1.6"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function SparkleDoodle({ size = 14, color = "#FF8FA4" }: DoodleProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 2 C12.5 8 13 8.5 19 9 C13 9.5 12.5 10 12 16 C11.5 10 11 9.5 5 9 C11 8.5 11.5 8 12 2 Z"
        fill={color}
      />
    </svg>
  );
}

export function WaveDoodle({
  width = 60,
  color = "#3ECFCF",
  stroke = 2,
}: {
  width?: number;
  color?: string;
  stroke?: number;
}) {
  return (
    <svg
      width={width}
      height={width * 0.25}
      viewBox="0 0 60 15"
      aria-hidden="true"
    >
      <path
        d="M2 8 Q 10 1, 18 8 T 34 8 T 50 8 T 66 8"
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeLinecap="round"
      />
    </svg>
  );
}

export function DotDoodle({ size = 8, color = "#FFD93D" }: DoodleProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 8 8" aria-hidden="true">
      <circle cx="4" cy="4" r="3" fill={color} />
    </svg>
  );
}

export function HeartDoodle({ size = 16, color = "#FF8FA4" }: DoodleProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.5-7 10-7 10z"
        fill={color}
      />
    </svg>
  );
}

export function SeedDoodle({ size = 24, color = "#3ECFCF" }: DoodleProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 20 C12 15.5 12.2 11.8 15.5 8.5"
        fill="none"
        stroke="#1F2733"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M15 8 C18.3 5.2 21 5.2 21.4 5.6 C21.8 6 21.7 8.8 18.7 11.4 C16.5 13.3 14.3 12.6 13.8 12 C13.2 11.4 12.9 9.8 15 8 Z"
        fill={color}
        stroke="#1F2733"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <path
        d="M10.2 12.4 C7.1 10.2 4.4 10.5 4 11 C3.7 11.5 4.4 14.1 7.5 15.8 C9.7 17 11.5 16 11.8 15.3 C12.1 14.6 12 13.7 10.2 12.4 Z"
        fill="#FFD93D"
        stroke="#1F2733"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function FlaskDoodle({ size = 24, color = "#FF8FA4" }: DoodleProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M9 3 H15 M10 4.2 V9.3 L5.5 17.5 C4.6 19.2 5.7 21 7.6 21 H16.4 C18.3 21 19.4 19.2 18.5 17.5 L14 9.3 V4.2"
        fill="#FFFFFF"
        stroke="#1F2733"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8 16.2 H16.1 L17.2 18.2 C17.5 18.8 17.1 19.4 16.4 19.4 H7.6 C6.9 19.4 6.5 18.8 6.8 18.2 Z"
        fill={color}
      />
      <circle cx="9" cy="14.5" r="1" fill="#3ECFCF" />
      <circle cx="14.6" cy="16.7" r="1.2" fill="#FFD93D" />
    </svg>
  );
}

export function SoundDoodle({ size = 24, color = "#3ECFCF" }: DoodleProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M7.2 12 C7.2 8.2 9.2 5.8 12 5.8 C14.8 5.8 16.8 8.2 16.8 12"
        fill="none"
        stroke="#1F2733"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <rect x="4.2" y="11" width="4.3" height="7" rx="2" fill={color} />
      <rect x="15.5" y="11" width="4.3" height="7" rx="2" fill="#FFD93D" />
      <path
        d="M10 17 C11.2 18.2 12.8 18.2 14 17"
        fill="none"
        stroke="#FF8FA4"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function LetterDoodle({ size = 24, color = "#FFD93D" }: DoodleProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <rect
        x="4"
        y="6"
        width="16"
        height="12"
        rx="2.5"
        fill="#FFFFFF"
        stroke="#1F2733"
        strokeWidth="1.6"
      />
      <path
        d="M5.2 8 L12 13.2 L18.8 8"
        fill="none"
        stroke="#1F2733"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16.4 4.5 C17.5 3.5 19.1 4.2 19.1 5.6 C19.1 7.2 16.4 8.7 16.4 8.7 C16.4 8.7 13.7 7.2 13.7 5.6 C13.7 4.2 15.3 3.5 16.4 4.5 Z"
        fill={color}
        stroke="#1F2733"
        strokeWidth="1"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ArrowDoodle({ size = 18, color = "#1F2733" }: DoodleProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M5 12 H17 M13 7 L18 12 L13 17"
        fill="none"
        stroke={color}
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export type BoxStarStyle = CSSProperties & {
  "--tx": string;
  "--ty": string;
  "--r0": string;
  "--r1": string;
};
