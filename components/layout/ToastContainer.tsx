"use client";

import { useStore } from "@/lib/store";
import { X, CheckCircle, AlertTriangle, Info, XCircle } from "lucide-react";
import type { Toast } from "@/types";

const icons = {
  success: <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />,
  warning: <AlertTriangle className="w-4 h-4 text-yellow-500 shrink-0" />,
  error: <XCircle className="w-4 h-4 text-red-500 shrink-0" />,
  info: <Info className="w-4 h-4 text-blue-500 shrink-0" />,
};

const borderColors = {
  success: "border-l-green-500",
  warning: "border-l-yellow-500",
  error:   "border-l-red-500",
  info:    "border-l-blue-500",
};

function ToastItem({ toast }: { toast: Toast }) {
  const removeToast = useStore((s) => s.removeToast);
  return (
    <div
      className={`flex items-start gap-3 p-3 rounded-lg border border-l-4 ${borderColors[toast.type]} bg-[hsl(var(--card))] shadow-lg animate-fade-in min-w-[280px] max-w-[360px]`}
    >
      {icons[toast.type]}
      <p className="text-sm flex-1 leading-snug">{toast.message}</p>
      <button
        onClick={() => removeToast(toast.id)}
        className="shrink-0 text-[hsl(var(--muted-fg))] hover:text-[hsl(var(--foreground))] transition-colors"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

export function ToastContainer() {
  const toasts = useStore((s) => s.toasts);
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  );
}
