import { useSeatingStore } from "@/store/useSeatingStore";
import {
  TABLE_RADIUS,
  TABLE_RECT_WIDTH,
  TABLE_RECT_HEIGHT,
  SEAT_ORBIT_PADDING,
  SEAT_RADIUS,
} from "@/lib/constants";
import { drawDotGrid, drawTable, LIGHT_COLORS } from "./drawUtils";

const PADDING = 40;
const SCALE = 2;

export function exportCanvasImage() {
  const { tables, eventName } = useSeatingStore.getState();
  if (tables.length === 0) return;

  // Calculate bounding box of all tables + seats
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const table of tables) {
    const isRound = table.shape === "round";
    const extent = isRound
      ? TABLE_RADIUS + SEAT_ORBIT_PADDING + SEAT_RADIUS
      : Math.max(TABLE_RECT_WIDTH / 2, TABLE_RECT_HEIGHT / 2) +
        SEAT_ORBIT_PADDING +
        SEAT_RADIUS;

    minX = Math.min(minX, table.x - extent);
    minY = Math.min(minY, table.y - extent);
    maxX = Math.max(maxX, table.x + extent);
    maxY = Math.max(maxY, table.y + extent);
  }

  const w = maxX - minX + PADDING * 2;
  const h = maxY - minY + PADDING * 2;
  const offsetX = -minX + PADDING;
  const offsetY = -minY + PADDING;

  const canvas = document.createElement("canvas");
  canvas.width = w * SCALE;
  canvas.height = h * SCALE;

  const ctx = canvas.getContext("2d")!;
  ctx.scale(SCALE, SCALE);

  // White background
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, w, h);

  // Dot grid
  drawDotGrid(ctx, w, h, LIGHT_COLORS.canvasDot);

  // Draw all tables
  for (const table of tables) {
    drawTable(
      ctx,
      table,
      table.x + offsetX,
      table.y + offsetY,
      false,
      LIGHT_COLORS
    );
  }

  // Export as PNG
  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const name = eventName.trim() || "seating";
    a.download = `${name.replace(/\s+/g, "_")}_layout.png`;
    a.click();
    URL.revokeObjectURL(url);
  }, "image/png");
}
