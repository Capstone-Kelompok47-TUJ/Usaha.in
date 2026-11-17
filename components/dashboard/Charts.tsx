"use client";

import { useMemo } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar,
} from "recharts";
import { useStore } from "@/lib/store";
import { formatRp } from "@/lib/finance";

// ====== Sales Line Chart ======
export function SalesLineChart() {
  const rawOrders = useStore((s) => s.orders);
  const activeTenantId = useStore((s) => s.activeTenantId);
  const orders = useMemo(
    () => rawOrders.filter((o) => o.tenantId === activeTenantId),
    [rawOrders, activeTenantId]
  );

  // Hitung penjualan per hari (30 hari terakhir)
  const days = Array.from({ length: 30 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (29 - i));
    return d.toISOString().split("T")[0];
  });

  const data = days.map((date) => {
    const dayOrders = orders.filter(
      (o) => o.date === date && o.paymentStatus === "lunas"
    );
    return {
      date: new Date(date).toLocaleDateString("id-ID", { day: "numeric", month: "short" }),
      pendapatan: dayOrders.reduce((s, o) => s + o.subtotal, 0),
    };
  });

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-sm">Penjualan 30 Hari Terakhir</h3>
        <Link
          href="/laporan"
          className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5"
          title="Buka ringkasan laporan periodik"
        >
          Laporan Lengkap <ChevronRight className="w-3 h-3" />
        </Link>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 91%)" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10, fill: "hsl(220 10% 55%)" }}
            tickLine={false}
            interval={4}
          />
          <YAxis
            tick={{ fontSize: 10, fill: "hsl(220 10% 55%)" }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
          />
          <Tooltip
            formatter={(v: any) => [formatRp(Number(v) || 0), "Pendapatan"]}
            contentStyle={{
              fontSize: 12,
              borderRadius: "8px",
              border: "1px solid hsl(220 13% 91%)",
            }}
          />
          <Line
            type="monotone"
            dataKey="pendapatan"
            stroke="hsl(224 76% 52%)"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

// ====== Top Products Chart ======
export function TopProductsChart() {
  const rawOrders = useStore((s) => s.orders);
  const rawProducts = useStore((s) => s.products);
  const activeTenantId = useStore((s) => s.activeTenantId);
  const orders = useMemo(
    () => rawOrders.filter((o) => o.tenantId === activeTenantId),
    [rawOrders, activeTenantId]
  );
  const products = useMemo(
    () => rawProducts.filter((p) => p.tenantId === activeTenantId),
    [rawProducts, activeTenantId]
  );

  // Hitung qty terjual per produk
  const productSales: Record<string, number> = {};
  orders.forEach((o) => {
    if (o.paymentStatus !== "lunas") return;
    o.items.forEach((item) => {
      productSales[item.productId] = (productSales[item.productId] ?? 0) + item.qty;
    });
  });

  const data = products
    .map((p) => ({ name: p.name.replace(" (Sachet)", "").slice(0, 18), qty: productSales[p.id] ?? 0 }))
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5);

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-sm">Produk Terlaris (Top 5)</h3>
        <Link
          href="/produk"
          className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5"
          title="Kelola data dan stok produk"
        >
          Katalog Produk <ChevronRight className="w-3 h-3" />
        </Link>
      </div>
      <ResponsiveContainer width="100%" height={160}>
        <BarChart data={data} layout="vertical" margin={{ left: 0, right: 20 }}>
          <XAxis type="number" hide />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fontSize: 11, fill: "hsl(220 10% 55%)" }}
            tickLine={false}
            axisLine={false}
            width={110}
          />
          <Tooltip
            formatter={(v: any) => [`${Number(v) || 0} unit`, "Terjual"]}
            contentStyle={{ fontSize: 12, borderRadius: "8px" }}
          />
          <Bar dataKey="qty" fill="hsl(224 76% 52%)" radius={[0, 4, 4, 0]} barSize={14} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
