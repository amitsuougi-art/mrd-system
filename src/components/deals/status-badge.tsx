import { DealStatus } from "@/types/deal";

const statusConfig: Record<DealStatus, { label: string; className: string; dot: string }> = {
  DRAFT:              { label: "下書き",       className: "bg-slate-700/50 text-slate-400 border border-slate-600/50",                    dot: "bg-slate-400" },
  OCR_PENDING:        { label: "OCR確認待ち",   className: "bg-cyber-amber/10 text-cyber-amber border border-cyber-amber/30",              dot: "bg-cyber-amber" },
  CALCULATING:        { label: "計算中",        className: "bg-cyber-cyan/10 text-cyber-cyan border border-cyber-cyan/30 animate-pulse",   dot: "bg-cyber-cyan" },
  CALCULATED:         { label: "計算済",        className: "bg-blue-500/10 text-blue-400 border border-blue-500/30",                      dot: "bg-blue-400" },
  SUBMITTED_BY_BRANCH:{ label: "本部送信済",    className: "bg-violet-500/10 text-violet-400 border border-violet-500/30",                dot: "bg-violet-400" },
  RECEPTION_PENDING:  { label: "本部受付待ち",  className: "bg-violet-500/10 text-violet-400 border border-violet-500/30",                dot: "bg-violet-400" },
  RECEPTION_DONE:     { label: "本部受付済",    className: "bg-violet-500/10 text-violet-400 border border-violet-500/30",                dot: "bg-violet-400" },
  REVIEW_PENDING:     { label: "本部点検中",    className: "bg-indigo-500/10 text-indigo-400 border border-indigo-500/30",                dot: "bg-indigo-400" },
  REVIEW_DONE:        { label: "点検済",        className: "bg-indigo-500/10 text-indigo-400 border border-indigo-500/30",                dot: "bg-indigo-400" },
  APPROVAL_PENDING:   { label: "承認待ち",      className: "bg-cyber-amber/10 text-cyber-amber border border-cyber-amber/30",             dot: "bg-cyber-amber" },
  APPROVED:           { label: "回答済",        className: "bg-cyber-green/10 text-cyber-green border border-cyber-green/30",             dot: "bg-cyber-green" },
  REJECTED:           { label: "差戻",          className: "bg-cyber-red/10 text-cyber-red border border-cyber-red/30",                   dot: "bg-cyber-red" },
  CONFIRMED:          { label: "確定",          className: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/40 font-semibold", dot: "bg-emerald-400" },
  CANCELLED:          { label: "取消",          className: "bg-slate-700/30 text-slate-500 border border-slate-700/50",                   dot: "bg-slate-500" },
};

export function StatusBadge({ status }: { status: DealStatus }) {
  const config = statusConfig[status] || { label: status, className: "bg-slate-700/50 text-slate-400 border border-slate-600/50", dot: "bg-slate-400" };
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${config.className}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
}
