"use client";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ShieldOff, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function TidakAdaAksesPage() {
  return (
    <DashboardLayout title="Akses Ditolak">
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center gap-6 animate-fade-in">
        <div className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
          <ShieldOff className="w-10 h-10 text-red-500" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">Anda tidak memiliki akses</h2>
          <p className="text-[hsl(var(--muted-fg))] max-w-md">
            Halaman ini memerlukan izin khusus. Hubungi pemilik usaha untuk
            mendapatkan akses ke modul ini.
          </p>
        </div>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[hsl(var(--brand-500))] text-white font-medium hover:bg-[hsl(var(--brand-600))] transition-colors text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Dashboard
        </Link>
      </div>
    </DashboardLayout>
  );
}
