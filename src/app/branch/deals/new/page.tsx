"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";
import { calculatePrepaymentFee } from "@/lib/calculation";
import { DealInput, Deal } from "@/types/deal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertTriangle, Loader2, Save, Play, ArrowLeft,
  FileUp, CheckCircle2, XCircle, FileText, X, ChevronDown, ChevronRight,
} from "lucide-react";
import Link from "next/link";
import {
  extractTextFromPdf,
  parseLoanText,
  ParsedLoanData,
  FIELD_LABELS,
} from "@/lib/pdf-parser";

// ─────────────────────────────────────────────────────────────
// Default form values
// ─────────────────────────────────────────────────────────────
const defaultValues: DealInput = {
  customerInfo: {
    customerName: "",
    branchCode: "200",
    cifNo: "",
    loanAccountNo: "",
    transactionNo: "",
  },
  originalContract: {
    borrowingDate: "",
    maturityDate: "",
    nextPaymentDate: "",
    fixedEndDate: "",
    executionAmount: 0,
    contractRate: 0,
    repaymentMethod: "EQUAL_PRINCIPAL",
    productType: "CORPORATE",
    interestType: "FIXED",
  },
  schedule: {
    interestReceiveType: "POST",
    paymentInterval: "1M",
    holidayAdjustment: "FOLLOWING",
    contractDate: "",
  },
  rateInfo: {
    internalRate: 0.55,
    customerRate: 0,
    spread: 0,
  },
  prepayment: {
    responsiblePerson: "",
    contact: "",
    requestDate: new Date().toISOString().slice(0, 10),
    answerRequiredDate: "",
    answerDeadline: "15:00",
    prepaymentDate: "",
    executionMethod: "FULL",
    partialAmount: null,
    outstandingBalance: 0,
    isSyndicatedLoan: false,
    hasFeeReduction: false,
    approvalNo: null,
    recalculationDate: null,
  },
  remarks: "",
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

// ─────────────────────────────────────────────────────────────
// PDF Upload section component
// ─────────────────────────────────────────────────────────────
type PdfStatus = "idle" | "parsing" | "success" | "error";

function PdfUploadSection({
  onParsed,
}: {
  onParsed: (data: ParsedLoanData) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<PdfStatus>("idle");
  const [fileName, setFileName] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [parsed, setParsed] = useState<ParsedLoanData | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [rawText, setRawText] = useState<string>("");
  const [showRaw, setShowRaw] = useState(false);

  const handleFile = useCallback(async (file: File) => {
    if (!file.name.endsWith(".pdf")) {
      setErrorMsg("PDFファイルを選択してください");
      setStatus("error");
      return;
    }
    setFileName(file.name);
    setStatus("parsing");
    setErrorMsg("");
    setParsed(null);

    try {
      const text = await extractTextFromPdf(file);
      setRawText(text);
      const data = parseLoanText(text);
      setParsed(data);
      setStatus("success");
      onParsed(data);
    } catch (e) {
      console.error(e);
      setErrorMsg("PDF の解析に失敗しました。テキストが含まれているPDFか確認してください。");
      setStatus("error");
    }
  }, [onParsed]);

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const onDragLeave = () => setIsDragging(false);

  const reset = () => {
    setStatus("idle");
    setFileName("");
    setErrorMsg("");
    setParsed(null);
    setRawText("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Count matched fields
  const matchedCount = parsed
    ? Object.entries(parsed).filter(([, v]) => v !== undefined).length
    : 0;
  const totalFields = Object.keys(FIELD_LABELS).length;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <span
            className="inline-flex items-center justify-center h-6 w-6 rounded-full text-xs font-bold"
            style={{ background: "rgba(0,200,255,0.2)", color: "#00c8ff", border: "1px solid rgba(0,200,255,0.4)" }}
          >
            <FileText className="h-3.5 w-3.5" />
          </span>
          貸出明細照会票 読み込み
          <span className="ml-1 text-[10px] font-normal text-slate-500 border border-slate-700 px-1.5 py-0.5 rounded">
            任意
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Drop zone */}
        {status === "idle" || status === "error" ? (
          <div
            onClick={() => fileInputRef.current?.click()}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            className="relative flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed cursor-pointer transition-all duration-200 py-10"
            style={{
              borderColor: isDragging ? "#00c8ff" : "rgba(0,200,255,0.2)",
              background: isDragging
                ? "rgba(0,200,255,0.06)"
                : "rgba(11,22,40,0.5)",
            }}
          >
            <div
              className="flex items-center justify-center h-14 w-14 rounded-full"
              style={{ background: "rgba(0,200,255,0.1)", border: "1px solid rgba(0,200,255,0.2)" }}
            >
              <FileUp className="h-6 w-6 text-cyber-cyan" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-slate-200">
                PDFをドラッグ＆ドロップ、またはクリックして選択
              </p>
              <p className="text-xs text-slate-500 mt-1">
                貸出明細照会票（PDF）をアップロードすると各フィールドに自動入力します
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="pointer-events-none"
            >
              <FileUp className="h-3.5 w-3.5 mr-1.5" />
              ファイルを選択
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={onInputChange}
            />
          </div>
        ) : null}

        {/* Parsing indicator */}
        {status === "parsing" && (
          <div className="flex items-center gap-3 p-4 rounded-xl" style={{ background: "rgba(0,200,255,0.06)", border: "1px solid rgba(0,200,255,0.2)" }}>
            <Loader2 className="h-5 w-5 text-cyber-cyan animate-spin" />
            <div>
              <p className="text-sm font-medium text-slate-200">PDF解析中...</p>
              <p className="text-xs text-slate-500">{fileName}</p>
            </div>
          </div>
        )}

        {/* Success */}
        {status === "success" && parsed && (
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-xl" style={{ background: "rgba(16,185,129,0.07)", border: "1px solid rgba(16,185,129,0.25)" }}>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-cyber-green shrink-0" />
                <div>
                  <p className="text-sm font-medium text-slate-200">
                    読み込み完了 — {matchedCount}/{totalFields} フィールドを自動入力
                  </p>
                  <p className="text-xs text-slate-500">{fileName}</p>
                </div>
              </div>
              <button onClick={reset} className="text-slate-600 hover:text-slate-400 transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Matched fields grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {(Object.entries(FIELD_LABELS) as [keyof ParsedLoanData, string][]).map(([key, label]) => {
                const val = parsed[key];
                const matched = val !== undefined;
                return (
                  <div
                    key={key}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs"
                    style={{
                      background: matched ? "rgba(16,185,129,0.06)" : "rgba(255,255,255,0.02)",
                      border: matched ? "1px solid rgba(16,185,129,0.2)" : "1px solid rgba(255,255,255,0.06)",
                    }}
                  >
                    {matched
                      ? <CheckCircle2 className="h-3 w-3 text-cyber-green shrink-0" />
                      : <XCircle className="h-3 w-3 text-slate-700 shrink-0" />
                    }
                    <span className={matched ? "text-slate-300" : "text-slate-600"}>
                      {label}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Raw text toggle */}
            <button
              type="button"
              onClick={() => setShowRaw((v) => !v)}
              className="flex items-center gap-1 text-[11px] text-slate-600 hover:text-slate-400 transition-colors"
            >
              {showRaw ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
              抽出テキストを確認する
            </button>
            {showRaw && (
              <div
                className="p-3 rounded-lg text-[11px] font-mono text-slate-500 max-h-40 overflow-y-auto whitespace-pre-wrap"
                style={{ background: "rgba(8,15,30,0.8)", border: "1px solid rgba(0,200,255,0.08)" }}
              >
                {rawText || "（テキストなし）"}
              </div>
            )}
          </div>
        )}

        {/* Error */}
        {status === "error" && (
          <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.25)" }}>
            <XCircle className="h-4 w-4 text-cyber-red shrink-0" />
            <p className="text-xs text-red-400">{errorMsg}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─────────────────────────────────────────────────────────────
// Main page
// ─────────────────────────────────────────────────────────────
export default function NewDealPage() {
  const router = useRouter();
  const { addDeal, updateDeal, currentUser, setActiveDealId } = useAppStore();
  const [form, setForm] = useState<DealInput>({
    ...defaultValues,
    prepayment: {
      ...defaultValues.prepayment,
      responsiblePerson: currentUser?.name || "",
      contact: "",
    },
    rateInfo: {
      ...defaultValues.rateInfo,
      customerRate: 0,
    },
  });
  const [isCalculating, setIsCalculating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Spread auto-calculation
  useEffect(() => {
    const spread = form.rateInfo.customerRate - form.rateInfo.internalRate;
    setForm((prev) => ({
      ...prev,
      rateInfo: { ...prev.rateInfo, spread: Math.round(spread * 100000) / 100000 },
    }));
  }, [form.rateInfo.customerRate, form.rateInfo.internalRate]);

  // Apply parsed PDF data into form
  const handleParsed = useCallback((data: ParsedLoanData) => {
    setForm((prev) => ({
      ...prev,
      customerInfo: {
        ...prev.customerInfo,
        ...(data.customerName && { customerName: data.customerName }),
        ...(data.branchCode && { branchCode: data.branchCode }),
        ...(data.cifNo && { cifNo: data.cifNo }),
        ...(data.loanAccountNo && { loanAccountNo: data.loanAccountNo }),
        ...(data.transactionNo && { transactionNo: data.transactionNo }),
      },
      originalContract: {
        ...prev.originalContract,
        ...(data.borrowingDate && { borrowingDate: data.borrowingDate }),
        ...(data.maturityDate && { maturityDate: data.maturityDate }),
        ...(data.nextPaymentDate && { nextPaymentDate: data.nextPaymentDate }),
        ...(data.fixedEndDate && {
          fixedEndDate: data.fixedEndDate,
          maturityDate: prev.originalContract.maturityDate || data.fixedEndDate,
        }),
        ...(data.executionAmount && { executionAmount: data.executionAmount }),
        ...(data.contractRate && { contractRate: data.contractRate }),
        ...(data.repaymentMethod && { repaymentMethod: data.repaymentMethod }),
      },
      schedule: {
        ...prev.schedule,
        ...(data.paymentInterval && { paymentInterval: data.paymentInterval }),
        ...(data.borrowingDate && { contractDate: data.borrowingDate }),
      },
      rateInfo: {
        ...prev.rateInfo,
        ...(data.contractRate && { customerRate: data.contractRate }),
      },
      prepayment: {
        ...prev.prepayment,
        ...(data.outstandingBalance && { outstandingBalance: data.outstandingBalance }),
      },
    }));
  }, []);

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
      history: [{
        timestamp: new Date().toISOString(),
        userId: currentUser?.userId || "u001",
        userName: currentUser?.name || "",
        action: "作成",
        description: "案件を作成しました（下書き）",
      }],
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
      history: [{
        timestamp: new Date().toISOString(),
        userId: currentUser?.userId || "u001",
        userName: currentUser?.name || "",
        action: "試算実行",
        description: "試算を実行しました",
      }],
      createdBy: currentUser?.userId || "u001",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      receptionAt: null, receptionBy: null,
      reviewAt: null, reviewBy: null,
      approvalAt: null, approvalBy: null,
      confirmedAt: null, confirmedBy: null,
    };
    addDeal(deal);
    await new Promise((r) => setTimeout(r, 1500));
    const result = calculatePrepaymentFee(form);
    updateDeal(dealId, (d) => ({ ...d, status: "CALCULATED", result, updatedAt: new Date().toISOString() }));
    setActiveDealId(dealId);
    setIsCalculating(false);
    router.push("/branch/deals/result");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Page header */}
      <div className="flex items-center gap-4">
        <Link href="/branch/dashboard">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-1" />戻る
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-100">期限前弁済手数料 算出依頼</h1>
          <p className="text-sm text-slate-400 mt-1">固定金利融資の期限前弁済手数料を試算します</p>
        </div>
      </div>

      {/* ── PDF Upload ── */}
      <PdfUploadSection onParsed={handleParsed} />

      {/* ── セクション1：取引先情報 ── */}
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
            <Input id="customerName" value={form.customerInfo.customerName}
              onChange={(e) => update("customerInfo", "customerName", e.target.value)}
              className={errors.customerName ? "border-red-500" : ""}
              placeholder="株式会社〇〇" />
            {errors.customerName && <p className="text-xs text-red-500 mt-1">{errors.customerName}</p>}
          </div>
          <div>
            <Label htmlFor="branchCode">店番 <span className="text-red-500">*</span></Label>
            <Input id="branchCode" value={form.customerInfo.branchCode}
              onChange={(e) => update("customerInfo", "branchCode", e.target.value)} maxLength={3} />
          </div>
          <div>
            <Label htmlFor="cifNo">CIF番号 <span className="text-red-500">*</span></Label>
            <Input id="cifNo" value={form.customerInfo.cifNo}
              onChange={(e) => update("customerInfo", "cifNo", e.target.value)} />
          </div>
          <div>
            <Label htmlFor="loanAccountNo">融資口座番号 <span className="text-red-500">*</span></Label>
            <Input id="loanAccountNo" value={form.customerInfo.loanAccountNo}
              onChange={(e) => update("customerInfo", "loanAccountNo", e.target.value)} />
          </div>
          <div>
            <Label htmlFor="transactionNo">取扱番号 <span className="text-red-500">*</span></Label>
            <Input id="transactionNo" value={form.customerInfo.transactionNo}
              onChange={(e) => update("customerInfo", "transactionNo", e.target.value)} />
          </div>
        </CardContent>
      </Card>

      {/* ── セクション2：原契約条件 ── */}
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
            <Input type="date" id="borrowingDate" value={form.originalContract.borrowingDate}
              onChange={(e) => update("originalContract", "borrowingDate", e.target.value)} />
          </div>
          <div>
            <Label htmlFor="maturityDate">期日 <span className="text-red-500">*</span></Label>
            <Input type="date" id="maturityDate" value={form.originalContract.maturityDate}
              onChange={(e) => update("originalContract", "maturityDate", e.target.value)} />
          </div>
          <div>
            <Label htmlFor="nextPaymentDate">次回利払返済日 <span className="text-red-500">*</span></Label>
            <Input type="date" id="nextPaymentDate" value={form.originalContract.nextPaymentDate}
              onChange={(e) => update("originalContract", "nextPaymentDate", e.target.value)} />
          </div>
          <div>
            <Label htmlFor="fixedEndDate">固定期日 <span className="text-red-500">*</span></Label>
            <Input type="date" id="fixedEndDate" value={form.originalContract.fixedEndDate}
              onChange={(e) => update("originalContract", "fixedEndDate", e.target.value)}
              className={errors.fixedEndDate ? "border-red-500" : ""} />
            {errors.fixedEndDate && <p className="text-xs text-red-500 mt-1">{errors.fixedEndDate}</p>}
          </div>
          <div>
            <Label htmlFor="executionAmount">実行金額（円） <span className="text-red-500">*</span></Label>
            <Input type="number" id="executionAmount" value={form.originalContract.executionAmount || ""}
              onChange={(e) => update("originalContract", "executionAmount", Number(e.target.value))}
              className={errors.executionAmount ? "border-red-500" : ""}
              placeholder="例: 31800000" />
            {errors.executionAmount && <p className="text-xs text-red-500 mt-1">{errors.executionAmount}</p>}
          </div>
          <div>
            <Label htmlFor="contractRate">約定金利（%） <span className="text-red-500">*</span></Label>
            <Input type="number" step="0.00001" id="contractRate"
              value={form.originalContract.contractRate || ""}
              onChange={(e) => {
                const v = Number(e.target.value);
                update("originalContract", "contractRate", v);
                update("rateInfo", "customerRate", v);
              }}
              placeholder="例: 1.52091" />
          </div>
          <div>
            <Label htmlFor="repaymentMethod">返済方式 <span className="text-red-500">*</span></Label>
            <Select id="repaymentMethod" value={form.originalContract.repaymentMethod}
              onChange={(e) => update("originalContract", "repaymentMethod", e.target.value)}>
              <option value="EQUAL_PRINCIPAL">元金均等</option>
              <option value="EQUAL_PAYMENT">元利均等</option>
              <option value="BULLET">期日一括</option>
            </Select>
          </div>
          <div>
            <Label htmlFor="productType">商品区分 <span className="text-red-500">*</span></Label>
            <Select id="productType" value={form.originalContract.productType}
              onChange={(e) => update("originalContract", "productType", e.target.value)}>
              <option value="CORPORATE">事業法人</option>
              <option value="INDIVIDUAL">個人</option>
              <option value="SPREAD_LOAN">スプレッド融資</option>
              <option value="OTHER">その他</option>
            </Select>
          </div>
          <div>
            <Label htmlFor="interestType">金利種類 <span className="text-red-500">*</span></Label>
            <Select id="interestType" value={form.originalContract.interestType}
              onChange={(e) => update("originalContract", "interestType", e.target.value)}>
              <option value="FIXED">固定金利</option>
              <option value="TIBOR_SHORT">TIBOR等短期変動</option>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* ── セクション3：スケジュール条件 ── */}
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
                  <input type="radio" value={value} checked={form.schedule.interestReceiveType === value}
                    onChange={() => update("schedule", "interestReceiveType", value)}
                    className="h-4 w-4 accent-cyber-cyan" />
                  <span className="text-sm text-slate-300">{label}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <Label htmlFor="paymentInterval">利払間隔 <span className="text-red-500">*</span></Label>
            <Select id="paymentInterval" value={form.schedule.paymentInterval}
              onChange={(e) => update("schedule", "paymentInterval", e.target.value)}>
              <option value="1M">1ヶ月</option>
              <option value="3M">3ヶ月</option>
              <option value="6M">6ヶ月</option>
              <option value="12M">12ヶ月</option>
              <option value="OTHER">その他</option>
            </Select>
          </div>
          <div>
            <Label htmlFor="holidayAdjustment">休日調整 <span className="text-red-500">*</span></Label>
            <Select id="holidayAdjustment" value={form.schedule.holidayAdjustment}
              onChange={(e) => update("schedule", "holidayAdjustment", e.target.value)}>
              <option value="PRECEDING">前営業日</option>
              <option value="FOLLOWING">翌営業日</option>
              <option value="NONE">無し</option>
            </Select>
          </div>
          <div>
            <Label htmlFor="contractDate">約定日 <span className="text-red-500">*</span></Label>
            <Input type="date" id="contractDate" value={form.schedule.contractDate}
              onChange={(e) => update("schedule", "contractDate", e.target.value)} />
          </div>
        </CardContent>
      </Card>

      {/* ── セクション4：仕切レート情報 ── */}
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
            <Input type="number" step="0.00001" id="internalRate" value={form.rateInfo.internalRate}
              onChange={(e) => update("rateInfo", "internalRate", Number(e.target.value))} />
            <p className="text-xs text-slate-500 mt-1">L仕切カーブから取得</p>
          </div>
          <div>
            <Label htmlFor="customerRate">対顧金利（%） <span className="text-red-500">*</span></Label>
            <Input type="number" step="0.00001" id="customerRate" value={form.rateInfo.customerRate}
              onChange={(e) => update("rateInfo", "customerRate", Number(e.target.value))} />
          </div>
          <div>
            <Label htmlFor="spread">乖離幅（%）</Label>
            <Input type="number" id="spread" value={form.rateInfo.spread.toFixed(5)}
              readOnly className="bg-gray-50/5 text-gray-400" />
            <p className="text-xs text-slate-500 mt-1">対顧 − 仕切（自動計算）</p>
          </div>
        </CardContent>
      </Card>

      {/* ── セクション5：繰上返済条件 ── */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-bank-primary text-white text-xs font-bold">5</span>
            繰上返済条件
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {form.prepayment.isSyndicatedLoan && (
            <div className="md:col-span-2 p-3 bg-cyber-amber/10 border border-cyber-amber/30 rounded-lg flex gap-2">
              <AlertTriangle className="h-4 w-4 text-cyber-amber shrink-0 mt-0.5" />
              <p className="text-sm text-cyber-amber/90">シローン該当案件は手計算による補完が必要です</p>
            </div>
          )}
          <div>
            <Label htmlFor="responsiblePerson">担当者名 <span className="text-red-500">*</span></Label>
            <Input id="responsiblePerson" value={form.prepayment.responsiblePerson}
              onChange={(e) => update("prepayment", "responsiblePerson", e.target.value)} />
          </div>
          <div>
            <Label htmlFor="contact">連絡先 <span className="text-red-500">*</span></Label>
            <Input id="contact" value={form.prepayment.contact}
              onChange={(e) => update("prepayment", "contact", e.target.value)}
              placeholder="電話番号" />
          </div>
          <div>
            <Label htmlFor="requestDate">算出依頼日 <span className="text-red-500">*</span></Label>
            <Input type="date" id="requestDate" value={form.prepayment.requestDate}
              onChange={(e) => update("prepayment", "requestDate", e.target.value)} />
          </div>
          <div>
            <Label htmlFor="answerRequiredDate">回答が必要な日 <span className="text-red-500">*</span></Label>
            <Input type="date" id="answerRequiredDate" value={form.prepayment.answerRequiredDate}
              onChange={(e) => update("prepayment", "answerRequiredDate", e.target.value)} />
          </div>
          <div>
            <Label htmlFor="answerDeadline">回答時限 <span className="text-red-500">*</span></Label>
            <Input type="time" id="answerDeadline" value={form.prepayment.answerDeadline}
              onChange={(e) => update("prepayment", "answerDeadline", e.target.value)} />
          </div>

          {/* ── 繰上返済日（目立たせる）── */}
          <div
            className="rounded-xl p-4"
            style={{ background: "rgba(0,200,255,0.05)", border: "1px solid rgba(0,200,255,0.2)" }}
          >
            <Label htmlFor="prepaymentDate" className="text-cyber-cyan">
              繰上返済ご希望日 <span className="text-red-400">*</span>
            </Label>
            <Input
              type="date"
              id="prepaymentDate"
              value={form.prepayment.prepaymentDate}
              onChange={(e) => update("prepayment", "prepaymentDate", e.target.value)}
              className={`mt-1 ${errors.prepaymentDate ? "border-red-500" : "border-cyber-cyan/30 focus-visible:ring-cyber-cyan/60"}`}
            />
            {errors.prepaymentDate && <p className="text-xs text-red-500 mt-1">{errors.prepaymentDate}</p>}
            <p className="text-xs text-slate-500 mt-2">
              お客様が繰上返済を希望する日付を入力してください
            </p>
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
                  <input type="radio" value={value}
                    checked={form.prepayment.executionMethod === value}
                    onChange={() => update("prepayment", "executionMethod", value)}
                    className="h-4 w-4 accent-cyber-cyan" />
                  <span className="text-sm text-slate-300">{label}</span>
                </label>
              ))}
            </div>
          </div>
          {form.prepayment.executionMethod === "PARTIAL" && (
            <div>
              <Label htmlFor="partialAmount">一部繰上返済金額（円） <span className="text-red-500">*</span></Label>
              <Input type="number" id="partialAmount" value={form.prepayment.partialAmount || ""}
                onChange={(e) => update("prepayment", "partialAmount", Number(e.target.value))}
                className={errors.partialAmount ? "border-red-500" : ""} />
              {errors.partialAmount && <p className="text-xs text-red-500 mt-1">{errors.partialAmount}</p>}
            </div>
          )}
          <div>
            <Label htmlFor="outstandingBalance">借入残高（円） <span className="text-red-500">*</span></Label>
            <Input type="number" id="outstandingBalance" value={form.prepayment.outstandingBalance || ""}
              onChange={(e) => update("prepayment", "outstandingBalance", Number(e.target.value))} />
          </div>
          <div>
            <Label>シローン該当 <span className="text-red-500">*</span></Label>
            <div className="flex gap-4 mt-2">
              {[{ value: true, label: "有" }, { value: false, label: "無" }].map(({ value, label }) => (
                <label key={label} className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" checked={form.prepayment.isSyndicatedLoan === value}
                    onChange={() => update("prepayment", "isSyndicatedLoan", value)}
                    className="h-4 w-4 accent-cyber-cyan" />
                  <span className="text-sm text-slate-300">{label}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <Label>手数料減免 <span className="text-red-500">*</span></Label>
            <div className="flex gap-4 mt-2">
              {[{ value: true, label: "有" }, { value: false, label: "無" }].map(({ value, label }) => (
                <label key={label} className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" checked={form.prepayment.hasFeeReduction === value}
                    onChange={() => update("prepayment", "hasFeeReduction", value)}
                    className="h-4 w-4 accent-cyber-cyan" />
                  <span className="text-sm text-slate-300">{label}</span>
                </label>
              ))}
            </div>
          </div>
          {form.prepayment.hasFeeReduction && (
            <div>
              <Label htmlFor="approvalNo">稟議番号 <span className="text-red-500">*</span></Label>
              <Input id="approvalNo" value={form.prepayment.approvalNo || ""}
                onChange={(e) => update("prepayment", "approvalNo", e.target.value)}
                className={errors.approvalNo ? "border-red-500" : ""} />
              {errors.approvalNo && <p className="text-xs text-red-500 mt-1">{errors.approvalNo}</p>}
            </div>
          )}
          <div>
            <Label htmlFor="recalculationDate">後日再計算日</Label>
            <Input type="date" id="recalculationDate" value={form.prepayment.recalculationDate || ""}
              onChange={(e) => update("prepayment", "recalculationDate", e.target.value || null)} />
          </div>
        </CardContent>
      </Card>

      {/* ── セクション6：備考 ── */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-bank-primary text-white text-xs font-bold">6</span>
            備考
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea value={form.remarks}
            onChange={(e) => setForm((prev) => ({ ...prev, remarks: e.target.value }))}
            placeholder="補足事項があれば記入してください（500文字以内）"
            maxLength={500} rows={4} />
          <p className="text-xs text-slate-500 mt-1 text-right">{form.remarks.length}/500</p>
        </CardContent>
      </Card>

      {/* ── アクションボタン ── */}
      <div className="flex justify-end gap-3 pb-8">
        <Link href="/branch/dashboard">
          <Button variant="outline">キャンセル</Button>
        </Link>
        <Button variant="secondary" onClick={handleSave} disabled={isSaving}>
          {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
          一時保存
        </Button>
        <Button onClick={handleCalculate} disabled={isCalculating} className="min-w-32">
          {isCalculating ? (
            <><Loader2 className="h-4 w-4 mr-2 animate-spin" />計算中...</>
          ) : (
            <><Play className="h-4 w-4 mr-2" />試算実行</>
          )}
        </Button>
      </div>
    </div>
  );
}
