"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, PlusCircle, List, Bell } from "lucide-react";
import { cn } from "@/lib/utils";

const menuItems = [
  { href: "/mrd-system/branch/dashboard", label: "ダッシュボード", icon: Home },
  { href: "/mrd-system/branch/deals/new", label: "新規案件登録", icon: PlusCircle },
  { href: "/mrd-system/branch/deals", label: "案件一覧", icon: List },
];

export function SidebarBranch() {
  const pathname = usePathname();
  return (
    <aside className="w-56 bg-white border-r h-full flex flex-col">
      <div className="px-4 py-3 border-b">
        <p className="text-xs text-gray-500">営業店メニュー</p>
      </div>
      <nav className="flex-1 py-2">
        {menuItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || (href !== "/mrd-system/branch/dashboard" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-4 py-2.5 text-sm transition-colors",
                isActive
                  ? "bg-bank-primary/10 text-bank-primary font-medium border-r-2 border-bank-primary"
                  : "text-gray-600 hover:bg-gray-50"
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t">
        <p className="text-xs text-gray-400">横浜支店（200）</p>
      </div>
    </aside>
  );
}
