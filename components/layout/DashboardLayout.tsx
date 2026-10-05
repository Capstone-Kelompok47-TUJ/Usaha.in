"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
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

  useEffect(() => {
    // Memberi waktu Zustand persist rehidrasi
    setHasHydrated(true);
  }, []);

  useEffect(() => {
    if (hasHydrated && !isAuthenticated) {
      router.replace("/login");
    }
  }, [hasHydrated, isAuthenticated, router]);

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
      {/* Sidebar: desktop = in-flow; mobile = fixed overlay inside Sidebar.tsx */}
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header title={title} subtitle={subtitle} />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
      <ToastContainer />
    </div>
  );
}
