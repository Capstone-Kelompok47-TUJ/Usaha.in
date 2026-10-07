"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { Breadcrumb } from "./Breadcrumb";
import { CommandPalette } from "./CommandPalette";
import { KeyboardShortcutsModal } from "./KeyboardShortcutsModal";
import { ToastContainer } from "./ToastContainer";

interface DashboardLayoutProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export function DashboardLayout({ title, subtitle, children }: DashboardLayoutProps) {
  const router = useRouter();
  const isAuthenticated = useStore((s) => s.isAuthenticated);
  const [hasHydrated, setHasHydrated] = useState(false);

  // Modals state
  const [searchOpen, setSearchOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);

  useEffect(() => {
    // Memberi waktu Zustand persist rehidrasi
    setHasHydrated(true);
  }, []);

  useEffect(() => {
    if (hasHydrated && !isAuthenticated) {
      router.replace("/login");
    }
  }, [hasHydrated, isAuthenticated, router]);

  // Global Keyboard Shortcuts
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const target = e.target as HTMLElement | null;
    const isInput =
      target &&
      (target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT" ||
        target.isContentEditable);

    // Ctrl + K or Cmd + K: Open Global Search
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      setSearchOpen((prev) => !prev);
      return;
    }

    // Ctrl + Enter or Cmd + Enter: Save Active Form
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      // Find active form or closest dialog/modal submit button
      const activeModal = document.querySelector("[role='dialog'], .modal, .animate-scale-up");
      const submitBtn = activeModal
        ? (activeModal.querySelector('button[type="submit"], button[data-action="save"]') as HTMLButtonElement)
        : (document.querySelector('form button[type="submit"], button[data-action="save"]') as HTMLButtonElement);

      if (submitBtn) {
        e.preventDefault();
        submitBtn.click();
        return;
      }
    }

    // Escape: Close Search / Modal
    if (e.key === "Escape") {
      if (searchOpen) {
        setSearchOpen(false);
        return;
      }
      if (shortcutsOpen) {
        setShortcutsOpen(false);
        return;
      }
    }

    // If typing inside an input field, do not trigger single letter shortcuts
    if (isInput) return;

    // '?' or '/': Open Keyboard Shortcuts & Help Modal
    if (e.key === "?" || e.key === "/") {
      e.preventDefault();
      setShortcutsOpen(true);
      return;
    }

    // 'N' or 'n': Add / Input New in Active Page
    if (e.key.toLowerCase() === "n" && !e.ctrlKey && !e.metaKey && !e.altKey) {
      // Search for add/new button on active page
      const newBtn = document.querySelector(
        '[data-shortcut="new"], #btn-tambah, #btn-input, button:has-text("+"), button[title*="Tambah"], button[title*="Input"]'
      ) as HTMLButtonElement;

      if (newBtn) {
        e.preventDefault();
        newBtn.click();
      } else {
        // Fallback: look for common add button text
        const allButtons = Array.from(document.querySelectorAll("button"));
        const matchingBtn = allButtons.find((btn) => {
          const text = btn.textContent?.toLowerCase() || "";
          return (
            text.includes("tambah") ||
            text.includes("input penjualan") ||
            text.includes("catat pengeluaran") ||
            text.includes("buat")
          );
        });
        if (matchingBtn) {
          e.preventDefault();
          matchingBtn.click();
        }
      }
    }
  }, [searchOpen, shortcutsOpen]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Loading state saat initial hydration
  if (!hasHydrated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[hsl(var(--background))]">
        <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-medium text-[hsl(var(--muted-fg))] animate-pulse">
          Memuat Usaha.in...
        </p>
      </div>
    );
  }

  // Jika tidak terotentikasi, jangan render konten dashboard sebelum router redirect
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[hsl(var(--background))]">
        <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-medium text-[hsl(var(--muted-fg))]">
          Mengarahkan ke halaman masuk...
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[hsl(var(--background))]">
      {/* Sidebar: desktop = in-flow (collapsible); mobile = fixed overlay inside Sidebar.tsx */}
      <Sidebar />

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header
          title={title}
          subtitle={subtitle}
          onOpenSearch={() => setSearchOpen(true)}
          onOpenShortcuts={() => setShortcutsOpen(true)}
        />

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <div className="max-w-7xl mx-auto w-full">
            <Breadcrumb />
            {children}
          </div>
        </main>
      </div>

      {/* Global Modals & Notifications */}
      <CommandPalette
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
      />
      <KeyboardShortcutsModal
        isOpen={shortcutsOpen}
        onClose={() => setShortcutsOpen(false)}
      />
      <ToastContainer />
    </div>
  );
}
