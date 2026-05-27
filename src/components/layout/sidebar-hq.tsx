"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, List, Calendar, BarChart3, Settings, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

const menuItems = [
  { href: "/headquarters/dashboard", label: "本部ダッシュボード", icon: Home },
  { href: "/headquarters/deals", label: "案件一覧（全店）", icon: List },
  { href: "/branch/market", label: "仕切レート照会", icon: TrendingUp },
  { href: "#", label: "朝業務メニュー", icon: Calendar, disabled: true },
  { href: "#", label: "日次一覧", icon: BarChart3, disabled: true },
  { href: "#", label: "マスタ管理", icon: Settings, disabled: true },
];

export function SidebarHq() {
  const pathname = usePathname();
  return (
    <aside
      className="w-56 flex flex-col flex-shrink-0"
      style={{
        background: "#080f1e",
        borderRight: "1px solid rgba(0,200,255,0.1)",
      }}
    >
      <div className="px-4 py-3" style={{ borderBottom: "1px solid rgba(0,200,255,0.08)" }}>
        <p className="text-[10px] text-slate-500 uppercase tracking-widest font-medium">本部メニュー</p>
      </div>
      <nav className="flex-1 py-3 space-y-0.5 px-2">
        {menuItems.map(({ href, label, icon: Icon, disabled }) => {
          const isActive =
            !disabled &&
            (pathname === href ||
              (href !== "/headquarters/dashboard" && pathname.startsWith(href)));
          return (
            <Link
              key={href + label}
              href={disabled ? "#" : href}
              onClick={(e) => disabled && e.preventDefault()}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150",
                disabled
                  ? "text-slate-600 cursor-not-allowed"
                  : isActive
                  ? "text-cyber-cyan bg-cyber-cyan/10 border border-cyber-cyan/20 shadow-neon-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-cyber-surface/80"
              )}
            >
              <Icon
                className={cn(
                  "h-4 w-4 shrink-0",
                  disabled ? "text-slate-700" : isActive ? "text-cyber-cyan" : "text-slate-500"
                )}
              />
              <span className="text-xs font-medium">{label}</span>
              {isActive && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-cyber-cyan shadow-neon-sm" />}
              {disabled && (
                <span className="ml-auto text-[9px] text-slate-700 border border-slate-700/50 px-1 rounded tracking-wider">
                  準備中
                </span>
              )}
            </Link>
          );
        })}
      </nav>
      <div
        className="p-4"
        style={{ borderTop: "1px solid rgba(0,200,255,0.08)" }}
      >
        <p className="text-[10px] text-slate-600">市場営業部 本部</p>
      </div>
    </aside>
  );
}
