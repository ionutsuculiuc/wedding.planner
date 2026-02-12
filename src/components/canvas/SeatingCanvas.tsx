"use client";

import { useEffect, useRef, useCallback } from "react";
import { useSeatingStore } from "@/store/useSeatingStore";
import {
  drawDotGrid,
  drawTable,
  drawEmptyState,
  hitTestTable,
  getColorsFromCSS,
  type CanvasColors,
} from "./drawUtils";

interface DragState {
  tableId: string;
  /** Pointer position when drag started (canvas coords) */
  originX: number;
  originY: number;
  /** Table position when drag started */
  tableStartX: number;
  tableStartY: number;
  /** Current pointer position (canvas coords), updated during move */
  currentX: number;
  currentY: number;
  /** Whether pointer moved ≥5px from origin */
  moved: boolean;
}

export function SeatingCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const colorsRef = useRef<CanvasColors | null>(null);
  const dragRef = useRef<DragState | null>(null);
  const rafRef = useRef<number>(0);
  const sizeRef = useRef({ w: 0, h: 0 });

  const getColors = useCallback(() => {
    if (!colorsRef.current) {
      colorsRef.current = getColorsFromCSS();
    }
    return colorsRef.current;
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { w, h } = sizeRef.current;
    const dpr = window.devicePixelRatio || 1;
    const colors = getColors();

    ctx.save();
    ctx.scale(dpr, dpr);

    // Clear
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = colors.background;
    ctx.fillRect(0, 0, w, h);

    // Dot grid
    drawDotGrid(ctx, w, h, colors.canvasDot);

    const { tables, selectedTableId } = useSeatingStore.getState();
    const drag = dragRef.current;

    if (tables.length === 0) {
      drawEmptyState(ctx, w, h, colors.muted);
    } else {
      // Draw non-dragged tables first, then dragged table on top
      for (const table of tables) {
        if (drag?.moved && table.id === drag.tableId) continue;
        const isSelected = selectedTableId === table.id;
        drawTable(ctx, table, table.x, table.y, isSelected, colors);
      }

      // Draw dragged table on top with offset
      if (drag?.moved) {
        const table = tables.find((t) => t.id === drag.tableId);
        if (table) {
          const isSelected = selectedTableId === table.id;
          const dx = drag.currentX - drag.originX;
          const dy = drag.currentY - drag.originY;
          drawTable(
            ctx,
            table,
            drag.tableStartX + dx,
            drag.tableStartY + dy,
            isSelected,
            colors,
            0.7
          );
        }
      }
    }

    ctx.restore();
  }, [getColors]);

  // Resize handling
  useEffect(() => {
    const wrapper = wrapperRef.current;
    const canvas = canvasRef.current;
    if (!wrapper || !canvas) return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const { width, height } = entry.contentRect;
      const dpr = window.devicePixelRatio || 1;

      sizeRef.current = { w: width, h: height };
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      draw();
    });

    observer.observe(wrapper);
    return () => observer.disconnect();
  }, [draw]);

  // Store subscription — redraw on any state change
  useEffect(() => {
    const unsub = useSeatingStore.subscribe(() => {
      draw();
    });
    return unsub;
  }, [draw]);

  // Dark mode toggle — watch <html> class changes
  useEffect(() => {
    const observer = new MutationObserver(() => {
      colorsRef.current = null; // bust cache
      draw();
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, [draw]);

  // Pointer event helpers
  const getCanvasPoint = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return { x: 0, y: 0 };
      const rect = canvas.getBoundingClientRect();
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    },
    []
  );

  const onPointerDown = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      const pt = getCanvasPoint(e);
      const { tables } = useSeatingStore.getState();

      // Hit-test tables in reverse order (top-most first)
      for (let i = tables.length - 1; i >= 0; i--) {
        if (hitTestTable(tables[i], pt.x, pt.y)) {
          dragRef.current = {
            tableId: tables[i].id,
            originX: pt.x,
            originY: pt.y,
            tableStartX: tables[i].x,
            tableStartY: tables[i].y,
            currentX: pt.x,
            currentY: pt.y,
            moved: false,
          };
          canvasRef.current?.setPointerCapture(e.pointerId);
          return;
        }
      }

      // Clicked empty space — deselect
      useSeatingStore.getState().selectTable(null);
    },
    [getCanvasPoint]
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      const drag = dragRef.current;
      if (!drag) return;

      const pt = getCanvasPoint(e);
      drag.currentX = pt.x;
      drag.currentY = pt.y;

      const dx = pt.x - drag.originX;
      const dy = pt.y - drag.originY;

      if (!drag.moved && dx * dx + dy * dy < 25) return;
      drag.moved = true;

      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(draw);
    },
    [getCanvasPoint, draw]
  );

  const onPointerUp = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      const drag = dragRef.current;
      if (!drag) return;

      canvasRef.current?.releasePointerCapture(e.pointerId);

      if (!drag.moved) {
        // Click — toggle selection
        const { selectedTableId, selectTable } = useSeatingStore.getState();
        selectTable(selectedTableId === drag.tableId ? null : drag.tableId);
      } else {
        // Drag ended — commit position, clamped 60px from edges
        const pt = getCanvasPoint(e);
        const { w, h } = sizeRef.current;
        const dx = pt.x - drag.originX;
        const dy = pt.y - drag.originY;
        let newX = drag.tableStartX + dx;
        let newY = drag.tableStartY + dy;

        newX = Math.max(60, Math.min(newX, w - 60));
        newY = Math.max(60, Math.min(newY, h - 60));

        useSeatingStore.getState().moveTable(drag.tableId, newX, newY);
      }

      dragRef.current = null;
      draw();
    },
    [getCanvasPoint, draw]
  );

  return (
    <div ref={wrapperRef} className="relative flex-1 overflow-hidden">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 cursor-grab active:cursor-grabbing"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      />
    </div>
  );
}
