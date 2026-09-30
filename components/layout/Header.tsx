"use client";

import { useStore } from "@/lib/store";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { AccountSwitcher } from "./AccountSwitcher";
import { RotateCcw, Moon, Sun } from "lucide-react";
import { useState, useEffect } from "react";

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  const resetToInitial = useStore((s) => s.resetToInitial);
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

  return (
    <header className="h-16 shrink-0 flex items-center justify-between px-6 border-b border-[hsl(var(--border))] bg-[hsl(var(--card))]">
      {/* Title */}
      <div>
        <h1 className="font-semibold text-base leading-tight">{title}</h1>
        {subtitle && (
          <p className="text-xs text-[hsl(var(--muted-fg))] mt-0.5">{subtitle}</p>
        )}
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-2">
        {/* Dark mode */}
        <button
          onClick={toggleDark}
          id="dark-mode-toggle"
          title={dark ? "Mode Terang" : "Mode Gelap"}
          className="p-2 rounded-lg hover:bg-[hsl(var(--muted))] text-[hsl(var(--muted-fg))] hover:text-[hsl(var(--foreground))] transition-colors"
        >
          {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Reset Demo */}
        <button
          onClick={() => {
            if (confirm("Reset semua data demo ke kondisi awal?")) {
              resetToInitial();
            }
          }}
          id="reset-demo-btn"
          title="Reset Data Demo"
          className="p-2 rounded-lg hover:bg-[hsl(var(--muted))] text-[hsl(var(--muted-fg))] hover:text-[hsl(var(--foreground))] transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <div className="w-px h-6 bg-[hsl(var(--border))]" />

        <AccountSwitcher />
      </div>
    </header>
  );
}
