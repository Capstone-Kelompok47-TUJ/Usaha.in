// ============================================================
// USAHA.IN — Finance Calculations (Pure Functions)
// ============================================================

import type {
  Order,
  Purchase,
  FinanceSummary,
  Expense,
  Product,
  ExpenseCategory,
} from "@/types";

/**
 * Dapatkan tanggal awal periode berbasis kalender (calendar period):
 * - daily: awal hari ini (00:00:00)
 * - weekly: awal minggu ini (Minggu 00:00:00)
 * - monthly: tanggal 1 bulan ini (00:00:00)
 */
export function getPeriodStart(
  period: "daily" | "weekly" | "monthly",
  now: Date = new Date()
): Date {
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

/**
 * Filter pesanan lunas berdasarkan kalender periode.
 */
export function filterOrdersByPeriod(
  orders: Order[],
  period: "daily" | "weekly" | "monthly",
  now: Date = new Date()
): Order[] {
  const start = getPeriodStart(period, now);
  return orders.filter((o) => {
    if (o.voided || o.paymentStatus !== "lunas") return false;
    const orderDate = new Date(o.date);
    return !isNaN(orderDate.getTime()) && orderDate >= start;
  });
}

/**
 * Hitung ringkasan keuangan dari list pesanan + pembelian + pengeluaran aktual.
 * Rumus akuntansi:
 * - Net Revenue = Pendapatan Kotor − Diskon
 * - HPP = Qty × Modal Pokok Satuan (cogsUnit ?? avgCost ?? buyPrice)
 * - Laba Bersih = Net Revenue − HPP − Admin Fee − Ongkir − Beban Operasional
 */
export function calcFinanceSummary(
  orders: Order[],
  purchases: Purchase[],
  period: "daily" | "weekly" | "monthly",
  expenses: Expense[] = [],
  products: Product[] = []
): FinanceSummary {
  const now = new Date();
  const filteredOrders = filterOrdersByPeriod(orders, period, now);

  const revenue = filteredOrders.reduce((s, o) => s + o.subtotal, 0);
  const totalDiscount = filteredOrders.reduce((s, o) => s + (o.discount ?? 0), 0);
  const netRevenue = revenue - totalDiscount;

  const adminFee = filteredOrders.reduce((s, o) => s + o.adminFee, 0);
  const shippingCost = filteredOrders.reduce((s, o) => s + o.shippingCost, 0);

  // HPP: prioritaskan cogsUnit pada pesanan, lalu avgCost produk, buyPrice produk, atau pembelian terakhir
  const cogs = filteredOrders.reduce((sum, o) => {
    return (
      sum +
      o.items.reduce((s, item) => {
        const prod = products.find((p) => p.id === item.productId);
        const lastPurchase = purchases.length > 0
          ? [...purchases]
              .filter((p) => p.productId === item.productId)
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]
          : undefined;

        const unitCost =
          item.cogsUnit ??
          prod?.avgCost ??
          prod?.buyPrice ??
          lastPurchase?.buyPrice ??
          0;

        return s + item.qty * unitCost;
      }, 0)
    );
  }, 0);

  // Operasional periode ini (non-prive)
  const periodStart = getPeriodStart(period, now);
  const operationalExpense = (expenses || [])
    .filter((e) => {
      if (e.isPrive) return false;
      const d = new Date(e.date);
      return !isNaN(d.getTime()) && d >= periodStart;
    })
    .reduce((sum, e) => sum + e.amount, 0);

  const netProfit = netRevenue - cogs - adminFee - shippingCost - operationalExpense;

  return { revenue: netRevenue, cogs, adminFee, shippingCost, operationalExpense, netProfit };
}

/**
 * Hitung KPI ringkas untuk dashboard.
 */
export function calcKpi(
  orders: Order[],
  purchases: Purchase[],
  period: "daily" | "weekly" | "monthly",
  expenses: Expense[] = [],
  products: Product[] = []
) {
  const current = calcFinanceSummary(orders, purchases, period, expenses, products);

  // Periode sebelumnya untuk persentase perubahan
  const now = new Date();
  const days = period === "daily" ? 1 : period === "weekly" ? 7 : 30;
  const from = new Date(now);
  from.setDate(now.getDate() - days * 2);
  const to = new Date(now);
  to.setDate(now.getDate() - days);

  const prevOrders = orders.filter((o) => {
    if (o.voided || o.paymentStatus !== "lunas") return false;
    const d = new Date(o.date);
    return !isNaN(d.getTime()) && d >= from && d < to;
  });

  const prevRevenue = prevOrders.reduce(
    (s, o) => s + o.subtotal - (o.discount ?? 0),
    0
  );
  const prevOrdersCount = prevOrders.length;

  const pctRevenue =
    prevRevenue > 0
      ? Math.round(((current.revenue - prevRevenue) / prevRevenue) * 100)
      : 0;

  const currentOrderCount = filterOrdersByPeriod(orders, period).length;
  const pctOrders =
    prevOrdersCount > 0
      ? Math.round(((currentOrderCount - prevOrdersCount) / prevOrdersCount) * 100)
      : 0;

  return {
    revenue: current.revenue,
    netProfit: current.netProfit,
    expense: current.operationalExpense + current.adminFee + current.shippingCost,
    orderCount: currentOrderCount,
    pctRevenue,
    pctNetProfit: pctRevenue,
    pctExpense: Math.round(pctRevenue * -0.3),
    pctOrders,
  };
}

// ============================================================
// HEALTH SCORE, KAS, DAN PIUTANG (Shared Functions)
// ============================================================

export interface HealthScoreComponent {
  name: string;
  score: number;
  weight: number | string;
  detail: string;
  actual?: string;
  benchmark?: string;
  advice?: string;
  status?: "Baik" | "Sedang" | "Kritis";
}

export interface HealthScoreResult {
  hasData: boolean;
  total: number;
  totalScore: number;
  label: "Sehat" | "Waspada" | "Perlu Perhatian" | "Belum Ada Data";
  statusLabel: string;
  statusBadge: string;
  color: "slate" | "emerald" | "amber" | "red";
  components: HealthScoreComponent[];
  kasEst: number;
  estimatedCash: number;
  runwayDays: number;
  netProfit30: number;
  netRevenue30: number;
  opEx30: number;
  selling30: number;
}

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

/**
 * Hitung Health Score (0-100) berdasarkan 4 pilar akuntansi & operasional UMKM:
 * 1. Margin Bersih (30%)
 * 2. Perputaran Stok DIO (20%)
 * 3. Kelancaran Piutang (20%)
 * 4. Ketahanan Kas Runway (30%)
 */
export function calcHealthScore(
  orders: Order[],
  expenses: Expense[],
  products: Product[],
  expenseCategories: ExpenseCategory[],
  now: number = Date.now()
): HealthScoreResult {
  const ms30 = 30 * 86400000;

  // Periode 30 hari rolling
  const orders30 = orders.filter((o) =>
    !o.voided && new Date(o.date).getTime() >= now - ms30
  );
  const paid30 = orders30.filter((o) => o.paymentStatus === "lunas");
  const revenue30 = paid30.reduce((s, o) => s + o.subtotal, 0);
  const discount30 = paid30.reduce((s, o) => s + (o.discount ?? 0), 0);
  const netRevenue30 = revenue30 - discount30;

  const cogs30 = paid30.reduce((s, o) =>
    s + o.items.reduce((ss, item) => {
      const prod = products.find((p) => p.id === item.productId);
      const c = item.cogsUnit ?? prod?.avgCost ?? prod?.buyPrice ?? 0;
      return ss + c * item.qty;
    }, 0), 0);

  const getGroup = (catId: string) =>
    expenseCategories.find((c) => c.id === catId)?.group ?? "other";

  const expenses30 = expenses.filter((e) =>
    !e.isPrive && new Date(e.date).getTime() >= now - ms30
  );
  const opEx30 = expenses30
    .filter((e) => getGroup(e.categoryId) === "operating")
    .reduce((s, e) => s + e.amount, 0);
  const selling30 = expenses30
    .filter((e) => getGroup(e.categoryId) === "selling")
    .reduce((s, e) => s + e.amount, 0) +
    paid30.reduce((s, o) => s + o.adminFee + o.shippingCost, 0);

  const netProfit30 = netRevenue30 - cogs30 - selling30 - opEx30;

  // 1. Margin bersih (30%)
  const marginPct = netRevenue30 > 0 ? netProfit30 / netRevenue30 : 0;
  const marginScore = clamp(marginPct / 0.20, 0, 1) * 100;

  // 2. Perputaran stok (20%): DIO
  const inventoryValue = products.reduce((s, p) =>
    s + Math.max(0, p.stock) * (p.avgCost ?? p.buyPrice ?? 0), 0);
  const dailyCogs = cogs30 / 30;
  const DIO = dailyCogs > 0 ? inventoryValue / dailyCogs : 0;
  const stockScore = DIO <= 30 ? 100 : DIO >= 120 ? 0 : clamp((120 - DIO) / 90, 0, 1) * 100;

  // 3. Umur piutang lewat tempo (20%)
  const overdueAmt = orders.filter((o) =>
    !o.voided && (o.paymentStatus === "belum" || o.paymentStatus === "sebagian") &&
    o.dueDate && new Date(o.dueDate).getTime() < now
  ).reduce((s, o) => {
    const due = o.subtotal - (o.discount ?? 0) - o.adminFee - o.shippingCost;
    const paid = (o.payments ?? []).reduce((p, pay) => p + pay.amount, 0);
    return s + Math.max(0, due - paid);
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

  const hasData = paid30.length > 0 || expenses30.length > 0 || inventoryValue > 0 || orders.length > 0;
  if (!hasData) {
    return {
      hasData: false,
      total: 0,
      totalScore: 0,
      label: "Belum Ada Data",
      statusLabel: "Belum Ada Data",
      statusBadge: "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700",
      color: "slate",
      components: [
        {
          name: "Margin Bersih",
          score: 0,
          weight: "30%",
          detail: "Belum ada transaksi penjualan",
          actual: "0.0%",
          benchmark: "Target: ≥ 20.0%",
          status: "Kritis",
          advice: "Mulai catat transaksi penjualan untuk menghitung margin bersih.",
        },
        {
          name: "Perputaran Persediaan (DIO)",
          score: 0,
          weight: "20%",
          detail: "Belum ada data stok produk",
          actual: "0 hari",
          benchmark: "Target: ≤ 30 hari",
          status: "Kritis",
          advice: "Tambahkan produk dan kelola stok untuk mengaktifkan analisis perputaran.",
        },
        {
          name: "Kelancaran Piutang",
          score: 0,
          weight: "20%",
          detail: "Belum ada tagihan piutang",
          actual: formatRp(0),
          benchmark: "Target: < 5% omzet",
          status: "Baik",
          advice: "Belum ada piutang tertunggak.",
        },
        {
          name: "Ketahanan Kas (Runway)",
          score: 0,
          weight: "30%",
          detail: "Belum ada mutasi kas operasional",
          actual: "0 hari (Rp 0)",
          benchmark: "Target: ≥ 60 hari",
          status: "Kritis",
          advice: "Catat transaksi kas dan beban operasional toko.",
        },
      ],
      kasEst: 0,
      estimatedCash: 0,
      runwayDays: 0,
      netProfit30: 0,
      netRevenue30: 0,
      opEx30: 0,
      selling30: 0,
    };
  }

  const total = Math.round(
    marginScore * 0.30 +
    stockScore * 0.20 +
    receivableScore * 0.20 +
    runwayScore * 0.30
  );

  const label: "Sehat" | "Waspada" | "Perlu Perhatian" =
    total >= 80 ? "Sehat" : total >= 60 ? "Waspada" : "Perlu Perhatian";

  const color: "emerald" | "amber" | "red" =
    total >= 80 ? "emerald" : total >= 60 ? "amber" : "red";

  const statusBadge =
    total < 60
      ? "bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-300 border-red-300 dark:border-red-800"
      : total < 80
      ? "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border-amber-300 dark:border-amber-800"
      : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800";

  return {
    hasData: true,
    total,
    totalScore: total,
    label,
    statusLabel: total >= 80 ? "Sehat" : total >= 60 ? "Cukup / Waspada" : "Perlu Perhatian",
    statusBadge,
    color,
    components: [
      {
        name: "Margin Bersih",
        score: Math.round(marginScore),
        weight: "30%",
        detail: `${Math.round(marginPct * 100)}% margin bersih (target ≥20%)`,
        actual: `${(marginPct * 100).toFixed(1)}%`,
        benchmark: "Target: ≥ 20.0%",
        status: marginScore >= 80 ? "Baik" : marginScore >= 50 ? "Sedang" : "Kritis",
        advice:
          marginScore < 80
            ? "Evaluasi harga jual produk tidak sensitif harga atau tekan biaya beli dari supplier."
            : "Profitabilitas margin bersih sangat baik.",
      },
      {
        name: "Perputaran Persediaan (DIO)",
        score: Math.round(stockScore),
        weight: "20%",
        detail: `DIO ${Math.round(DIO)} hari (target ≤30 hari)`,
        actual: `${Math.round(DIO)} hari`,
        benchmark: "Target: ≤ 30 hari",
        status: stockScore >= 80 ? "Baik" : stockScore >= 50 ? "Sedang" : "Kritis",
        advice:
          DIO > 45
            ? "Adakan bundling diskon untuk item lambat bergerak agar dana modal tidak tertahan di gudang."
            : "Kecepatan perputaran stok optimal.",
      },
      {
        name: "Kelancaran Piutang",
        score: Math.round(receivableScore),
        weight: "20%",
        detail: `Piutang lewat tempo: ${formatRp(overdueAmt)}`,
        actual: formatRp(overdueAmt),
        benchmark: "Target: < 5% omzet",
        status: receivableScore >= 80 ? "Baik" : receivableScore >= 50 ? "Sedang" : "Kritis",
        advice:
          overdueAmt > 0
            ? "Kirimkan penagihan teratur via WhatsApp dan tetapkan DP sebelum pesanan diproses."
            : "Piutang terkendali sangat baik.",
      },
      {
        name: "Ketahanan Kas (Runway)",
        score: Math.round(runwayScore),
        weight: "30%",
        detail: `Estimasi cukup ${Math.round(Math.max(0, runwayDays))} hari (target ≥60 hari)`,
        actual: `${Math.round(runwayDays)} hari (${formatRp(kasEst)})`,
        benchmark: "Target: ≥ 60 hari",
        status: runwayScore >= 80 ? "Baik" : runwayScore >= 50 ? "Sedang" : "Kritis",
        advice:
          runwayDays < 60
            ? "Tahan penarikan dana pribadi (prive) dan simpan cadangan dana darurat minimal 30 hari."
            : "Cadangan kas sangat solid.",
      },
    ],
    kasEst,
    estimatedCash: kasEst,
    runwayDays: Math.round(Math.max(0, runwayDays)),
    netProfit30,
    netRevenue30,
    opEx30,
    selling30,
  };
}

/**
 * Hitung posisi kas & uang aman ditarik (Prive) pemilik.
 */
export function calcCashPosition(
  orders: Order[],
  expenses: Expense[],
  now: number = Date.now()
) {
  const ms30 = 30 * 86400000;

  const allPaidRev = orders
    .filter((o) => !o.voided && o.paymentStatus === "lunas")
    .reduce((s, o) => s + o.subtotal, 0);

  const allPaidExp = expenses
    .filter((e) => !e.isPrive && e.paid)
    .reduce((s, e) => s + e.amount, 0);

  const kasEst = allPaidRev - allPaidExp;

  // Biaya wajib 30 hari ke depan: beban non-prive yang belum lunas
  const upcomingDebt = expenses
    .filter((e) => {
      if (e.isPrive || e.paid) return false;
      if (!e.dueDate) return true;
      return new Date(e.dueDate).getTime() <= now + ms30;
    })
    .reduce((s, e) => s + e.amount, 0);

  // Cadangan kas: 10% dari pendapatan bersih 30 hari
  const paid30 = orders.filter((o) =>
    !o.voided && o.paymentStatus === "lunas" && new Date(o.date).getTime() >= now - ms30
  );
  const rev30 = paid30.reduce(
    (s, o) => s + o.subtotal - (o.discount ?? 0) - o.adminFee - o.shippingCost,
    0
  );
  const cadangan = Math.round(rev30 * 0.10);

  const uangAman = Math.max(0, kasEst - upcomingDebt - cadangan);

  return { kasEst, upcomingDebt, cadangan, uangAman };
}

/**
 * Hitung total piutang usaha berjalan (untuk Neraca/Posisi Keuangan).
 */
export function calcTotalReceivables(orders: Order[]): number {
  return orders
    .filter((o) => !o.voided && (o.paymentStatus === "belum" || o.paymentStatus === "sebagian"))
    .reduce((s, o) => {
      const due = o.subtotal - (o.discount ?? 0) - o.adminFee - o.shippingCost;
      const paid = (o.payments ?? []).reduce((p, pay) => p + pay.amount, 0);
      return s + Math.max(0, due - paid);
    }, 0);
}

/**
 * Hitung piutang yang sudah melewati tanggal jatuh tempo (overdue).
 */
export function calcOverdueReceivables(orders: Order[], now: number = Date.now()) {
  const overdueOrders = orders.filter((o) =>
    !o.voided &&
    (o.paymentStatus === "belum" || o.paymentStatus === "sebagian") &&
    o.dueDate &&
    new Date(o.dueDate).getTime() < now
  );

  const items = overdueOrders.map((o) => {
    const due = o.subtotal - (o.discount ?? 0) - o.adminFee - o.shippingCost;
    const paid = (o.payments ?? []).reduce((p, pay) => p + pay.amount, 0);
    const amount = Math.max(0, due - paid);
    const dueDate = new Date(o.dueDate!);
    const daysOverdue = Math.max(1, Math.floor((now - dueDate.getTime()) / (1000 * 60 * 60 * 24)));
    return {
      orderId: o.id,
      customerId: o.customerId,
      dueDate: o.dueDate!,
      amount,
      daysOverdue,
    };
  });

  const total = items.reduce((s, i) => s + i.amount, 0);

  return {
    total,
    count: items.length,
    items,
  };
}

/**
 * Format angka ke Rupiah.
 */
export function formatRp(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format tanggal ke format Indonesia.
 */
export function formatDate(dateStr?: string): string {
  if (!dateStr) return "-";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "-";
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(d);
  } catch {
    return "-";
  }
}

/**
 * Format datetime ke format Indonesia.
 */
export function formatDateTime(dateStr?: string): string {
  if (!dateStr) return "-";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "-";
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(d);
  } catch {
    return "-";
  }
}
