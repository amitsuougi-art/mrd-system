"use client";

import { use, useState } from "react";
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
          <p className="text-gray-500 mb-4">案件が見つかりません</p>
          <Link href="/mrd-system/branch/dashboard">
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
    router.push("/mrd-system/branch/dashboard");
  };

  const aiStatusIcon = (status: "OK" | "WARN" | "NG") => {
    if (status === "OK") return <CheckCircle2 className="h-5 w-5 text-green-600" />;
    if (status === "WARN") return <AlertTriangle className="h-5 w-5 text-amber-500" />;
    return <XCircle className="h-5 w-5 text-red-600" />;
  };

  const aiStatusBg = (status: "OK" | "WARN" | "NG") => {
    if (status === "OK") return "bg-green-50 border-green-200";
    if (status === "WARN") return "bg-amber-50 border-amber-200";
    return "bg-red-50 border-red-200";
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/mrd-system/branch/dashboard">
          <Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4 mr-1" />戻る</Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">計算結果確認</h1>
          <p className="text-sm text-gray-500 mt-1">期限前弁済手数料の算出結果</p>
        </div>
      </div>

      {/* Summary Bar */}
      <div className="bg-white border rounded-lg p-4 flex flex-wrap items-center gap-4 text-sm">
        <div><span className="text-gray-500">案件番号：</span><span className="font-mono font-medium">{deal.dealNo}</span></div>
        <div className="h-4 w-px bg-gray-200" />
        <div><span className="text-gray-500">取引先：</span><span className="font-medium">{deal.input.customerInfo.customerName}</span></div>
        <div className="h-4 w-px bg-gray-200" />
        <div><span className="text-gray-500">業務：</span><span>期限前弁済</span></div>
        <div className="h-4 w-px bg-gray-200" />
        <StatusBadge status={deal.status} />
        <div className="ml-auto">
          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${deal.input.prepayment.isSyndicatedLoan ? "bg-yellow-100 text-yellow-800" : "bg-green-100 text-green-800"}`}>
            {deal.input.prepayment.isSyndicatedLoan ? "⚠️ シローン手計算" : "✓ 自動処理可"}
          </span>
        </div>
      </div>

      {/* Main Result Card */}
      {isRecalculating ? (
        <Card>
          <CardContent className="p-8">
            <Skeleton className="h-8 w-48 mb-4" />
            <Skeleton className="h-16 w-64 mb-4" />
            <Skeleton className="h-4 w-96" />
          </CardContent>
        </Card>
      ) : result ? (
        <Card className="border-2 border-bank-primary">
          <CardContent className="p-8 text-center">
            <p className="text-sm font-medium text-gray-500 mb-2">期限前弁済手数料</p>
            <p className="text-5xl font-bold text-bank-primary mb-4">
              {formatCurrency(result.prepaymentFee)}
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-gray-500 border-t pt-4">
              <div><span className="block text-gray-400">計算実行日時</span>{formatDateTime(result.calculatedAt)}</div>
              <div><span className="block text-gray-400">マーケットデータ取得</span>{formatDateTime(result.marketDataAcquiredAt)}</div>
              <div><span className="block text-gray-400">使用カーブ</span>{result.appliedCurveType}</div>
              <div><span className="block text-gray-400">計算エンジン</span>{result.calculationEngineVersion}</div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-8 text-center text-gray-400">
            計算結果がありません。試算実行してください。
          </CardContent>
        </Card>
      )}

      {/* Breakdown Cards */}
      {result && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-500 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-blue-600" />
                A（受取予定利息合計）
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-blue-700">{formatCurrency(result.sideATotal)}</p>
              <p className="text-xs text-gray-400 mt-1">テナーバンド：{result.appliedTenorBand}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-500 flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-green-600" />
                B（再運用利息合計）
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-green-700">{formatCurrency(result.sideBTotal)}</p>
              <p className="text-xs text-gray-400 mt-1">{result.amountBandApplied}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-500 flex items-center gap-2">
                <Minus className="h-4 w-4 text-bank-primary" />
                A−B現在価値合計
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-bank-primary">{formatCurrency(result.pvAdjustedDiff)}</p>
              <p className="text-xs text-gray-400 mt-1">= 期限前弁済手数料</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Cashflow Detail (Accordion) */}
      {result && result.cashflows.length > 0 && (
        <Accordion type="single">
          <AccordionItem value="cashflows">
            <AccordionTrigger>
              <span className="font-medium">キャッシュフロー詳細（{result.cashflows.length}件）</span>
            </AccordionTrigger>
            <AccordionContent>
              <div className="overflow-x-auto">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border px-3 py-2 text-left">No.</th>
                      <th className="border px-3 py-2 text-left">キャッシュフロー日</th>
                      <th className="border px-3 py-2 text-right">受取利息（A）</th>
                      <th className="border px-3 py-2 text-right">適用レート</th>
                      <th className="border px-3 py-2 text-right">割引係数</th>
                      <th className="border px-3 py-2 text-right">現在価値</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.cashflows.slice(0, 20).map((cf) => (
                      <tr key={cf.sequence} className="hover:bg-gray-50">
                        <td className="border px-3 py-1.5 text-gray-600">{cf.sequence}</td>
                        <td className="border px-3 py-1.5 font-mono">{cf.cashflowDate}</td>
                        <td className="border px-3 py-1.5 text-right font-mono">{new Intl.NumberFormat("ja-JP").format(cf.amount)}</td>
                        <td className="border px-3 py-1.5 text-right">{cf.appliedRate.toFixed(5)}%</td>
                        <td className="border px-3 py-1.5 text-right font-mono">{cf.discountFactor.toFixed(8)}</td>
                        <td className="border px-3 py-1.5 text-right font-mono">{new Intl.NumberFormat("ja-JP").format(cf.presentValue)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-gray-50 font-medium">
                      <td colSpan={2} className="border px-3 py-2">合計</td>
                      <td className="border px-3 py-2 text-right font-mono">{formatCurrency(result.sideATotal)}</td>
                      <td colSpan={2} className="border px-3 py-2" />
                      <td className="border px-3 py-2 text-right font-mono text-bank-primary">{formatCurrency(result.prepaymentFee)}</td>
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
          <h2 className="text-base font-semibold mb-3">AIチェック結果</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { label: "計算ロジック整合性", data: result.aiCheckResult.logicConsistency },
              { label: "マーケットデータ妥当性", data: result.aiCheckResult.marketDataValidity },
              { label: "過去類似案件との比較", data: result.aiCheckResult.similarDealComparison },
              { label: "異常値検知", data: result.aiCheckResult.anomalyDetection },
            ].map(({ label, data }) => (
              <div key={label} className={`p-4 rounded-lg border ${aiStatusBg(data.status)}`}>
                <div className="flex items-center gap-2 mb-1">
                  {aiStatusIcon(data.status)}
                  <span className="font-medium text-sm">{label}</span>
                </div>
                <p className="text-xs text-gray-600 ml-7">{data.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap justify-end gap-3 pb-8">
        <Link href={`/mrd-system/branch/deals/new`}>
          <Button variant="outline">修正する</Button>
        </Link>
        <Button variant="outline" onClick={handleRecalculate} disabled={isRecalculating}>
          {isRecalculating ? <><RefreshCw className="h-4 w-4 mr-2 animate-spin" />再計算中...</> : <><RefreshCw className="h-4 w-4 mr-2" />再計算</>}
        </Button>
        <Button variant="ghost" onClick={() => alert("PDFダウンロード中...")}>
          <FileDown className="h-4 w-4 mr-2" />PDF出力
        </Button>
        {(deal.status === "CALCULATED" || deal.status === "DRAFT") && (
          <Button onClick={handleSubmit} disabled={isSubmitting} className="bg-bank-primary hover:bg-bank-primary-light min-w-32">
            {isSubmitting ? <><RefreshCw className="h-4 w-4 mr-2 animate-spin" />送信中...</> : <><Send className="h-4 w-4 mr-2" />本部へ送信</>}
          </Button>
        )}
        {deal.status === "APPROVED" && (
          <Link href={`/mrd-system/branch/deals/${deal.dealId}/confirm`}>
            <Button className="bg-emerald-600 hover:bg-emerald-700">確定操作へ</Button>
          </Link>
        )}
      </div>
    </div>
  );
}
