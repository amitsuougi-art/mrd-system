"use client";

import { useAppStore } from "@/lib/store";
import { StatusBadge } from "@/components/deals/status-badge";
import { formatDateTime } from "@/lib/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PlusCircle, Search } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";

export default function BranchDealsPage() {
  const { deals } = useAppStore();
  const [search, setSearch] = useState("");

  const filtered = deals.filter(
    (d) =>
      d.dealNo.includes(search) ||
      d.input.customerInfo.customerName.includes(search) ||
      search === ""
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">案件一覧</h1>
          <p className="text-sm text-gray-500 mt-1">自店の案件一覧</p>
        </div>
        <Link href="/mrd-system/branch/deals/new">
          <Button>
            <PlusCircle className="h-4 w-4 mr-2" />
            新規案件登録
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="案件番号・取引先で検索"
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left px-4 py-3 font-medium text-gray-600">案件番号</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">取引先名</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">業務種別</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">ステータス</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">手数料額</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">作成日時</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">操作</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((deal) => (
                  <tr key={deal.dealId} className="border-b hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs">{deal.dealNo}</td>
                    <td className="px-4 py-3 font-medium">{deal.input.customerInfo.customerName}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {deal.businessType === "PREPAY" ? "期限前弁済" : "仕切レート"}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={deal.status} />
                    </td>
                    <td className="px-4 py-3 text-right font-mono">
                      {deal.result
                        ? new Intl.NumberFormat("ja-JP", { style: "currency", currency: "JPY" }).format(deal.result.prepaymentFee)
                        : "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{formatDateTime(deal.createdAt)}</td>
                    <td className="px-4 py-3">
                      <Link href={`/mrd-system/branch/deals/${deal.dealId}/result`}>
                        <Button size="sm" variant="outline">詳細</Button>
                      </Link>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-gray-400">案件がありません</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
