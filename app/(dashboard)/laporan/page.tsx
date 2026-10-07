"use client";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageIntro } from "@/components/ui/PageIntro";
import { Hint } from "@/components/ui/Hint";
import { usePermission } from "@/hooks/usePermission";
import { useStore } from "@/lib/store";
import { calcFinanceSummary, formatRp } from "@/lib/finance";
import { redirect } from "next/navigation";
import { useState } from "react";
import { SalesLineChart, ChannelChart, TopProductsChart } from "@/components/dashboard/Charts";
import type { Channel } from "@/types";

type Period = "daily" | "weekly" | "monthly";

export default function LaporanPage() {
  const { canView } = usePermission("laporan_periodik");
  const orders = useStore((s) => s.orders);
  const purchases = useStore((s) => s.purchases);
  const [period, setPeriod] = useState<Period>("monthly");

  if (!canView) redirect("/tidak-ada-akses");

  const summary = calcFinanceSummary(orders, purchases, period);
  const PERIODS: { key: Period; label: string }[] = [
    { key: "daily", label: "Hari Ini" },
    { key: "weekly", label: "Minggu Ini" },
    { key: "monthly", label: "Bulan Ini" },
  ];

  return (
    <DashboardLayout title="Laporan" subtitle="Ringkasan performa bisnis per periode">
      <div className="space-y-6 animate-fade-in pb-12">
        <PageIntro
          title="Laporan Keuangan Periodik"
          description="Pantau ringkasan performa penjualan, beban pokok modal produk, potongan biaya admin platform, dan laba bersih per periode."
          guideTitle="Panduan Laporan Periodik"
          guideSteps={[
            "Pilih tab periode (Hari Ini, Minggu Ini, atau Bulan Ini) untuk mengubah rentang waktu laporan.",
            "Pendapatan mencatat total nilai kotor pesanan yang lunas pada periode terpilih.",
            "HPP (Harga Pokok Penjualan) adalah modal awal produk yang terjual.",
            "Admin & Ongkir menghitung total potongan biaya kanal marketplace dan kurir pengiriman.",
            "Laba Bersih adalah sisa keuntungan riil setelah dikurangi HPP, admin, dan biaya operasional.",
          ]}
        />

        <div className="flex items-center gap-1 p-1 bg-[hsl(var(--muted))] rounded-lg w-fit">
          {PERIODS.map((p) => (
            <button key={p.key} onClick={() => setPeriod(p.key)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                period === p.key ? "bg-[hsl(var(--card))] shadow text-[hsl(var(--foreground))] font-bold" : "text-[hsl(var(--muted-fg))] hover:text-[hsl(var(--foreground))]"
              }`}>
              {p.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Pendapatan Kotor", term: undefined, value: formatRp(summary.revenue), color: "text-blue-600 dark:text-blue-400" },
            { label: "HPP (Modal Produk)", term: "HPP" as const, value: formatRp(summary.cogs), color: "text-red-600 dark:text-red-400" },
            { label: "Admin & Ongkir", term: undefined, value: formatRp(summary.adminFee + summary.shippingCost), color: "text-orange-600 dark:text-orange-400" },
            { label: "Laba Bersih Riil", term: "Laba Bersih" as const, value: formatRp(summary.netProfit), color: summary.netProfit >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400" },
          ].map((item) => (
            <div key={item.label} className="card text-center">
              <p className="text-xs text-[hsl(var(--muted-fg))] mb-1 flex items-center justify-center gap-1">
                {item.term ? <Hint term={item.term}>{item.label}</Hint> : item.label}
              </p>
              <p className={`text-lg font-bold ${item.color}`}>{item.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2"><SalesLineChart /></div>
          <ChannelChart />
        </div>
        <div><TopProductsChart /></div>
      </div>
    </DashboardLayout>
  );
}
