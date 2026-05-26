import type { Concept, ConceptIconKey } from "@/lib/concepts";

const WIDTH = 390;
const CARD_X = 18;
const CARD_WIDTH = WIDTH - CARD_X * 2;
const CARD_PADDING = 18;
const DPR = 3;

type CanvasContext = CanvasRenderingContext2D;

function setFont(
  context: CanvasContext,
  size: number,
  weight: number,
  family = '"PingFang SC", "Microsoft YaHei", sans-serif',
) {
  context.font = `${weight} ${size}px ${family}`;
}

function wrapText(
  context: CanvasContext,
  text: string,
  maxWidth: number,
): string[] {
  const lines: string[] = [];
  let current = "";

  for (const char of text) {
    const next = current + char;
    if (context.measureText(next).width > maxWidth && current) {
      lines.push(current);
      current = char;
    } else {
      current = next;
    }
  }

  if (current) {
    lines.push(current);
  }

  return lines;
}

function drawWrappedText(
  context: CanvasContext,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
) {
  const lines = wrapText(context, text, maxWidth);
  lines.forEach((line, index) => {
    context.fillText(line, x, y + index * lineHeight);
  });

  return lines.length * lineHeight;
}

function roundRect(
  context: CanvasContext,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  context.beginPath();
  context.moveTo(x + radius, y);
  context.lineTo(x + width - radius, y);
  context.quadraticCurveTo(x + width, y, x + width, y + radius);
  context.lineTo(x + width, y + height - radius);
  context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  context.lineTo(x + radius, y + height);
  context.quadraticCurveTo(x, y + height, x, y + height - radius);
  context.lineTo(x, y + radius);
  context.quadraticCurveTo(x, y, x + radius, y);
  context.closePath();
}

function drawConceptIcon(
  context: CanvasContext,
  icon: ConceptIconKey,
  x: number,
  y: number,
  size: number,
  accent: string,
) {
  context.save();
  context.lineWidth = 1.6;
  context.lineCap = "round";
  context.lineJoin = "round";
  context.strokeStyle = "#1F2733";

  if (icon === "seed") {
    context.beginPath();
    context.moveTo(x + size * 0.48, y + size * 0.84);
    context.quadraticCurveTo(x + size * 0.5, y + size * 0.48, x + size * 0.7, y + size * 0.28);
    context.stroke();
    context.fillStyle = accent;
    context.beginPath();
    context.ellipse(x + size * 0.72, y + size * 0.28, size * 0.2, size * 0.12, -0.6, 0, Math.PI * 2);
    context.fill();
    context.stroke();
    context.fillStyle = "#FFD93D";
    context.beginPath();
    context.ellipse(x + size * 0.38, y + size * 0.5, size * 0.18, size * 0.11, 0.55, 0, Math.PI * 2);
    context.fill();
    context.stroke();
  } else if (icon === "flask") {
    context.beginPath();
    context.moveTo(x + size * 0.38, y + size * 0.12);
    context.lineTo(x + size * 0.62, y + size * 0.12);
    context.moveTo(x + size * 0.44, y + size * 0.16);
    context.lineTo(x + size * 0.44, y + size * 0.42);
    context.lineTo(x + size * 0.22, y + size * 0.8);
    context.quadraticCurveTo(x + size * 0.16, y + size * 0.92, x + size * 0.31, y + size * 0.92);
    context.lineTo(x + size * 0.69, y + size * 0.92);
    context.quadraticCurveTo(x + size * 0.84, y + size * 0.92, x + size * 0.78, y + size * 0.8);
    context.lineTo(x + size * 0.56, y + size * 0.42);
    context.lineTo(x + size * 0.56, y + size * 0.16);
    context.stroke();
    context.fillStyle = accent;
    context.beginPath();
    context.moveTo(x + size * 0.28, y + size * 0.72);
    context.lineTo(x + size * 0.72, y + size * 0.72);
    context.lineTo(x + size * 0.78, y + size * 0.84);
    context.quadraticCurveTo(x + size * 0.82, y + size * 0.92, x + size * 0.68, y + size * 0.92);
    context.lineTo(x + size * 0.32, y + size * 0.92);
    context.quadraticCurveTo(x + size * 0.18, y + size * 0.92, x + size * 0.22, y + size * 0.84);
    context.closePath();
    context.fill();
  } else if (icon === "sound") {
    context.beginPath();
    context.arc(x + size * 0.5, y + size * 0.47, size * 0.26, Math.PI, 0);
    context.stroke();
    context.fillStyle = accent;
    roundRect(context, x + size * 0.16, y + size * 0.46, size * 0.18, size * 0.34, size * 0.08);
    context.fill();
    context.stroke();
    context.fillStyle = "#FFD93D";
    roundRect(context, x + size * 0.66, y + size * 0.46, size * 0.18, size * 0.34, size * 0.08);
    context.fill();
    context.stroke();
  } else if (icon === "letter") {
    context.fillStyle = "#FFFFFF";
    roundRect(context, x + size * 0.16, y + size * 0.28, size * 0.68, size * 0.5, size * 0.08);
    context.fill();
    context.stroke();
    context.beginPath();
    context.moveTo(x + size * 0.2, y + size * 0.36);
    context.lineTo(x + size * 0.5, y + size * 0.58);
    context.lineTo(x + size * 0.8, y + size * 0.36);
    context.stroke();
    context.fillStyle = accent;
    context.beginPath();
    context.arc(x + size * 0.68, y + size * 0.25, size * 0.1, 0, Math.PI * 2);
    context.fill();
    context.stroke();
  } else {
    context.fillStyle = accent;
    context.beginPath();
    context.moveTo(x + size * 0.5, y + size * 0.08);
    context.lineTo(x + size * 0.6, y + size * 0.4);
    context.lineTo(x + size * 0.92, y + size * 0.5);
    context.lineTo(x + size * 0.6, y + size * 0.6);
    context.lineTo(x + size * 0.5, y + size * 0.92);
    context.lineTo(x + size * 0.4, y + size * 0.6);
    context.lineTo(x + size * 0.08, y + size * 0.5);
    context.lineTo(x + size * 0.4, y + size * 0.4);
    context.closePath();
    context.fill();
  }

  context.restore();
}

function measureConceptCard(context: CanvasContext, concept: Concept) {
  const textWidth = CARD_WIDTH - CARD_PADDING * 2;
  let height = 110;

  setFont(context, 24, 800);
  height += wrapText(context, concept.concept_name, textWidth).length * 30;

  setFont(context, 13.5, 600);
  height += wrapText(context, concept.one_liner, textWidth).length * 21 + 22;

  for (const body of [
    concept.core_interaction,
    concept.why_you,
    concept.takeaway,
  ]) {
    setFont(context, 13.5, 500);
    height += 26 + wrapText(context, body, textWidth - 12).length * 21;
  }

  return Math.max(height, 300);
}

function drawConceptCard(
  context: CanvasContext,
  concept: Concept,
  index: number,
  total: number,
  y: number,
  height: number,
) {
  context.save();
  context.shadowColor = "rgba(31, 39, 51, 0.10)";
  context.shadowBlur = 18;
  context.shadowOffsetY = 8;
  context.fillStyle = "#FFFFFF";
  roundRect(context, CARD_X, y, CARD_WIDTH, height, 22);
  context.fill();
  context.restore();

  context.save();
  roundRect(context, CARD_X, y, CARD_WIDTH, height, 22);
  context.clip();
  context.globalAlpha = 0.15;
  context.fillStyle = concept.accent;
  context.beginPath();
  context.arc(CARD_X + CARD_WIDTH - 36, y + 36, 56, 0, Math.PI * 2);
  context.fill();
  context.restore();

  const innerX = CARD_X + CARD_PADDING;
  let cursorY = y + CARD_PADDING + 18;

  context.fillStyle = concept.accent;
  context.beginPath();
  context.arc(innerX + 18, cursorY - 4, 18, 0, Math.PI * 2);
  context.fill();
  context.fillStyle = concept.accent === "#FFD93D" ? "#7A5C00" : "#FFFFFF";
  setFont(context, 17, 800);
  context.textAlign = "center";
  context.fillText(String(index + 1), innerX + 18, cursorY + 2);
  context.textAlign = "left";

  setFont(context, 11, 800);
  context.fillStyle = "#8A93A0";
  context.fillText(
    `CONCEPT · ${String(index + 1).padStart(2, "0")} / ${String(total).padStart(2, "0")}`,
    innerX + 50,
    cursorY + 1,
  );
  drawConceptIcon(
    context,
    concept.icon,
    innerX + CARD_WIDTH - CARD_PADDING * 2 - 28,
    cursorY - 20,
    30,
    concept.accent,
  );

  cursorY += 42;

  setFont(context, 24, 800);
  context.fillStyle = "#1F2733";
  cursorY += drawWrappedText(
    context,
    concept.concept_name,
    innerX,
    cursorY,
    CARD_WIDTH - CARD_PADDING * 2,
    30,
  );

  setFont(context, 13.5, 600);
  context.fillStyle = "#4A5462";
  cursorY += 4;
  cursorY += drawWrappedText(
    context,
    concept.one_liner,
    innerX,
    cursorY,
    CARD_WIDTH - CARD_PADDING * 2,
    21,
  );

  cursorY += 12;
  context.strokeStyle = concept.accent;
  context.globalAlpha = 0.55;
  context.lineWidth = 1.5;
  context.beginPath();
  context.moveTo(innerX, cursorY);
  context.lineTo(innerX + CARD_WIDTH - CARD_PADDING * 2, cursorY);
  context.stroke();
  context.globalAlpha = 1;
  cursorY += 22;

  const sections = [
    { title: "核心互动", body: concept.core_interaction, dot: "#3ECFCF" },
    { title: "为什么是「你」", body: concept.why_you, dot: "#FF8FA4" },
    { title: "他人带走的礼物", body: concept.takeaway, dot: "#FFD93D" },
  ];

  for (const section of sections) {
    context.fillStyle = section.dot;
    context.beginPath();
    context.arc(innerX + 4, cursorY - 4, 4, 0, Math.PI * 2);
    context.fill();

    setFont(context, 13, 800);
    context.fillStyle = "#1F2733";
    context.fillText(section.title, innerX + 14, cursorY);
    cursorY += 16;

    setFont(context, 13.5, 500);
    context.fillStyle = "#4A5462";
    cursorY += drawWrappedText(
      context,
      section.body,
      innerX + 14,
      cursorY,
      CARD_WIDTH - CARD_PADDING * 2 - 14,
      21,
    );
    cursorY += 12;
  }
}

export async function createInspirationImage(
  concepts: Concept[],
): Promise<Blob> {
  const measureCanvas = document.createElement("canvas");
  const measureContext = measureCanvas.getContext("2d");

  if (!measureContext) {
    throw new Error("Canvas is not available.");
  }

  const cardHeights = concepts.map((concept) =>
    measureConceptCard(measureContext, concept),
  );
  const height =
    132 + cardHeights.reduce((sum, cardHeight) => sum + cardHeight + 14, 0) + 54;

  const canvas = document.createElement("canvas");
  canvas.width = WIDTH * DPR;
  canvas.height = height * DPR;
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Canvas is not available.");
  }

  context.scale(DPR, DPR);
  context.fillStyle = "#FFFDF7";
  context.fillRect(0, 0, WIDTH, height);

  context.fillStyle = "#1F2733";
  setFont(context, 30, 900);
  context.fillText("我的创意盲盒", 22, 44);

  setFont(context, 13.5, 600);
  context.fillStyle = "#4A5462";
  context.fillText("5 个属于我的成长市集摊位灵感", 22, 70);

  context.fillStyle = "#FFD93D";
  context.beginPath();
  context.arc(WIDTH - 42, 42, 12, 0, Math.PI * 2);
  context.fill();
  context.fillStyle = "#FF8FA4";
  context.beginPath();
  context.arc(WIDTH - 64, 68, 5, 0, Math.PI * 2);
  context.fill();

  let cursorY = 104;
  concepts.forEach((concept, index) => {
    drawConceptCard(
      context,
      concept,
      index,
      concepts.length,
      cursorY,
      cardHeights[index],
    );
    cursorY += cardHeights[index] + 14;
  });

  setFont(context, 12, 800);
  context.fillStyle = "#8A93A0";
  context.textAlign = "center";
  context.fillText("没有对错 · 实验心态 · 从我出发", WIDTH / 2, cursorY + 26);

  const dataUrl = canvas.toDataURL("image/png");
  const response = await fetch(dataUrl);
  return response.blob();
}
