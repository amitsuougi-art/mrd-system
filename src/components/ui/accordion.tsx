"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

function Accordion({ children, type = "single", className }: {
  children: React.ReactNode;
  type?: "single" | "multiple";
  className?: string;
}) {
  return <div className={cn("", className)}>{children}</div>;
}

function AccordionItem({ children, value, className }: {
  children: React.ReactNode;
  value: string;
  className?: string;
}) {
  const [open, setOpen] = React.useState(false);
  return (
    <div className={cn("border-b", className)}>
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
        "flex flex-1 w-full items-center justify-between py-4 font-medium transition-all hover:underline",
        className
      )}
    >
      {children}
      <ChevronDown className={cn("h-4 w-4 shrink-0 transition-transform duration-200", open ? "rotate-180" : "")} />
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
    <div className={cn("overflow-hidden text-sm", className)}>
      <div className="pb-4 pt-0">{children}</div>
    </div>
  );
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
