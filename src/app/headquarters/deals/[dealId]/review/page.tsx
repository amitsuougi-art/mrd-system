"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";
import { StatusBadge } from "@/components/deals/status-badge";
import { formatCurrency, formatDateTime, formatDate } from "@/lib/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import {
  CheckCircle2, XCircle, AlertTriangle, ArrowLeft,
  ThumbsUp, ThumbsDown, Loader2
} from "lucide-react";
import Link from "next/link";
import { calculatePrepaymentFee } from "@/lib/calculation";

interface PageProps {
  params: { dealId: string };
}

const checkItems = [
  "入力データに誤りがないか",
  "添付資料がすべて揃っているか",
  "OCR突合結果に未解決の差異がないか",
  "AIチェック結果の警告内容を確認したか",
  "マーケットデータ取得時刻が適切か",
  "類似案件と比較して妥当な範囲か",
  "商品区分と返済方式の整合性",
  "顧客への回答期日に間に合うか",
];

export default function ReviewPage({ params }: PageProps) {
  const router = useRouter();
  const { getDeal, updateDeal, currentUser } = useAppStore();
  const deal = getDeal(params.dealId);
  const [checkedItems, setCheckedItems] = useState<boolean[]>(new Array(checkItems.length).fill(false));
  const [reviewComment, setReviewComment] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);

  if (!deal) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-slate-400 mb-4">案件が見つかりません</p>
          <Link href="/headquarters/dashboard">
            <Button variant="outline">ダッシュボードへ戻る</Button>
          </Link>
        </div>
      </div>
    );
  }

  const result = deal.result || calculatePrepaymentFee(deal.input);
  const allChecked = checkedItems.every(Boolean);

  const aiStatusIcon = (status: "OK" | "WARN" | "NG") => {
    if (status === "OK") return <CheckCircle2 className="h-4 w-4 text-cyber-green shrink-0" />;
    if (status === "WARN") return <AlertTriangle className="h-4 w-4 text-cyber-amber shrink-0" />;
    return <XCircle className="h-4 w-4 text-cyber-red shrink-0" />;
  };

  const aiStatusStyle = (status: "OK" | "WARN" | "NG") => {
    if (status === "OK") return "bg-cyber-green/10 border-cyber-green/25";
    if (status === "WARN") return "bg-cyber-amber/10 border-cyber-amber/25";
    return "bg-cyber-red/10 border-cyber-red/25";
  };

  const handleApprove = async () => {
    if (!allChecked) {
      alert("すべての点検項目を確認してからチェックを入れてください");
      return;
    }
    if (!window.confirm("承認します。よろしいですか？")) return;
    setIsApproving(true);
    await new Promise((r) => setTimeout(r, 1500));
    updateDeal(deal.dealId, (d) => ({
      ...d,
      status: "APPROVED",
      approvalAt: new Date().toISOString(),
      approvalBy: currentUser?.userId || "u003",
      updatedAt: new Date().toISOString(),
      history: [...d.history, {
        timestamp: new Date().toISOString(),
        userId: currentUser?.userId || "u003",
        userName: currentUser?.name || "",
        action: "承認",
        description: `承認しました。コメント：${reviewComment || "（なし）"}`,
      }],
    }));
    setIsApproving(false);
    alert("承認し、営業店へ自動通知しました");
    router.push("/headquarters/dashboard");
  };

  const handleReject = async () => {
    if (!rejectReason) {
      alert("差し戻し理由を入力してください");
      return;
    }
    setIsRejecting(true);
    await new Promise((r) => setTimeout(r, 1000));
    updateDeal(deal.dealId, (d) => ({
      ...d,
      status: "REJECTED",
      updatedAt: new Date().toISOString(),
      history: [...d.history, {
        timestamp: new Date().toISOString(),
        userId: currentUser?.userId || "u003",
        userName: currentUser?.name || "",
        action: "差し戻し",
        description: `差し戻し理由：${rejectReason}`,
      }],
    }));
    setIsRejecting(false);
    setShowRejectDialog(false);
    alert("差し戻しました");
    router.push("/headquarters/dashboard");
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/headquarters/dashboard">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-1" />戻る
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-100">案件承認・再鑑</h1>
          <p className="text-sm text-slate-400 mt-1">本部承認者による最終確認</p>
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
        <StatusBadge status={deal.status} />
        <div className="ml-auto text-xs text-slate-500">
          回答期限：{deal.input.prepayment.answerRequiredDate} {deal.input.prepayment.answerDeadline}
        </div>
      </div>

      {/* Calculation Result */}
      <div
        className="rounded-xl p-6 text-center"
        style={{
          background: "linear-gradient(135deg, #0a1e38 0%, #0d2540 60%, #091830 100%)",
          border: "1px solid rgba(0,200,255,0.3)",
          boxShadow: "0 0 40px rgba(0,200,255,0.06)",
        }}
      >
        <p className="text-xs font-medium text-slate-400 mb-2 tracking-widest uppercase">期限前弁済手数料</p>
        <p className="text-5xl font-bold mb-5 tabular-nums" style={{ color: "#00c8ff", textShadow: "0 0 20px rgba(0,200,255,0.35)" }}>
          {formatCurrency(result.prepaymentFee)}
        </p>
        <div className="grid grid-cols-3 gap-4 border-t border-cyber-border/30 pt-4 text-xs">
          <div>
            <p className="text-slate-500 mb-1">A（受取利息合計）</p>
            <p className="text-slate-200 font-mono">{formatCurrency(result.sideATotal)}</p>
          </div>
          <div>
            <p className="text-slate-500 mb-1">B（再運用利息合計）</p>
            <p className="text-slate-200 font-mono">{formatCurrency(result.sideBTotal)}</p>
          </div>
          <div>
            <p className="text-slate-500 mb-1">使用カーブ / テナー</p>
            <p className="text-slate-200">{result.appliedCurveType} / {result.appliedTenorBand}</p>
          </div>
        </div>
      </div>

      {/* Applied Rules */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm text-slate-400 uppercase tracking-wider">適用ルール</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 text-sm">
          <div><span className="text-slate-500">適用テナーバンド：</span><span className="font-medium text-slate-200">{result.appliedTenorBand}</span></div>
          <div><span className="text-slate-500">金額帯：</span><span className="font-medium text-slate-200">{result.amountBandApplied}</span></div>
          <div><span className="text-slate-500">シローン該当：</span><span className="font-medium text-slate-200">{deal.input.prepayment.isSyndicatedLoan ? "有（手計算補完）" : "なし"}</span></div>
          <div><span className="text-slate-500">特殊取引判定：</span><span className="font-medium text-slate-200">該当なし</span></div>
        </CardContent>
      </Card>

      {/* Input Data Accordion */}
      <Accordion type="single">
        <AccordionItem value="input">
          <AccordionTrigger>
            <span className="text-slate-200">入力データ詳細</span>
          </AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-2 gap-3 text-sm p-4">
              <div className="col-span-2 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-cyber-border/30 pb-2">取引先情報</div>
              <div><span className="text-slate-500">取引先名：</span><span className="text-slate-200">{deal.input.customerInfo.customerName}</span></div>
              <div><span className="text-slate-500">CIF番号：</span><span className="text-slate-200">{deal.input.customerInfo.cifNo}</span></div>
              <div><span className="text-slate-500">融資口座番号：</span><span className="text-slate-200">{deal.input.customerInfo.loanAccountNo}</span></div>
              <div><span className="text-slate-500">取扱番号：</span><span className="text-slate-200">{deal.input.customerInfo.transactionNo}</span></div>
              <div className="col-span-2 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-cyber-border/30 pb-2 mt-3">原契約条件</div>
              <div><span className="text-slate-500">借入日：</span><span className="text-slate-200">{formatDate(deal.input.originalContract.borrowingDate)}</span></div>
              <div><span className="text-slate-500">期日：</span><span className="text-slate-200">{formatDate(deal.input.originalContract.maturityDate)}</span></div>
              <div><span className="text-slate-500">実行金額：</span><span className="text-slate-200 font-mono">{new Intl.NumberFormat("ja-JP", { style: "currency", currency: "JPY" }).format(deal.input.originalContract.executionAmount)}</span></div>
              <div><span className="text-slate-500">約定金利：</span><span className="text-slate-200">{deal.input.originalContract.contractRate.toFixed(5)}%</span></div>
              <div><span className="text-slate-500">固定期日：</span><span className="text-slate-200">{formatDate(deal.input.originalContract.fixedEndDate)}</span></div>
              <div><span className="text-slate-500">返済方式：</span><span className="text-slate-200">
                {deal.input.originalContract.repaymentMethod === "EQUAL_PRINCIPAL" ? "元金均等" :
                 deal.input.originalContract.repaymentMethod === "EQUAL_PAYMENT" ? "元利均等" : "期日一括"}
              </span></div>
              <div className="col-span-2 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-cyber-border/30 pb-2 mt-3">仕切レート</div>
              <div><span className="text-slate-500">仕切レート：</span><span className="text-slate-200">{deal.input.rateInfo.internalRate.toFixed(5)}%</span></div>
              <div><span className="text-slate-500">対顧金利：</span><span className="text-slate-200">{deal.input.rateInfo.customerRate.toFixed(5)}%</span></div>
              <div><span className="text-slate-500">乖離幅：</span><span className="text-slate-200">{deal.input.rateInfo.spread.toFixed(5)}%</span></div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* AI Check Results */}
      <div>
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">AIチェック結果</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            { label: "計算ロジック整合性", data: result.aiCheckResult.logicConsistency },
            { label: "マーケットデータ妥当性", data: result.aiCheckResult.marketDataValidity },
            { label: "過去類似案件との比較", data: result.aiCheckResult.similarDealComparison },
            { label: "異常値検知", data: result.aiCheckResult.anomalyDetection },
          ].map(({ label, data }) => (
            <div key={label} className={`p-3.5 rounded-xl border flex items-start gap-2.5 ${aiStatusStyle(data.status)}`}>
              {aiStatusIcon(data.status)}
              <div>
                <div className="font-medium text-sm text-slate-200">{label}</div>
                <div className="text-xs text-slate-400 mt-0.5">{data.message}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Review Checklist */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm text-slate-300">
            点検チェックリスト
            <span className="ml-2 text-xs font-normal text-slate-500">
              （{checkedItems.filter(Boolean).length} / {checkItems.length} 確認済）
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2.5">
          {checkItems.map((item, i) => (
            <label key={i} className="flex items-start gap-3 cursor-pointer group py-1">
              <Checkbox
                checked={checkedItems[i]}
                onCheckedChange={(checked) => {
                  const newChecked = [...checkedItems];
                  newChecked[i] = !!checked;
                  setCheckedItems(newChecked);
                }}
                className="mt-0.5"
              />
              <span className={`text-sm transition-colors ${checkedItems[i] ? "line-through text-slate-600" : "text-slate-300 group-hover:text-slate-200"}`}>
                {item}
              </span>
            </label>
          ))}
          <div className="mt-3 pt-3 border-t border-cyber-border/30">
            <div
              className="h-1.5 rounded-full bg-cyber-border/40 overflow-hidden"
            >
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${(checkedItems.filter(Boolean).length / checkItems.length) * 100}%`,
                  background: allChecked ? "#10b981" : "#00c8ff",
                  boxShadow: allChecked ? "0 0 8px rgba(16,185,129,0.5)" : "0 0 8px rgba(0,200,255,0.4)",
                }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Review Comment */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm text-slate-300">再鑑コメント（任意）</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={reviewComment}
            onChange={(e) => setReviewComment(e.target.value)}
            placeholder="特記事項があれば記入してください"
            rows={3}
          />
        </CardContent>
      </Card>

      {/* Reject Dialog (inline) */}
      {showRejectDialog && (
        <div
          className="rounded-xl p-6"
          style={{ background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.25)" }}
        >
          <h3 className="text-sm font-semibold text-cyber-red mb-3">差し戻し理由入力</h3>
          <Textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="差し戻し理由を入力してください"
            rows={3}
            className="border-cyber-red/30 focus-visible:ring-cyber-red/40"
          />
          <div className="flex gap-2 justify-end mt-3">
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>キャンセル</Button>
            <Button
              onClick={handleReject}
              disabled={isRejecting}
              className="bg-cyber-red/20 text-cyber-red border border-cyber-red/40 hover:bg-cyber-red/30"
            >
              {isRejecting ? <Loader2 className="h-4 w-4 animate-spin" /> : "差し戻し確定"}
            </Button>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 pb-8">
        <Button
          variant="destructive"
          onClick={() => setShowRejectDialog(true)}
          className="min-w-28"
          disabled={isRejecting || isApproving}
        >
          <ThumbsDown className="h-4 w-4 mr-2" />差し戻し
        </Button>
        <Button
          onClick={handleApprove}
          disabled={isApproving || !allChecked}
          className="min-w-28"
          style={allChecked ? { background: "#059669", boxShadow: "0 0 16px rgba(5,150,105,0.35)" } : {}}
        >
          {isApproving ? (
            <><Loader2 className="h-4 w-4 mr-2 animate-spin" />承認中...</>
          ) : (
            <><ThumbsUp className="h-4 w-4 mr-2" />承認</>
          )}
        </Button>
      </div>
      {!allChecked && (
        <p className="text-xs text-cyber-amber/70 text-right -mt-4 pb-4">
          ※ すべての点検項目にチェックを入れると承認できます
        </p>
      )}
    </div>
  );
}
