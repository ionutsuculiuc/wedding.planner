"use client";

import { useRef } from "react";
import { useDraggable } from "@dnd-kit/react";
import type { Table } from "@/store/types";
import { useSeatingStore } from "@/store/useSeatingStore";
import { TableShape } from "./TableShape";

interface Props {
  table: Table;
}

export function CanvasTable({ table }: Props) {
  const selectTable = useSeatingStore((s) => s.selectTable);
  const selectedTableId = useSeatingStore((s) => s.selectedTableId);
  const dragStartPos = useRef<{ x: number; y: number } | null>(null);

  const { ref, isDragging } = useDraggable({
    id: table.id,
    data: { tableId: table.id },
  });

  const isSelected = selectedTableId === table.id;

  return (
    <div
      ref={ref}
      className="absolute cursor-grab active:cursor-grabbing"
      style={{
        left: table.x,
        top: table.y,
        transform: "translate(-50%, -50%)",
        zIndex: isDragging ? 50 : isSelected ? 20 : 10,
        opacity: isDragging ? 0.7 : 1,
        filter: isSelected ? "drop-shadow(0 0 6px rgba(180,83,9,0.4))" : "none",
        transition: isDragging ? "none" : "filter 0.15s ease",
      }}
      onPointerDown={(e) => {
        dragStartPos.current = { x: e.clientX, y: e.clientY };
      }}
      onPointerUp={(e) => {
        if (!dragStartPos.current) return;
        const dx = Math.abs(e.clientX - dragStartPos.current.x);
        const dy = Math.abs(e.clientY - dragStartPos.current.y);
        // Only treat as click if moved less than 5px
        if (dx < 5 && dy < 5) {
          selectTable(isSelected ? null : table.id);
        }
        dragStartPos.current = null;
      }}
    >
      <TableShape table={table} />
    </div>
  );
}
