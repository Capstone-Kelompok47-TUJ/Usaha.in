"use client";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { AlertPanel } from "@/components/dashboard/AlertPanel";
import { SalesLineChart, ChannelChart, TopProductsChart } from "@/components/dashboard/Charts";
import { EmployeeWidgets } from "@/components/dashboard/EmployeeWidgets";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useStore } from "@/lib/store";
import { calcKpi, formatRp } from "@/lib/finance";
import {
  DollarSign, TrendingUp, ShoppingCart, CreditCard,
  Banknote, ShieldCheck, ChevronDown, ChevronUp,
  AlertTriangle, Activity,
} from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import type { Expense, ExpenseCategory, Order, Product } from "@/types";

type Period = "daily" | "weekly" | "monthly";

// ============================================================
// H2: Business Health Score
// ============================================================

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

function calcHealthScore(
  orders: Order[],
  expenses: Expense[],
  products: Product[],
  expenseCategories: ExpenseCategory[],
  now: number
) {
  const ms30 = 30 * 86400000;

  // Periode 30 hari
  const orders30 = orders.filter((o) =>
    !o.voided && new Date(o.date).getTime() >= now - ms30
  );
  const paid30 = orders30.filter((o) => o.paymentStatus === "lunas");
  const revenue30 = paid30.reduce((s, o) => s + o.subtotal, 0);
  const discount30 = paid30.reduce((s, o) => s + (o.discount ?? 0), 0);
  const netRevenue30 = revenue30 - discount30;

  const cogs30 = paid30.reduce((s, o) =>
    s + o.items.reduce((ss, item) => {
      const c = item.cogsUnit ?? products.find((p) => p.id === item.productId)?.avgCost ?? 0;
      return ss + c * item.qty;
    }, 0), 0);

  const getGroup = (catId: string) =>
    expenseCategories.find((c) => c.id === catId)?.group ?? "other";
  const expenses30 = expenses.filter((e) =>
    !e.isPrive && new Date(e.date).getTime() >= now - ms30
  );
  const opEx30 = expenses30.filter((e) => getGroup(e.categoryId) === "operating").reduce((s, e) => s + e.amount, 0);
  const selling30 = expenses30.filter((e) => getGroup(e.categoryId) === "selling").reduce((s, e) => s + e.amount, 0)
    + paid30.reduce((s, o) => s + o.adminFee + o.shippingCost, 0);
  const netProfit30 = netRevenue30 - cogs30 - selling30 - opEx30;

  // 1. Margin bersih (30%)
  const marginPct = netRevenue30 > 0 ? netProfit30 / netRevenue30 : 0;
  const marginScore = clamp(marginPct / 0.20, 0, 1) * 100;

  // 2. Perputaran stok (20%): DIO
  const inventoryValue = products.reduce((s, p) =>
    s + Math.max(0, p.stock) * (p.avgCost ?? p.buyPrice), 0);
  const dailyCogs = cogs30 / 30;
  const DIO = dailyCogs > 0 ? inventoryValue / dailyCogs : 0;
  const stockScore = DIO <= 30 ? 100 : DIO >= 120 ? 0 : clamp((120 - DIO) / 90, 0, 1) * 100;

  // 3. Umur piutang (20%)
  const overdueAmt = orders.filter((o) =>
    !o.voided && (o.paymentStatus === "belum" || o.paymentStatus === "sebagian") &&
    o.dueDate && new Date(o.dueDate).getTime() < now
  ).reduce((s, o) => {
    const due = o.subtotal - (o.discount ?? 0) - o.adminFee - o.shippingCost;
    const paid = (o.payments ?? []).reduce((p, pay) => p + pay.amount, 0);
    return s + (due - paid);
  }, 0);
  const receivableScore = netRevenue30 > 0
    ? clamp(1 - (overdueAmt / netRevenue30) / 0.20, 0, 1) * 100
    : 100;

  // 4. Kas runway (30%)
  const allPaidRev = orders.filter((o) => !o.voided && o.paymentStatus === "lunas").reduce((s, o) => s + o.subtotal, 0);
  const allPaidExp = expenses.filter((e) => !e.isPrive && e.paid).reduce((s, e) => s + e.amount, 0);
  const kasEst = allPaidRev - allPaidExp;
  const avgDailyExp = opEx30 > 0 ? (opEx30 + selling30) / 30 : 0;
  const runwayDays = avgDailyExp > 0 ? kasEst / avgDailyExp : 60;
  const runwayScore = clamp(runwayDays / 60, 0, 1) * 100;

  const total = Math.round(
    marginScore * 0.30 +
    stockScore * 0.20 +
    receivableScore * 0.20 +
    runwayScore * 0.30
  );

  return {
    total,
    label: total >= 80 ? "Sehat" : total >= 60 ? "Waspada" : "Perlu Perhatian",
    color: total >= 80 ? "emerald" : total >= 60 ? "amber" : "red",
    components: [
      { name: "Margin Bersih", score: Math.round(marginScore), weight: 30, detail: `${Math.round(marginPct * 100)}% margin bersih (target ≥20%)` },
      { name: "Perputaran Stok", score: Math.round(stockScore), weight: 20, detail: `DIO ${Math.round(DIO)} hari (target ≤30 hari)` },
      { name: "Umur Piutang", score: Math.round(receivableScore), weight: 20, detail: `Piutang lewat tempo: ${formatRp(overdueAmt)}` },
      { name: "Kas Runway", score: Math.round(runwayScore), weight: 30, detail: `Estimasi cukup ${Math.round(Math.max(0, runwayDays))} hari (target ≥60 hari)` },
    ],
    kasEst,
    runwayDays: Math.round(Math.max(0, runwayDays)),
    netProfit30,
    netRevenue30,
    opEx30,
    selling30,
  };
}

function HealthScoreCard({ now }: { now: number }) {
  const orders = useStore((s) => s.orders);
  const expenses = useStore((s) => s.expenses);
  const products = useStore((s) => s.products);
  const expenseCategories = useStore((s) => s.expenseCategories);

  const [open, setOpen] = useState(false);

  const score = useMemo(
    () => calcHealthScore(orders, expenses, products, expenseCategories, now),
    [orders, expenses, products, expenseCategories, now]
  );
  const weakestComponent = score.components.reduce((weakest, component) =>
    component.score < weakest.score ? component : weakest
  );
  const advice = score.total >= 80
    ? "Pertahankan kebiasaan mencatat transaksi dan memeriksa kondisi usaha secara rutin."
    : weakestComponent.name === "Margin Bersih"
      ? "Periksa kembali harga jual dan modal barang agar laba dari setiap penjualan tetap cukup."
      : weakestComponent.name === "Perputaran Stok"
        ? "Mulai dengan memeriksa barang yang paling lama tersimpan dan sesuaikan rencana belanja."
        : weakestComponent.name === "Umur Piutang"
          ? "Dahulukan menghubungi pembeli yang tagihannya sudah lewat tempo."
          : "Tinjau biaya wajib dan pemasukan yang diperkirakan masuk dalam beberapa minggu ke depan.";

  const colorMap: Record<string, string> = {
    emerald: "text-emerald-600 dark:text-emerald-400",
    amber: "text-amber-600 dark:text-amber-400",
    red: "text-red-600 dark:text-red-400",
  };
  const bgMap: Record<string, string> = {
    emerald: "bg-emerald-500",
    amber: "bg-amber-500",
    red: "bg-red-500",
  };

  return (
    <div className="card">
      <button
        className="w-full flex items-center justify-between"
        aria-expanded={open}
        aria-label={`${open ? "Sembunyikan" : "Lihat"} rincian kesehatan usaha`}
        onClick={() => setOpen((o) => !o)}>
        <div className="flex items-center gap-3">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white font-black text-xl ${bgMap[score.color]}`}>
            {score.total}
          </div>
          <div className="text-left">
            <p className="text-xs text-[hsl(var(--muted-fg))]">Skor Kesehatan Usaha</p>
            <p className={`font-black text-base ${colorMap[score.color]}`}>{score.label}</p>
            <p className="text-xs text-[hsl(var(--muted-fg))]">dari 100 poin</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-[hsl(var(--muted-fg))]">Rincian</span>
          {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>
      <p className="mt-3 text-xs text-[hsl(var(--muted-fg))]">{advice}</p>

      {open && (
        <div className="mt-4 pt-4 border-t border-[hsl(var(--border))] space-y-3">
          {score.components.map((c) => (
            <div key={c.name}>
              <div className="flex items-center justify-between mb-1">
                <div>
                  <span className="text-xs font-semibold">{c.name}</span>
                  <span className="text-[10px] text-[hsl(var(--muted-fg))] ml-1">({c.weight}%)</span>
                </div>
                <span className={`text-xs font-bold ${c.score >= 80 ? "text-emerald-600" : c.score >= 60 ? "text-amber-600" : "text-red-600"}`}>
                  {c.score}/100
                </span>
              </div>
              <div className="h-2 rounded-full bg-[hsl(var(--muted))] overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${c.score >= 80 ? "bg-emerald-500" : c.score >= 60 ? "bg-amber-500" : "bg-red-500"}`}
                  style={{ width: `${c.score}%` }}
                />
              </div>
              <p className="text-[10px] text-[hsl(var(--muted-fg))] mt-0.5">{c.detail}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================
// H1: Kas + Uang Aman (Prive) Card & Modal
// ============================================================

function RecordPriveModal({
  onClose,
  safeAmount,
}: {
  onClose: () => void;
  safeAmount: number;
}) {
  const addExpense = useStore((s) => s.addExpense);
  const addToast = useStore((s) => s.addToast);
  const [amount, setAmount] = useState(safeAmount > 0 ? safeAmount : 0);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [note, setNote] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (amount <= 0) {
      addToast("Nominal penarikan harus lebih dari 0", "error");
      return;
    }
    addExpense({
      categoryId: "cat-prive",
      amount,
      date,
      paid: true,
      isPrive: true,
      note: note.trim() || "Pengambilan uang pribadi pemilik (Prive)",
    });
    addToast(`Pengambilan uang pribadi ${formatRp(amount)} berhasil dicatat`, "success");
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-[hsl(var(--border))] pb-3">
          <h3 className="font-bold text-base text-[hsl(var(--foreground))]">Catat Pengambilan Uang Pribadi</h3>
          <button onClick={onClose} className="p-1 rounded-lg text-[hsl(var(--muted-fg))] hover:text-[hsl(var(--foreground))]">
            <span className="text-xl">×</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs">
            Uang yang aman ditarik saat ini: <strong>{formatRp(safeAmount)}</strong>. Penarikan ini otomatis dicatat ke pos <strong>Prive</strong> (tidak mengurangi laba operasional).
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[hsl(var(--foreground))]">Tanggal Penarikan</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-lg border border-[hsl(var(--input))] bg-[hsl(var(--card))] text-xs font-semibold"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[hsl(var(--foreground))]">Nominal yang Diambil (Rp)</label>
            <input
              type="number"
              min="1000"
              step="10000"
              value={amount}
              onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
              required
              className="w-full px-3.5 py-2.5 rounded-lg border border-[hsl(var(--input))] bg-[hsl(var(--card))] text-sm font-bold text-[hsl(var(--foreground))]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[hsl(var(--foreground))]">Catatan (Opsional)</label>
            <input
              type="text"
              placeholder="Contoh: Keperluan pribadi / belanja rumah"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-[hsl(var(--input))] bg-[hsl(var(--card))] text-xs"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[hsl(var(--border))]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-[hsl(var(--muted-fg))] hover:text-[hsl(var(--foreground))]"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-colors"
            >
              Simpan Penarikan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function SafeWithdrawCard({ now }: { now: number }) {
  const orders = useStore((s) => s.orders);
  const expenses = useStore((s) => s.expenses);
  const [showPriveModal, setShowPriveModal] = useState(false);

  const data = useMemo(() => {
    const ms30 = 30 * 86400000;

    const allPaidRev = orders.filter((o) => !o.voided && o.paymentStatus === "lunas").reduce((s, o) => s + o.subtotal, 0);
    const allPaidExp = expenses.filter((e) => !e.isPrive && e.paid).reduce((s, e) => s + e.amount, 0);
    const kasEst = allPaidRev - allPaidExp;

    // Biaya wajib 30 hari: expenses yg belum lunas + jatuh tempo 30 hari ke depan
    const upcomingDebt = expenses.filter((e) => {
      if (e.isPrive || e.paid) return false;
      if (!e.dueDate) return true;
      return new Date(e.dueDate).getTime() <= now + ms30;
    }).reduce((s, e) => s + e.amount, 0);

    // Cadangan: 10% dari pendapatan bersih 30 hari
    const paid30 = orders.filter((o) =>
      !o.voided && o.paymentStatus === "lunas" && new Date(o.date).getTime() >= now - ms30
    );
    const rev30 = paid30.reduce((s, o) => s + o.subtotal - (o.discount ?? 0) - o.adminFee - o.shippingCost, 0);
    const cadangan = Math.round(rev30 * 0.10);

    const uangAman = Math.max(0, kasEst - upcomingDebt - cadangan);

    return { kasEst, upcomingDebt, cadangan, uangAman };
  }, [orders, expenses, now]);

  return (
    <>
      <div className={`card flex flex-col justify-between ${data.uangAman === 0 && data.kasEst < data.upcomingDebt + data.cadangan ? "border-red-200 dark:border-red-800/60" : ""}`}>
        <div>
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck className={`w-5 h-5 ${data.uangAman > 0 ? "text-emerald-500" : "text-red-500"}`} />
            <div>
              <p className="text-sm font-bold leading-tight">Uang yang Boleh Kamu Ambil</p>
              <p className="text-[11px] text-[hsl(var(--muted-fg))]">Uang aman ditarik (Prive)</p>
            </div>
            <Link href="/keuangan" className="ml-auto text-xs text-[hsl(var(--muted-fg))] hover:text-blue-500 flex items-center gap-0.5">
              Detail <ChevronDown className="w-3 h-3 rotate-[-90deg]" />
            </Link>
          </div>
          <p className={`text-2xl font-black mb-3 ${data.uangAman > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
            {formatRp(data.uangAman)}
          </p>
          {data.uangAman === 0 && (
            <div className="flex items-start gap-2 p-2.5 rounded-lg bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-300 text-xs mb-3">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span>Kas usaha sedang diprioritaskan untuk kewajiban & cadangan operasional</span>
            </div>
          )}
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between text-[hsl(var(--muted-fg))]">
              <span>Kas Usaha Tersedia</span><span className="font-semibold text-[hsl(var(--foreground))]">{formatRp(data.kasEst)}</span>
            </div>
            <div className="flex justify-between text-[hsl(var(--muted-fg))]">
              <span>Kewajiban 30 hari</span><span className="font-semibold text-red-500">−{formatRp(data.upcomingDebt)}</span>
            </div>
            <div className="flex justify-between text-[hsl(var(--muted-fg))]">
              <span>Cadangan Darurat (10%)</span><span className="font-semibold text-amber-600">−{formatRp(data.cadangan)}</span>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-[hsl(var(--border))]">
          <button
            onClick={() => setShowPriveModal(true)}
            className="w-full py-2 px-3 rounded-lg bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Banknote className="w-4 h-4" /> Catat Pengambilan Uang Pribadi
          </button>
        </div>
      </div>

      {showPriveModal && (
        <RecordPriveModal
          onClose={() => setShowPriveModal(false)}
          safeAmount={data.uangAman}
        />
      )}
    </>
  );
}

// ============================================================
// Main Dashboard Page
// ============================================================

export default function DashboardPage() {
  const user = useCurrentUser();
  const orders = useStore((s) => s.orders);
  const purchases = useStore((s) => s.purchases);
  const [period, setPeriod] = useState<Period>("monthly");
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    const timer = window.setTimeout(() => setNow(Date.now()), 0);
    return () => window.clearTimeout(timer);
  }, []);

  const kpi = calcKpi(orders, purchases, period);
  const isOwner = user?.isOwner ?? false;
  const [chartsOpen, setChartsOpen] = useState(true);

  const PERIODS: { key: Period; label: string }[] = [
    { key: "daily", label: "Hari Ini" },
    { key: "weekly", label: "Minggu Ini" },
    { key: "monthly", label: "Bulan Ini" },
  ];
  const activePeriodLabel = PERIODS.find((item) => item.key === period)?.label ?? "Periode ini";
  const revenueChange = kpi.pctRevenue;
  const revenueSummary = revenueChange > 0
    ? `Omzet naik ${revenueChange}% dibanding periode sebelumnya.`
    : revenueChange < 0
      ? `Omzet turun ${Math.abs(revenueChange)}% dibanding periode sebelumnya.`
      : "Omzet tercatat sama dengan periode sebelumnya.";

  return (
    <DashboardLayout
      title={`Selamat datang, ${user?.name ?? "—"}`}
      subtitle={isOwner ? "Ringkasan performa bisnis Anda" : "Ringkasan aktivitas Anda"}
    >
      {/* Period Toggle (Owner only) */}
      {isOwner && (
        <div className="flex items-center gap-1 mb-5 p-1 bg-[hsl(var(--muted))] rounded-xl w-fit">
          {PERIODS.map((p) => (
            <button key={p.key} onClick={() => setPeriod(p.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                period === p.key
                  ? "bg-[hsl(var(--card))] shadow text-[hsl(var(--foreground))]"
                  : "text-[hsl(var(--muted-fg))] hover:text-[hsl(var(--foreground))]"
              }`}>
              {p.label}
            </button>
          ))}
        </div>
      )}

      {/* Owner Dashboard */}
      {isOwner && (
        <div className="space-y-5">
          <div className="card flex items-start gap-3 border-blue-200 bg-gradient-to-r from-blue-50/80 to-[hsl(var(--card))] dark:border-blue-900/50 dark:from-blue-950/30">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 shrink-0">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold">Ringkasan {activePeriodLabel.toLowerCase()}</h2>
              <p className="text-sm text-[hsl(var(--foreground))] mt-1">
                {kpi.netProfit >= 0
                  ? `Laba bersih usahamu ${formatRp(kpi.netProfit)}.`
                  : `Usahamu masih mencatat rugi ${formatRp(Math.abs(kpi.netProfit))}.`}
                {" "}{revenueSummary}
              </p>
              {kpi.netProfit < 0 && (
                <p className="text-xs text-[hsl(var(--muted-fg))] mt-1">
                  Tidak apa-apa, mulai dengan memeriksa penjualan dan pengeluaran untuk mencari langkah perbaikan.
                </p>
              )}
            </div>
          </div>

          {/* Four key business figures */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard
              label="Omzet"
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
              label="Pengeluaran"
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

          {/* H1: Kas + Uang Aman + H2: Skor Kesehatan */}
          {now !== null && (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <SafeWithdrawCard now={now} />
                <div className="lg:col-span-2">
                  <HealthScoreCard now={now} />
                </div>
              </div>
              <AlertPanel now={now} />
            </>
          )}

          <section className="card space-y-4" aria-labelledby="dashboard-charts-title">
            <button
              type="button"
              className="w-full flex items-center justify-between gap-3 text-left"
              aria-expanded={chartsOpen}
              aria-controls="dashboard-charts-content"
              onClick={() => setChartsOpen((open) => !open)}
            >
              <span>
                <span id="dashboard-charts-title" className="block font-semibold text-sm">
                  Grafik usaha
                </span>
                <span className="block text-xs text-[hsl(var(--muted-fg))] mt-1">
                  Tren 30 hari, omzet per kanal, dan produk terlaris
                </span>
              </span>
              {chartsOpen ? <ChevronUp className="w-4 h-4 shrink-0" /> : <ChevronDown className="w-4 h-4 shrink-0" />}
            </button>
            {chartsOpen && (
              <div id="dashboard-charts-content" className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2">
                  <SalesLineChart />
                </div>
                <ChannelChart />
                <div className="lg:col-span-3">
                  <TopProductsChart />
                </div>
              </div>
            )}
          </section>
        </div>
      )}

      {/* Employee Dashboard */}
      {!isOwner && <EmployeeWidgets />}
    </DashboardLayout>
  );
}
