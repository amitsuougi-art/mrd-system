import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-lg border border-cyber-border bg-cyber-surface/60 px-3 py-2 text-sm text-slate-200",
          "placeholder:text-slate-500",
          "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cyber-cyan/60 focus-visible:border-cyber-cyan/60",
          "disabled:cursor-not-allowed disabled:opacity-40",
          "transition-colors duration-150 resize-none",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };
