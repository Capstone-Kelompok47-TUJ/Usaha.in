"use client";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { usePermission } from "@/hooks/usePermission";
import { useStore } from "@/lib/store";
import { calcFinanceSummary, calcChannelFinance, formatRp } from "@/lib/finance";
import { redirect } from "next/navigation";
import { useState } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import type { Channel } from "@/types";

type Period = "daily" | "weekly" | "monthly";

const CHANNEL_LABEL: Record<string, string> = {
  shopee: "Shopee",
  marketplace_a: "Shopee",
  tokopedia: "Tokopedia",
  marketplace_b: "Tokopedia",
  chat: "WhatsApp",
  offline: "Toko Offline",
};

function SummaryRow({ label, value, sub, highlight }: { label: string; value: string; sub?: string; highlight?: "positive" | "negative" | "neutral" }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-[hsl(var(--border))] last:border-0">
      <div>
        <p className="text-sm font-medium">{label}</p>
        {sub && <p className="text-xs text-[hsl(var(--muted-fg))]">{sub}</p>}
      </div>
      <span className={`font-bold text-sm ${
        highlight === "positive" ? "text-green-600 dark:text-green-400"
        : highlight === "negative" ? "text-red-600 dark:text-red-400"
        : ""
      }`}>
        {value}
      </span>
    </div>
  );
}

export default function KeuanganPage() {
  const { canView } = usePermission("keuangan");
  const orders = useStore((s) => s.orders);
  const purchases = useStore((s) => s.purchases);
  const [period, setPeriod] = useState<Period>("monthly");

  if (!canView) redirect("/tidak-ada-akses");

  const summary = calcFinanceSummary(orders, purchases, period);
  const channelData = calcChannelFinance(orders, purchases, period);

  const PERIODS: { key: Period; label: string }[] = [
    { key: "daily", label: "Hari Ini" },
    { key: "weekly", label: "Minggu Ini" },
    { key: "monthly", label: "Bulan Ini" },
  ];

  return (
    <DashboardLayout title="Keuangan" subtitle="Laporan laba/rugi dan profitabilitas per kanal">
      {/* Period toggle */}
      <div className="flex items-center gap-1 mb-5 p-1 bg-[hsl(var(--muted))] rounded-lg w-fit">
        {PERIODS.map((p) => (
          <button key={p.key} onClick={() => setPeriod(p.key)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              period === p.key
                ? "bg-[hsl(var(--card))] shadow text-[hsl(var(--foreground))]"
                : "text-[hsl(var(--muted-fg))] hover:text-[hsl(var(--foreground))]"
            }`}>
            {p.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Laba/Rugi Summary */}
        <div className="card">
          <h3 className="font-bold text-sm mb-4">Ringkasan Laba/Rugi</h3>
          <SummaryRow label="Total Pendapatan" value={formatRp(summary.revenue)} highlight="positive" />
          <SummaryRow label="HPP (Harga Pokok Penjualan)" value={`−${formatRp(summary.cogs)}`} sub="Biaya produk terjual" highlight="negative" />
          <SummaryRow label="Potongan Admin Marketplace" value={`−${formatRp(summary.adminFee)}`} highlight="negative" />
          <SummaryRow label="Ongkos Kirim" value={`−${formatRp(summary.shippingCost)}`} highlight="negative" />
          <SummaryRow label="Pengeluaran Operasional" value={`−${formatRp(summary.operationalExpense)}`} sub="Biaya tetap (proporsional)" highlight="negative" />
          <div className="mt-3 pt-3 border-t-2 border-[hsl(var(--border))] flex items-center justify-between">
            <span className="font-bold">Laba Bersih</span>
            <div className="flex items-center gap-2">
              {summary.netProfit >= 0
                ? <TrendingUp className="w-4 h-4 text-green-500" />
                : <TrendingDown className="w-4 h-4 text-red-500" />}
              <span className={`text-lg font-bold ${summary.netProfit >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                {formatRp(summary.netProfit)}
              </span>
            </div>
          </div>
          {summary.revenue > 0 && (
            <p className="text-xs text-[hsl(var(--muted-fg))] mt-1">
              Margin: <span className="font-semibold">{Math.round((summary.netProfit / summary.revenue) * 100)}%</span>
            </p>
          )}
        </div>

        {/* Profitabilitas per Kanal */}
        <div className="card">
          <h3 className="font-bold text-sm mb-4">Profitabilitas per Kanal</h3>
          <div className="space-y-3">
            {channelData
              .filter((c) => c.revenue > 0)
              .sort((a, b) => b.margin - a.margin)
              .map((c) => (
                <div key={c.channel} className="p-3 rounded-lg border border-[hsl(var(--border))] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className={`badge-${c.channel} text-[11px] px-2 py-0.5 rounded-full font-semibold`}>
                      {CHANNEL_LABEL[c.channel]}
                    </span>
                    <div className="text-right">
                      <p className="text-xs text-[hsl(var(--muted-fg))]">Margin</p>
                      <p className={`text-sm font-bold ${c.margin >= 20 ? "text-green-600" : c.margin >= 10 ? "text-yellow-600" : "text-red-600"}`}>
                        {c.margin}%
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[hsl(var(--muted-fg))]">Omzet</span>
                      <p className="font-semibold">{formatRp(c.revenue)}</p>
                    </div>
                    <div>
                      <span className="text-[hsl(var(--muted-fg))]">Laba Bersih</span>
                      <p className={`font-semibold ${c.netProfit >= 0 ? "text-green-600" : "text-red-600"}`}>{formatRp(c.netProfit)}</p>
                    </div>
                    <div>
                      <span className="text-[hsl(var(--muted-fg))]">Admin Fee</span>
                      <p className="font-medium text-red-600">−{formatRp(c.adminFee)}</p>
                    </div>
                    <div>
                      <span className="text-[hsl(var(--muted-fg))]">HPP</span>
                      <p className="font-medium text-red-600">−{formatRp(c.cogs)}</p>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
