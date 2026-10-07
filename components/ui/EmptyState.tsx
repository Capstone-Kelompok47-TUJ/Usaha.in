"use client";

import { FolderOpen } from "lucide-react";

export interface EmptyStateProps {
  icon?: React.ReactNode | React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  actionText?: string;
  actionLabel?: string;
  onAction?: () => void;
  actionHref?: string;
  secondaryActionText?: string;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon: IconProp,
  title,
  description,
  actionText,
  actionLabel,
  onAction,
  actionHref,
  secondaryActionText,
  secondaryActionLabel,
  onSecondaryAction,
  className = "",
}: EmptyStateProps) {
  const primaryText = actionLabel || actionText;
  const secondaryText = secondaryActionLabel || secondaryActionText;

  // Render icon whether it's a ComponentType or ReactNode
  let renderedIcon: React.ReactNode = null;
  if (IconProp) {
    if (typeof IconProp === "function") {
      const IconComponent = IconProp as React.ComponentType<{ className?: string }>;
      renderedIcon = <IconComponent className="w-7 h-7" />;
    } else {
      renderedIcon = IconProp;
    }
  } else {
    renderedIcon = <FolderOpen className="w-7 h-7" />;
  }

  return (
    <div
      className={`flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl border border-dashed border-[hsl(var(--border))] bg-[hsl(var(--card))]/50 ${className}`}
    >
      {/* Icon Container */}
      <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4 shadow-2xs">
        {renderedIcon}
      </div>

      {/* Text Info */}
      <h3 className="text-base sm:text-lg font-bold text-[hsl(var(--foreground))] mb-1">
        {title}
      </h3>
      <p className="text-xs sm:text-sm text-[hsl(var(--muted-fg))] max-w-md mb-6 leading-relaxed">
        {description}
      </p>

      {/* Action Buttons */}
      <div className="flex items-center gap-3 flex-wrap justify-center">
        {primaryText && (
          actionHref ? (
            <a
              href={actionHref}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold transition-colors shadow-xs"
            >
              {primaryText}
            </a>
          ) : (
            <button
              type="button"
              onClick={onAction}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold transition-colors shadow-xs cursor-pointer"
            >
              {primaryText}
            </button>
          )
        )}

        {secondaryText && (
          <button
            type="button"
            onClick={onSecondaryAction}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] hover:bg-[hsl(var(--muted))] text-[hsl(var(--foreground))] text-xs sm:text-sm font-medium transition-colors cursor-pointer"
          >
            {secondaryText}
          </button>
        )}
      </div>
    </div>
  );
}
