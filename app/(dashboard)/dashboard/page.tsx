"use client";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { AlertPanel } from "@/components/dashboard/AlertPanel";
import { SalesLineChart, ChannelChart, TopProductsChart } from "@/components/dashboard/Charts";
import { EmployeeWidgets } from "@/components/dashboard/EmployeeWidgets";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useStore } from "@/lib/store";
import { calcKpi } from "@/lib/finance";
import { DollarSign, TrendingUp, ShoppingCart, CreditCard } from "lucide-react";
import { useState } from "react";

type Period = "daily" | "weekly" | "monthly";

export default function DashboardPage() {
  const user = useCurrentUser();
  const orders = useStore((s) => s.orders);
  const purchases = useStore((s) => s.purchases);
  const [period, setPeriod] = useState<Period>("monthly");

  const kpi = calcKpi(orders, purchases, period);

  const isOwner = user?.isOwner ?? false;

  const PERIODS: { key: Period; label: string }[] = [
    { key: "daily", label: "Hari Ini" },
    { key: "weekly", label: "Minggu Ini" },
    { key: "monthly", label: "Bulan Ini" },
  ];

  return (
    <DashboardLayout
      title={`Selamat datang, ${user?.name ?? "—"}`}
      subtitle={isOwner ? "Ringkasan performa bisnis Anda" : "Ringkasan aktivitas Anda"}
    >
      {/* Period Toggle (Owner only) */}
      {isOwner && (
        <div className="flex items-center gap-1 mb-5 p-1 bg-[hsl(var(--muted))] rounded-lg w-fit">
          {PERIODS.map((p) => (
            <button
              key={p.key}
              onClick={() => setPeriod(p.key)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                period === p.key
                  ? "bg-[hsl(var(--card))] shadow text-[hsl(var(--foreground))]"
                  : "text-[hsl(var(--muted-fg))] hover:text-[hsl(var(--foreground))]"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      )}

      {/* Owner Dashboard */}
      {isOwner && (
        <div className="space-y-5">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard
              label="Total Omzet"
              value={kpi.revenue}
              isCurrency
              pct={kpi.pctRevenue}
              icon={<DollarSign className="w-5 h-5" />}
              color="blue"
            />
            <KpiCard
              label="Laba Bersih"
              value={kpi.netProfit}
              isCurrency
              pct={kpi.pctNetProfit}
              icon={<TrendingUp className="w-5 h-5" />}
              color="green"
            />
            <KpiCard
              label="Total Pengeluaran"
              value={kpi.expense}
              isCurrency
              pct={kpi.pctExpense}
              icon={<CreditCard className="w-5 h-5" />}
              color="red"
            />
            <KpiCard
              label="Jumlah Pesanan"
              value={kpi.orderCount}
              pct={kpi.pctOrders}
              icon={<ShoppingCart className="w-5 h-5" />}
              color="purple"
            />
          </div>

          {/* Alerts */}
          <AlertPanel />

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <SalesLineChart />
            </div>
            <ChannelChart />
          </div>

          <TopProductsChart />
        </div>
      )}

      {/* Employee Dashboard */}
      {!isOwner && <EmployeeWidgets />}
    </DashboardLayout>
  );
}
