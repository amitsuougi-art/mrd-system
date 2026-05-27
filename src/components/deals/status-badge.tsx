import { DealStatus } from "@/types/deal";

const statusConfig: Record<DealStatus, { label: string; className: string }> = {
  DRAFT: { label: "下書き", className: "bg-gray-100 text-gray-700" },
  OCR_PENDING: { label: "OCR確認待ち", className: "bg-amber-100 text-amber-800" },
  CALCULATING: { label: "計算中", className: "bg-blue-100 text-blue-800" },
  CALCULATED: { label: "計算済", className: "bg-blue-100 text-blue-800" },
  SUBMITTED_BY_BRANCH: { label: "本部送信済", className: "bg-purple-100 text-purple-800" },
  RECEPTION_PENDING: { label: "本部受付待ち", className: "bg-purple-100 text-purple-800" },
  RECEPTION_DONE: { label: "本部受付済", className: "bg-purple-100 text-purple-800" },
  REVIEW_PENDING: { label: "本部点検中", className: "bg-purple-100 text-purple-800" },
  REVIEW_DONE: { label: "点検済", className: "bg-purple-100 text-purple-800" },
  APPROVAL_PENDING: { label: "承認待ち", className: "bg-yellow-100 text-yellow-800" },
  APPROVED: { label: "回答済", className: "bg-green-100 text-green-800" },
  REJECTED: { label: "差戻", className: "bg-red-100 text-red-800" },
  CONFIRMED: { label: "確定", className: "bg-emerald-100 text-emerald-900 font-semibold" },
  CANCELLED: { label: "取消", className: "bg-gray-100 text-gray-500" },
};

export function StatusBadge({ status }: { status: DealStatus }) {
  const config = statusConfig[status] || { label: status, className: "bg-gray-100 text-gray-700" };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${config.className}`}>
      {config.label}
    </span>
  );
}
