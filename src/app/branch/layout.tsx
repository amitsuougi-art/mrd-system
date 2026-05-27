"use client";

import { Header } from "@/components/layout/header";
import { SidebarBranch } from "@/components/layout/sidebar-branch";

export default function BranchLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-cyber-bg flex flex-col">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <SidebarBranch />
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
