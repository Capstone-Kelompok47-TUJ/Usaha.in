"use client";

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Cell, PieChart, Pie, Legend,
} from "recharts";
import { useStore } from "@/lib/store";
import { formatRp } from "@/lib/finance";
import type { Channel } from "@/types";

const CHANNEL_COLORS: Record<Channel, string> = {
  marketplace_a: "#f97316",
  marketplace_b: "#22c55e",
  chat:          "#10b981",
  offline:       "#94a3b8",
};

const CHANNEL_LABELS: Record<Channel, string> = {
  marketplace_a: "Marketplace A",
  marketplace_b: "Marketplace B",
  chat:          "Chat",
  offline:       "Toko Offline",
};

// ====== Sales Line Chart ======
export function SalesLineChart() {
  const orders = useStore((s) => s.orders);

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
      <h3 className="font-semibold text-sm mb-4">Penjualan 30 Hari Terakhir</h3>
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

// ====== Channel Bar/Pie Chart ======
export function ChannelChart() {
  const orders = useStore((s) => s.orders);

  const channels: Channel[] = ["marketplace_a", "marketplace_b", "chat", "offline"];
  const data = channels.map((ch) => {
    const chOrders = orders.filter(
      (o) => o.channel === ch && o.paymentStatus === "lunas"
    );
    return {
      name: CHANNEL_LABELS[ch],
      value: chOrders.reduce((s, o) => s + o.subtotal, 0),
      color: CHANNEL_COLORS[ch],
    };
  });

  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <div className="card">
      <h3 className="font-semibold text-sm mb-4">Omzet per Kanal</h3>
      <div className="flex items-center gap-4">
        <ResponsiveContainer width="100%" height={160}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={45}
              outerRadius={70}
              paddingAngle={3}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={index} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(v: any) => [formatRp(Number(v) || 0), "Omzet"]}
              contentStyle={{ fontSize: 12, borderRadius: "8px" }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="space-y-2 shrink-0">
          {data.map((d) => (
            <div key={d.name} className="flex items-center gap-2 text-xs">
              <div
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ background: d.color }}
              />
              <span className="text-[hsl(var(--muted-fg))]">{d.name}</span>
              <span className="font-semibold ml-1">
                {total > 0 ? Math.round((d.value / total) * 100) : 0}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ====== Top Products Chart ======
export function TopProductsChart() {
  const orders = useStore((s) => s.orders);
  const products = useStore((s) => s.products);

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
      <h3 className="font-semibold text-sm mb-4">Produk Terlaris (Top 5)</h3>
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
