"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, List, Calendar, BarChart3, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const menuItems = [
  { href: "/mrd-system/headquarters/dashboard", label: "本部ダッシュボード", icon: Home },
  { href: "/mrd-system/headquarters/deals", label: "案件一覧（全店）", icon: List },
  { href: "#", label: "朝業務メニュー", icon: Calendar, disabled: true },
  { href: "#", label: "日次一覧", icon: BarChart3, disabled: true },
  { href: "#", label: "マスタ管理", icon: Settings, disabled: true },
];

export function SidebarHq() {
  const pathname = usePathname();
  return (
    <aside className="w-56 bg-white border-r h-full flex flex-col">
      <div className="px-4 py-3 border-b">
        <p className="text-xs text-gray-500">本部メニュー</p>
      </div>
      <nav className="flex-1 py-2">
        {menuItems.map(({ href, label, icon: Icon, disabled }) => {
          const isActive = !disabled && (pathname === href || (href !== "/mrd-system/headquarters/dashboard" && pathname.startsWith(href)));
          return (
            <Link
              key={href + label}
              href={disabled ? "#" : href}
              className={cn(
                "flex items-center gap-3 px-4 py-2.5 text-sm transition-colors",
                disabled ? "text-gray-400 cursor-not-allowed" :
                isActive ? "bg-bank-primary/10 text-bank-primary font-medium border-r-2 border-bank-primary" :
                "text-gray-600 hover:bg-gray-50"
              )}
              onClick={(e) => disabled && e.preventDefault()}
            >
              <Icon className="h-4 w-4" />
              {label}
              {disabled && <span className="ml-auto text-[10px] text-gray-300">準備中</span>}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t">
        <p className="text-xs text-gray-400">市場営業部 本部</p>
      </div>
    </aside>
  );
}
