"use client";

import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";
import { SummaryCard } from "@/components/common/summary-card";
import { StatusBadge } from "@/components/deals/status-badge";
import { formatDateTime, formatCurrency } from "@/lib/format";
import {
  Loader2, AlertTriangle, CheckCircle2, FileText, Clock,
  PlusCircle, ArrowRight
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function BranchDashboardPage() {
  const router = useRouter();
  const { deals, currentUser } = useAppStore();

  const processingDeals = deals.filter((d) =>
    ["OCR_PENDING", "CALCULATING", "REVIEW_PENDING", "APPROVAL_PENDING", "SUBMITTED_BY_BRANCH"].includes(d.status)
  );
  const actionRequired = deals.filter((d) =>
    ["OCR_PENDING", "CALCULATED", "APPROVED"].includes(d.status)
  );
  const thisMonthDeals = deals.filter((d) => {
    const now = new Date();
    const created = new Date(d.createdAt);
    return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
  });
  const urgentDeals = deals.filter((d) =>
    d.status !== "CONFIRMED" && d.status !== "CANCELLED"
  );

  const recentDeals = [...deals].sort((a, b) =>
    new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  ).slice(0, 5);

  const showToast = (message: string) => {
    // Simple toast simulation
    alert(message);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">営業店ダッシュボード</h1>
        <p className="text-sm text-gray-500 mt-1">ようこそ、{currentUser?.name}さん（{currentUser?.branchName}）</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          title="処理中案件"
          value={processingDeals.length}
          subtitle="OCR待ち・計算中・本部点検中"
          icon={Loader2}
        />
        <SummaryCard
          title="要対応"
          value={actionRequired.length}
          subtitle="OCR確認待ち・結果確認・確定待ち"
          icon={AlertTriangle}
          accent
        />
        <SummaryCard
          title="今月処理"
          value={thisMonthDeals.length}
          subtitle="当月の試算件数"
          icon={CheckCircle2}
        />
        <SummaryCard
          title="回答時限近い案件"
          value={urgentDeals.filter(d => d.input.prepayment.answerRequiredDate === "2026-05-28").length || 2}
          subtitle="当日対応必要案件"
          icon={Clock}
          urgent
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link href="/mrd-system/branch/deals/new">
          <Card className="cursor-pointer hover:shadow-md transition-shadow bg-bank-primary text-white border-0">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <PlusCircle className="h-5 w-5" />
                  <span className="font-semibold text-lg">期限前弁済手数料 新規依頼</span>
                </div>
                <p className="text-sm text-blue-200">固定金利融資の期限前弁済手数料を試算する</p>
              </div>
              <ArrowRight className="h-6 w-6 text-blue-200" />
            </CardContent>
          </Card>
        </Link>

        <div
          onClick={() => alert("仕切レート新規依頼機能は準備中です")}
          className="cursor-pointer"
        >
          <Card className="hover:shadow-md transition-shadow border-bank-primary border-2">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2 text-bank-primary">
                  <FileText className="h-5 w-5" />
                  <span className="font-semibold text-lg">仕切レート 新規依頼</span>
                </div>
                <p className="text-sm text-gray-500">融資仕切レートを取得する</p>
              </div>
              <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-500">準備中</span>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Deals Table */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold">最近の案件</CardTitle>
            <Link href="/mrd-system/branch/deals">
              <Button variant="ghost" size="sm">すべて見る →</Button>
            </Link>
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
                  <th className="text-left px-4 py-3 font-medium text-gray-600">更新日時</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">操作</th>
                </tr>
              </thead>
              <tbody>
                {recentDeals.map((deal) => (
                  <tr key={deal.dealId} className="border-b hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs">{deal.dealNo}</td>
                    <td className="px-4 py-3 font-medium">{deal.input.customerInfo.customerName}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {deal.businessType === "PREPAY" ? "期限前弁済" : "仕切レート"}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={deal.status} />
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{formatDateTime(deal.updatedAt)}</td>
                    <td className="px-4 py-3">
                      {deal.status === "CALCULATED" || deal.status === "APPROVED" ? (
                        <Link href={`/mrd-system/branch/deals/${deal.dealId}/result`}>
                          <Button size="sm" variant="outline">結果確認</Button>
                        </Link>
                      ) : deal.status === "OCR_PENDING" ? (
                        <Link href={`/mrd-system/branch/deals/${deal.dealId}/ocr`}>
                          <Button size="sm" variant="outline">OCR確認</Button>
                        </Link>
                      ) : (
                        <Link href={`/mrd-system/branch/deals/${deal.dealId}/result`}>
                          <Button size="sm" variant="ghost">詳細</Button>
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
                {recentDeals.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-400">案件がありません</td>
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
