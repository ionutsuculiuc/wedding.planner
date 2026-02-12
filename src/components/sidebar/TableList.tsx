"use client";

import { useSeatingStore } from "@/store/useSeatingStore";
import { MIN_SEATS, MAX_SEATS } from "@/lib/constants";

export function TableList() {
  const tables = useSeatingStore((s) => s.tables);
  const selectedTableId = useSeatingStore((s) => s.selectedTableId);
  const selectTable = useSeatingStore((s) => s.selectTable);
  const removeTable = useSeatingStore((s) => s.removeTable);
  const setSeatCount = useSeatingStore((s) => s.setSeatCount);

  if (tables.length === 0) {
    return (
      <p className="px-4 py-6 text-sm" style={{ color: "var(--muted)" }}>
        No tables yet. Add one above to get started.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-1 px-2">
      {tables.map((table) => {
        const filled = table.seats.filter((s) => s.guestName.trim()).length;
        const isSelected = selectedTableId === table.id;

        return (
          <li
            key={table.id}
            className="rounded-lg px-3 py-2 cursor-pointer transition-colors"
            style={{
              background: isSelected ? "var(--accent-light)" : "transparent",
            }}
            onClick={() => selectTable(isSelected ? null : table.id)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">
                  Table {table.tableNumber}
                </span>
                <span
                  className="text-xs px-1.5 py-0.5 rounded"
                  style={{
                    background: "var(--sidebar-border)",
                    color: "var(--muted)",
                  }}
                >
                  {table.shape === "round" ? "Round" : "Rect"}
                </span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeTable(table.id);
                }}
                className="text-xs px-1.5 py-0.5 rounded hover:bg-red-100 hover:text-red-600 transition-colors"
                style={{ color: "var(--muted)" }}
                title="Remove table"
              >
                &times;
              </button>
            </div>

            <div className="flex items-center justify-between mt-1.5">
              <span className="text-xs" style={{ color: "var(--muted)" }}>
                {filled}/{table.seats.length} seated
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (table.seats.length > MIN_SEATS)
                      setSeatCount(table.id, table.seats.length - 1);
                  }}
                  disabled={table.seats.length <= MIN_SEATS}
                  className="w-6 h-6 rounded text-sm flex items-center justify-center hover:bg-stone-200 disabled:opacity-30 transition-colors"
                >
                  &minus;
                </button>
                <span className="text-xs w-4 text-center tabular-nums">
                  {table.seats.length}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (table.seats.length < MAX_SEATS)
                      setSeatCount(table.id, table.seats.length + 1);
                  }}
                  disabled={table.seats.length >= MAX_SEATS}
                  className="w-6 h-6 rounded text-sm flex items-center justify-center hover:bg-stone-200 disabled:opacity-30 transition-colors"
                >
                  +
                </button>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
