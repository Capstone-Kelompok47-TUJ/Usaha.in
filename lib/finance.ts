// ============================================================
// USAHA.IN — Finance Calculations (Pure Functions)
// ============================================================

import type { Order, Purchase, FinanceSummary, ChannelFinance, Channel } from "@/types";

const OPERATIONAL_EXPENSE_MONTHLY = 2_500_000; // pengeluaran tetap per bulan

/**
 * Filter pesanan berdasarkan rentang tanggal.
 */
export function filterOrdersByPeriod(
  orders: Order[],
  period: "daily" | "weekly" | "monthly"
): Order[] {
  const now = new Date();
  const cutoff = new Date(now);

  if (period === "daily") {
    cutoff.setDate(now.getDate() - 1);
  } else if (period === "weekly") {
    cutoff.setDate(now.getDate() - 7);
  } else {
    cutoff.setDate(now.getDate() - 30);
  }

  return orders.filter((o) => {
    const orderDate = new Date(o.date);
    return orderDate >= cutoff && o.paymentStatus === "lunas";
  });
}

/**
 * Hitung ringkasan keuangan dari list pesanan + pembelian.
 * Rumus: Laba = Pendapatan − HPP − Admin Fee − Ongkir − Operasional
 */
export function calcFinanceSummary(
  orders: Order[],
  purchases: Purchase[],
  period: "daily" | "weekly" | "monthly"
): FinanceSummary {
  const filteredOrders = filterOrdersByPeriod(orders, period);

  const revenue = filteredOrders.reduce((s, o) => s + o.subtotal, 0);
  const adminFee = filteredOrders.reduce((s, o) => s + o.adminFee, 0);
  const shippingCost = filteredOrders.reduce((s, o) => s + o.shippingCost, 0);

  // HPP: qty × harga beli per item (pakai harga beli dari pembelian terakhir — simplified)
  const cogs = filteredOrders.reduce((sum, o) => {
    return (
      sum +
      o.items.reduce((s, item) => {
        // Cari pembelian terakhir untuk produk ini
        const lastPurchase = [...purchases]
          .filter((p) => p.productId === item.productId)
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
        const buyPrice = lastPurchase?.buyPrice ?? 0;
        return s + item.qty * buyPrice;
      }, 0)
    );
  }, 0);

  // Operasional proporsional ke periode
  const factor = period === "daily" ? 1 / 30 : period === "weekly" ? 7 / 30 : 1;
  const operationalExpense = Math.round(OPERATIONAL_EXPENSE_MONTHLY * factor);

  const netProfit = revenue - cogs - adminFee - shippingCost - operationalExpense;

  return { revenue, cogs, adminFee, shippingCost, operationalExpense, netProfit };
}

/**
 * Hitung profitabilitas per kanal.
 */
export function calcChannelFinance(
  orders: Order[],
  purchases: Purchase[],
  period: "daily" | "weekly" | "monthly"
): ChannelFinance[] {
  const filteredOrders = filterOrdersByPeriod(orders, period);
  const channels: Channel[] = ["marketplace_a", "marketplace_b", "chat", "offline"];

  return channels.map((channel) => {
    const channelOrders = filteredOrders.filter((o) => o.channel === channel);
    const revenue = channelOrders.reduce((s, o) => s + o.subtotal, 0);
    const adminFee = channelOrders.reduce((s, o) => s + o.adminFee, 0);
    const shippingCost = channelOrders.reduce((s, o) => s + o.shippingCost, 0);
    const cogs = channelOrders.reduce((sum, o) => {
      return (
        sum +
        o.items.reduce((s, item) => {
          const lastPurchase = [...purchases]
            .filter((p) => p.productId === item.productId)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
          const buyPrice = lastPurchase?.buyPrice ?? 0;
          return s + item.qty * buyPrice;
        }, 0)
      );
    }, 0);
    const netProfit = revenue - cogs - adminFee - shippingCost;
    const margin = revenue > 0 ? Math.round((netProfit / revenue) * 100) : 0;

    return { channel, revenue, adminFee, shippingCost, cogs, netProfit, margin };
  });
}

/**
 * Hitung KPI ringkas untuk dashboard.
 */
export function calcKpi(
  orders: Order[],
  purchases: Purchase[],
  period: "daily" | "weekly" | "monthly"
) {
  const current = calcFinanceSummary(orders, purchases, period);

  // Periode sebelumnya untuk persentase perubahan
  const prevOrders = orders.filter((o) => {
    const d = new Date(o.date);
    const now = new Date();
    const days = period === "daily" ? 1 : period === "weekly" ? 7 : 30;
    const from = new Date(now);
    from.setDate(now.getDate() - days * 2);
    const to = new Date(now);
    to.setDate(now.getDate() - days);
    return d >= from && d < to && o.paymentStatus === "lunas";
  });

  const prevRevenue = prevOrders.reduce((s, o) => s + o.subtotal, 0);
  const prevOrders30 = prevOrders.length;

  const pctRevenue =
    prevRevenue > 0
      ? Math.round(((current.revenue - prevRevenue) / prevRevenue) * 100)
      : 0;

  const currentOrderCount = filterOrdersByPeriod(orders, period).length;
  const pctOrders =
    prevOrders30 > 0
      ? Math.round(((currentOrderCount - prevOrders30) / prevOrders30) * 100)
      : 0;

  return {
    revenue: current.revenue,
    netProfit: current.netProfit,
    expense: current.operationalExpense + current.adminFee + current.shippingCost,
    orderCount: currentOrderCount,
    pctRevenue,
    pctNetProfit: pctRevenue, // simplified
    pctExpense: Math.round(pctRevenue * -0.3), // simplified
    pctOrders,
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
export function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(dateStr));
}

/**
 * Format datetime ke format Indonesia.
 */
export function formatDateTime(dateStr: string): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateStr));
}
