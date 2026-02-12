"use client";

import { useSeatingStore } from "@/store/useSeatingStore";
import { SIDEBAR_WIDTH } from "@/lib/constants";
import { TableList } from "./TableList";
import { PdfExport } from "@/components/pdf/PdfExport";
import { ThemeToggle } from "@/components/ThemeToggle";
import { exportCanvasImage } from "@/components/canvas/exportCanvasImage";

export function Sidebar() {
  const addTable = useSeatingStore((s) => s.addTable);
  const tables = useSeatingStore((s) => s.tables);
  const eventName = useSeatingStore((s) => s.eventName);
  const setEventName = useSeatingStore((s) => s.setEventName);

  return (
    <aside
      className="flex flex-col h-full shrink-0 border-r"
      style={{
        width: SIDEBAR_WIDTH,
        background: "var(--sidebar-bg)",
        borderColor: "var(--sidebar-border)",
      }}
    >
      {/* Header */}
      <div className="px-4 pt-5 pb-3">
        <div className="flex items-center justify-between">
          <h1 className="text-base font-semibold tracking-tight">
            Seating Planner
          </h1>
          <ThemeToggle />
        </div>
        <input
          type="text"
          placeholder="Event name..."
          value={eventName}
          onChange={(e) => setEventName(e.target.value)}
          className="mt-2 w-full rounded-md border px-2.5 py-1.5 text-sm outline-none focus:ring-2"
          style={{
            borderColor: "var(--sidebar-border)",
          }}
        />
      </div>

      {/* Add table buttons */}
      <div className="px-4 pb-3 flex gap-2">
        <button
          onClick={() => addTable("round")}
          className="flex-1 rounded-md px-3 py-2 text-sm font-medium text-white transition-colors hover:opacity-90"
          style={{ background: "var(--accent)" }}
        >
          + Round
        </button>
        <button
          onClick={() => addTable("rectangular")}
          className="flex-1 rounded-md px-3 py-2 text-sm font-medium text-white transition-colors hover:opacity-90"
          style={{ background: "var(--accent)" }}
        >
          + Rectangular
        </button>
      </div>

      {/* Divider */}
      <div
        className="mx-4 border-t"
        style={{ borderColor: "var(--sidebar-border)" }}
      />

      {/* Table list */}
      <div className="flex-1 overflow-y-auto py-2">
        <TableList />
      </div>

      {/* Footer with exports */}
      <div
        className="border-t p-4"
        style={{ borderColor: "var(--sidebar-border)" }}
      >
        <div className="flex gap-2">
          <PdfExport />
          <button
            onClick={exportCanvasImage}
            disabled={tables.length === 0}
            className="flex-1 rounded-md px-3 py-2 text-sm font-medium text-white transition-colors hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: "#1c1917" }}
          >
            Export PNG
          </button>
        </div>
      </div>
    </aside>
  );
}
