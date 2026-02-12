"use client";

import { Sidebar } from "@/components/sidebar/Sidebar";
import { SeatingCanvas } from "@/components/canvas/SeatingCanvas";
import { GuestModal } from "@/components/modal/GuestModal";

export default function Home() {
  return (
    <div className="flex h-screen w-screen overflow-hidden">
      <Sidebar />
      <SeatingCanvas />
      <GuestModal />
    </div>
  );
}
