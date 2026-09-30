"use client";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { usePermission } from "@/hooks/usePermission";
import { useStore } from "@/lib/store";
import { formatRp } from "@/lib/finance";
import { redirect } from "next/navigation";
import type { Channel } from "@/types";

const CHANNEL_LABEL: Record<Channel, string> = {
  marketplace_a: "Marketplace A",
  marketplace_b: "Marketplace B",
  chat: "Chat",
  offline: "Toko Offline",
};

export default function PelangganPage() {
  const { canView } = usePermission("pelanggan");
  const customers = useStore((s) => s.customers);
  const orders = useStore((s) => s.orders);

  if (!canView) redirect("/tidak-ada-akses");

  // Hitung statistik per pelanggan
  const customerStats = customers.map((c) => {
    const custOrders = orders.filter((o) => o.customerId === c.id && o.paymentStatus === "lunas");
    const totalSpend = custOrders.reduce((s, o) => s + o.subtotal, 0);
    return { ...c, orderCount: custOrders.length, totalSpend };
  }).sort((a, b) => b.totalSpend - a.totalSpend);

  return (
    <DashboardLayout title="Pelanggan" subtitle={`${customers.length} pelanggan terdaftar`}>
      <div className="card !p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[hsl(var(--border))] bg-[hsl(var(--muted))]">
                {["#", "Nama", "Kanal Asal", "No. HP", "Jml Pesanan", "Total Belanja"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wide text-[hsl(var(--muted-fg))]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {customerStats.map((c, idx) => (
                <tr key={c.id} className="border-b border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))] transition-colors">
                  <td className="px-4 py-3 text-[hsl(var(--muted-fg))] text-xs">{idx + 1}</td>
                  <td className="px-4 py-3 font-medium">{c.name}</td>
                  <td className="px-4 py-3">
                    <span className={`badge-${c.channel} text-[11px] px-2 py-0.5 rounded-full font-semibold`}>
                      {CHANNEL_LABEL[c.channel]}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-[hsl(var(--muted-fg))]">{c.phone ?? "—"}</td>
                  <td className="px-4 py-3 font-semibold text-center">{c.orderCount}</td>
                  <td className="px-4 py-3 font-bold">{formatRp(c.totalSpend)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
