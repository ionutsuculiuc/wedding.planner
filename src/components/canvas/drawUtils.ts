import type { Table } from "@/store/types";
import {
  TABLE_RADIUS,
  TABLE_RECT_WIDTH,
  TABLE_RECT_HEIGHT,
  SEAT_RADIUS,
} from "@/lib/constants";
import { getRoundSeatPositions, getRectSeatPositions } from "@/lib/utils";

export interface CanvasColors {
  background: string;
  canvasDot: string;
  tableFill: string;
  tableStroke: string;
  tableLabel: string;
  seatEmpty: string;
  seatEmptyStroke: string;
  seatFilled: string;
  seatFilledStroke: string;
  selectedGlow: string;
  muted: string;
  foreground: string;
}

export function getColorsFromCSS(): CanvasColors {
  const style = getComputedStyle(document.documentElement);
  const v = (name: string) => style.getPropertyValue(name).trim();
  return {
    background: v("--background"),
    canvasDot: v("--canvas-dot"),
    tableFill: v("--accent-light"),
    tableStroke: v("--accent"),
    tableLabel: "#92400e",
    seatEmpty: v("--seat-empty"),
    seatEmptyStroke: "#a8a29e",
    seatFilled: v("--seat-filled"),
    seatFilledStroke: "#15803d",
    selectedGlow: "rgba(180,83,9,0.4)",
    muted: v("--muted"),
    foreground: v("--foreground"),
  };
}

export const LIGHT_COLORS: CanvasColors = {
  background: "#f5f5f4",
  canvasDot: "#d4d4d4",
  tableFill: "#fef3c7",
  tableStroke: "#d97706",
  tableLabel: "#92400e",
  seatEmpty: "#d6d3d1",
  seatEmptyStroke: "#a8a29e",
  seatFilled: "#16a34a",
  seatFilledStroke: "#15803d",
  selectedGlow: "rgba(180,83,9,0.4)",
  muted: "#78716c",
  foreground: "#1c1917",
};

export function drawDotGrid(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  color: string
) {
  ctx.fillStyle = color;
  for (let x = 0; x < w; x += 24) {
    for (let y = 0; y < h; y += 24) {
      ctx.fillRect(x, y, 1, 1);
    }
  }
}

export function drawTable(
  ctx: CanvasRenderingContext2D,
  table: Table,
  x: number,
  y: number,
  isSelected: boolean,
  colors: CanvasColors,
  opacity: number = 1
) {
  ctx.save();
  ctx.globalAlpha = opacity;

  const isRound = table.shape === "round";

  // Selected glow
  if (isSelected) {
    ctx.shadowColor = colors.selectedGlow;
    ctx.shadowBlur = 12;
  }

  // Table body
  ctx.fillStyle = colors.tableFill;
  ctx.strokeStyle = colors.tableStroke;
  ctx.lineWidth = 2;

  if (isRound) {
    ctx.beginPath();
    ctx.arc(x, y, TABLE_RADIUS, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  } else {
    const rx = 8;
    const left = x - TABLE_RECT_WIDTH / 2;
    const top = y - TABLE_RECT_HEIGHT / 2;
    ctx.beginPath();
    ctx.roundRect(left, top, TABLE_RECT_WIDTH, TABLE_RECT_HEIGHT, rx);
    ctx.fill();
    ctx.stroke();
  }

  // Clear shadow for label/seats
  ctx.shadowColor = "transparent";
  ctx.shadowBlur = 0;

  // Table number label
  ctx.fillStyle = colors.tableLabel;
  ctx.font = "600 14px Arial, Helvetica, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(String(table.tableNumber), x, y);

  // Seat dots
  const seatPositions = isRound
    ? getRoundSeatPositions(table.seats.length)
    : getRectSeatPositions(table.seats.length);

  seatPositions.forEach((pos, i) => {
    const seat = table.seats[i];
    const filled = seat && seat.guestName.trim().length > 0;

    ctx.beginPath();
    ctx.arc(x + pos.x, y + pos.y, SEAT_RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = filled ? colors.seatFilled : colors.seatEmpty;
    ctx.fill();
    ctx.strokeStyle = filled ? colors.seatFilledStroke : colors.seatEmptyStroke;
    ctx.lineWidth = 1.5;
    ctx.stroke();
  });

  ctx.restore();
}

export function drawEmptyState(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  mutedColor: string
) {
  ctx.fillStyle = mutedColor;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  ctx.font = "500 18px Arial, Helvetica, sans-serif";
  ctx.fillText("No tables yet", w / 2, h / 2 - 12);

  ctx.font = "14px Arial, Helvetica, sans-serif";
  ctx.fillText(
    "Use the sidebar to add round or rectangular tables",
    w / 2,
    h / 2 + 12
  );
}

/** Hit-test helpers */

type CircleBounds = { type: "circle"; cx: number; cy: number; radius: number };
type RectBounds = { type: "rect"; left: number; top: number; right: number; bottom: number };

export function getTableBounds(table: Table): CircleBounds | RectBounds {
  const isRound = table.shape === "round";
  const seatPositions = isRound
    ? getRoundSeatPositions(table.seats.length)
    : getRectSeatPositions(table.seats.length);

  if (isRound) {
    const orbit = TABLE_RADIUS + 20; // SEAT_ORBIT_PADDING
    return {
      type: "circle",
      cx: table.x,
      cy: table.y,
      radius: orbit + SEAT_RADIUS,
    };
  }

  // Rectangular: bounding box including seats
  let minX = -TABLE_RECT_WIDTH / 2;
  let maxX = TABLE_RECT_WIDTH / 2;
  let minY = -TABLE_RECT_HEIGHT / 2;
  let maxY = TABLE_RECT_HEIGHT / 2;

  for (const pos of seatPositions) {
    minX = Math.min(minX, pos.x - SEAT_RADIUS);
    maxX = Math.max(maxX, pos.x + SEAT_RADIUS);
    minY = Math.min(minY, pos.y - SEAT_RADIUS);
    maxY = Math.max(maxY, pos.y + SEAT_RADIUS);
  }

  return {
    type: "rect",
    left: table.x + minX,
    top: table.y + minY,
    right: table.x + maxX,
    bottom: table.y + maxY,
  };
}

export function hitTestTable(
  table: Table,
  px: number,
  py: number
): boolean {
  const bounds = getTableBounds(table);

  if (bounds.type === "circle") {
    const dx = px - bounds.cx;
    const dy = py - bounds.cy;
    return dx * dx + dy * dy <= bounds.radius * bounds.radius;
  }

  return (
    px >= bounds.left &&
    px <= bounds.right &&
    py >= bounds.top &&
    py <= bounds.bottom
  );
}
