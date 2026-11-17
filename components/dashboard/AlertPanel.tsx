"use client";

import { useStore } from "@/lib/store";
import { formatRp, calcOverdueReceivables, calcHealthScore } from "@/lib/finance";
import {
  AlertTriangle,
  TrendingDown,
  Package,
  Clock,
  Banknote,
  Flame,
  Truck,
  ShieldAlert,
  ChevronRight,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

export function AlertPanel({ now }: { now: number }) {
  const rawProducts = useStore((s) => s.products);
  const rawOrders = useStore((s) => s.orders);
  const rawExpenses = useStore((s) => s.expenses);
  const activeTenantId = useStore((s) => s.activeTenantId);
  const expenseCategories = useStore((s) => s.expenseCategories);
  const budgets = useStore((s) => s.budgets);

  const [expanded, setExpanded] = useState(false);

  const products = useMemo(
    () => rawProducts.filter((p) => p.tenantId === activeTenantId),
    [rawProducts, activeTenantId]
  );
  const orders = useMemo(
    () => rawOrders.filter((o) => o.tenantId === activeTenantId),
    [rawOrders, activeTenantId]
  );
  const expenses = useMemo(
    () => rawExpenses.filter((e) => e.tenantId === activeTenantId),
    [rawExpenses, activeTenantId]
  );

  const alerts = useMemo(() => {
    const result: {
      id: string;
      type: "error" | "warning";
      icon: React.ReactNode;
      message: string;
      href: string;
      actionLabel: string;
      priority: number;
    }[] = [];

    // 1. Stok menipis / negatif
    for (const p of products) {
      if (p.trackStock === false) continue;
      if (p.stock < 0) {
        result.push({
          id: `neg-${p.id}`,
          type: "error",
          icon: <Package className="w-4 h-4 shrink-0 text-red-500" />,
          message: `Stok minus: ${p.name} (${p.stock} unit) — segera lakukan penyesuaian`,
          href: "/stok",
          actionLabel: "Periksa stok",
          priority: 1,
        });
      } else if (p.stock <= p.minStock) {
        result.push({
          id: `low-${p.id}`,
          type: "warning",
          icon: <Package className="w-4 h-4 shrink-0 text-amber-500" />,
          message: `Stok menipis: ${p.name} (${p.stock} unit, batas aman: ${p.minStock})`,
          href: "/stok",
          actionLabel: "Lihat stok",
          priority: 3,
        });
      }
    }

    // 2. Piutang lewat jatuh tempo
    const overdue = calcOverdueReceivables(orders, now);
    if (overdue.count > 0) {
      result.push({
        id: "overdue-piutang",
        type: "error",
        icon: <Clock className="w-4 h-4 shrink-0 text-red-500" />,
        message: `Piutang lewat jatuh tempo: ${overdue.count} pesanan, total ${formatRp(overdue.total)}`,
        href: "/pembayaran",
        actionLabel: "Tagih sekarang",
        priority: 2,
      });
    }

    // 3. Pesanan baru belum diproses > 24 jam
    const pendingOrders = orders.filter((o) => {
      if (o.voided || o.shipmentStatus !== "baru") return false;
      const orderTime = new Date(o.date).getTime();
      return !isNaN(orderTime) && now - orderTime > 24 * 60 * 60 * 1000;
    });
    if (pendingOrders.length > 0) {
      result.push({
        id: "pending-shipment",
        type: "warning",
        icon: <Truck className="w-4 h-4 shrink-0 text-amber-500" />,
        message: `${pendingOrders.length} pesanan baru belum diproses lebih dari 24 jam`,
        href: "/pengiriman",
        actionLabel: "Kemas pesanan",
        priority: 3,
      });
    }

    // 4. Kategori biaya melebihi batas anggaran (>90% / >100%)
    const now30 = new Date(now);
    const monthStart = `${now30.getFullYear()}-${String(now30.getMonth() + 1).padStart(2, "0")}`;
    for (const [categoryId, limit] of Object.entries(budgets)) {
      if (!limit || limit <= 0) continue;
      const spent = expenses
        .filter((e) => e.categoryId === categoryId && e.date.startsWith(monthStart) && !e.isPrive)
        .reduce((s, e) => s + e.amount, 0);

      const cat = expenseCategories.find((c) => c.id === categoryId);
      if (spent >= limit) {
        result.push({
          id: `budget-${categoryId}`,
          type: "error",
          icon: <Flame className="w-4 h-4 shrink-0 text-red-500" />,
          message: `Anggaran pos "${cat?.name ?? categoryId}" terlampaui: ${formatRp(spent)} / ${formatRp(limit)}`,
          href: "/pengeluaran",
          actionLabel: "Atur pengeluaran",
          priority: 2,
        });
      } else if (spent >= limit * 0.9) {
        result.push({
          id: `budget-warn-${categoryId}`,
          type: "warning",
          icon: <Flame className="w-4 h-4 shrink-0 text-amber-500" />,
          message: `Anggaran pos "${cat?.name ?? categoryId}" mendekati batas (${Math.round((spent / limit) * 100)}%)`,
          href: "/pengeluaran",
          actionLabel: "Pantau biaya",
          priority: 4,
        });
      }
    }

    // 5. Penjualan mingguan turun signifikan (>15%)
    const week1Rev = orders
      .filter((o) => new Date(o.date).getTime() >= now - 7 * 86400000 && o.paymentStatus === "lunas" && !o.voided)
      .reduce((s, o) => s + o.subtotal, 0);
    const week2Rev = orders
      .filter((o) => {
        const d = new Date(o.date).getTime();
        return d >= now - 14 * 86400000 && d < now - 7 * 86400000 && o.paymentStatus === "lunas" && !o.voided;
      })
      .reduce((s, o) => s + o.subtotal, 0);
    if (week2Rev > 0 && week1Rev < week2Rev * 0.85) {
      const dropPct = Math.round(((week2Rev - week1Rev) / week2Rev) * 100);
      result.push({
        id: "rev-drop",
        type: "error",
        icon: <TrendingDown className="w-4 h-4 shrink-0 text-red-500" />,
        message: `Omzet minggu ini turun ~${dropPct}% dibanding minggu sebelumnya`,
        href: "/keuangan",
        actionLabel: "Cek laporan",
        priority: 4,
      });
    }

    // 6. Evaluasi Skor Kesehatan Usaha (jika Kritis <60)
    const health = calcHealthScore(orders, expenses, products, expenseCategories, now);
    if (health.hasData && health.total < 60) {
      result.push({
        id: "low-health-score",
        type: "error",
        icon: <ShieldAlert className="w-4 h-4 shrink-0 text-red-500" />,
        message: `Skor kesehatan usahamu ${health.total}/100 (${health.label}) — perlu perhatian strategis`,
        href: "/analitik",
        actionLabel: "Lihat saran",
        priority: 1,
      });
    }

    // 7. Ketahanan kas runway < 30 hari
    if (health.hasData && health.runwayDays < 30 && health.runwayDays >= 0 && isFinite(health.runwayDays)) {
      result.push({
        id: "low-runway",
        type: "error",
        icon: <Banknote className="w-4 h-4 shrink-0 text-red-500" />,
        message: `Kas diperkirakan hanya cukup untuk ${health.runwayDays} hari pengeluaran`,
        href: "/keuangan",
        actionLabel: "Arus kas",
        priority: 2,
      });
    }

    return result.sort((a, b) => a.priority - b.priority);
  }, [products, orders, expenses, expenseCategories, budgets, now]);

  if (alerts.length === 0) return null;

  const visibleAlerts = expanded ? alerts : alerts.slice(0, 3);
  const hasMore = alerts.length > 3;

  return (
    <div className="card space-y-2">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-500" />
          <h3 className="font-semibold text-sm">Peringatan Operasional & Finansial</h3>
          <span className="text-xs font-bold px-1.5 py-0.5 rounded-full bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">
            {alerts.length}
          </span>
        </div>
        {hasMore && (
          <button
            onClick={() => setExpanded((prev) => !prev)}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-1 cursor-pointer transition-colors"
          >
            {expanded ? (
              <>
                Tampilkan ringkas <ChevronUp className="w-3.5 h-3.5" />
              </>
            ) : (
              <>
                Lihat semua ({alerts.length}) <ChevronDown className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        )}
      </div>

      <div className="space-y-1.5">
        {visibleAlerts.map((alert) => (
          <div
            key={alert.id}
            className={`flex items-center gap-2.5 p-2.5 rounded-xl text-sm transition-all ${
              alert.type === "warning"
                ? "bg-amber-50/80 text-amber-900 border border-amber-200/70 dark:bg-amber-950/20 dark:text-amber-300 dark:border-amber-900/40"
                : "bg-red-50/80 text-red-900 border border-red-200/70 dark:bg-red-950/20 dark:text-red-300 dark:border-red-900/40"
            }`}
          >
            {alert.icon}
            <span className="flex-1 text-xs md:text-sm leading-tight font-medium">
              {alert.message}
            </span>
            {alert.href && (
              <Link
                href={alert.href}
                className="shrink-0 text-xs font-bold text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-0.5 px-2 py-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                aria-label={`${alert.actionLabel}: ${alert.message}`}
              >
                {alert.actionLabel} <ChevronRight className="w-3 h-3" />
              </Link>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
