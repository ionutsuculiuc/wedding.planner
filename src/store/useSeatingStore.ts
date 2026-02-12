import { create } from "zustand";
import { nanoid } from "nanoid";
import type { SeatingState, Seat } from "./types";
import { DEFAULT_SEAT_COUNT } from "@/lib/constants";

function createSeats(count: number): Seat[] {
  return Array.from({ length: count }, (_, i) => ({
    id: nanoid(),
    seatNumber: i + 1,
    guestName: "",
  }));
}

export const useSeatingStore = create<SeatingState>((set) => ({
  eventName: "",
  tables: [],
  selectedTableId: null,

  setEventName: (name) => set({ eventName: name }),

  addTable: (shape) =>
    set((state) => {
      const tableNumber =
        state.tables.length > 0
          ? Math.max(...state.tables.map((t) => t.tableNumber)) + 1
          : 1;
      return {
        tables: [
          ...state.tables,
          {
            id: nanoid(),
            tableNumber,
            shape,
            x: 100 + Math.random() * 200,
            y: 100 + Math.random() * 200,
            seats: createSeats(DEFAULT_SEAT_COUNT),
          },
        ],
      };
    }),

  removeTable: (id) =>
    set((state) => ({
      tables: state.tables.filter((t) => t.id !== id),
      selectedTableId:
        state.selectedTableId === id ? null : state.selectedTableId,
    })),

  moveTable: (id, x, y) =>
    set((state) => ({
      tables: state.tables.map((t) => (t.id === id ? { ...t, x, y } : t)),
    })),

  selectTable: (id) => set({ selectedTableId: id }),

  setSeatCount: (tableId, count) =>
    set((state) => ({
      tables: state.tables.map((t) => {
        if (t.id !== tableId) return t;
        const existing = t.seats;
        if (count > existing.length) {
          const additional = Array.from(
            { length: count - existing.length },
            (_, i) => ({
              id: nanoid(),
              seatNumber: existing.length + i + 1,
              guestName: "",
            })
          );
          return { ...t, seats: [...existing, ...additional] };
        }
        return { ...t, seats: existing.slice(0, count) };
      }),
    })),

  setGuestName: (tableId, seatId, name) =>
    set((state) => ({
      tables: state.tables.map((t) =>
        t.id === tableId
          ? {
              ...t,
              seats: t.seats.map((s) =>
                s.id === seatId ? { ...s, guestName: name } : s
              ),
            }
          : t
      ),
    })),
}));
