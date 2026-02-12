"use client";

import type { Seat } from "@/store/types";
import { useSeatingStore } from "@/store/useSeatingStore";

interface Props {
  tableId: string;
  seat: Seat;
}

export function SeatRow({ tableId, seat }: Props) {
  const setGuestName = useSeatingStore((s) => s.setGuestName);
  const filled = seat.guestName.trim().length > 0;

  return (
    <div className="flex items-center gap-3 px-1 py-1">
      <div
        className="w-3 h-3 rounded-full shrink-0"
        style={{
          background: filled ? "var(--seat-filled)" : "var(--seat-empty)",
        }}
      />
      <span
        className="text-xs w-5 shrink-0 tabular-nums"
        style={{ color: "var(--muted)" }}
      >
        {seat.seatNumber}
      </span>
      <input
        type="text"
        placeholder="Guest name..."
        value={seat.guestName}
        onChange={(e) => setGuestName(tableId, seat.id, e.target.value)}
        className="flex-1 rounded border px-2 py-1 text-sm outline-none focus:ring-2"
        style={{
          borderColor: "var(--sidebar-border)",
        }}
      />
    </div>
  );
}
