"use client";

import { Sidebar } from "@/components/sidebar/Sidebar";
import { Canvas } from "@/components/canvas/Canvas";
import { GuestModal } from "@/components/modal/GuestModal";

export default function Home() {
  return (
    <div className="flex h-screen w-screen overflow-hidden">
      <Sidebar />
      <Canvas />
      <GuestModal />
    </div>
  );
}
