"use client";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { usePermission } from "@/hooks/usePermission";
import { useStore } from "@/lib/store";
import { formatRp, formatDate } from "@/lib/finance";
import { redirect } from "next/navigation";
import { AlertTriangle } from "lucide-react";

export default function StokPage() {
  const { canView } = usePermission("stok");
  const products = useStore((s) => s.products);
  const stockMovements = useStore((s) => s.stockMovements);

  if (!canView) redirect("/tidak-ada-akses");

  const lowStock = products.filter((p) => p.stock <= p.minStock);

  return (
    <DashboardLayout title="Stok" subtitle="Ledger pergerakan stok semua produk">
      {/* Alert stok menipis */}
      {lowStock.length > 0 && (
        <div className="flex items-start gap-3 p-4 mb-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
          <AlertTriangle className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-yellow-800 dark:text-yellow-300 text-sm">{lowStock.length} produk stok menipis</p>
            <p className="text-xs text-yellow-700 dark:text-yellow-400 mt-0.5">
              {lowStock.map((p) => `${p.name} (${p.stock} unit)`).join(", ")}
            </p>
          </div>
        </div>
      )}

      {/* Stok summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
        {products.slice(0, 4).map((p) => (
          <div key={p.id} className="card">
            <p className="text-xs font-medium text-[hsl(var(--muted-fg))] truncate mb-1">{p.name}</p>
            <p className={`text-2xl font-bold ${p.stock <= p.minStock ? "text-red-500" : ""}`}>{p.stock}</p>
            <div className="mt-1 h-1.5 rounded-full bg-[hsl(var(--muted))] overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${p.stock <= p.minStock ? "bg-red-500" : "bg-blue-500"}`}
                style={{ width: `${Math.min(100, (p.stock / (p.minStock * 3)) * 100)}%` }}
              />
            </div>
            <p className="text-[10px] text-[hsl(var(--muted-fg))] mt-1">Min: {p.minStock} unit</p>
          </div>
        ))}
      </div>

      {/* Full stock table */}
      <div className="card !p-0 overflow-hidden">
        <div className="px-4 py-3 border-b border-[hsl(var(--border))]">
          <h3 className="font-semibold text-sm">Semua Produk</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[hsl(var(--border))] bg-[hsl(var(--muted))]">
                {["Produk", "SKU", "Stok Saat Ini", "Min Stok", "Harga Beli", "Harga Jual", "Status"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wide text-[hsl(var(--muted-fg))]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {products.map((p) => {
                const isLow = p.stock <= p.minStock;
                const pct = Math.min(100, Math.round((p.stock / (p.minStock * 2)) * 100));
                return (
                  <tr key={p.id} className="border-b border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))] transition-colors">
                    <td className="px-4 py-3 font-medium">{p.name}</td>
                    <td className="px-4 py-3 font-mono text-xs text-[hsl(var(--muted-fg))]">{p.sku}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className={`font-bold text-base w-8 ${isLow ? "text-red-500" : ""}`}>{p.stock}</span>
                        <div className="flex-1 h-1.5 rounded-full bg-[hsl(var(--muted))] max-w-[80px] overflow-hidden">
                          <div className={`h-full rounded-full ${isLow ? "bg-red-500" : "bg-blue-500"}`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[hsl(var(--muted-fg))]">{p.minStock}</td>
                    <td className="px-4 py-3 text-[hsl(var(--muted-fg))]">{formatRp(p.buyPrice)}</td>
                    <td className="px-4 py-3 font-medium">{formatRp(p.sellPrice)}</td>
                    <td className="px-4 py-3">
                      {isLow
                        ? <span className="flex items-center gap-1 text-[11px] font-semibold text-yellow-700 dark:text-yellow-400"><AlertTriangle className="w-3 h-3" /> Menipis</span>
                        : <span className="text-[11px] text-green-600 font-semibold">Aman</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
