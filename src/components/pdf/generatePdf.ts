import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import type { Table } from "@/store/types";

export function generatePdf(eventName: string, tables: Table[]) {
  const doc = new jsPDF();
  const title = eventName.trim() || "Seating Arrangement";

  // Title
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text(title, 14, 22);

  // Subtitle
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(120);
  const totalSeats = tables.reduce((sum, t) => sum + t.seats.length, 0);
  const totalGuests = tables.reduce(
    (sum, t) => sum + t.seats.filter((s) => s.guestName.trim()).length,
    0
  );
  doc.text(
    `${tables.length} mese \u00B7 ${totalGuests}/${totalSeats} invitati`,
    14,
    30
  );
  doc.setTextColor(0);

  let startY = 38;

  for (const table of tables) {
    const guests = table.seats.filter((s) => s.guestName.trim());
    const rows = table.seats.map((seat) => [
      seat.seatNumber,
      seat.guestName.trim() || "\u2014",
    ]);

    // Table heading
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.text(
      `Masa ${table.tableNumber}  (${guests.length}/${table.seats.length} invitati)`,
      14,
      startY
    );
    startY += 2;

    autoTable(doc, {
      startY,
      head: [["Loc", "Invitat"]],
      body: rows,
      theme: "striped",
      headStyles: {
        fillColor: [180, 83, 9],
        textColor: 255,
        fontStyle: "bold",
      },
      alternateRowStyles: {
        fillColor: [254, 243, 199],
      },
      styles: {
        fontSize: 10,
        cellPadding: 4,
      },
      margin: { left: 14, right: 14 },
    });

    // Get the Y after the table was drawn
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    startY = (doc as any).lastAutoTable.finalY + 12;

    // Add new page if running low on space
    if (startY > 260) {
      doc.addPage();
      startY = 20;
    }
  }

  doc.save(`${title.replace(/\s+/g, "_")}_seating.pdf`);
}
