"use client";

import { useStore } from "@/lib/store";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { AccountSwitcher } from "./AccountSwitcher";
import {
  RotateCcw,
  Moon,
  Sun,
  Search,
  HelpCircle,
  Store,
} from "lucide-react";
import { useState, useEffect } from "react";

interface HeaderProps {
  title: string;
  subtitle?: string;
  onOpenSearch?: () => void;
  onOpenShortcuts?: () => void;
}

export function Header({
  title,
  subtitle,
  onOpenSearch,
  onOpenShortcuts,
}: HeaderProps) {
  const resetToInitial = useStore((s) => s.resetToInitial);
  const getActiveTenant = useStore((s) => s.getActiveTenant);
  const activeTenant = getActiveTenant();
  const user = useCurrentUser();
  const [dark, setDark] = useState(false);

  // Dark mode toggle
  useEffect(() => {
    const stored = localStorage.getItem("theme");
    if (stored === "dark") {
      document.documentElement.classList.add("dark");
      setDark(true);
    }
  }, []);

  function toggleDark() {
    const next = !dark;
    setDark(next);
    if (next) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }

  // Helper function to format business type label
  const businessTypeLabel =
    activeTenant?.businessType === "produksi"
      ? "Produksi"
      : activeTenant?.businessType === "jasa"
      ? "Jasa"
      : "Dagang";

  return (
    <header className="h-16 shrink-0 flex items-center justify-between px-4 lg:px-6 border-b border-[hsl(var(--border))] bg-[hsl(var(--card))] gap-3 z-20">
      {/* Left / Business Name & Page Title */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="hidden sm:flex items-center gap-2 pr-3 border-r border-[hsl(var(--border))] shrink-0">
          <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
            <Store className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold text-[hsl(var(--foreground))] truncate max-w-[130px] leading-tight">
              {activeTenant?.name ?? "Usaha.in"}
            </div>
            <div className="text-[10px] text-[hsl(var(--muted-fg))] leading-tight flex items-center gap-1">
              <span>Toko {businessTypeLabel}</span>
            </div>
          </div>
        </div>

        {/* Page Title Context */}
        <div className="min-w-0 pl-1">
          <h1 className="font-bold text-sm lg:text-base leading-tight truncate text-[hsl(var(--foreground))]">
            {title}
          </h1>
          {subtitle && (
            <p className="text-[11px] text-[hsl(var(--muted-fg))] truncate leading-tight hidden md:block">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Middle: Global Search Bar (Ctrl+K trigger) */}
      <div className="flex-1 max-w-md hidden md:block">
        <button
          type="button"
          onClick={onOpenSearch}
          id="global-search-trigger"
          className="w-full flex items-center justify-between px-3 py-1.5 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))]/40 hover:bg-[hsl(var(--muted))] hover:border-blue-400/40 text-xs text-[hsl(var(--muted-fg))] transition-all group cursor-pointer shadow-2xs"
        >
          <div className="flex items-center gap-2 truncate">
            <Search className="w-3.5 h-3.5 text-[hsl(var(--muted-fg))] group-hover:text-blue-500 transition-colors" />
            <span className="truncate">Cari pesanan, produk, pelanggan, atau menu...</span>
          </div>
          <kbd className="hidden lg:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono font-semibold rounded bg-[hsl(var(--card))] border border-[hsl(var(--border))] shadow-2xs text-[hsl(var(--muted-fg))] group-hover:text-[hsl(var(--foreground))]">
            Ctrl K
          </kbd>
        </button>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {/* Mobile Search Button */}
        <button
          onClick={onOpenSearch}
          className="md:hidden p-2 rounded-lg hover:bg-[hsl(var(--muted))] text-[hsl(var(--muted-fg))] hover:text-[hsl(var(--foreground))] transition-colors"
          title="Cari Cepat (Ctrl+K)"
          aria-label="Cari Cepat"
        >
          <Search className="w-4 h-4" />
        </button>

        {/* Keyboard Shortcuts / Help Button "?" */}
        <button
          onClick={onOpenShortcuts}
          id="shortcuts-help-btn"
          title="Bantuan & Pintasan Keyboard (?)"
          aria-label="Bantuan & Pintasan"
          className="p-2 rounded-lg hover:bg-[hsl(var(--muted))] text-[hsl(var(--muted-fg))] hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center justify-center cursor-pointer"
        >
          <HelpCircle className="w-4 h-4" />
        </button>

        {/* Dark mode */}
        <button
          onClick={toggleDark}
          id="dark-mode-toggle"
          title={dark ? "Mode Terang" : "Mode Gelap"}
          className="p-2 rounded-lg hover:bg-[hsl(var(--muted))] text-[hsl(var(--muted-fg))] hover:text-[hsl(var(--foreground))] transition-colors cursor-pointer"
        >
          {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Reset Data Demo (Hanya Pemilik Usaha & Demo Mode) */}
        {user?.isOwner && process.env.NEXT_PUBLIC_DEMO_MODE !== "false" && (
          <button
            onClick={() => {
              if (
                confirm(
                  "Reset semua data contoh ke kondisi awal? Seluruh perubahan lokal akan dikembalikan."
                )
              ) {
                resetToInitial();
              }
            }}
            id="reset-data-btn"
            title="Reset Data Demo ke Kondisi Awal"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors border border-amber-200 dark:border-amber-800 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden xl:inline">Reset Demo</span>
          </button>
        )}

        <div className="w-px h-5 bg-[hsl(var(--border))] mx-0.5" />

        {/* Account Menu / Switcher */}
        <AccountSwitcher />
      </div>
    </header>
  );
}
