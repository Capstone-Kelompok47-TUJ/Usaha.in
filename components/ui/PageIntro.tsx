"use client";

import { useState } from "react";
import { HelpCircle, X, Sparkles, CheckCircle2 } from "lucide-react";

export interface PageHelpTip {
  title?: string;
  description: string;
}

export interface PageIntroProps {
  title: string;
  description: string;
  badge?: string;
  guideTitle?: string;
  guideSteps?: (string | PageHelpTip)[];
  helpTips?: (string | PageHelpTip)[];
  primaryAction?: React.ReactNode;
  secondaryAction?: React.ReactNode;
  actions?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

export function PageIntro({
  title,
  description,
  badge,
  guideTitle,
  guideSteps,
  helpTips = [],
  primaryAction,
  secondaryAction,
  actions,
  children,
  className = "",
}: PageIntroProps) {
  const [showHelpModal, setShowHelpModal] = useState(false);

  const rawTips = guideSteps || helpTips;
  const tips: PageHelpTip[] = rawTips.map((tip, idx) => {
    if (typeof tip === "string") {
      return {
        title: `Langkah ${idx + 1}`,
        description: tip,
      };
    }
    return {
      title: tip.title || `Panduan ${idx + 1}`,
      description: tip.description,
    };
  });

  const modalTitle = guideTitle || `Panduan: ${title}`;

  return (
    <>
      <div
        className={`flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-5 border-b border-[hsl(var(--border))]/80 mb-6 ${className}`}
      >
        {/* Title & Description */}
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[hsl(var(--foreground))]">
              {title}
            </h1>

            {badge && (
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                {badge}
              </span>
            )}

            {/* Help Button '?' */}
            {tips.length > 0 && (
              <button
                type="button"
                onClick={() => setShowHelpModal(true)}
                title={`Panduan ringkas: ${title}`}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium text-[hsl(var(--muted-fg))] hover:text-blue-600 dark:hover:text-blue-400 bg-[hsl(var(--muted))]/60 hover:bg-blue-50 dark:hover:bg-blue-950/40 border border-[hsl(var(--border))] transition-colors cursor-pointer"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span className="text-[11px] hidden sm:inline">Panduan</span>
              </button>
            )}
          </div>

          <p className="text-xs sm:text-sm text-[hsl(var(--muted-fg))] leading-relaxed max-w-3xl">
            {description}
          </p>
        </div>

        {/* Actions Zone: Single Primary Action + Optional Secondary */}
        {(actions || primaryAction || secondaryAction || children) && (
          <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
            {children}
            {secondaryAction}
            {primaryAction}
            {actions}
          </div>
        )}
      </div>

      {/* Quick Help Modal */}
      {showHelpModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in"
          onClick={() => setShowHelpModal(false)}
        >
          <div
            className="relative w-full max-w-lg rounded-2xl bg-[hsl(var(--card))] border border-[hsl(var(--border))] shadow-2xl overflow-hidden animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[hsl(var(--border))] bg-[hsl(var(--muted))]/40">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[hsl(var(--foreground))]">
                    {modalTitle}
                  </h3>
                  <p className="text-xs text-[hsl(var(--muted-fg))]">
                    Cara praktis memakai fitur di halaman ini
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowHelpModal(false)}
                className="p-1.5 rounded-lg text-[hsl(var(--muted-fg))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))] transition-colors"
                aria-label="Tutup"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Help Content (Max 5 tips) */}
            <div className="p-6 space-y-3.5 max-h-[60vh] overflow-y-auto">
              {tips.slice(0, 5).map((tip, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] hover:bg-[hsl(var(--muted))]/40 transition-colors"
                >
                  <div className="p-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    {tip.title && (
                      <h4 className="text-xs sm:text-sm font-semibold text-[hsl(var(--foreground))] mb-0.5">
                        {tip.title}
                      </h4>
                    )}
                    <p className="text-xs text-[hsl(var(--muted-fg))] leading-relaxed">
                      {tip.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3.5 border-t border-[hsl(var(--border))] bg-[hsl(var(--muted))]/30 flex items-center justify-between text-xs text-[hsl(var(--muted-fg))]">
              <span>Usaha.in — Sistem Operasional Toko</span>
              <button
                onClick={() => setShowHelpModal(false)}
                className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-colors cursor-pointer"
              >
                Saya Mengerti
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
