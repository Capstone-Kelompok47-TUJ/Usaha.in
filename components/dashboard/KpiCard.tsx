"use client";

import { formatRp } from "@/lib/finance";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface KpiCardProps {
  label: string;
  value: string | number;
  pct?: number;
  icon: React.ReactNode;
  color?: string;
  isCurrency?: boolean;
}

export function KpiCard({ label, value, pct, icon, color = "blue", isCurrency }: KpiCardProps) {
  const colorMap: Record<string, string> = {
    blue:   "from-blue-500/10 to-blue-600/5 border-blue-200 dark:border-blue-900/50",
    green:  "from-green-500/10 to-green-600/5 border-green-200 dark:border-green-900/50",
    red:    "from-red-500/10 to-red-600/5 border-red-200 dark:border-red-900/50",
    purple: "from-purple-500/10 to-purple-600/5 border-purple-200 dark:border-purple-900/50",
  };
  const iconColorMap: Record<string, string> = {
    blue:   "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
    green:  "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400",
    red:    "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400",
    purple: "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400",
  };

  const displayValue =
    isCurrency && typeof value === "number" ? formatRp(value) : value;

  return (
    <div
      className={`card bg-gradient-to-br ${colorMap[color]} border animate-fade-in`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1 min-w-0 flex-1">
          <p className="text-xs font-medium text-[hsl(var(--muted-fg))] uppercase tracking-wide">
            {label}
          </p>
          <p className="text-2xl font-bold tracking-tight truncate">{displayValue}</p>
          {pct !== undefined && (
            <div className="flex items-center gap-1 text-xs font-medium">
              {pct > 0 ? (
                <>
                  <TrendingUp className="w-3 h-3 text-green-500" />
                  <span className="text-green-600 dark:text-green-400">+{pct}%</span>
                </>
              ) : pct < 0 ? (
                <>
                  <TrendingDown className="w-3 h-3 text-red-500" />
                  <span className="text-red-600 dark:text-red-400">{pct}%</span>
                </>
              ) : (
                <>
                  <Minus className="w-3 h-3 text-[hsl(var(--muted-fg))]" />
                  <span className="text-[hsl(var(--muted-fg))]">0%</span>
                </>
              )}
              <span className="text-[hsl(var(--muted-fg))]">vs periode lalu</span>
            </div>
          )}
        </div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${iconColorMap[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
