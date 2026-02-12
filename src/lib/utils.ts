import {
  TABLE_RADIUS,
  TABLE_RECT_WIDTH,
  TABLE_RECT_HEIGHT,
  SEAT_ORBIT_PADDING,
} from "./constants";

export function getRoundSeatPositions(
  seatCount: number
): { x: number; y: number }[] {
  const orbit = TABLE_RADIUS + SEAT_ORBIT_PADDING;
  return Array.from({ length: seatCount }, (_, i) => {
    const angle = (2 * Math.PI * i) / seatCount - Math.PI / 2;
    return {
      x: Math.cos(angle) * orbit,
      y: Math.sin(angle) * orbit,
    };
  });
}

export function getRectSeatPositions(
  seatCount: number
): { x: number; y: number }[] {
  const hw = TABLE_RECT_WIDTH / 2 + SEAT_ORBIT_PADDING;
  const hh = TABLE_RECT_HEIGHT / 2 + SEAT_ORBIT_PADDING;

  // Distribute seats proportionally across 4 sides based on length
  const hLen = TABLE_RECT_WIDTH;
  const vLen = TABLE_RECT_HEIGHT;
  const totalLen = 2 * (hLen + vLen);

  // Each side gets seats proportional to its length, minimum 0
  const rawTop = (hLen / totalLen) * seatCount;
  const rawRight = (vLen / totalLen) * seatCount;
  const rawBottom = (hLen / totalLen) * seatCount;
  const rawLeft = (vLen / totalLen) * seatCount;

  // Round with remainder distribution
  let top = Math.floor(rawTop);
  let right = Math.floor(rawRight);
  let bottom = Math.floor(rawBottom);
  let left = Math.floor(rawLeft);
  let remaining = seatCount - (top + right + bottom + left);

  // Distribute remaining seats to sides with largest fractional parts
  const fractions = [
    { side: "top", frac: rawTop - top },
    { side: "right", frac: rawRight - right },
    { side: "bottom", frac: rawBottom - bottom },
    { side: "left", frac: rawLeft - left },
  ].sort((a, b) => b.frac - a.frac);

  for (const f of fractions) {
    if (remaining <= 0) break;
    if (f.side === "top") top++;
    else if (f.side === "right") right++;
    else if (f.side === "bottom") bottom++;
    else left++;
    remaining--;
  }

  const positions: { x: number; y: number }[] = [];

  // Place seats centered along each side
  // Top side (left to right)
  for (let i = 0; i < top; i++) {
    const t = (i + 0.5) / top;
    positions.push({ x: -hw + t * hw * 2, y: -hh });
  }
  // Right side (top to bottom)
  for (let i = 0; i < right; i++) {
    const t = (i + 0.5) / right;
    positions.push({ x: hw, y: -hh + t * hh * 2 });
  }
  // Bottom side (right to left)
  for (let i = 0; i < bottom; i++) {
    const t = (i + 0.5) / bottom;
    positions.push({ x: hw - t * hw * 2, y: hh });
  }
  // Left side (bottom to top)
  for (let i = 0; i < left; i++) {
    const t = (i + 0.5) / left;
    positions.push({ x: -hw, y: hh - t * hh * 2 });
  }

  return positions;
}
