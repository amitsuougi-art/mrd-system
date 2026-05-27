import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline";
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variants: Record<string, string> = {
    default: "bg-cyber-cyan/15 text-cyber-cyan border border-cyber-cyan/30",
    secondary: "bg-cyber-surface text-slate-300 border border-cyber-border",
    destructive: "bg-cyber-red/15 text-cyber-red border border-cyber-red/30",
    outline: "border border-cyber-border text-slate-300",
  };
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}

export { Badge };
