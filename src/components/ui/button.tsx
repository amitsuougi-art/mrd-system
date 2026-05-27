import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    const base =
      "inline-flex items-center justify-center rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyber-cyan/50 disabled:pointer-events-none disabled:opacity-40";
    const variants: Record<string, string> = {
      default:
        "bg-cyber-cyan text-cyber-bg font-semibold hover:bg-bank-primary-light shadow-neon-sm hover:shadow-neon-cyan",
      destructive:
        "bg-cyber-red/20 text-cyber-red border border-cyber-red/40 hover:bg-cyber-red/30",
      outline:
        "border border-cyber-border text-slate-300 bg-transparent hover:bg-cyber-surface hover:border-cyber-cyan/40 hover:text-cyber-cyan",
      secondary:
        "bg-cyber-surface text-slate-200 border border-cyber-border hover:bg-cyber-muted hover:border-cyber-cyan/30",
      ghost:
        "text-slate-400 hover:bg-cyber-surface hover:text-slate-200",
      link:
        "text-cyber-cyan underline-offset-4 hover:underline hover:text-bank-primary-light",
    };
    const sizes: Record<string, string> = {
      default: "h-10 px-4 py-2",
      sm: "h-8 rounded-md px-3 text-xs",
      lg: "h-11 rounded-md px-8 text-base",
      icon: "h-10 w-10",
    };
    return (
      <button
        className={cn(base, variants[variant], sizes[size], className)}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
