"use client";

import { useStore } from "@/lib/store";
import { formatRp } from "@/lib/finance";
import { AlertTriangle, TrendingDown, Package, Clock, Banknote, Flame, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";

export function AlertPanel() {
  const products = useStore((s) => s.products);
  const orders = useStore((s) => s.orders);
  const expenses = useStore((s) => s.expenses);
  const expenseCategories = useStore((s) => s.expenseCategories);
  const budgets = useStore((s) => s.budgets);

  const alerts = useMemo(() => {
    const now = Date.now();
    const result: {
      id: string;
      type: "error" | "warning";
      icon: React.ReactNode;
      message: string;
      href?: string;
    }[] = [];

    // 1. Stok menipis / negatif
    for (const p of products) {
      if (p.trackStock === false) continue;
      if (p.stock < 0) {
        result.push({
          id: `neg-${p.id}`,
          type: "error",
          icon: <Package className="w-4 h-4 shrink-0" />,
          message: `Stok negatif: ${p.name} (${p.stock}) — periksa pencatatan`,
          href: "/stok",
        });
      } else if (p.stock <= p.minStock) {
        result.push({
          id: `low-${p.id}`,
          type: "warning",
          icon: <Package className="w-4 h-4 shrink-0" />,
          message: `Stok menipis: ${p.name} (${p.stock} unit, min: ${p.minStock})`,
          href: "/stok",
        });
      }
    }

    // 2. Penjualan turun
    const week1Rev = orders
      .filter((o) => new Date(o.date).getTime() >= now - 7 * 86400000 && o.paymentStatus === "lunas" && !o.voided)
      .reduce((s, o) => s + o.subtotal, 0);
    const week2Rev = orders
      .filter((o) => {
        const d = new Date(o.date).getTime();
        return d >= now - 14 * 86400000 && d < now - 7 * 86400000 && o.paymentStatus === "lunas" && !o.voided;
      })
      .reduce((s, o) => s + o.subtotal, 0);
    if (week2Rev > 0 && week1Rev < week2Rev * 0.9) {
      result.push({
        id: "rev-drop",
        type: "error",
        icon: <TrendingDown className="w-4 h-4 shrink-0" />,
        message: `Pendapatan minggu ini turun ~${Math.round(((week2Rev - week1Rev) / week2Rev) * 100)}% vs minggu lalu`,
        href: "/keuangan",
      });
    }

    // 3. Piutang lewat jatuh tempo (H3)
    const overdueOrders = orders.filter((o) =>
      !o.voided &&
      (o.paymentStatus === "belum" || o.paymentStatus === "sebagian") &&
      o.dueDate &&
      new Date(o.dueDate).getTime() < now
    );
    if (overdueOrders.length > 0) {
      const totalOverdue = overdueOrders.reduce((s, o) => {
        const due = o.subtotal - (o.discount ?? 0) - o.adminFee - o.shippingCost;
        const paid = (o.payments ?? []).reduce((p, pay) => p + pay.amount, 0);
        return s + (due - paid);
      }, 0);
      result.push({
        id: "overdue-piutang",
        type: "error",
        icon: <Clock className="w-4 h-4 shrink-0" />,
        message: `Piutang lewat jatuh tempo: ${overdueOrders.length} pesanan, total ${formatRp(totalOverdue)}`,
        href: "/pembayaran",
      });
    }

    // 4. Kategori biaya merah (>100% batas) (H3)
    const now30 = new Date();
    const monthStart = `${now30.getFullYear()}-${String(now30.getMonth() + 1).padStart(2, "0")}`;
    for (const [categoryId, limit] of Object.entries(budgets)) {
      if (!limit || limit <= 0) continue;
      const spent = expenses
        .filter((e) => e.categoryId === categoryId && e.date.startsWith(monthStart) && !e.isPrive)
        .reduce((s, e) => s + e.amount, 0);
      if (spent > limit) {
        const cat = expenseCategories.find((c) => c.id === categoryId);
        result.push({
          id: `budget-${categoryId}`,
          type: "warning",
          icon: <Flame className="w-4 h-4 shrink-0" />,
          message: `Batas biaya "${cat?.name ?? categoryId}" terlampaui: ${formatRp(spent)} / ${formatRp(limit)}`,
          href: "/pengeluaran",
        });
      }
    }

    // 5. Kas runway < 30 hari (H3)
    const allPaidRev = orders.filter((o) => !o.voided && o.paymentStatus === "lunas").reduce((s, o) => s + o.subtotal, 0);
    const allPaidExp = expenses.filter((e) => !e.isPrive && e.paid).reduce((s, e) => s + e.amount, 0);
    const kasEst = allPaidRev - allPaidExp;
    // avg daily expense (30 hari)
    const exp30 = expenses
      .filter((e) => !e.isPrive && e.paid && new Date(e.date).getTime() >= now - 30 * 86400000)
      .reduce((s, e) => s + e.amount, 0);
    const avgDailyExp = exp30 / 30;
    const runwayDays = avgDailyExp > 0 ? Math.round(kasEst / avgDailyExp) : Infinity;
    if (runwayDays < 30 && runwayDays >= 0 && isFinite(runwayDays)) {
      result.push({
        id: "low-runway",
        type: "error",
        icon: <Banknote className="w-4 h-4 shrink-0" />,
        message: `Kas diperkirakan cukup hanya ${runwayDays} hari lagi`,
        href: "/keuangan",
      });
    }

    return result;
  }, [products, orders, expenses, expenseCategories, budgets]);

  if (alerts.length === 0) return null;

  return (
    <div className="card space-y-2">
      <div className="flex items-center gap-2 mb-1">
        <AlertTriangle className="w-4 h-4 text-amber-500" />
        <h3 className="font-semibold text-sm">Peringatan Otomatis</h3>
        <span className="text-xs font-bold px-1.5 py-0.5 rounded-full bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">
          {alerts.length}
        </span>
      </div>
      <div className="space-y-1.5">
        {alerts.map((alert) => (
          <div key={alert.id}
            className={`flex items-center gap-2.5 p-2.5 rounded-lg text-sm ${
              alert.type === "warning"
                ? "bg-amber-50 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300"
                : "bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-300"
            }`}>
            {alert.icon}
            <span className="flex-1">{alert.message}</span>
            {alert.href && (
              <Link href={alert.href}
                className="shrink-0 text-xs font-semibold opacity-70 hover:opacity-100 flex items-center gap-0.5">
                Lihat <ChevronRight className="w-3 h-3" />
              </Link>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
