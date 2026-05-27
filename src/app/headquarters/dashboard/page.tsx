"use client";

import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";
import { SummaryCard } from "@/components/common/summary-card";
import { StatusBadge } from "@/components/deals/status-badge";
import { formatDateTime } from "@/lib/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Clock, AlertTriangle, FileCheck } from "lucide-react";
import Link from "next/link";

export default function HqDashboardPage() {
  const { deals, currentUser } = useAppStore();

  const receptionPending = deals.filter((d) => d.status === "SUBMITTED_BY_BRANCH" || d.status === "RECEPTION_PENDING");
  const reviewPending = deals.filter((d) => d.status === "REVIEW_PENDING" || d.status === "REVIEW_DONE");
  const approvalPending = deals.filter((d) => d.status === "APPROVAL_PENDING");
  const confirmedToday = deals.filter((d) => {
    if (!d.confirmedAt) return false;
    const today = new Date().toDateString();
    return new Date(d.confirmedAt).toDateString() === today;
  });

  const actionDeals = deals.filter((d) =>
    ["SUBMITTED_BY_BRANCH", "RECEPTION_PENDING", "REVIEW_PENDING", "APPROVAL_PENDING"].includes(d.status)
  );

  // Deadline items (mock)
  const deadlineItems = [
    { time: "14:00", count: 2, urgent: false, deals: ["20260527-200-00002"] },
    { time: "15:00", count: 1, urgent: true, deals: ["20260527-200-00001"] },
    { time: "16:00", count: 1, urgent: false, deals: [] },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Morning Operations Banner */}
      <div className="bg-green-600 text-white px-5 py-3 rounded-lg flex items-center gap-3">
        <CheckCircle2 className="h-5 w-5" />
        <span className="font-medium">本日の朝業務完了：LSEG取得 ✓ 仕切表更新 ✓ データ品質チェック ✓（9:00完了）</span>
      </div>

      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">本部ダッシュボード</h1>
        <p className="text-sm text-gray-500 mt-1">ようこそ、{currentUser?.name}さん</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard title="受付待ち" value={receptionPending.length + 4} subtitle="営業店からの依頼" icon={Clock} />
        <SummaryCard title="点検待ち" value={reviewPending.length + 2} subtitle="本部点検中" icon={AlertTriangle} accent />
        <SummaryCard title="承認待ち" value={approvalPending.length + 2} subtitle="役席承認待ち" icon={FileCheck} urgent />
        <SummaryCard title="本日確定" value={confirmedToday.length + 1} subtitle="本日の確定件数" icon={CheckCircle2} />
      </div>

      {/* Deadline Dashboard */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">回答時限ダッシュボード（本日）</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {deadlineItems.map(({ time, count, urgent }) => (
              <div key={time} className="flex items-center gap-4">
                <div className="w-16 text-sm font-mono font-medium text-gray-600">{time}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <div
                      className={`h-8 rounded-md flex items-center px-3 text-sm font-medium text-white transition-all ${
                        urgent ? "bg-red-500" : "bg-bank-primary"
                      }`}
                      style={{ width: `${Math.min(count * 80, 300)}px` }}
                    >
                      {urgent && "🔴 "}{count}件
                    </div>
                    {urgent && <span className="text-xs text-red-600 font-medium">⚠ 30分前</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Action Required Deals Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">本部対応必要案件一覧</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left px-4 py-3 font-medium text-gray-600">案件番号</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">営業店</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">取引先</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">業務種別</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">ステータス</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">回答時限</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">操作</th>
                </tr>
              </thead>
              <tbody>
                {/* Show action-required deals from store */}
                {actionDeals.map((deal) => (
                  <tr key={deal.dealId} className="border-b hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs">{deal.dealNo}</td>
                    <td className="px-4 py-3 text-gray-600">{deal.input.customerInfo.branchCode}店</td>
                    <td className="px-4 py-3 font-medium">{deal.input.customerInfo.customerName}</td>
                    <td className="px-4 py-3">期限前弁済</td>
                    <td className="px-4 py-3"><StatusBadge status={deal.status} /></td>
                    <td className="px-4 py-3 text-sm">{deal.input.prepayment.answerRequiredDate} {deal.input.prepayment.answerDeadline}</td>
                    <td className="px-4 py-3">
                      <Link href={`/mrd-system/headquarters/deals/${deal.dealId}/review`}>
                        <Button size="sm">承認・再鑑</Button>
                      </Link>
                    </td>
                  </tr>
                ))}
                {/* Demo rows if no action deals */}
                {actionDeals.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-gray-400">対応必要案件はありません</td>
                  </tr>
                )}
                {/* Show the REVIEW_PENDING deal from mock data */}
                {deals.filter(d => d.status === "REVIEW_PENDING" && !actionDeals.find(a => a.dealId === d.dealId)).map((deal) => (
                  <tr key={deal.dealId + "-hq"} className="border-b hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs">{deal.dealNo}</td>
                    <td className="px-4 py-3 text-gray-600">{deal.input.customerInfo.branchCode}店</td>
                    <td className="px-4 py-3 font-medium">{deal.input.customerInfo.customerName}</td>
                    <td className="px-4 py-3">期限前弁済</td>
                    <td className="px-4 py-3"><StatusBadge status={deal.status} /></td>
                    <td className="px-4 py-3 text-sm">{deal.input.prepayment.answerRequiredDate} {deal.input.prepayment.answerDeadline}</td>
                    <td className="px-4 py-3">
                      <Link href={`/mrd-system/headquarters/deals/${deal.dealId}/review`}>
                        <Button size="sm">承認・再鑑</Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
