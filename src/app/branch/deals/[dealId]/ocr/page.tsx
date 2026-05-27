"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";
import { ExtractedField } from "@/types/deal";
import { calculatePrepaymentFee } from "@/lib/calculation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ArrowLeft, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import Link from "next/link";

interface PageProps {
  params: { dealId: string };
}

const mockOcrFields: ExtractedField[] = [
  { fieldName: "transactionNo", fieldLabel: "取扱番号", formValue: "1000000", ocrValue: "1000000", confidence: 0.99, hasDifference: false },
  { fieldName: "executionAmount", fieldLabel: "実行金額", formValue: 31800000, ocrValue: 31800000, confidence: 0.98, hasDifference: false },
  { fieldName: "contractRate", fieldLabel: "約定金利", formValue: 1.52091, ocrValue: 1.52091, confidence: 0.95, hasDifference: false },
  { fieldName: "fixedEndDate", fieldLabel: "固定期日", formValue: "2029-06-30", ocrValue: "2029-06-30", confidence: 0.98, hasDifference: false },
  { fieldName: "internalRate", fieldLabel: "仕切レート", formValue: 0.5, ocrValue: 0.51, confidence: 0.87, hasDifference: true },
  { fieldName: "outstandingBalance", fieldLabel: "借入残高", formValue: 31800000, ocrValue: 31800000, confidence: 0.99, hasDifference: false },
];

export default function OcrPage({ params }: PageProps) {
  const router = useRouter();
  const { getDeal, updateDeal, currentUser } = useAppStore();
  const deal = getDeal(params.dealId);
  const [fields, setFields] = useState<(ExtractedField & { adopted: string | number })[]>(
    mockOcrFields.map((f) => ({ ...f, adopted: f.formValue }))
  );
  const [isCalculating, setIsCalculating] = useState(false);

  if (!deal) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">案件が見つかりません</p>
      </div>
    );
  }

  const adoptOcr = (idx: number) => {
    setFields((prev) => prev.map((f, i) => i === idx ? { ...f, adopted: f.ocrValue } : f));
  };

  const adoptForm = (idx: number) => {
    setFields((prev) => prev.map((f, i) => i === idx ? { ...f, adopted: f.formValue } : f));
  };

  const adoptAllOcr = () => setFields((prev) => prev.map((f) => ({ ...f, adopted: f.ocrValue })));
  const adoptAllForm = () => setFields((prev) => prev.map((f) => ({ ...f, adopted: f.formValue })));

  const confidenceBadge = (conf: number) => {
    if (conf >= 0.9) return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-green-100 text-green-800">{(conf * 100).toFixed(0)}%</span>;
    if (conf >= 0.7) return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-amber-100 text-amber-800">{(conf * 100).toFixed(0)}%</span>;
    return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-red-100 text-red-800">{(conf * 100).toFixed(0)}%</span>;
  };

  const handleCalculate = async () => {
    setIsCalculating(true);
    await new Promise((r) => setTimeout(r, 1500));
    const result = calculatePrepaymentFee(deal.input);
    updateDeal(deal.dealId, (d) => ({
      ...d,
      status: "CALCULATED",
      result,
      updatedAt: new Date().toISOString(),
    }));
    setIsCalculating(false);
    router.push(`/mrd-system/branch/deals/${deal.dealId}/result`);
  };

  // Sort: differences first
  const sortedFields = [...fields].sort((a, b) => (b.hasDifference ? 1 : 0) - (a.hasDifference ? 1 : 0));

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/mrd-system/branch/deals/new`}>
          <Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4 mr-1" />戻る</Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">OCR突合確認</h1>
          <p className="text-sm text-gray-500 mt-1">AI-OCRの抽出結果とフォーム入力値を照合します</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: PDF Preview */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">PDF書類プレビュー</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="doc1">
              <TabsList className="mb-3">
                <TabsTrigger value="doc1">貸出明細票</TabsTrigger>
                <TabsTrigger value="doc2">返済予定表</TabsTrigger>
              </TabsList>
              <TabsContent value="doc1">
                <div className="bg-gray-100 rounded-lg p-4 h-80 flex items-center justify-center">
                  <div className="text-center text-gray-400">
                    <div className="text-4xl mb-2">📄</div>
                    <p className="text-sm">貸出明細票.pdf</p>
                    <p className="text-xs mt-1">プレビュー（デモ）</p>
                    {/* Simulated PDF content */}
                    <div className="mt-4 text-left text-xs bg-white rounded p-3 w-48 mx-auto text-gray-600 border">
                      <div className="font-bold border-b pb-1 mb-2">貸出明細票</div>
                      <div>取扱番号：1000000</div>
                      <div>実行金額：31,800,000円</div>
                      <div>約定金利：1.52091%</div>
                      <div className="bg-yellow-200 px-1">仕切レート：0.51%</div>
                      <div>固定期日：2029/06/30</div>
                      <div>借入残高：31,800,000円</div>
                    </div>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="doc2">
                <div className="bg-gray-100 rounded-lg p-4 h-80 flex items-center justify-center">
                  <div className="text-center text-gray-400">
                    <div className="text-4xl mb-2">📄</div>
                    <p className="text-sm">返済予定表.pdf</p>
                    <p className="text-xs mt-1">プレビュー（デモ）</p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Right: Comparison Table */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">突合結果</CardTitle>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={adoptAllOcr} className="text-xs">全OCR値採用</Button>
                <Button size="sm" variant="outline" onClick={adoptAllForm} className="text-xs">全フォーム値採用</Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left px-3 py-2">項目</th>
                    <th className="text-left px-3 py-2">フォーム値</th>
                    <th className="text-left px-3 py-2">OCR値</th>
                    <th className="text-left px-3 py-2">信頼度</th>
                    <th className="text-left px-3 py-2">差異</th>
                    <th className="text-left px-3 py-2">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedFields.map((field, i) => (
                    <tr key={field.fieldName} className={`border-b ${field.hasDifference ? "bg-yellow-50" : ""}`}>
                      <td className="px-3 py-2 font-medium">{field.fieldLabel}</td>
                      <td className="px-3 py-2 font-mono">{String(field.formValue)}</td>
                      <td className={`px-3 py-2 font-mono ${field.hasDifference ? "text-red-600 font-bold" : ""}`}>{String(field.ocrValue)}</td>
                      <td className="px-3 py-2">{confidenceBadge(field.confidence)}</td>
                      <td className="px-3 py-2">
                        {field.hasDifference
                          ? <XCircle className="h-4 w-4 text-red-500" />
                          : <CheckCircle2 className="h-4 w-4 text-green-500" />
                        }
                      </td>
                      <td className="px-3 py-2">
                        {field.hasDifference && (
                          <div className="flex gap-1">
                            <button onClick={() => adoptOcr(fields.indexOf(field))} className="text-blue-600 hover:underline text-xs">OCR値</button>
                            <span className="text-gray-300">|</span>
                            <button onClick={() => adoptForm(fields.indexOf(field))} className="text-gray-600 hover:underline text-xs">フォーム値</button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Differences Summary */}
      {sortedFields.some((f) => f.hasDifference) && (
        <div className="p-3 bg-amber-50 border border-amber-300 rounded-lg text-sm text-amber-800">
          ⚠️ {sortedFields.filter((f) => f.hasDifference).length}件の差異があります。採用値を確認してから試算実行してください。
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-3 pb-8">
        <Link href={`/mrd-system/branch/deals/new`}>
          <Button variant="outline">フォームへ戻る</Button>
        </Link>
        <Button onClick={handleCalculate} disabled={isCalculating} className="min-w-40">
          {isCalculating ? (
            <><Loader2 className="h-4 w-4 mr-2 animate-spin" />計算中...</>
          ) : (
            "採用値で試算実行"
          )}
        </Button>
      </div>
    </div>
  );
}
