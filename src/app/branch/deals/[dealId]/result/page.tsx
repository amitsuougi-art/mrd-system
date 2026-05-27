"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";
import { StatusBadge } from "@/components/deals/status-badge";
import { formatCurrency, formatDateTime, formatRate } from "@/lib/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import {
  CheckCircle2, AlertTriangle, XCircle, ArrowLeft, RefreshCw,
  Send, FileDown, TrendingUp, TrendingDown, Minus
} from "lucide-react";
import Link from "next/link";
import { calculatePrepaymentFee } from "@/lib/calculation";

interface PageProps {
  params: { dealId: string };
}

export default function ResultPage({ params }: PageProps) {
  const router = useRouter();
  const { getDeal, updateDeal, currentUser } = useAppStore();
  const deal = getDeal(params.dealId);
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!deal) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-slate-400 mb-4">案件が見つかりません</p>
          <Link href="/branch/dashboard">
            <Button variant="outline">ダッシュボードへ戻る</Button>
          </Link>
        </div>
      </div>
    );
  }

  const result = deal.result;

  const handleRecalculate = async () => {
    setIsRecalculating(true);
    await new Promise((r) => setTimeout(r, 1500));
    const newResult = calculatePrepaymentFee(deal.input);
    updateDeal(deal.dealId, (d) => ({ ...d, result: newResult, updatedAt: new Date().toISOString() }));
    setIsRecalculating(false);
  };

  const handleSubmit = async () => {
    if (!window.confirm("本部へ送信しますか？")) return;
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 1000));
    updateDeal(deal.dealId, (d) => ({
      ...d,
      status: "SUBMITTED_BY_BRANCH",
      updatedAt: new Date().toISOString(),
      history: [...d.history, {
        timestamp: new Date().toISOString(),
        userId: currentUser?.userId || "u001",
        userName: currentUser?.name || "",
        action: "本部送信",
        description: "本部へ送信しました",
      }],
    }));
    setIsSubmitting(false);
    alert("本部へ送信しました");
    router.push("/branch/dashboard");
  };

  const aiStatusIcon = (status: "OK" | "WARN" | "NG") => {
    if (status === "OK") return <CheckCircle2 className="h-5 w-5 text-cyber-green" />;
    if (status === "WARN") return <AlertTriangle className="h-5 w-5 text-cyber-amber" />;
    return <XCircle className="h-5 w-5 text-cyber-red" />;
  };

  const aiStatusStyle = (status: "OK" | "WARN" | "NG") => {
    if (status === "OK") return "bg-cyber-green/10 border-cyber-green/25";
    if (status === "WARN") return "bg-cyber-amber/10 border-cyber-amber/25";
    return "bg-cyber-red/10 border-cyber-red/25";
  };

  const aiStatusText = (status: "OK" | "WARN" | "NG") => {
    if (status === "OK") return "text-cyber-green/80";
    if (status === "WARN") return "text-cyber-amber/80";
    return "text-cyber-red/80";
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/branch/dashboard">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-1" />戻る
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-100">計算結果確認</h1>
          <p className="text-sm text-slate-400 mt-1">期限前弁済手数料の算出結果</p>
        </div>
      </div>

      {/* Summary Bar */}
      <div
        className="rounded-xl px-5 py-3.5 flex flex-wrap items-center gap-4 text-sm"
        style={{ background: "#0b1628", border: "1px solid rgba(0,200,255,0.12)" }}
      >
        <div>
          <span className="text-slate-500 text-xs">案件番号</span>
          <span className="ml-2 font-mono font-medium text-slate-200">{deal.dealNo}</span>
        </div>
        <div className="h-3.5 w-px bg-cyber-border/60" />
        <div>
          <span className="text-slate-500 text-xs">取引先</span>
          <span className="ml-2 font-medium text-slate-200">{deal.input.customerInfo.customerName}</span>
        </div>
        <div className="h-3.5 w-px bg-cyber-border/60" />
        <div>
          <span className="text-slate-500 text-xs">業務</span>
          <span className="ml-2 text-slate-300">期限前弁済</span>
        </div>
        <div className="h-3.5 w-px bg-cyber-border/60" />
        <StatusBadge status={deal.status} />
        <div className="ml-auto">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
            deal.input.prepayment.isSyndicatedLoan
              ? "bg-cyber-amber/10 text-cyber-amber border border-cyber-amber/25"
              : "bg-cyber-green/10 text-cyber-green border border-cyber-green/25"
          }`}>
            {deal.input.prepayment.isSyndicatedLoan ? "⚠ シローン手計算" : "✓ 自動処理可"}
          </span>
        </div>
      </div>

      {/* Main Result Card */}
      {isRecalculating ? (
        <Card>
          <CardContent className="p-8">
            <Skeleton className="h-6 w-40 mb-4 bg-cyber-surface" />
            <Skeleton className="h-16 w-64 mb-4 bg-cyber-surface" />
            <Skeleton className="h-4 w-80 bg-cyber-surface" />
          </CardContent>
        </Card>
      ) : result ? (
        <div
          className="rounded-xl p-8 text-center"
          style={{
            background: "linear-gradient(135deg, #0a1e38 0%, #0d2540 60%, #091830 100%)",
            border: "1px solid rgba(0,200,255,0.3)",
            boxShadow: "0 0 40px rgba(0,200,255,0.08), 0 4px 24px rgba(0,0,0,0.4)",
          }}
        >
          <p className="text-sm font-medium text-slate-400 mb-2 tracking-wide uppercase">期限前弁済手数料</p>
          <p
            className="text-6xl font-bold mb-6 tabular-nums"
            style={{ color: "#00c8ff", textShadow: "0 0 30px rgba(0,200,255,0.4)" }}
          >
            {formatCurrency(result.prepaymentFee)}
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 border-t border-cyber-border/30 pt-5">
            {[
              { label: "計算実行日時", value: formatDateTime(result.calculatedAt) },
              { label: "マーケットデータ取得", value: formatDateTime(result.marketDataAcquiredAt) },
              { label: "使用カーブ", value: result.appliedCurveType },
              { label: "計算エンジン", value: result.calculationEngineVersion },
            ].map(({ label, value }) => (
              <div key={label} className="text-center">
                <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">{label}</p>
                <p className="text-xs text-slate-300 font-mono">{value}</p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <Card>
          <CardContent className="p-8 text-center text-slate-500">
            計算結果がありません。試算実行してください。
          </CardContent>
        </Card>
      )}

      {/* Breakdown Cards */}
      {result && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs text-slate-400 flex items-center gap-2 font-medium uppercase tracking-wider">
                <TrendingUp className="h-4 w-4 text-blue-400" />
                A（受取予定利息合計）
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-blue-400 tabular-nums">{formatCurrency(result.sideATotal)}</p>
              <p className="text-xs text-slate-500 mt-1.5">テナーバンド：{result.appliedTenorBand}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs text-slate-400 flex items-center gap-2 font-medium uppercase tracking-wider">
                <TrendingDown className="h-4 w-4 text-cyber-green" />
                B（再運用利息合計）
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-cyber-green tabular-nums">{formatCurrency(result.sideBTotal)}</p>
              <p className="text-xs text-slate-500 mt-1.5">{result.amountBandApplied}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs text-slate-400 flex items-center gap-2 font-medium uppercase tracking-wider">
                <Minus className="h-4 w-4 text-cyber-cyan" />
                A−B 現在価値合計
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-cyber-cyan tabular-nums">{formatCurrency(result.pvAdjustedDiff)}</p>
              <p className="text-xs text-slate-500 mt-1.5">= 期限前弁済手数料</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Cashflow Detail */}
      {result && result.cashflows.length > 0 && (
        <Accordion type="single">
          <AccordionItem value="cashflows">
            <AccordionTrigger>
              <span className="font-medium text-slate-200">キャッシュフロー詳細（{result.cashflows.length}件）</span>
            </AccordionTrigger>
            <AccordionContent>
              <div className="overflow-x-auto rounded-lg" style={{ border: "1px solid rgba(26,58,92,0.6)" }}>
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-cyber-surface/80">
                      <th className="text-left px-3 py-2.5 text-slate-400 font-medium">No.</th>
                      <th className="text-left px-3 py-2.5 text-slate-400 font-medium">CF日付</th>
                      <th className="text-right px-3 py-2.5 text-slate-400 font-medium">受取利息（A）</th>
                      <th className="text-right px-3 py-2.5 text-slate-400 font-medium">適用レート</th>
                      <th className="text-right px-3 py-2.5 text-slate-400 font-medium">割引係数</th>
                      <th className="text-right px-3 py-2.5 text-slate-400 font-medium">現在価値</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.cashflows.slice(0, 20).map((cf) => (
                      <tr key={cf.sequence} className="border-t border-cyber-border/20 hover:bg-cyber-surface/40">
                        <td className="px-3 py-2 text-slate-500">{cf.sequence}</td>
                        <td className="px-3 py-2 font-mono text-slate-300">{cf.cashflowDate}</td>
                        <td className="px-3 py-2 text-right font-mono text-slate-200">{new Intl.NumberFormat("ja-JP").format(cf.amount)}</td>
                        <td className="px-3 py-2 text-right text-slate-300">{cf.appliedRate.toFixed(5)}%</td>
                        <td className="px-3 py-2 text-right font-mono text-slate-400">{cf.discountFactor.toFixed(8)}</td>
                        <td className="px-3 py-2 text-right font-mono text-slate-200">{new Intl.NumberFormat("ja-JP").format(cf.presentValue)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-cyber-surface/60 border-t border-cyber-border/40">
                      <td colSpan={2} className="px-3 py-2.5 font-medium text-slate-300">合計</td>
                      <td className="px-3 py-2.5 text-right font-mono font-medium text-slate-200">{formatCurrency(result.sideATotal)}</td>
                      <td colSpan={2} className="px-3 py-2.5" />
                      <td className="px-3 py-2.5 text-right font-mono font-bold text-cyber-cyan">{formatCurrency(result.prepaymentFee)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}

      {/* AI Check Results */}
      {result && (
        <div>
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">AIチェック結果</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { label: "計算ロジック整合性", data: result.aiCheckResult.logicConsistency },
              { label: "マーケットデータ妥当性", data: result.aiCheckResult.marketDataValidity },
              { label: "過去類似案件との比較", data: result.aiCheckResult.similarDealComparison },
              { label: "異常値検知", data: result.aiCheckResult.anomalyDetection },
            ].map(({ label, data }) => (
              <div key={label} className={`p-4 rounded-xl border ${aiStatusStyle(data.status)}`}>
                <div className="flex items-center gap-2 mb-1.5">
                  {aiStatusIcon(data.status)}
                  <span className="font-medium text-sm text-slate-200">{label}</span>
                </div>
                <p className={`text-xs ml-7 ${aiStatusText(data.status)}`}>{data.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap justify-end gap-3 pb-8">
        <Link href="/branch/deals/new">
          <Button variant="outline">修正する</Button>
        </Link>
        <Button variant="outline" onClick={handleRecalculate} disabled={isRecalculating}>
          {isRecalculating
            ? <><RefreshCw className="h-4 w-4 mr-2 animate-spin" />再計算中...</>
            : <><RefreshCw className="h-4 w-4 mr-2" />再計算</>}
        </Button>
        <Button variant="ghost" onClick={() => alert("PDFダウンロード中...")}>
          <FileDown className="h-4 w-4 mr-2" />PDF出力
        </Button>
        {(deal.status === "CALCULATED" || deal.status === "DRAFT") && (
          <Button onClick={handleSubmit} disabled={isSubmitting} className="min-w-32">
            {isSubmitting
              ? <><RefreshCw className="h-4 w-4 mr-2 animate-spin" />送信中...</>
              : <><Send className="h-4 w-4 mr-2" />本部へ送信</>}
          </Button>
        )}
        {deal.status === "APPROVED" && (
          <Link href={`/branch/deals/${deal.dealId}/confirm`}>
            <Button style={{ background: "#059669" }} className="hover:opacity-90">確定操作へ</Button>
          </Link>
        )}
      </div>
    </div>
  );
}
