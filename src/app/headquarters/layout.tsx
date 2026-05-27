"use client";

import { Header } from "@/components/layout/header";
import { SidebarHq } from "@/components/layout/sidebar-hq";

export default function HeadquartersLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-bank-bg flex flex-col">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <SidebarHq />
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
