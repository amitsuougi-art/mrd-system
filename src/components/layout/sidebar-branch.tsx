"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, PlusCircle, List, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

const menuItems = [
  { href: "/branch/dashboard", label: "ダッシュボード", icon: Home },
  { href: "/branch/deals/new", label: "新規案件登録", icon: PlusCircle },
  { href: "/branch/deals", label: "案件一覧", icon: List },
  { href: "/branch/market", label: "市場データ確認", icon: TrendingUp },
];

export function SidebarBranch() {
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
        <p className="text-[10px] text-slate-500 uppercase tracking-widest font-medium">営業店メニュー</p>
      </div>
      <nav className="flex-1 py-3 space-y-0.5 px-2">
        {menuItems.map(({ href, label, icon: Icon }) => {
          const isActive =
            pathname === href ||
            (href !== "/branch/dashboard" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150",
                isActive
                  ? "text-cyber-cyan bg-cyber-cyan/10 border border-cyber-cyan/20 shadow-neon-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-cyber-surface/80"
              )}
            >
              <Icon className={cn("h-4 w-4 shrink-0", isActive ? "text-cyber-cyan" : "text-slate-500")} />
              <span className="text-xs font-medium">{label}</span>
              {isActive && (
                <span className="ml-auto h-1.5 w-1.5 rounded-full bg-cyber-cyan shadow-neon-sm" />
              )}
            </Link>
          );
        })}
      </nav>
      <div
        className="p-4"
        style={{ borderTop: "1px solid rgba(0,200,255,0.08)" }}
      >
        <p className="text-[10px] text-slate-600">横浜支店（200）</p>
      </div>
    </aside>
  );
}
