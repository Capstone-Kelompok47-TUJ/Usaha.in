"use client";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { usePermission } from "@/hooks/usePermission";
import { useStore } from "@/lib/store";
import { formatRp } from "@/lib/finance";
import { redirect } from "next/navigation";
import { AlertTriangle, Package, X, History, TrendingDown, TrendingUp } from "lucide-react";
import { useState } from "react";
import type { Product } from "@/types";

function StockLedgerDrawer({ product, onClose }: { product: Product; onClose: () => void }) {
  const movements = useStore((s) =>
    s.stockMovements
      .filter((m) => m.productId === product.id)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 20)
  );

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="w-full max-w-md bg-[hsl(var(--card))] border-l border-[hsl(var(--border))] h-full overflow-y-auto animate-slide-in p-6 space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="font-bold text-base">{product.name}</h2>
            <p className="text-xs text-[hsl(var(--muted-fg))] font-mono">{product.sku}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[hsl(var(--muted))] transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="card !p-3 text-center">
            <p className="text-xs text-[hsl(var(--muted-fg))]">Stok</p>
            <p className={`text-xl font-bold ${product.stock <= product.minStock ? "text-red-500" : ""}`}>{product.stock}</p>
          </div>
          <div className="card !p-3 text-center">
            <p className="text-xs text-[hsl(var(--muted-fg))]">Min</p>
            <p className="text-xl font-bold">{product.minStock}</p>
          </div>
          <div className="card !p-3 text-center">
            <p className="text-xs text-[hsl(var(--muted-fg))]">Harga Jual</p>
            <p className="text-sm font-bold">{formatRp(product.sellPrice)}</p>
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
            <History className="w-4 h-4" /> Riwayat Pergerakan Stok
          </h3>
          <div className="space-y-2">
            {movements.length === 0 ? (
              <p className="text-sm text-[hsl(var(--muted-fg))] text-center py-4">Belum ada pergerakan stok</p>
            ) : (
              movements.map((m) => (
                <div key={m.id} className="flex items-center gap-3 p-2.5 rounded-lg border border-[hsl(var(--border))]">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                    m.qty > 0 ? "bg-green-100 dark:bg-green-900/30" : "bg-red-100 dark:bg-red-900/30"
                  }`}>
                    {m.qty > 0
                      ? <TrendingUp className="w-3.5 h-3.5 text-green-600" />
                      : <TrendingDown className="w-3.5 h-3.5 text-red-600" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium capitalize">{m.type === "sale" ? "Penjualan" : m.type === "purchase" ? "Pembelian" : "Penyesuaian"}</p>
                    <p className="text-[10px] text-[hsl(var(--muted-fg))] font-mono truncate">{m.refId}</p>
                  </div>
                  <span className={`text-sm font-bold ${m.qty > 0 ? "text-green-600" : "text-red-600"}`}>
                    {m.qty > 0 ? "+" : ""}{m.qty}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProdukPage() {
  const { canView } = usePermission("produk");
  const products = useStore((s) => s.products);
  const [selected, setSelected] = useState<Product | null>(null);

  if (!canView) redirect("/tidak-ada-akses");

  return (
    <DashboardLayout title="Produk & Stok" subtitle={`${products.length} produk terdaftar`}>
      <div className="card !p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[hsl(var(--border))] bg-[hsl(var(--muted))]">
                {["SKU", "Nama Produk", "Harga Jual", "Harga Beli", "Stok", "Min", "Kanal", "Status"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wide text-[hsl(var(--muted-fg))]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {products.map((p) => {
                const isLow = p.stock <= p.minStock;
                return (
                  <tr
                    key={p.id}
                    onClick={() => setSelected(p)}
                    className="border-b border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))] transition-colors cursor-pointer"
                  >
                    <td className="px-4 py-3 font-mono text-xs text-[hsl(var(--muted-fg))]">{p.sku}</td>
                    <td className="px-4 py-3 font-medium">{p.name}</td>
                    <td className="px-4 py-3">{formatRp(p.sellPrice)}</td>
                    <td className="px-4 py-3 text-[hsl(var(--muted-fg))]">{formatRp(p.buyPrice)}</td>
                    <td className={`px-4 py-3 font-bold ${isLow ? "text-red-500" : ""}`}>{p.stock}</td>
                    <td className="px-4 py-3 text-[hsl(var(--muted-fg))]">{p.minStock}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        {p.channels.includes("marketplace_a") && (
                          <span className="badge-marketplace_a text-[10px] px-1.5 py-0.5 rounded-full font-semibold">MKT-A</span>
                        )}
                        {p.channels.includes("marketplace_b") && (
                          <span className="badge-marketplace_b text-[10px] px-1.5 py-0.5 rounded-full font-semibold">MKT-B</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {isLow ? (
                        <span className="flex items-center gap-1 text-[11px] font-semibold text-yellow-700 dark:text-yellow-400">
                          <AlertTriangle className="w-3 h-3" /> Menipis
                        </span>
                      ) : (
                        <span className="text-[11px] text-green-600 dark:text-green-400 font-semibold">Aman</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {selected && <StockLedgerDrawer product={selected} onClose={() => setSelected(null)} />}
    </DashboardLayout>
  );
}
