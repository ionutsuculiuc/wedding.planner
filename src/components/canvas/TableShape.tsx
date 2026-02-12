"use client";

import type { Table } from "@/store/types";
import {
  TABLE_RADIUS,
  TABLE_RECT_WIDTH,
  TABLE_RECT_HEIGHT,
  SEAT_RADIUS,
} from "@/lib/constants";
import { getRoundSeatPositions, getRectSeatPositions } from "@/lib/utils";

interface Props {
  table: Table;
}

export function TableShape({ table }: Props) {
  const isRound = table.shape === "round";
  const seatPositions = isRound
    ? getRoundSeatPositions(table.seats.length)
    : getRectSeatPositions(table.seats.length);

  const padding = SEAT_RADIUS + 4;
  const viewW = isRound
    ? (TABLE_RADIUS + 30) * 2 + padding * 2
    : TABLE_RECT_WIDTH + 60 + padding * 2;
  const viewH = isRound
    ? (TABLE_RADIUS + 30) * 2 + padding * 2
    : TABLE_RECT_HEIGHT + 60 + padding * 2;
  const cx = viewW / 2;
  const cy = viewH / 2;

  return (
    <svg
      width={viewW}
      height={viewH}
      viewBox={`0 0 ${viewW} ${viewH}`}
      className="pointer-events-none"
    >
      {/* Table body */}
      {isRound ? (
        <circle
          cx={cx}
          cy={cy}
          r={TABLE_RADIUS}
          fill="#fef3c7"
          stroke="#d97706"
          strokeWidth={2}
        />
      ) : (
        <rect
          x={cx - TABLE_RECT_WIDTH / 2}
          y={cy - TABLE_RECT_HEIGHT / 2}
          width={TABLE_RECT_WIDTH}
          height={TABLE_RECT_HEIGHT}
          rx={8}
          fill="#fef3c7"
          stroke="#d97706"
          strokeWidth={2}
        />
      )}

      {/* Table number label */}
      <text
        x={cx}
        y={cy}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={14}
        fontWeight={600}
        fill="#92400e"
      >
        {table.tableNumber}
      </text>

      {/* Seat dots */}
      {seatPositions.map((pos, i) => {
        const seat = table.seats[i];
        const filled = seat && seat.guestName.trim().length > 0;
        return (
          <circle
            key={seat?.id ?? i}
            cx={cx + pos.x}
            cy={cy + pos.y}
            r={SEAT_RADIUS}
            fill={filled ? "var(--seat-filled)" : "var(--seat-empty)"}
            stroke={filled ? "#15803d" : "#a8a29e"}
            strokeWidth={1.5}
          />
        );
      })}
    </svg>
  );
}
