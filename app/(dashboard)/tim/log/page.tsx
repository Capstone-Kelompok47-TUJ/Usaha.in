"use client";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useStore } from "@/lib/store";
import { formatDateTime } from "@/lib/finance";
import { redirect } from "next/navigation";
import { Activity } from "lucide-react";

const MODULE_LABEL: Record<string, string> = {
  penjualan: "Penjualan",
  stok: "Stok",
  pembelian: "Pembelian",
  pembayaran: "Pembayaran",
  pengiriman: "Pengiriman",
  manajemen_tim: "Manajemen Tim",
  copilot: "AI Copilot",
};

export default function LogAktivitasPage() {
  const user = useCurrentUser();
  const activityLogs = useStore((s) => s.activityLogs);

  if (!user?.isOwner) redirect("/tidak-ada-akses");

  return (
    <DashboardLayout title="Log Aktivitas" subtitle="Riwayat semua tindakan yang tercatat">
      <div className="card !p-0 overflow-hidden">
        <div className="px-4 py-3 border-b border-[hsl(var(--border))] flex items-center gap-2">
          <Activity className="w-4 h-4 text-[hsl(var(--muted-fg))]" />
          <span className="text-sm font-semibold">{activityLogs.length} aktivitas tercatat</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[hsl(var(--border))] bg-[hsl(var(--muted))]">
                {["Waktu", "Pengguna", "Modul", "Aktivitas"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wide text-[hsl(var(--muted-fg))]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {activityLogs.map((log) => (
                <tr key={log.id} className="border-b border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))] transition-colors">
                  <td className="px-4 py-3 text-xs text-[hsl(var(--muted-fg))] whitespace-nowrap">
                    {formatDateTime(log.timestamp)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                        {log.userName.charAt(0)}
                      </div>
                      <span className="font-medium text-sm">{log.userName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-[hsl(var(--muted))] border border-[hsl(var(--border))] font-medium">
                      {MODULE_LABEL[log.module] ?? log.module}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">{log.action}</td>
                </tr>
              ))}
              {activityLogs.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center py-12 text-[hsl(var(--muted-fg))]">Belum ada aktivitas tercatat</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
