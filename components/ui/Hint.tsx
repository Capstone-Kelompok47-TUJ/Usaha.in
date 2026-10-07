"use client";

import { useState, useRef, useEffect } from "react";
import { HelpCircle, Info } from "lucide-react";
import { GLOSSARY } from "@/lib/glossary";

interface HintProps {
  term?: keyof typeof GLOSSARY | string;
  text?: string;
  children?: React.ReactNode;
  tooltip?: string;
  technicalTerm?: string;
  className?: string;
}

export function Hint({
  term,
  text,
  children,
  tooltip,
  technicalTerm,
  className = "",
}: HintProps) {
  const item = term && GLOSSARY[term] ? GLOSSARY[term] : null;
  const displayText = children || text || item?.simpleTerm || term || "";
  const displayTooltip = tooltip || item?.tooltip || "";
  const displayTechnical = technicalTerm || item?.technicalTerm || "";

  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <span className={`inline-flex items-center gap-1 relative ${className}`} ref={ref}>
      {displayText && <span>{displayText}</span>}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        className="inline-flex items-center justify-center p-0.5 rounded-full text-[hsl(var(--muted-fg))] hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors cursor-help focus:outline-hidden"
        aria-label={`Bantuan istilah: ${displayText}`}
      >
        <HelpCircle className="w-3.5 h-3.5" />
      </button>

      {/* Tooltip / Popover Bubble */}
      {open && displayTooltip && (
        <div
          role="tooltip"
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 rounded-xl bg-[hsl(var(--card))] border border-[hsl(var(--border))] shadow-xl z-50 text-xs animate-fade-in text-[hsl(var(--foreground))] pointer-events-none sm:pointer-events-auto"
        >
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
            <div className="min-w-0">
              {displayTechnical && (
                <div className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wide mb-0.5">
                  {displayTechnical}
                </div>
              )}
              <p className="text-[11px] leading-relaxed text-[hsl(var(--foreground))] font-normal">
                {displayTooltip}
              </p>
            </div>
          </div>
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px w-2 h-2 bg-[hsl(var(--card))] border-r border-b border-[hsl(var(--border))] rotate-45" />
        </div>
      )}
    </span>
  );
}
