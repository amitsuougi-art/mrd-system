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

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold text-slate-100">営業店ダッシュボード</h1>
        <p className="text-slate-400 text-sm mt-1">ようこそ、{currentUser?.name}さん（{currentUser?.branchName}）</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          title="処理中案件"
          value={processingDeals.length}
          subtitle="OCR処理中・計算中・本部点検中"
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
        <Link href="/branch/deals/new">
          <Card
            className="cursor-pointer hover:shadow-lg transition-shadow border-0"
            style={{ background: "linear-gradient(135deg, #0a2040 0%, #0d2d50 100%)", border: "1px solid rgba(0,200,255,0.25)" }}
          >
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <PlusCircle className="h-5 w-5 text-cyber-cyan" />
                  <span className="font-semibold text-lg text-white">期限前弁済手数料 新規依頼</span>
                </div>
                <p className="text-sm text-slate-400">固定金利融資の期限前弁済手数料を試算する</p>
              </div>
              <ArrowRight className="h-6 w-6 text-cyber-cyan" />
            </CardContent>
          </Card>
        </Link>

        <div
          onClick={() => alert("仕切レート新規依頼機能は準備中です")}
          className="cursor-pointer"
        >
          <Card className="hover:border-cyber-cyan/20 transition-colors border-cyber-border">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2 text-slate-300">
                  <FileText className="h-5 w-5" />
                  <span className="font-semibold text-lg">仕切レート新規依頼</span>
                </div>
                <p className="text-sm text-slate-500">融資の仕切レートを取得する</p>
              </div>
              <span className="text-slate-500 border border-slate-700 text-[10px] px-1.5 rounded">準備中</span>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Deals Table */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold text-slate-100">最近の案件</CardTitle>
            <Link href="/branch/deals">
              <Button variant="ghost" size="sm" className="text-cyber-cyan hover:text-cyber-cyan hover:bg-cyber-cyan/10">すべて見る →</Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-cyber-border/30 bg-cyber-surface/50">
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">案件番号</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">取引先名</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">業務種別</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">ステータス</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">更新日時</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">操作</th>
                </tr>
              </thead>
              <tbody>
                {recentDeals.map((deal) => (
                  <tr key={deal.dealId} className="border-b border-cyber-border/20 hover:bg-cyber-surface/60 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-slate-300">{deal.dealNo}</td>
                    <td className="px-4 py-3 font-medium text-slate-200">{deal.input.customerInfo.customerName}</td>
                    <td className="px-4 py-3 text-slate-400">
                      {deal.businessType === "PREPAY" ? "期限前弁済" : "仕切レート"}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={deal.status} />
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{formatDateTime(deal.updatedAt)}</td>
                    <td className="px-4 py-3">
                      {deal.status === "CALCULATED" || deal.status === "APPROVED" ? (
                        <Link href={`/branch/deals/${deal.dealId}/result`}>
                          <Button size="sm" variant="outline">結果確認</Button>
                        </Link>
                      ) : deal.status === "OCR_PENDING" ? (
                        <Link href={`/branch/deals/${deal.dealId}/ocr`}>
                          <Button size="sm" variant="outline">OCR確認</Button>
                        </Link>
                      ) : (
                        <Link href={`/branch/deals/${deal.dealId}/result`}>
                          <Button size="sm" variant="ghost">詳細</Button>
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
                {recentDeals.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-slate-500">案件がありません</td>
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
