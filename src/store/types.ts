export interface Seat {
  id: string;
  seatNumber: number;
  guestName: string;
}

export interface Table {
  id: string;
  tableNumber: number;
  shape: "round" | "rectangular";
  x: number;
  y: number;
  seats: Seat[];
}

export interface SeatingState {
  eventName: string;
  tables: Table[];
  selectedTableId: string | null;

  setEventName: (name: string) => void;
  addTable: (shape: "round" | "rectangular") => void;
  removeTable: (id: string) => void;
  moveTable: (id: string, x: number, y: number) => void;
  selectTable: (id: string | null) => void;
  setSeatCount: (tableId: string, count: number) => void;
  setGuestName: (tableId: string, seatId: string, name: string) => void;
}
