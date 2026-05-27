"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";
import { StatusBadge } from "@/components/deals/status-badge";
import { formatCurrency, formatDate } from "@/lib/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";
import Link from "next/link";

interface PageProps {
  params: { dealId: string };
}

export default function ConfirmPage({ params }: PageProps) {
  const router = useRouter();
  const { getDeal, updateDeal, currentUser } = useAppStore();
  const deal = getDeal(params.dealId);

  const [confirmType, setConfirmType] = useState<"EXECUTE" | "CANCEL">("EXECUTE");
  const [confirmDate, setConfirmDate] = useState("2026-05-28");
  const [remarks, setRemarks] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!deal) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">案件が見つかりません</p>
      </div>
    );
  }

  const handleConfirm = async () => {
    if (!agreed) return;
    if (!window.confirm("確定します。この操作は取り消せません。よろしいですか？")) return;
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 1500));
    updateDeal(deal.dealId, (d) => ({
      ...d,
      status: "CONFIRMED",
      confirmedAt: new Date().toISOString(),
      confirmedBy: currentUser?.userId || "u001",
      updatedAt: new Date().toISOString(),
      history: [...d.history, {
        timestamp: new Date().toISOString(),
        userId: currentUser?.userId || "u001",
        userName: currentUser?.name || "",
        action: "確定",
        description: confirmType === "EXECUTE" ? "期限前返済を確定しました" : "試算のみ（見送り）として確定しました",
      }],
    }));
    setIsSubmitting(false);
    alert("案件を確定しました");
    router.push("/mrd-system/branch/dashboard");
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/mrd-system/branch/deals/${deal.dealId}/result`}>
          <Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4 mr-1" />戻る</Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">期限前返済の確定</h1>
          <p className="text-sm text-gray-500 mt-1">確定後は変更・取消ができません</p>
        </div>
      </div>

      {/* Summary */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">案件サマリ</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 text-sm">
          <div><span className="text-gray-500">案件番号：</span><span className="font-mono">{deal.dealNo}</span></div>
          <div><span className="text-gray-500">取引先：</span><span className="font-medium">{deal.input.customerInfo.customerName}</span></div>
          <div><span className="text-gray-500">ステータス：</span><StatusBadge status={deal.status} /></div>
          <div><span className="text-gray-500">手数料額：</span><span className="font-bold text-bank-primary text-lg">{deal.result ? formatCurrency(deal.result.prepaymentFee) : "—"}</span></div>
        </CardContent>
      </Card>

      {/* Confirm Form */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">確定情報入力</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div>
            <Label>確定種別 <span className="text-red-500">*</span></Label>
            <div className="flex gap-6 mt-2">
              {[
                { value: "EXECUTE" as const, label: "期限前返済確定" },
                { value: "CANCEL" as const, label: "見送り（試算のみ）" },
              ].map(({ value, label }) => (
                <label key={value} className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" checked={confirmType === value} onChange={() => setConfirmType(value)} className="h-4 w-4 text-bank-primary" />
                  <span className="text-sm">{label}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <Label htmlFor="confirmDate">確定日 <span className="text-red-500">*</span></Label>
            <Input type="date" id="confirmDate" value={confirmDate} onChange={(e) => setConfirmDate(e.target.value)} className="max-w-xs" />
          </div>
          {deal.result && (
            <div>
              <Label>損害金受領額</Label>
              <div className="mt-1 p-3 bg-gray-50 rounded-md">
                <span className="text-lg font-bold text-bank-primary">{formatCurrency(deal.result.prepaymentFee)}</span>
                <span className="text-xs text-gray-500 ml-2">（自動計算値）</span>
              </div>
            </div>
          )}
          <div>
            <Label htmlFor="remarks">確定備考</Label>
            <Textarea id="remarks" value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder="特記事項があれば記入してください" rows={3} />
          </div>

          {/* Agreement Checkbox */}
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <label className="flex items-start gap-3 cursor-pointer">
              <Checkbox
                checked={agreed}
                onCheckedChange={(checked) => setAgreed(!!checked)}
                className="mt-0.5"
              />
              <span className="text-sm text-red-800 font-medium">
                確定後は変更・取消ができないことを確認しました。顧客への説明が完了していることを確認しました。
              </span>
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 pb-8">
        <Link href={`/mrd-system/branch/deals/${deal.dealId}/result`}>
          <Button variant="outline">キャンセル</Button>
        </Link>
        <Button
          onClick={handleConfirm}
          disabled={!agreed || isSubmitting}
          className="bg-emerald-600 hover:bg-emerald-700 min-w-32"
        >
          {isSubmitting ? (
            <><Loader2 className="h-4 w-4 mr-2 animate-spin" />確定中...</>
          ) : (
            <><CheckCircle2 className="h-4 w-4 mr-2" />確定実行</>
          )}
        </Button>
      </div>
    </div>
  );
}
