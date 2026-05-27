"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Upload, FileText, Trash2, CheckCircle2, Loader2 } from "lucide-react";
import Link from "next/link";

interface PageProps {
  params: { dealId: string };
}

interface MockFile {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadedAt: string;
}

export default function AttachPage({ params }: PageProps) {
  const router = useRouter();
  const { getDeal, updateDeal } = useAppStore();
  const deal = getDeal(params.dealId);
  const [files, setFiles] = useState<MockFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!deal) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">案件が見つかりません</p>
      </div>
    );
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files;
    if (!selected) return;
    const newFiles: MockFile[] = Array.from(selected).map((f) => ({
      id: `file-${Date.now()}-${Math.random()}`,
      name: f.name,
      size: f.size,
      type: f.name.includes("貸出") ? "貸出明細票" : f.name.includes("返済") ? "返済予定表" : "その他",
      uploadedAt: new Date().toLocaleString("ja-JP"),
    }));
    setFiles((prev) => [...prev, ...newFiles]);
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleOcr = async () => {
    if (files.length === 0) {
      alert("PDFをアップロードしてください");
      return;
    }
    setIsProcessing(true);
    await new Promise((r) => setTimeout(r, 1000));
    updateDeal(deal.dealId, (d) => ({ ...d, status: "OCR_PENDING", updatedAt: new Date().toISOString() }));
    setIsProcessing(false);
    router.push(`/mrd-system/branch/deals/${deal.dealId}/ocr`);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/mrd-system/branch/deals/new`}>
          <Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4 mr-1" />戻る</Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">補助資料の添付</h1>
          <p className="text-sm text-gray-500 mt-1">{deal.input.customerInfo.customerName}</p>
        </div>
      </div>

      {/* Required docs checklist */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">必要書類チェックリスト</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            {[
              { label: "貸出明細票", required: true },
              { label: "返済予定表", required: deal.input.originalContract.repaymentMethod === "EQUAL_PAYMENT" },
              { label: "取引先管理表", required: deal.input.originalContract.repaymentMethod === "EQUAL_PAYMENT" },
              { label: "市場性取引内容確認票", required: false },
              { label: "実行試算照会", required: deal.input.prepayment.executionMethod === "PARTIAL" },
            ].map(({ label, required }) => (
              <li key={label} className="flex items-center gap-2">
                <CheckCircle2 className={`h-4 w-4 ${files.some(f => f.name.includes(label)) ? "text-green-500" : required ? "text-gray-300" : "text-gray-200"}`} />
                <span className={required ? "font-medium" : "text-gray-500"}>
                  {label} {required && <span className="text-red-500 text-xs">（必須）</span>}
                </span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Upload area */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">ファイルアップロード</CardTitle>
        </CardHeader>
        <CardContent>
          <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-8 cursor-pointer hover:border-bank-primary hover:bg-blue-50 transition-colors">
            <Upload className="h-8 w-8 text-gray-400 mb-2" />
            <span className="text-sm text-gray-500">クリックしてPDFファイルを選択</span>
            <span className="text-xs text-gray-400 mt-1">複数ファイル選択可</span>
            <input type="file" multiple accept=".pdf,image/*" className="hidden" onChange={handleFileSelect} />
          </label>

          {files.length > 0 && (
            <div className="mt-4 space-y-2">
              {files.map((f) => (
                <div key={f.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <FileText className="h-4 w-4 text-bank-primary" />
                  <div className="flex-1">
                    <div className="text-sm font-medium">{f.name}</div>
                    <div className="text-xs text-gray-500">{f.type} | {f.uploadedAt}</div>
                  </div>
                  <button onClick={() => removeFile(f.id)} className="text-red-400 hover:text-red-600">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3 pb-8">
        <Link href={`/mrd-system/branch/deals/new`}>
          <Button variant="outline">キャンセル</Button>
        </Link>
        <Button onClick={handleOcr} disabled={isProcessing || files.length === 0}>
          {isProcessing ? (
            <><Loader2 className="h-4 w-4 mr-2 animate-spin" />OCR処理中...</>
          ) : (
            <><Upload className="h-4 w-4 mr-2" />OCR処理開始</>
          )}
        </Button>
      </div>
    </div>
  );
}
