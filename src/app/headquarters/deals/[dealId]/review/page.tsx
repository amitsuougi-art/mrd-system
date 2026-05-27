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
          <p className="text-gray-500 mb-4">案件が見つかりません</p>
          <Link href="/mrd-system/headquarters/dashboard">
            <Button variant="outline">ダッシュボードへ戻る</Button>
          </Link>
        </div>
      </div>
    );
  }

  const result = deal.result || calculatePrepaymentFee(deal.input);
  const allChecked = checkedItems.every(Boolean);

  const aiStatusIcon = (status: "OK" | "WARN" | "NG") => {
    if (status === "OK") return <CheckCircle2 className="h-4 w-4 text-green-600" />;
    if (status === "WARN") return <AlertTriangle className="h-4 w-4 text-amber-500" />;
    return <XCircle className="h-4 w-4 text-red-600" />;
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
    router.push("/mrd-system/headquarters/dashboard");
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
    router.push("/mrd-system/headquarters/dashboard");
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/mrd-system/headquarters/dashboard">
          <Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4 mr-1" />戻る</Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">案件承認・再鑑</h1>
          <p className="text-sm text-gray-500 mt-1">本部承認者による最終確認</p>
        </div>
      </div>

      {/* Summary Bar */}
      <div className="bg-white border rounded-lg p-4 flex flex-wrap items-center gap-4 text-sm">
        <div><span className="text-gray-500">案件番号：</span><span className="font-mono font-medium">{deal.dealNo}</span></div>
        <div className="h-4 w-px bg-gray-200" />
        <div><span className="text-gray-500">取引先：</span><span className="font-medium">{deal.input.customerInfo.customerName}</span></div>
        <div className="h-4 w-px bg-gray-200" />
        <StatusBadge status={deal.status} />
        <div className="ml-auto text-xs text-gray-500">
          回答期限：{deal.input.prepayment.answerRequiredDate} {deal.input.prepayment.answerDeadline}
        </div>
      </div>

      {/* Calculation Result */}
      <Card className="border-2 border-bank-primary">
        <CardContent className="p-6 text-center">
          <p className="text-sm text-gray-500 mb-1">期限前弁済手数料</p>
          <p className="text-4xl font-bold text-bank-primary">{formatCurrency(result.prepaymentFee)}</p>
          <div className="grid grid-cols-3 gap-4 mt-4 text-xs text-gray-500 border-t pt-4">
            <div><span className="block text-gray-400">A（受取利息合計）</span>{formatCurrency(result.sideATotal)}</div>
            <div><span className="block text-gray-400">B（再運用利息合計）</span>{formatCurrency(result.sideBTotal)}</div>
            <div><span className="block text-gray-400">使用カーブ / テナー</span>{result.appliedCurveType} / {result.appliedTenorBand}</div>
          </div>
        </CardContent>
      </Card>

      {/* Applied Rules */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">適用ルール</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 text-sm">
          <div><span className="text-gray-500">適用テナーバンド：</span><span className="font-medium">{result.appliedTenorBand}</span></div>
          <div><span className="text-gray-500">金額帯：</span><span className="font-medium">{result.amountBandApplied}</span></div>
          <div><span className="text-gray-500">シローン該当：</span><span className="font-medium">{deal.input.prepayment.isSyndicatedLoan ? "有（手計算補完）" : "なし"}</span></div>
          <div><span className="text-gray-500">特殊取引判定：</span><span className="font-medium">該当なし</span></div>
        </CardContent>
      </Card>

      {/* Input Data Accordion */}
      <Accordion type="single">
        <AccordionItem value="input">
          <AccordionTrigger>入力データ詳細</AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="col-span-2 font-medium text-gray-700 border-b pb-1">取引先情報</div>
              <div><span className="text-gray-500">取引先名：</span>{deal.input.customerInfo.customerName}</div>
              <div><span className="text-gray-500">CIF番号：</span>{deal.input.customerInfo.cifNo}</div>
              <div><span className="text-gray-500">融資口座番号：</span>{deal.input.customerInfo.loanAccountNo}</div>
              <div><span className="text-gray-500">取扱番号：</span>{deal.input.customerInfo.transactionNo}</div>
              <div className="col-span-2 font-medium text-gray-700 border-b pb-1 mt-2">原契約条件</div>
              <div><span className="text-gray-500">借入日：</span>{formatDate(deal.input.originalContract.borrowingDate)}</div>
              <div><span className="text-gray-500">期日：</span>{formatDate(deal.input.originalContract.maturityDate)}</div>
              <div><span className="text-gray-500">実行金額：</span>{new Intl.NumberFormat("ja-JP", {style: "currency", currency: "JPY"}).format(deal.input.originalContract.executionAmount)}</div>
              <div><span className="text-gray-500">約定金利：</span>{deal.input.originalContract.contractRate.toFixed(5)}%</div>
              <div><span className="text-gray-500">固定期日：</span>{formatDate(deal.input.originalContract.fixedEndDate)}</div>
              <div><span className="text-gray-500">返済方式：</span>
                {deal.input.originalContract.repaymentMethod === "EQUAL_PRINCIPAL" ? "元金均等" :
                 deal.input.originalContract.repaymentMethod === "EQUAL_PAYMENT" ? "元利均等" : "期日一括"}
              </div>
              <div className="col-span-2 font-medium text-gray-700 border-b pb-1 mt-2">仕切レート</div>
              <div><span className="text-gray-500">仕切レート：</span>{deal.input.rateInfo.internalRate.toFixed(5)}%</div>
              <div><span className="text-gray-500">対顧金利：</span>{deal.input.rateInfo.customerRate.toFixed(5)}%</div>
              <div><span className="text-gray-500">乖離幅：</span>{deal.input.rateInfo.spread.toFixed(5)}%</div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* AI Check Results */}
      <div>
        <h2 className="text-base font-semibold mb-3">AIチェック結果</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            { label: "計算ロジック整合性", data: result.aiCheckResult.logicConsistency },
            { label: "マーケットデータ妥当性", data: result.aiCheckResult.marketDataValidity },
            { label: "過去類似案件との比較", data: result.aiCheckResult.similarDealComparison },
            { label: "異常値検知", data: result.aiCheckResult.anomalyDetection },
          ].map(({ label, data }) => (
            <div
              key={label}
              className={`p-3 rounded-lg border flex items-start gap-2 ${
                data.status === "OK" ? "bg-green-50 border-green-200" :
                data.status === "WARN" ? "bg-amber-50 border-amber-200" : "bg-red-50 border-red-200"
              }`}
            >
              {aiStatusIcon(data.status)}
              <div>
                <div className="font-medium text-sm">{label}</div>
                <div className="text-xs text-gray-600 mt-0.5">{data.message}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Review Checklist */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">点検チェックリスト（全{checkItems.length}項目）</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {checkItems.map((item, i) => (
            <label key={i} className="flex items-start gap-3 cursor-pointer group">
              <Checkbox
                checked={checkedItems[i]}
                onCheckedChange={(checked) => {
                  const newChecked = [...checkedItems];
                  newChecked[i] = !!checked;
                  setCheckedItems(newChecked);
                }}
                className="mt-0.5"
              />
              <span className={`text-sm ${checkedItems[i] ? "line-through text-gray-400" : "text-gray-700"}`}>{item}</span>
            </label>
          ))}
          <div className="mt-2 text-xs text-gray-500">
            {checkedItems.filter(Boolean).length} / {checkItems.length} 項目確認済
          </div>
        </CardContent>
      </Card>

      {/* Review Comment */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">再鑑コメント（任意）</CardTitle>
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
        <Card className="border-red-400">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-red-700">差し戻し理由入力</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="差し戻し理由を入力してください"
              rows={3}
            />
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowRejectDialog(false)}>キャンセル</Button>
              <Button
                onClick={handleReject}
                disabled={isRejecting}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {isRejecting ? <Loader2 className="h-4 w-4 animate-spin" /> : "差し戻し確定"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 pb-8">
        <Button
          variant="outline"
          onClick={() => setShowRejectDialog(true)}
          className="border-red-400 text-red-600 hover:bg-red-50 min-w-28"
          disabled={isRejecting || isApproving}
        >
          <ThumbsDown className="h-4 w-4 mr-2" />差し戻し
        </Button>
        <Button
          onClick={handleApprove}
          disabled={isApproving || !allChecked}
          className="bg-green-600 hover:bg-green-700 text-white min-w-28"
        >
          {isApproving ? (
            <><Loader2 className="h-4 w-4 mr-2 animate-spin" />承認中...</>
          ) : (
            <><ThumbsUp className="h-4 w-4 mr-2" />承認</>
          )}
        </Button>
      </div>
      {!allChecked && (
        <p className="text-xs text-amber-600 text-right">※すべての点検項目にチェックを入れると承認できます</p>
      )}
    </div>
  );
}
