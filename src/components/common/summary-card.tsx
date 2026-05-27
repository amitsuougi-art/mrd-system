import { LucideIcon } from "lucide-react";

interface SummaryCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  accent?: boolean;
  urgent?: boolean;
}

export function SummaryCard({ title, value, subtitle, icon: Icon, accent, urgent }: SummaryCardProps) {
  const borderColor = urgent
    ? "border-cyber-red/40"
    : accent
    ? "border-cyber-amber/30"
    : "border-cyber-border/60";

  const iconBg = urgent
    ? "bg-cyber-red/10 border border-cyber-red/20"
    : accent
    ? "bg-cyber-amber/10 border border-cyber-amber/20"
    : "bg-cyber-cyan/10 border border-cyber-cyan/15";

  const iconColor = urgent
    ? "text-cyber-red"
    : accent
    ? "text-cyber-amber"
    : "text-cyber-cyan";

  const valueColor = urgent
    ? "text-cyber-red"
    : accent
    ? "text-cyber-amber"
    : "text-cyber-cyan";

  return (
    <div
      className={`
        rounded-xl p-5 transition-all duration-200
        bg-cyber-card/80 backdrop-blur-sm border ${borderColor}
        hover:shadow-card-hover hover:border-opacity-100
        shadow-card-dark
      `}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-slate-400 tracking-wide uppercase">{title}</p>
          <p className={`text-3xl font-bold mt-2 tabular-nums ${valueColor}`}>
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{subtitle}</p>
          )}
        </div>
        {Icon && (
          <div className={`shrink-0 p-2.5 rounded-lg ${iconBg}`}>
            <Icon className={`h-5 w-5 ${iconColor}`} />
          </div>
        )}
      </div>
    </div>
  );
}
