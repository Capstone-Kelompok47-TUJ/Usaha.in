"use client";

import { useStore } from "@/lib/store";
import { AlertTriangle, TrendingDown, Package } from "lucide-react";

export function AlertPanel() {
  const products = useStore((s) => s.products);
  const orders = useStore((s) => s.orders);

  const lowStockProducts = products.filter((p) => p.stock <= p.minStock);

  // Cek penjualan turun: bandingkan 7 hari vs 7 hari sebelumnya
  const now = Date.now();
  const week1Orders = orders.filter((o) => {
    const d = new Date(o.date).getTime();
    return d >= now - 7 * 86400000 && o.paymentStatus === "lunas";
  });
  const week2Orders = orders.filter((o) => {
    const d = new Date(o.date).getTime();
    return d >= now - 14 * 86400000 && d < now - 7 * 86400000 && o.paymentStatus === "lunas";
  });
  const rev1 = week1Orders.reduce((s, o) => s + o.subtotal, 0);
  const rev2 = week2Orders.reduce((s, o) => s + o.subtotal, 0);
  const revDrop = rev2 > 0 && rev1 < rev2 * 0.9;

  const alerts = [
    ...lowStockProducts.map((p) => ({
      id: `low-${p.id}`,
      type: "warning" as const,
      icon: <Package className="w-4 h-4" />,
      message: `Stok menipis: ${p.name} (${p.stock} unit tersisa, min: ${p.minStock})`,
    })),
    ...(revDrop
      ? [{
          id: "rev-drop",
          type: "error" as const,
          icon: <TrendingDown className="w-4 h-4" />,
          message: `Pendapatan minggu ini turun ~${Math.round(((rev2 - rev1) / rev2) * 100)}% dibanding minggu lalu`,
        }]
      : []),
  ];

  if (alerts.length === 0) return null;

  return (
    <div className="card space-y-2">
      <div className="flex items-center gap-2 mb-1">
        <AlertTriangle className="w-4 h-4 text-yellow-500" />
        <h3 className="font-semibold text-sm">Peringatan Otomatis</h3>
        <span className="text-xs font-bold px-1.5 py-0.5 rounded-full bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">
          {alerts.length}
        </span>
      </div>
      <div className="space-y-1.5">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={`flex items-start gap-2.5 p-2.5 rounded-lg text-sm ${
              alert.type === "warning"
                ? "bg-yellow-50 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300"
                : "bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-300"
            }`}
          >
            {alert.icon}
            <span>{alert.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
