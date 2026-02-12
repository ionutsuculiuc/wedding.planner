"use client";

import { useEffect } from "react";
import { useSeatingStore } from "@/store/useSeatingStore";
import { GUEST_PANEL_WIDTH } from "@/lib/constants";
import { SeatRow } from "./SeatRow";

export function GuestModal() {
  const selectedTableId = useSeatingStore((s) => s.selectedTableId);
  const tables = useSeatingStore((s) => s.tables);
  const selectTable = useSeatingStore((s) => s.selectTable);

  const table = tables.find((t) => t.id === selectedTableId);
  const isOpen = !!table;

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen) {
        selectTable(null);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, selectTable]);

  const filled = table
    ? table.seats.filter((s) => s.guestName.trim()).length
    : 0;

  return (
    <div
      className="h-full shrink-0 border-l flex flex-col overflow-hidden transition-all duration-200 ease-in-out"
      style={{
        width: isOpen ? GUEST_PANEL_WIDTH : 0,
        borderColor: isOpen ? "var(--sidebar-border)" : "transparent",
        background: "var(--sidebar-bg)",
      }}
    >
      {table && (
        <div
          className="flex flex-col h-full"
          style={{ width: GUEST_PANEL_WIDTH }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 pt-4 pb-2">
            <div>
              <h2 className="text-sm font-semibold">
                Table {table.tableNumber}
              </h2>
              <p className="text-xs" style={{ color: "var(--muted)" }}>
                {filled}/{table.seats.length} guests assigned
                {" \u00B7 "}
                {table.shape === "round" ? "Round" : "Rectangular"}
              </p>
            </div>
            <button
              onClick={() => selectTable(null)}
              className="w-7 h-7 rounded flex items-center justify-center hover:bg-stone-100 transition-colors text-lg"
              style={{ color: "var(--muted)" }}
            >
              &times;
            </button>
          </div>

          {/* Divider */}
          <div
            className="mx-4 border-t"
            style={{ borderColor: "var(--sidebar-border)" }}
          />

          {/* Seat list */}
          <div className="flex-1 overflow-y-auto px-3 py-2">
            {table.seats.map((seat) => (
              <SeatRow key={seat.id} tableId={table.id} seat={seat} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
