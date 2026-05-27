"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

function Accordion({ children, type = "single", className }: {
  children: React.ReactNode;
  type?: "single" | "multiple";
  className?: string;
}) {
  return (
    <div className={cn("rounded-xl overflow-hidden", "bg-cyber-card/80 backdrop-blur-sm border border-cyber-border/60", className)}>
      {children}
    </div>
  );
}

function AccordionItem({ children, value, className }: {
  children: React.ReactNode;
  value: string;
  className?: string;
}) {
  const [open, setOpen] = React.useState(false);
  return (
    <div className={cn("", className)}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<{ open?: boolean; onToggle?: () => void }>, { open, onToggle: () => setOpen(!open) });
        }
        return child;
      })}
    </div>
  );
}

function AccordionTrigger({ children, className, open, onToggle }: {
  children: React.ReactNode;
  className?: string;
  open?: boolean;
  onToggle?: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className={cn(
        "flex w-full items-center justify-between px-6 py-4 text-sm font-medium transition-all",
        "text-slate-300 hover:text-slate-100 hover:bg-cyber-surface/40",
        className
      )}
    >
      {children}
      <ChevronDown className={cn("h-4 w-4 shrink-0 text-slate-500 transition-transform duration-200", open ? "rotate-180 text-cyber-cyan" : "")} />
    </button>
  );
}

function AccordionContent({ children, className, open }: {
  children: React.ReactNode;
  className?: string;
  open?: boolean;
}) {
  if (!open) return null;
  return (
    <div className={cn("overflow-hidden text-sm border-t border-cyber-border/30", className)}>
      <div className="p-6 pt-4">{children}</div>
    </div>
  );
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
