"use client";

import { useSeatingStore } from "@/store/useSeatingStore";
import { generatePdf } from "./generatePdf";

export function PdfExport() {
  const tables = useSeatingStore((s) => s.tables);
  const eventName = useSeatingStore((s) => s.eventName);

  return (
    <button
      onClick={() => generatePdf(eventName, tables)}
      disabled={tables.length === 0}
      className="w-full rounded-md px-3 py-2 text-sm font-medium text-white transition-colors hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
      style={{ background: "#1c1917" }}
    >
      Export PDF
    </button>
  );
}
