/**
 * 貸出明細照会票 PDF テキスト解析ユーティリティ
 * pdfjs-dist を使ってブラウザ上でテキスト抽出 → フィールドマッピング
 */

export interface ParsedLoanData {
  customerName?: string;
  branchCode?: string;
  cifNo?: string;
  loanAccountNo?: string;
  transactionNo?: string;
  borrowingDate?: string;      // YYYY-MM-DD
  maturityDate?: string;
  nextPaymentDate?: string;
  fixedEndDate?: string;
  executionAmount?: number;
  contractRate?: number;
  outstandingBalance?: number;
  repaymentMethod?: "EQUAL_PRINCIPAL" | "EQUAL_PAYMENT" | "BULLET";
  paymentInterval?: "1M" | "3M" | "6M" | "12M";
}

export interface ParseResult {
  success: boolean;
  text: string;
  data: ParsedLoanData;
  matchedFields: string[];
  unmatchedFields: string[];
}

// ─────────────────────────────────────────────────────────────
// PDF テキスト抽出
// ─────────────────────────────────────────────────────────────
export async function extractTextFromPdf(file: File): Promise<string> {
  // pdfjs-dist 4.x: legacy build を使用（webpack互換）
  const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs");
  const { GlobalWorkerOptions, getDocument } = pdfjsLib;

  // CDN ワーカーを使用（静的エクスポート環境で最も安定）
  GlobalWorkerOptions.workerSrc =
    "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.worker.min.mjs";

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await getDocument({ data: arrayBuffer }).promise;

  const texts: string[] = [];
  // 最大10ページまで解析（貸出明細は通常1〜2ページ）
  const pageCount = Math.min(pdf.numPages, 10);
  for (let i = 1; i <= pageCount; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((item: any) => ("str" in item ? item.str : ""))
      .join(" ");
    texts.push(pageText);
  }
  return texts.join("\n");
}

// ─────────────────────────────────────────────────────────────
// 日付文字列を YYYY-MM-DD に変換
// ─────────────────────────────────────────────────────────────
function parseDate(raw: string): string | undefined {
  // YYYY/MM/DD
  const slash = raw.match(/(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/);
  if (slash) {
    return `${slash[1]}-${slash[2].padStart(2, "0")}-${slash[3].padStart(2, "0")}`;
  }
  // YYYY年MM月DD日
  const kanji = raw.match(/(\d{4})年\s*(\d{1,2})月\s*(\d{1,2})日/);
  if (kanji) {
    return `${kanji[1]}-${kanji[2].padStart(2, "0")}-${kanji[3].padStart(2, "0")}`;
  }
  return undefined;
}

// ─────────────────────────────────────────────────────────────
// 数値（金額）を抽出
// ─────────────────────────────────────────────────────────────
function parseAmount(raw: string): number | undefined {
  // 1,234,567 / 1234567 / 1,234,567円
  const cleaned = raw.replace(/[,，円¥￥\s]/g, "");
  const n = parseFloat(cleaned);
  return isNaN(n) ? undefined : n;
}

// ─────────────────────────────────────────────────────────────
// テキストから値を抽出するヘルパー
// キーワードの直後にある値を返す
// ─────────────────────────────────────────────────────────────
function findAfter(text: string, ...keywords: string[]): string | undefined {
  for (const kw of keywords) {
    // キーワードの後ろ〜次の区切りまで
    const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const re = new RegExp(
      escaped + "[\\s:：]*(\\S[^\\n\\r]{0,60})",
      "i"
    );
    const m = text.match(re);
    if (m?.[1]) return m[1].trim();
  }
  return undefined;
}

// ─────────────────────────────────────────────────────────────
// メイン解析関数
// ─────────────────────────────────────────────────────────────
export function parseLoanText(text: string): ParsedLoanData {
  const d: ParsedLoanData = {};

  // ── 取引先名 ──
  const nameRaw = findAfter(text, "取引先名", "貸出先名", "借入人名", "お客様名", "顧客名");
  if (nameRaw) {
    // 後続の余分な情報を除去（最初の漢字・カタカナ・ひらがな部分のみ）
    const clean = nameRaw.match(/^([^\d\s　]{2,40})/);
    if (clean) d.customerName = clean[1];
  }

  // ── 店番 ──
  const branchRaw = findAfter(text, "店番", "店コード", "取扱店番", "店番号");
  if (branchRaw) {
    const m = branchRaw.match(/^(\d{3})/);
    if (m) d.branchCode = m[1];
  }

  // ── CIF番号 ──
  const cifRaw = findAfter(text, "CIF番号", "CIF", "顧客番号", "お客様番号");
  if (cifRaw) {
    const m = cifRaw.match(/^(\d{7,12})/);
    if (m) d.cifNo = m[1];
  }

  // ── 口座番号 ──
  const acctRaw = findAfter(text, "融資口座番号", "口座番号", "貸出口座番号", "ローン番号");
  if (acctRaw) {
    const m = acctRaw.match(/^(\d{6,12})/);
    if (m) d.loanAccountNo = m[1];
  }

  // ── 取扱番号 ──
  const txRaw = findAfter(text, "取扱番号", "取引番号", "管理番号");
  if (txRaw) {
    const m = txRaw.match(/^(\d+)/);
    if (m) d.transactionNo = m[1];
  }

  // ── 借入日 / 実行日 ──
  const borrowRaw = findAfter(text, "借入日", "実行日", "融資日", "貸出日");
  if (borrowRaw) d.borrowingDate = parseDate(borrowRaw);

  // ── 期日 / 満期日 ──
  const matRaw = findAfter(text, "最終返済日", "期日", "満期日", "弁済期日");
  if (matRaw) d.maturityDate = parseDate(matRaw);

  // ── 次回利払返済日 ──
  const nextRaw = findAfter(text, "次回利払日", "次回返済日", "次回利払返済日", "次回弁済日");
  if (nextRaw) d.nextPaymentDate = parseDate(nextRaw);

  // ── 固定期日 ──
  const fixedRaw = findAfter(text, "固定期日", "固定金利期日", "固定期間終了日");
  if (fixedRaw) d.fixedEndDate = parseDate(fixedRaw);

  // ── 実行金額 ──
  const amtRaw = findAfter(text, "実行金額", "融資金額", "借入金額", "貸出金額", "融資額");
  if (amtRaw) d.executionAmount = parseAmount(amtRaw);

  // ── 約定金利 ──
  const rateRaw = findAfter(text, "約定金利", "適用金利", "貸出金利", "金利");
  if (rateRaw) {
    const m = rateRaw.match(/([\d]+\.[\d]+)\s*%?/);
    if (m) d.contractRate = parseFloat(m[1]);
  }

  // ── 借入残高 ──
  const balRaw = findAfter(text, "借入残高", "残高", "元金残高", "現在残高", "残元金");
  if (balRaw) d.outstandingBalance = parseAmount(balRaw);

  // ── 返済方式 ──
  if (/元金均等|元金等額/.test(text)) d.repaymentMethod = "EQUAL_PRINCIPAL";
  else if (/元利均等|元利等額/.test(text)) d.repaymentMethod = "EQUAL_PAYMENT";
  else if (/期日一括|一括/.test(text)) d.repaymentMethod = "BULLET";

  // ── 利払間隔 ──
  if (/毎月|1ヶ月|1か月|月次/.test(text)) d.paymentInterval = "1M";
  else if (/3ヶ月|3か月|四半期|3月毎/.test(text)) d.paymentInterval = "3M";
  else if (/6ヶ月|6か月|半年/.test(text)) d.paymentInterval = "6M";
  else if (/12ヶ月|12か月|年1回|年次/.test(text)) d.paymentInterval = "12M";

  return d;
}

// ─────────────────────────────────────────────────────────────
// 解析結果のフィールドラベルマップ
// ─────────────────────────────────────────────────────────────
export const FIELD_LABELS: Record<keyof ParsedLoanData, string> = {
  customerName: "取引先名",
  branchCode: "店番",
  cifNo: "CIF番号",
  loanAccountNo: "融資口座番号",
  transactionNo: "取扱番号",
  borrowingDate: "借入日",
  maturityDate: "期日",
  nextPaymentDate: "次回利払返済日",
  fixedEndDate: "固定期日",
  executionAmount: "実行金額",
  contractRate: "約定金利",
  outstandingBalance: "借入残高",
  repaymentMethod: "返済方式",
  paymentInterval: "利払間隔",
};
