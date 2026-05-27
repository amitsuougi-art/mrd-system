"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";
import { MOCK_USERS } from "@/lib/mock-data";
import { calculatePrepaymentFee } from "@/lib/calculation";
import { DealInput, Deal } from "@/types/deal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { AlertTriangle, Loader2, Save, Play, ArrowLeft } from "lucide-react";
import Link from "next/link";

const defaultValues: DealInput = {
  customerInfo: {
    customerName: "株式会社てすと",
    branchCode: "200",
    cifNo: "1234567890",
    loanAccountNo: "987654321",
    transactionNo: "1000000",
  },
  originalContract: {
    borrowingDate: "2024-06-05",
    maturityDate: "2029-06-30",
    nextPaymentDate: "2026-07-05",
    fixedEndDate: "2029-06-30",
    executionAmount: 31800000,
    contractRate: 1.52091,
    repaymentMethod: "EQUAL_PRINCIPAL",
    productType: "CORPORATE",
    interestType: "FIXED",
  },
  schedule: {
    interestReceiveType: "POST",
    paymentInterval: "1M",
    holidayAdjustment: "FOLLOWING",
    contractDate: "2024-06-05",
  },
  rateInfo: {
    internalRate: 0.5,
    customerRate: 1.52091,
    spread: 1.02091,
  },
  prepayment: {
    responsiblePerson: "山田 太郎",
    contact: "045-XXX-XXXX",
    requestDate: "2026-05-27",
    answerRequiredDate: "2026-05-28",
    answerDeadline: "15:00",
    prepaymentDate: "2026-06-05",
    executionMethod: "FULL",
    partialAmount: null,
    outstandingBalance: 31800000,
    isSyndicatedLoan: false,
    hasFeeReduction: false,
    approvalNo: null,
    recalculationDate: null,
  },
  remarks: "顧客の都合により期限前弁済を希望",
};

function generateDealId(): string {
  return `deal-${Date.now()}`;
}

function generateDealNo(branchCode: string): string {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, "");
  const seq = String(Math.floor(Math.random() * 100) + 1).padStart(5, "0");
  return `${dateStr}-${branchCode}-${seq}`;
}

export default function NewDealPage() {
  const router = useRouter();
  const { addDeal, updateDeal, currentUser } = useAppStore();
  const [form, setForm] = useState<DealInput>({
    ...defaultValues,
    prepayment: {
      ...defaultValues.prepayment,
      responsiblePerson: currentUser?.name || "山田 太郎",
    },
  });
  const [isCalculating, setIsCalculating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Auto-calculate spread
  useEffect(() => {
    const spread = form.rateInfo.customerRate - form.rateInfo.internalRate;
    setForm((prev) => ({
      ...prev,
      rateInfo: { ...prev.rateInfo, spread: Math.round(spread * 100000) / 100000 },
    }));
  }, [form.rateInfo.customerRate, form.rateInfo.internalRate]);

  const update = (section: keyof DealInput, field: string, value: unknown) => {
    setForm((prev) => ({
      ...prev,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      [section]: { ...(prev[section] as any), [field]: value },
    }));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!form.customerInfo.customerName) newErrors["customerName"] = "取引先名は必須です";
    if (!form.originalContract.executionAmount) newErrors["executionAmount"] = "実行金額は必須です";
    if (!form.prepayment.prepaymentDate) newErrors["prepaymentDate"] = "繰上返済日は必須です";
    if (!form.originalContract.fixedEndDate) newErrors["fixedEndDate"] = "固定期日は必須です";
    if (form.prepayment.executionMethod === "PARTIAL" && !form.prepayment.partialAmount) {
      newErrors["partialAmount"] = "一部繰上返済金額は必須です";
    }
    if (form.prepayment.hasFeeReduction && !form.prepayment.approvalNo) {
      newErrors["approvalNo"] = "減免有の場合、稟議番号は必須です";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise((r) => setTimeout(r, 800));
    const dealId = generateDealId();
    const deal: Deal = {
      dealId,
      dealNo: generateDealNo(form.customerInfo.branchCode || "200"),
      businessType: "PREPAY",
      status: "DRAFT",
      input: form,
      result: null,
      attachments: [],
      history: [{ timestamp: new Date().toISOString(), userId: currentUser?.userId || "u001", userName: currentUser?.name || "", action: "作成", description: "案件を作成しました（下書き）" }],
      createdBy: currentUser?.userId || "u001",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      receptionAt: null, receptionBy: null,
      reviewAt: null, reviewBy: null,
      approvalAt: null, approvalBy: null,
      confirmedAt: null, confirmedBy: null,
    };
    addDeal(deal);
    setIsSaving(false);
    alert("保存しました（下書き）");
  };

  const handleCalculate = async () => {
    if (!validate()) return;
    setIsCalculating(true);
    const dealId = generateDealId();
    const deal: Deal = {
      dealId,
      dealNo: generateDealNo(form.customerInfo.branchCode || "200"),
      businessType: "PREPAY",
      status: "CALCULATING",
      input: form,
      result: null,
      attachments: [],
      history: [{ timestamp: new Date().toISOString(), userId: currentUser?.userId || "u001", userName: currentUser?.name || "", action: "試算実行", description: "試算を実行しました" }],
      createdBy: currentUser?.userId || "u001",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      receptionAt: null, receptionBy: null,
      reviewAt: null, reviewBy: null,
      approvalAt: null, approvalBy: null,
      confirmedAt: null, confirmedBy: null,
    };
    addDeal(deal);
    // Simulate calculation delay
    await new Promise((r) => setTimeout(r, 1500));
    const result = calculatePrepaymentFee(form);
    updateDeal(dealId, (d) => ({ ...d, status: "CALCULATED", result, updatedAt: new Date().toISOString() }));
    setIsCalculating(false);
    router.push(`/mrd-system/branch/deals/${dealId}/result`);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/mrd-system/branch/dashboard">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-1" />戻る
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">期限前弁済手数料 算出依頼</h1>
          <p className="text-sm text-gray-500 mt-1">固定金利融資の期限前弁済手数料を試算します</p>
        </div>
      </div>

      {/* Section 1: Customer Info */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-bank-primary text-white text-xs font-bold">1</span>
            取引先情報
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <Label htmlFor="customerName">取引先名 <span className="text-red-500">*</span></Label>
            <Input
              id="customerName"
              value={form.customerInfo.customerName}
              onChange={(e) => update("customerInfo", "customerName", e.target.value)}
              className={errors.customerName ? "border-red-500" : ""}
            />
            {errors.customerName && <p className="text-xs text-red-500 mt-1">{errors.customerName}</p>}
          </div>
          <div>
            <Label htmlFor="branchCode">店番 <span className="text-red-500">*</span></Label>
            <Input id="branchCode" value={form.customerInfo.branchCode} onChange={(e) => update("customerInfo", "branchCode", e.target.value)} maxLength={3} />
          </div>
          <div>
            <Label htmlFor="cifNo">CIF番号 <span className="text-red-500">*</span></Label>
            <Input id="cifNo" value={form.customerInfo.cifNo} onChange={(e) => update("customerInfo", "cifNo", e.target.value)} />
          </div>
          <div>
            <Label htmlFor="loanAccountNo">融資口座番号 <span className="text-red-500">*</span></Label>
            <Input id="loanAccountNo" value={form.customerInfo.loanAccountNo} onChange={(e) => update("customerInfo", "loanAccountNo", e.target.value)} />
          </div>
          <div>
            <Label htmlFor="transactionNo">取扱番号 <span className="text-red-500">*</span></Label>
            <Input id="transactionNo" value={form.customerInfo.transactionNo} onChange={(e) => update("customerInfo", "transactionNo", e.target.value)} />
          </div>
        </CardContent>
      </Card>

      {/* Section 2: Original Contract */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-bank-primary text-white text-xs font-bold">2</span>
            原契約条件
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="borrowingDate">借入日 <span className="text-red-500">*</span></Label>
            <Input type="date" id="borrowingDate" value={form.originalContract.borrowingDate} onChange={(e) => update("originalContract", "borrowingDate", e.target.value)} />
          </div>
          <div>
            <Label htmlFor="maturityDate">期日 <span className="text-red-500">*</span></Label>
            <Input type="date" id="maturityDate" value={form.originalContract.maturityDate} onChange={(e) => update("originalContract", "maturityDate", e.target.value)} />
          </div>
          <div>
            <Label htmlFor="nextPaymentDate">次回利払返済日 <span className="text-red-500">*</span></Label>
            <Input type="date" id="nextPaymentDate" value={form.originalContract.nextPaymentDate} onChange={(e) => update("originalContract", "nextPaymentDate", e.target.value)} />
          </div>
          <div>
            <Label htmlFor="fixedEndDate">固定期日 <span className="text-red-500">*</span></Label>
            <Input type="date" id="fixedEndDate" value={form.originalContract.fixedEndDate} onChange={(e) => update("originalContract", "fixedEndDate", e.target.value)} className={errors.fixedEndDate ? "border-red-500" : ""} />
          </div>
          <div>
            <Label htmlFor="executionAmount">実行金額（円） <span className="text-red-500">*</span></Label>
            <Input
              type="number"
              id="executionAmount"
              value={form.originalContract.executionAmount}
              onChange={(e) => update("originalContract", "executionAmount", Number(e.target.value))}
              className={errors.executionAmount ? "border-red-500" : ""}
            />
          </div>
          <div>
            <Label htmlFor="contractRate">約定金利（%） <span className="text-red-500">*</span></Label>
            <Input type="number" step="0.00001" id="contractRate" value={form.originalContract.contractRate} onChange={(e) => update("originalContract", "contractRate", Number(e.target.value))} />
          </div>
          <div>
            <Label htmlFor="repaymentMethod">返済方式 <span className="text-red-500">*</span></Label>
            <Select id="repaymentMethod" value={form.originalContract.repaymentMethod} onChange={(e) => update("originalContract", "repaymentMethod", e.target.value)}>
              <option value="EQUAL_PRINCIPAL">元金均等</option>
              <option value="EQUAL_PAYMENT">元利均等</option>
              <option value="BULLET">期日一括</option>
            </Select>
          </div>
          <div>
            <Label htmlFor="productType">商品区分 <span className="text-red-500">*</span></Label>
            <Select id="productType" value={form.originalContract.productType} onChange={(e) => update("originalContract", "productType", e.target.value)}>
              <option value="CORPORATE">事業法人</option>
              <option value="INDIVIDUAL">個人</option>
              <option value="SPREAD_LOAN">スプレッド融資</option>
              <option value="OTHER">その他</option>
            </Select>
          </div>
          <div>
            <Label htmlFor="interestType">金利種類 <span className="text-red-500">*</span></Label>
            <Select id="interestType" value={form.originalContract.interestType} onChange={(e) => update("originalContract", "interestType", e.target.value)}>
              <option value="FIXED">固定金利</option>
              <option value="TIBOR_SHORT">TIBOR等短期変動</option>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Section 3: Schedule */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-bank-primary text-white text-xs font-bold">3</span>
            スケジュール条件
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>利息受入区分 <span className="text-red-500">*</span></Label>
            <div className="flex gap-4 mt-2">
              {[{ value: "POST", label: "後取" }, { value: "PRE", label: "前取" }].map(({ value, label }) => (
                <label key={value} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    value={value}
                    checked={form.schedule.interestReceiveType === value}
                    onChange={() => update("schedule", "interestReceiveType", value)}
                    className="h-4 w-4 text-bank-primary"
                  />
                  <span className="text-sm">{label}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <Label htmlFor="paymentInterval">利払間隔 <span className="text-red-500">*</span></Label>
            <Select id="paymentInterval" value={form.schedule.paymentInterval} onChange={(e) => update("schedule", "paymentInterval", e.target.value)}>
              <option value="1M">1ヶ月</option>
              <option value="3M">3ヶ月</option>
              <option value="6M">6ヶ月</option>
              <option value="12M">12ヶ月</option>
              <option value="OTHER">その他</option>
            </Select>
          </div>
          <div>
            <Label htmlFor="holidayAdjustment">休日調整 <span className="text-red-500">*</span></Label>
            <Select id="holidayAdjustment" value={form.schedule.holidayAdjustment} onChange={(e) => update("schedule", "holidayAdjustment", e.target.value)}>
              <option value="PRECEDING">前営業日</option>
              <option value="FOLLOWING">翌営業日</option>
              <option value="NONE">無し</option>
            </Select>
          </div>
          <div>
            <Label htmlFor="contractDate">約定日 <span className="text-red-500">*</span></Label>
            <Input type="date" id="contractDate" value={form.schedule.contractDate} onChange={(e) => update("schedule", "contractDate", e.target.value)} />
          </div>
        </CardContent>
      </Card>

      {/* Section 4: Rate Info */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-bank-primary text-white text-xs font-bold">4</span>
            仕切レート情報
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="internalRate">仕切レート（%） <span className="text-red-500">*</span></Label>
            <Input type="number" step="0.00001" id="internalRate" value={form.rateInfo.internalRate} onChange={(e) => update("rateInfo", "internalRate", Number(e.target.value))} />
            <p className="text-xs text-gray-500 mt-1">L仕切カーブから取得</p>
          </div>
          <div>
            <Label htmlFor="customerRate">対顧金利（%） <span className="text-red-500">*</span></Label>
            <Input type="number" step="0.00001" id="customerRate" value={form.rateInfo.customerRate} onChange={(e) => update("rateInfo", "customerRate", Number(e.target.value))} />
          </div>
          <div>
            <Label htmlFor="spread">乖離幅（%）</Label>
            <Input
              type="number"
              id="spread"
              value={form.rateInfo.spread.toFixed(5)}
              readOnly
              className="bg-gray-50 text-gray-600"
            />
            <p className="text-xs text-gray-500 mt-1">対顧金利 - 仕切レート（自動計算）</p>
          </div>
        </CardContent>
      </Card>

      {/* Section 5: Prepayment Info */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-bank-primary text-white text-xs font-bold">5</span>
            繰上返済条件
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {form.prepayment.isSyndicatedLoan && (
            <div className="md:col-span-2 p-3 bg-yellow-50 border border-yellow-300 rounded-lg flex gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600 shrink-0 mt-0.5" />
              <p className="text-sm text-yellow-800">シローン該当案件は手計算による補完が必要です</p>
            </div>
          )}
          <div>
            <Label htmlFor="responsiblePerson">担当者名 <span className="text-red-500">*</span></Label>
            <Input id="responsiblePerson" value={form.prepayment.responsiblePerson} onChange={(e) => update("prepayment", "responsiblePerson", e.target.value)} />
          </div>
          <div>
            <Label htmlFor="contact">連絡先 <span className="text-red-500">*</span></Label>
            <Input id="contact" value={form.prepayment.contact} onChange={(e) => update("prepayment", "contact", e.target.value)} placeholder="電話番号" />
          </div>
          <div>
            <Label htmlFor="requestDate">算出依頼日 <span className="text-red-500">*</span></Label>
            <Input type="date" id="requestDate" value={form.prepayment.requestDate} onChange={(e) => update("prepayment", "requestDate", e.target.value)} />
          </div>
          <div>
            <Label htmlFor="answerRequiredDate">回答が必要な日 <span className="text-red-500">*</span></Label>
            <Input type="date" id="answerRequiredDate" value={form.prepayment.answerRequiredDate} onChange={(e) => update("prepayment", "answerRequiredDate", e.target.value)} />
          </div>
          <div>
            <Label htmlFor="answerDeadline">回答時限 <span className="text-red-500">*</span></Label>
            <Input type="time" id="answerDeadline" value={form.prepayment.answerDeadline} onChange={(e) => update("prepayment", "answerDeadline", e.target.value)} />
          </div>
          <div>
            <Label htmlFor="prepaymentDate">繰上返済日 <span className="text-red-500">*</span></Label>
            <Input type="date" id="prepaymentDate" value={form.prepayment.prepaymentDate} onChange={(e) => update("prepayment", "prepaymentDate", e.target.value)} className={errors.prepaymentDate ? "border-red-500" : ""} />
          </div>
          <div className="md:col-span-2">
            <Label>実行方法 <span className="text-red-500">*</span></Label>
            <div className="flex flex-wrap gap-4 mt-2">
              {[
                { value: "FULL", label: "全額繰上" },
                { value: "PARTIAL", label: "一部繰上" },
                { value: "CONDITION_CHANGE", label: "条件変更" },
                { value: "DEFAULT", label: "破綻" },
              ].map(({ value, label }) => (
                <label key={value} className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" value={value} checked={form.prepayment.executionMethod === value} onChange={() => update("prepayment", "executionMethod", value)} className="h-4 w-4 text-bank-primary" />
                  <span className="text-sm">{label}</span>
                </label>
              ))}
            </div>
          </div>
          {form.prepayment.executionMethod === "PARTIAL" && (
            <div>
              <Label htmlFor="partialAmount">一部繰上返済金額（円） <span className="text-red-500">*</span></Label>
              <Input
                type="number"
                id="partialAmount"
                value={form.prepayment.partialAmount || ""}
                onChange={(e) => update("prepayment", "partialAmount", Number(e.target.value))}
                className={errors.partialAmount ? "border-red-500" : ""}
              />
              {errors.partialAmount && <p className="text-xs text-red-500 mt-1">{errors.partialAmount}</p>}
            </div>
          )}
          <div>
            <Label htmlFor="outstandingBalance">借入残高（円） <span className="text-red-500">*</span></Label>
            <Input type="number" id="outstandingBalance" value={form.prepayment.outstandingBalance} onChange={(e) => update("prepayment", "outstandingBalance", Number(e.target.value))} />
          </div>
          <div>
            <Label>シローン該当 <span className="text-red-500">*</span></Label>
            <div className="flex gap-4 mt-2">
              {[{ value: true, label: "有" }, { value: false, label: "無" }].map(({ value, label }) => (
                <label key={label} className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" checked={form.prepayment.isSyndicatedLoan === value} onChange={() => update("prepayment", "isSyndicatedLoan", value)} className="h-4 w-4 text-bank-primary" />
                  <span className="text-sm">{label}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <Label>手数料減免 <span className="text-red-500">*</span></Label>
            <div className="flex gap-4 mt-2">
              {[{ value: true, label: "有" }, { value: false, label: "無" }].map(({ value, label }) => (
                <label key={label} className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" checked={form.prepayment.hasFeeReduction === value} onChange={() => update("prepayment", "hasFeeReduction", value)} className="h-4 w-4 text-bank-primary" />
                  <span className="text-sm">{label}</span>
                </label>
              ))}
            </div>
          </div>
          {form.prepayment.hasFeeReduction && (
            <div>
              <Label htmlFor="approvalNo">稟議番号 <span className="text-red-500">*</span></Label>
              <Input
                id="approvalNo"
                value={form.prepayment.approvalNo || ""}
                onChange={(e) => update("prepayment", "approvalNo", e.target.value)}
                className={errors.approvalNo ? "border-red-500" : ""}
              />
              {errors.approvalNo && <p className="text-xs text-red-500 mt-1">{errors.approvalNo}</p>}
            </div>
          )}
          <div>
            <Label htmlFor="recalculationDate">後日再計算日</Label>
            <Input type="date" id="recalculationDate" value={form.prepayment.recalculationDate || ""} onChange={(e) => update("prepayment", "recalculationDate", e.target.value || null)} />
          </div>
        </CardContent>
      </Card>

      {/* Section 6: Remarks */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-bank-primary text-white text-xs font-bold">6</span>
            備考
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={form.remarks}
            onChange={(e) => setForm((prev) => ({ ...prev, remarks: e.target.value }))}
            placeholder="補足事項があれば記入してください（500文字以内）"
            maxLength={500}
            rows={4}
          />
          <p className="text-xs text-gray-400 mt-1 text-right">{form.remarks.length}/500</p>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 pb-8">
        <Link href="/mrd-system/branch/dashboard">
          <Button variant="outline">キャンセル</Button>
        </Link>
        <Button variant="secondary" onClick={handleSave} disabled={isSaving}>
          {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
          一時保存
        </Button>
        <Button onClick={handleCalculate} disabled={isCalculating} className="min-w-32">
          {isCalculating ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              計算中...
            </>
          ) : (
            <>
              <Play className="h-4 w-4 mr-2" />
              試算実行
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
