"use client";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { usePermission } from "@/hooks/usePermission";
import { useStore } from "@/lib/store";
import { formatRp } from "@/lib/finance";
import { redirect } from "next/navigation";
import { useState, useMemo } from "react";
import { TrendingUp, TrendingDown, CheckCircle2, AlertTriangle, Scale } from "lucide-react";
import type { Channel } from "@/types";

// ============================================================
// Types & Constants
// ============================================================

type Period = "daily" | "weekly" | "monthly";
type Tab = "labarugi" | "neraca" | "aruskas";

const CHANNEL_LABEL: Record<string, string> = {
  shopee: "Shopee", marketplace_a: "Shopee",
  tokopedia: "Tokopedia", marketplace_b: "Tokopedia",
  chat: "WhatsApp", offline: "Toko Offline",
};

const CHANNEL_BADGE: Record<string, string> = {
  marketplace_a: "bg-orange-100 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300",
  shopee: "bg-orange-100 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300",
  marketplace_b: "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-300",
  tokopedia: "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-300",
  chat: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
  offline: "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300",
};

// ============================================================
// Helpers
// ============================================================

function getPeriodStart(period: Period): Date {
  const now = new Date();
  if (period === "daily") {
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  } else if (period === "weekly") {
    const d = new Date(now);
    d.setDate(d.getDate() - d.getDay());
    d.setHours(0, 0, 0, 0);
    return d;
  } else {
    return new Date(now.getFullYear(), now.getMonth(), 1);
  }
}

function inPeriod(dateStr: string, period: Period): boolean {
  return new Date(dateStr) >= getPeriodStart(period);
}

// ============================================================
// Row component
// ============================================================

function FinRow({
  label, value, sub, indent, bold, highlight, separator,
}: {
  label: string; value: string | number; sub?: string;
  indent?: boolean; bold?: boolean; highlight?: "pos" | "neg" | "neutral";
  separator?: boolean;
}) {
  const valStr = typeof value === "number" ? formatRp(value) : value;
  return (
    <>
      {separator && <div className="h-px bg-[hsl(var(--border))] my-1" />}
      <div className={`flex items-center justify-between py-2 ${indent ? "pl-5" : ""}`}>
        <div>
          <p className={`text-sm ${bold ? "font-bold" : "font-medium"} ${indent ? "text-[hsl(var(--muted-fg))]" : ""}`}>{label}</p>
          {sub && <p className="text-xs text-[hsl(var(--muted-fg))]">{sub}</p>}
        </div>
        <span className={`text-sm ${bold ? "font-bold text-base" : "font-medium"} ${
          highlight === "pos" ? "text-emerald-600 dark:text-emerald-400"
          : highlight === "neg" ? "text-red-600 dark:text-red-400"
          : ""
        }`}>
          {valStr}
        </span>
      </div>
    </>
  );
}

// ============================================================
// Main Page
// ============================================================

export default function KeuanganPage() {
  const { canView } = usePermission("laporan_keuangan");
  const orders = useStore((s) => s.orders);
  const expenses = useStore((s) => s.expenses);
  const expenseCategories = useStore((s) => s.expenseCategories);
  const products = useStore((s) => s.products);

  if (!canView) redirect("/tidak-ada-akses");

  const [period, setPeriod] = useState<Period>("monthly");
  const [tab, setTab] = useState<Tab>("labarugi");

  const PERIODS: { key: Period; label: string }[] = [
    { key: "daily", label: "Hari Ini" },
    { key: "weekly", label: "Minggu Ini" },
    { key: "monthly", label: "Bulan Ini" },
  ];

  // ---- Computed Data ----
  const data = useMemo(() => {
    const periodOrders = orders.filter((o) => !o.voided && inPeriod(o.date, period));
    const paidOrders = periodOrders.filter((o) => o.paymentStatus === "lunas");
    const periodExpenses = expenses.filter((e) => !e.isPrive && inPeriod(e.date, period));
    const periodPrive = expenses.filter((e) => e.isPrive && inPeriod(e.date, period));

    // Helper: get group from category
    const getGroup = (categoryId: string) =>
      expenseCategories.find((c) => c.id === categoryId)?.group ?? "other";

    // G2: Laba/Rugi
    const revenue = paidOrders.reduce((s, o) => s + o.subtotal, 0);
    const totalDiscount = paidOrders.reduce((s, o) => s + (o.discount ?? 0), 0);
    const netRevenue = revenue - totalDiscount;

    // HPP: pakai cogsUnit jika ada, fallback avgCost produk
    const cogs = paidOrders.reduce((s, o) => {
      return s + o.items.reduce((ss, item) => {
        const cogs = item.cogsUnit ?? products.find((p) => p.id === item.productId)?.avgCost ?? 0;
        return ss + cogs * item.qty;
      }, 0);
    }, 0);
    const grossProfit = netRevenue - cogs;

    // Beban berdasarkan grup expense
    const sellingExpense = periodExpenses
      .filter((e) => getGroup(e.categoryId) === "selling")
      .reduce((s, e) => s + e.amount, 0);
    const sellingFromOrders = paidOrders.reduce((s, o) => s + o.adminFee + o.shippingCost, 0);
    const totalSelling = sellingExpense + sellingFromOrders;

    const operatingExpense = periodExpenses
      .filter((e) => getGroup(e.categoryId) === "operating")
      .reduce((s, e) => s + e.amount, 0);
    const otherExpense = periodExpenses
      .filter((e) => getGroup(e.categoryId) === "other")
      .reduce((s, e) => s + e.amount, 0);

    const netProfit = grossProfit - totalSelling - operatingExpense - otherExpense;
    const margin = netRevenue > 0 ? Math.round((netProfit / netRevenue) * 100) : 0;

    // G3: Neraca (semua data, tidak filter periode)
    const allPaidRevenue = orders.filter((o) => !o.voided && o.paymentStatus === "lunas").reduce((s, o) => s + o.subtotal, 0);
    const allExpensesPaid = expenses.filter((e) => !e.isPrive && e.paid).reduce((s, e) => s + e.amount, 0);
    const kasEstimate = allPaidRevenue - allExpensesPaid;
    const piutang = orders
      .filter((o) => !o.voided && (o.paymentStatus === "belum" || o.paymentStatus === "sebagian"))
      .reduce((s, o) => {
        const due = o.subtotal - (o.discount ?? 0) - o.adminFee - o.shippingCost;
        const paid = (o.payments ?? []).reduce((p, pay) => p + pay.amount, 0);
        return s + (due - paid);
      }, 0);
    const persediaan = products.reduce((s, p) => {
      const cost = p.avgCost ?? p.buyPrice;
      return s + Math.max(0, p.stock) * cost;
    }, 0);
    const totalAset = kasEstimate + piutang + persediaan;
    const utangUsaha = expenses.filter((e) => !e.isPrive && !e.paid).reduce((s, e) => s + e.amount, 0);
    const ekuitas = totalAset - utangUsaha;
    const isBalanced = Math.abs(totalAset - (utangUsaha + ekuitas)) < 1;

    // G4: Arus Kas
    const kasmasuk = paidOrders.reduce((s, o) => s + o.subtotal - (o.discount ?? 0) - o.adminFee - o.shippingCost, 0);
    const kaskeluar = periodExpenses.filter((e) => e.paid).reduce((s, e) => s + e.amount, 0);
    const kasPrive = periodPrive.reduce((s, e) => s + e.amount, 0);
    const saldoBersih = kasmasuk - kaskeluar - kasPrive;

    // Profitabilitas per kanal
    const CHANNELS = ["marketplace_a", "marketplace_b", "chat", "offline"] as Channel[];
    const channelData = CHANNELS.map((ch) => {
      const chOrders = paidOrders.filter((o) => o.channel === ch);
      const chRevenue = chOrders.reduce((s, o) => s + o.subtotal, 0);
      const chFee = chOrders.reduce((s, o) => s + o.adminFee, 0);
      const chDiscount = chOrders.reduce((s, o) => s + (o.discount ?? 0), 0);
      const chCogs = chOrders.reduce((s, o) =>
        s + o.items.reduce((ss, item) => {
          const c = item.cogsUnit ?? products.find((p) => p.id === item.productId)?.avgCost ?? 0;
          return ss + c * item.qty;
        }, 0), 0);
      const chNet = chRevenue - chFee - chDiscount - chCogs;
      const chMargin = chRevenue > 0 ? Math.round((chNet / chRevenue) * 100) : 0;
      return { channel: ch, revenue: chRevenue, adminFee: chFee, cogs: chCogs, netProfit: chNet, margin: chMargin };
    }).filter((c) => c.revenue > 0);

    return {
      revenue, totalDiscount, netRevenue, cogs, grossProfit,
      totalSelling, operatingExpense, otherExpense, netProfit, margin,
      kasEstimate, piutang, persediaan, totalAset, utangUsaha, ekuitas, isBalanced,
      kasmasuk, kaskeluar, kasPrive, saldoBersih,
      channelData,
    };
  }, [orders, expenses, expenseCategories, products, period]);

  return (
    <DashboardLayout title="Laporan Keuangan" subtitle="Laba/Rugi · Neraca · Arus Kas">
      {/* Period + Tab bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-1 p-1 bg-[hsl(var(--muted))] rounded-xl">
          {PERIODS.map((p) => (
            <button key={p.key} onClick={() => setPeriod(p.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${period === p.key ? "bg-[hsl(var(--card))] shadow text-[hsl(var(--foreground))]" : "text-[hsl(var(--muted-fg))]"}`}>
              {p.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1 p-1 bg-[hsl(var(--muted))] rounded-xl">
          {([
            { key: "labarugi", label: "Laba/Rugi" },
            { key: "neraca", label: "Neraca" },
            { key: "aruskas", label: "Arus Kas" },
          ] as { key: Tab; label: string }[]).map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${tab === t.key ? "bg-[hsl(var(--card))] shadow text-[hsl(var(--foreground))]" : "text-[hsl(var(--muted-fg))]"}`}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-5">
        {/* ---- Tab Content ---- */}
        <div className="card">
          {/* G2: Laba/Rugi */}
          {tab === "labarugi" && (
            <>
              <h3 className="font-bold text-sm mb-4">Laporan Laba/Rugi</h3>
              <FinRow label="Pendapatan Penjualan" value={data.revenue} highlight="pos" />
              {data.totalDiscount > 0 && (
                <FinRow label="(-) Diskon & Retur" value={`−${formatRp(data.totalDiscount)}`} indent highlight="neg" />
              )}
              <FinRow label="= Pendapatan Bersih" value={data.netRevenue} bold separator />
              <FinRow label="(-) HPP (Harga Pokok Penjualan)" value={`−${formatRp(data.cogs)}`} sub="Berdasarkan avg cost produk" indent highlight="neg" />
              <FinRow label="= Laba Kotor" value={data.grossProfit} bold separator
                highlight={data.grossProfit >= 0 ? "pos" : "neg"} />
              <FinRow label="(-) Beban Penjualan" value={`−${formatRp(data.totalSelling)}`}
                sub="Fee marketplace + ongkir + beban penjualan lain" indent highlight="neg" />
              <FinRow label="(-) Beban Operasional" value={`−${formatRp(data.operatingExpense)}`}
                sub="Gaji, sewa, utilitas, dll." indent highlight="neg" />
              {data.otherExpense > 0 && (
                <FinRow label="(-) Beban Lain-lain" value={`−${formatRp(data.otherExpense)}`} indent highlight="neg" />
              )}
              <div className="mt-4 pt-4 border-t-2 border-[hsl(var(--border))] flex items-center justify-between">
                <span className="font-bold text-base">Laba Bersih</span>
                <div className="flex items-center gap-2">
                  {data.netProfit >= 0
                    ? <TrendingUp className="w-5 h-5 text-emerald-500" />
                    : <TrendingDown className="w-5 h-5 text-red-500" />}
                  <span className={`text-xl font-black ${data.netProfit >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
                    {formatRp(data.netProfit)}
                  </span>
                </div>
              </div>
              {data.netRevenue > 0 && (
                <p className="text-xs text-[hsl(var(--muted-fg))] mt-1.5">
                  Margin bersih: <span className={`font-bold ${data.margin >= 20 ? "text-emerald-600" : data.margin >= 10 ? "text-amber-600" : "text-red-600"}`}>{data.margin}%</span>
                </p>
              )}
            </>
          )}

          {/* G3: Neraca */}
          {tab === "neraca" && (
            <>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-sm">Neraca (estimasi)</h3>
                {data.isBalanced
                  ? <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/40"><CheckCircle2 className="w-3 h-3" /> Seimbang</span>
                  : <span className="flex items-center gap-1 text-xs font-bold text-amber-600 px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/40"><AlertTriangle className="w-3 h-3" /> Tidak Seimbang</span>
                }
              </div>

              <p className="text-xs font-bold text-[hsl(var(--muted-fg))] uppercase tracking-wider mb-2">ASET</p>
              <FinRow label="Kas (estimasi)" value={data.kasEstimate} indent highlight={data.kasEstimate >= 0 ? "pos" : "neg"} />
              <FinRow label="Piutang Dagang" value={data.piutang} indent />
              <FinRow label="Persediaan Barang" value={data.persediaan} sub="Stok × avg cost" indent />
              <FinRow label="Total Aset" value={data.totalAset} bold separator highlight="pos" />

              <p className="text-xs font-bold text-[hsl(var(--muted-fg))] uppercase tracking-wider mt-4 mb-2">LIABILITAS</p>
              <FinRow label="Utang Usaha" value={data.utangUsaha} indent highlight={data.utangUsaha > 0 ? "neg" : "neutral"} />
              <FinRow label="Total Liabilitas" value={data.utangUsaha} bold separator highlight="neg" />

              <p className="text-xs font-bold text-[hsl(var(--muted-fg))] uppercase tracking-wider mt-4 mb-2">EKUITAS</p>
              <FinRow label="Ekuitas Pemilik" value={data.ekuitas} indent highlight={data.ekuitas >= 0 ? "pos" : "neg"} />
              <FinRow label="Total Ekuitas" value={data.ekuitas} bold separator highlight={data.ekuitas >= 0 ? "pos" : "neg"} />

              <div className="mt-4 pt-3 border-t-2 border-[hsl(var(--border))] flex items-center justify-between">
                <span className="font-bold">Liabilitas + Ekuitas</span>
                <span className="font-bold text-base">{formatRp(data.utangUsaha + data.ekuitas)}</span>
              </div>

              <p className="text-[11px] text-[hsl(var(--muted-fg))] mt-3 italic">
                * Kas merupakan estimasi berdasarkan pendapatan vs pengeluaran tercatat, bukan dari rekening bank aktual.
              </p>
            </>
          )}

          {/* G4: Arus Kas */}
          {tab === "aruskas" && (
            <>
              <h3 className="font-bold text-sm mb-4">Arus Kas</h3>
              <p className="text-xs font-bold text-[hsl(var(--muted-fg))] uppercase tracking-wider mb-2">KAS MASUK</p>
              <FinRow label="Penerimaan dari Penjualan" value={data.kasmasuk} indent highlight="pos" sub="Pendapatan bersih setelah fee & diskon" />
              <FinRow label="Total Kas Masuk" value={data.kasmasuk} bold separator highlight="pos" />

              <p className="text-xs font-bold text-[hsl(var(--muted-fg))] uppercase tracking-wider mt-4 mb-2">KAS KELUAR</p>
              <FinRow label="Pengeluaran Usaha (Lunas)" value={`−${formatRp(data.kaskeluar)}`} indent highlight="neg" />
              {data.kasPrive > 0 && (
                <FinRow label="Prive (Pengambilan Owner)" value={`−${formatRp(data.kasPrive)}`} indent highlight="neg" />
              )}
              <FinRow label="Total Kas Keluar" value={`−${formatRp(data.kaskeluar + data.kasPrive)}`} bold separator highlight="neg" />

              <div className="mt-4 pt-4 border-t-2 border-[hsl(var(--border))] flex items-center justify-between">
                <span className="font-bold text-base">Saldo Bersih</span>
                <span className={`text-xl font-black ${data.saldoBersih >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
                  {data.saldoBersih >= 0 ? "+" : ""}{formatRp(data.saldoBersih)}
                </span>
              </div>
            </>
          )}
        </div>

        {/* ---- Side: Profitabilitas per kanal ---- */}
        <div className="space-y-4">
          <div className="card">
            <h3 className="font-bold text-sm mb-4">Profitabilitas per Kanal</h3>
            {data.channelData.length === 0 ? (
              <p className="text-sm text-[hsl(var(--muted-fg))] text-center py-4">Belum ada penjualan di periode ini</p>
            ) : (
              <div className="space-y-3">
                {data.channelData.sort((a, b) => b.margin - a.margin).map((c) => (
                  <div key={c.channel} className="p-3 rounded-xl border border-[hsl(var(--border))] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${CHANNEL_BADGE[c.channel] ?? ""}`}>
                        {CHANNEL_LABEL[c.channel]}
                      </span>
                      <div className="text-right">
                        <p className="text-[10px] text-[hsl(var(--muted-fg))]">Margin</p>
                        <p className={`text-sm font-bold ${c.margin >= 20 ? "text-emerald-600" : c.margin >= 10 ? "text-amber-600" : "text-red-600"}`}>
                          {c.margin}%
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-1.5 text-xs">
                      <div><span className="text-[hsl(var(--muted-fg))]">Omzet</span><p className="font-semibold">{formatRp(c.revenue)}</p></div>
                      <div><span className="text-[hsl(var(--muted-fg))]">Laba Bersih</span><p className={`font-semibold ${c.netProfit >= 0 ? "text-emerald-600" : "text-red-600"}`}>{formatRp(c.netProfit)}</p></div>
                      <div><span className="text-[hsl(var(--muted-fg))]">Admin Fee</span><p className="font-medium text-red-500">−{formatRp(c.adminFee)}</p></div>
                      <div><span className="text-[hsl(var(--muted-fg))]">HPP</span><p className="font-medium text-red-500">−{formatRp(c.cogs)}</p></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick KPI */}
          <div className="card">
            <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
              <Scale className="w-4 h-4 text-blue-500" /> KPI Cepat
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[hsl(var(--muted-fg))]">Laba Kotor</span>
                <span className={`font-bold ${data.grossProfit >= 0 ? "text-emerald-600" : "text-red-600"}`}>{formatRp(data.grossProfit)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[hsl(var(--muted-fg))]">Margin Kotor</span>
                <span className="font-bold">
                  {data.netRevenue > 0 ? `${Math.round((data.grossProfit / data.netRevenue) * 100)}%` : "—"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[hsl(var(--muted-fg))]">Piutang</span>
                <span className="font-bold text-amber-600">{formatRp(data.piutang)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[hsl(var(--muted-fg))]">Nilai Persediaan</span>
                <span className="font-bold text-blue-600">{formatRp(data.persediaan)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
