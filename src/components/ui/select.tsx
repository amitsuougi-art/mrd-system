import * as React from "react";
import { cn } from "@/lib/utils";

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <select
        className={cn(
          "flex h-10 w-full rounded-lg border border-cyber-border bg-cyber-surface/60 px-3 py-2 text-sm text-slate-200",
          "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cyber-cyan/60 focus-visible:border-cyber-cyan/60",
          "disabled:cursor-not-allowed disabled:opacity-40",
          "transition-colors duration-150",
          "[color-scheme:dark]",
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </select>
    );
  }
);
Select.displayName = "Select";

export { Select };
