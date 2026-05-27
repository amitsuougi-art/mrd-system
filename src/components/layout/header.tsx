"use client";

import { useRouter } from "next/navigation";
import { Bell, ChevronDown, Building2, LogOut, User, RefreshCw, Zap } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { MOCK_USERS } from "@/lib/mock-data";
import { useState } from "react";

export function Header({ title }: { title?: string }) {
  const router = useRouter();
  const { currentUser, setCurrentUser } = useAppStore();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const switchUser = (userId: string) => {
    const user = MOCK_USERS.find((u) => u.userId === userId);
    if (user) {
      setCurrentUser(user);
      if (user.role === "BRANCH_STAFF" || user.role === "BRANCH_MGR") {
        router.push("/branch/dashboard");
      } else {
        router.push("/headquarters/dashboard");
      }
    }
    setDropdownOpen(false);
  };

  const handleLogout = () => {
    router.push("/");
    setDropdownOpen(false);
  };

  const roleLabel = (role: string) => {
    if (role === "BRANCH_STAFF") return "営業店担当";
    if (role === "HQ_APPROVER") return "本部承認者";
    if (role === "HQ_REVIEWER") return "本部点検者";
    return role;
  };

  return (
    <header
      className="h-14 flex items-center px-5 gap-4 z-50 sticky top-0"
      style={{
        background: "linear-gradient(90deg, #080f1e 0%, #0b1628 60%, #080f1e 100%)",
        borderBottom: "1px solid rgba(0,200,255,0.15)",
        boxShadow: "0 1px 20px rgba(0,0,0,0.6), 0 0 40px rgba(0,200,255,0.04)",
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5 font-bold text-sm whitespace-nowrap">
        <div className="flex items-center justify-center h-7 w-7 rounded-md bg-cyber-cyan/15 border border-cyber-cyan/30">
          <Zap className="h-4 w-4 text-cyber-cyan" />
        </div>
        <span className="text-slate-100">市場営業部</span>
        <span className="text-cyber-cyan" style={{ textShadow: "0 0 10px rgba(0,200,255,0.5)" }}>
          業務システム
        </span>
        <span className="text-[10px] bg-cyber-amber/20 border border-cyber-amber/30 text-cyber-amber px-1.5 py-0.5 rounded font-normal tracking-wider">
          DEMO
        </span>
      </div>

      <div className="flex-1" />
      {title && (
        <span className="text-xs text-slate-400 hidden md:block tracking-wide">{title}</span>
      )}
      <div className="flex-1" />

      {/* Notification Bell */}
      <button className="relative p-2 rounded-lg hover:bg-cyber-surface transition-colors group">
        <Bell className="h-4 w-4 text-slate-400 group-hover:text-slate-200" />
        <span
          className="absolute top-1.5 right-1.5 h-3.5 w-3.5 rounded-full text-[9px] flex items-center justify-center font-bold"
          style={{ background: "#ef4444", boxShadow: "0 0 6px rgba(239,68,68,0.6)" }}
        >
          3
        </span>
      </button>

      {/* User Menu */}
      <div className="relative">
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all hover:bg-cyber-surface border border-transparent hover:border-cyber-border"
        >
          <div className="flex items-center justify-center h-6 w-6 rounded-full bg-cyber-cyan/15 border border-cyber-cyan/25">
            <User className="h-3.5 w-3.5 text-cyber-cyan" />
          </div>
          <span className="hidden sm:block text-slate-200 text-xs font-medium">
            {currentUser?.name || "未ログイン"}
          </span>
          <span className="text-[10px] text-slate-500 hidden md:block">
            {currentUser?.role ? `/ ${roleLabel(currentUser.role)}` : ""}
          </span>
          <ChevronDown className={`h-3 w-3 text-slate-500 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
        </button>

        {dropdownOpen && (
          <div
            className="absolute right-0 top-full mt-2 w-60 rounded-xl z-50 overflow-hidden"
            style={{
              background: "#0b1628",
              border: "1px solid rgba(0,200,255,0.15)",
              boxShadow: "0 16px 40px rgba(0,0,0,0.6), 0 0 0 1px rgba(0,200,255,0.05)",
            }}
          >
            <div className="px-4 py-2.5 border-b border-cyber-border/50">
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-medium">
                ロール切替（デモ用）
              </p>
            </div>
            {MOCK_USERS.map((u) => (
              <button
                key={u.userId}
                onClick={() => switchUser(u.userId)}
                className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center gap-3 ${
                  currentUser?.userId === u.userId
                    ? "bg-cyber-cyan/10 text-cyber-cyan"
                    : "text-slate-300 hover:bg-cyber-surface"
                }`}
              >
                <RefreshCw className="h-3 w-3 text-slate-500 shrink-0" />
                <div>
                  <div className="font-medium">{u.name}</div>
                  <div className="text-[10px] text-slate-500">
                    {roleLabel(u.role)}
                    {u.branchName ? ` / ${u.branchName}` : " / 本部"}
                  </div>
                </div>
                {currentUser?.userId === u.userId && (
                  <span className="ml-auto text-[10px] text-cyber-cyan">●</span>
                )}
              </button>
            ))}
            <div className="border-t border-cyber-border/50">
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2.5 text-sm text-cyber-red hover:bg-cyber-red/10 transition-colors flex items-center gap-3"
              >
                <LogOut className="h-3.5 w-3.5" />
                ログアウト
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
