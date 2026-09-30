"use client";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { usePermission } from "@/hooks/usePermission";
import { useStore } from "@/lib/store";
import { calcFinanceSummary, formatRp } from "@/lib/finance";
import { redirect } from "next/navigation";
import { useState } from "react";
import { SalesLineChart, ChannelChart, TopProductsChart } from "@/components/dashboard/Charts";
import type { Channel } from "@/types";

type Period = "daily" | "weekly" | "monthly";

export default function LaporanPage() {
  const { canView } = usePermission("laporan");
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
      <div className="flex items-center gap-1 mb-5 p-1 bg-[hsl(var(--muted))] rounded-lg w-fit">
        {PERIODS.map((p) => (
          <button key={p.key} onClick={() => setPeriod(p.key)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              period === p.key ? "bg-[hsl(var(--card))] shadow" : "text-[hsl(var(--muted-fg))] hover:text-[hsl(var(--foreground))]"
            }`}>
            {p.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
        {[
          { label: "Pendapatan", value: formatRp(summary.revenue), color: "text-blue-600" },
          { label: "HPP", value: formatRp(summary.cogs), color: "text-red-600" },
          { label: "Admin & Ongkir", value: formatRp(summary.adminFee + summary.shippingCost), color: "text-orange-600" },
          { label: "Laba Bersih", value: formatRp(summary.netProfit), color: summary.netProfit >= 0 ? "text-green-600" : "text-red-600" },
        ].map((item) => (
          <div key={item.label} className="card text-center">
            <p className="text-xs text-[hsl(var(--muted-fg))] mb-1">{item.label}</p>
            <p className={`text-lg font-bold ${item.color}`}>{item.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2"><SalesLineChart /></div>
        <ChannelChart />
      </div>
      <div className="mt-5"><TopProductsChart /></div>
    </DashboardLayout>
  );
}
