"use client";

import { useCallback, useRef } from "react";
import { DragDropProvider } from "@dnd-kit/react";
import { useSeatingStore } from "@/store/useSeatingStore";
import { CanvasTable } from "./CanvasTable";

export function Canvas() {
  const tables = useSeatingStore((s) => s.tables);
  const moveTable = useSeatingStore((s) => s.moveTable);
  const canvasRef = useRef<HTMLDivElement>(null);

  const handleDragEnd = useCallback(
    (event: { canceled: boolean; operation: { source: { id: string | number } | null; transform: { x: number; y: number } } }) => {
      if (event.canceled) return;

      const { source, transform } = event.operation;
      if (!source) return;

      const tableId = source.id as string;
      const table = useSeatingStore
        .getState()
        .tables.find((t) => t.id === tableId);
      if (!table) return;

      let newX = table.x + transform.x;
      let newY = table.y + transform.y;

      // Clamp to canvas bounds
      if (canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        newX = Math.max(60, Math.min(newX, rect.width - 60));
        newY = Math.max(60, Math.min(newY, rect.height - 60));
      }

      moveTable(tableId, newX, newY);
    },
    [moveTable]
  );

  return (
    <DragDropProvider onDragEnd={handleDragEnd}>
      <div
        ref={canvasRef}
        className="relative flex-1 overflow-hidden"
        style={{
          background:
            "radial-gradient(circle, var(--canvas-dot) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      >
        {tables.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center" style={{ color: "var(--muted)" }}>
              <p className="text-lg font-medium mb-1">No tables yet</p>
              <p className="text-sm">
                Use the sidebar to add round or rectangular tables
              </p>
            </div>
          </div>
        )}
        {tables.map((table) => (
          <CanvasTable key={table.id} table={table} />
        ))}
      </div>
    </DragDropProvider>
  );
}
