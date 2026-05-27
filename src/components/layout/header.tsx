"use client";

import { useRouter } from "next/navigation";
import { Bell, ChevronDown, Building2, LogOut, User, RefreshCw } from "lucide-react";
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
        router.push("/mrd-system/branch/dashboard");
      } else {
        router.push("/mrd-system/headquarters/dashboard");
      }
    }
    setDropdownOpen(false);
  };

  const handleLogout = () => {
    router.push("/mrd-system/");
    setDropdownOpen(false);
  };

  return (
    <header className="h-14 bg-bank-primary text-white flex items-center px-4 gap-4 shadow-md z-50 sticky top-0">
      <div className="flex items-center gap-2 font-bold text-base whitespace-nowrap">
        <Building2 className="h-5 w-5" />
        <span>市場営業部 業務システム</span>
        <span className="text-xs bg-amber-500 px-1.5 py-0.5 rounded text-white font-normal">デモ</span>
      </div>
      <div className="flex-1" />
      {title && <span className="text-sm opacity-80 hidden md:block">{title}</span>}
      <div className="flex-1" />

      {/* Notifications */}
      <button className="relative p-2 hover:bg-bank-primary-light rounded-md">
        <Bell className="h-5 w-5" />
        <span className="absolute top-1 right-1 h-4 w-4 rounded-full bg-red-500 text-[10px] flex items-center justify-center">3</span>
      </button>

      {/* User Menu */}
      <div className="relative">
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-2 hover:bg-bank-primary-light px-3 py-1.5 rounded-md text-sm"
        >
          <User className="h-4 w-4" />
          <span className="hidden sm:block">{currentUser?.name || "未ログイン"}</span>
          <span className="text-xs opacity-70 hidden md:block">
            ({currentUser?.role === "BRANCH_STAFF" ? "営業店担当" :
              currentUser?.role === "HQ_APPROVER" ? "本部承認者" :
              currentUser?.role === "HQ_REVIEWER" ? "本部点検者" : currentUser?.role})
          </span>
          <ChevronDown className="h-3 w-3" />
        </button>
        {dropdownOpen && (
          <div className="absolute right-0 top-full mt-1 w-56 bg-white text-gray-900 rounded-md shadow-lg border z-50">
            <div className="px-3 py-2 border-b text-xs text-gray-500">ロール切替（デモ用）</div>
            {MOCK_USERS.map((u) => (
              <button
                key={u.userId}
                onClick={() => switchUser(u.userId)}
                className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2 ${currentUser?.userId === u.userId ? "bg-blue-50 font-medium" : ""}`}
              >
                <RefreshCw className="h-3 w-3 text-gray-400" />
                <div>
                  <div>{u.name}</div>
                  <div className="text-xs text-gray-500">
                    {u.role === "BRANCH_STAFF" ? "営業店担当" :
                     u.role === "HQ_REVIEWER" ? "本部点検者" :
                     u.role === "HQ_APPROVER" ? "本部承認者" : u.role}
                    {u.branchName ? ` / ${u.branchName}` : " / 本部"}
                  </div>
                </div>
              </button>
            ))}
            <div className="border-t">
              <button
                onClick={handleLogout}
                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2 text-red-600"
              >
                <LogOut className="h-3 w-3" />
                ログアウト
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
