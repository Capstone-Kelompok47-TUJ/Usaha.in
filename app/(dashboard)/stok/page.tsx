"use client";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageIntro } from "@/components/ui/PageIntro";
import { EmptyState } from "@/components/ui/EmptyState";
import { Hint } from "@/components/ui/Hint";
import { usePermission } from "@/hooks/usePermission";
import { useStore } from "@/lib/store";
import { formatRp } from "@/lib/finance";
import { redirect } from "next/navigation";
import { AlertTriangle, RefreshCw, PackageX, X, Minus, Plus, Package } from "lucide-react";
import { useState, useMemo } from "react";
import type { Product } from "@/types";

// ============================================================
// Helpers: E3 calculations
// ============================================================

function calcDailySales(productId: string, orders: any[], days = 28): number {
  const since = Date.now() - days * 24 * 60 * 60 * 1000;
  let total = 0;
  for (const o of orders) {
    if (o.voided) continue;
    if (new Date(o.date).getTime() < since) continue;
    for (const item of o.items) {
      if (item.productId === productId) total += item.qty;
    }
  }
  return total / days;
}

function calcLastSaleDate(productId: string, orders: any[]): string | null {
  let latest: string | null = null;
  for (const o of orders) {
    if (o.voided) continue;
    for (const item of o.items) {
      if (item.productId === productId) {
        if (!latest || o.date > latest) latest = o.date;
      }
    }
  }
  return latest;
}

// ============================================================
// Adjust Stock Modal (E3: catatan wajib)
// ============================================================

function AdjustStockModal({ product, onClose }: { product: Product; onClose: () => void }) {
  const adjustStock = useStore((s) => s.adjustStock);
  const [delta, setDelta] = useState(0);
  const [note, setNote] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const newStock = product.stock + delta;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (delta === 0) errs.delta = "Jumlah penyesuaian tidak boleh 0";
    if (!note.trim()) errs.note = "Catatan wajib diisi untuk penyesuaian stok";
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    adjustStock(product.id, delta, note);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[hsl(var(--card))] rounded-2xl border border-[hsl(var(--border))] shadow-2xl w-full max-w-sm p-6 animate-fade-in">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-base flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-blue-500" /> Sesuaikan Stok
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[hsl(var(--muted))] transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="card !p-3 mb-4">
          <p className="text-sm font-semibold">{product.name}</p>
          <p className="text-xs text-[hsl(var(--muted-fg))] font-mono">{product.sku}</p>
          <p className="text-xs mt-1">Stok saat ini: <strong className={product.stock < 0 ? "text-red-600" : ""}>{product.stock}</strong></p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-[hsl(var(--muted-fg))] block mb-2">Penyesuaian</label>
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => setDelta((d) => d - 1)}
                className="w-9 h-9 rounded-lg border border-[hsl(var(--border))] flex items-center justify-center hover:bg-red-50 dark:hover:bg-red-950/30 hover:border-red-300 hover:text-red-600 transition-all">
                <Minus className="w-4 h-4" />
              </button>
              <div className="flex-1 text-center">
                <input type="number" value={delta}
                  onChange={(e) => setDelta(+e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border text-center font-bold text-lg bg-[hsl(var(--background))] focus:outline-none focus:ring-2 ${errors.delta ? "border-red-500 focus:ring-red-500/30" : "border-[hsl(var(--border))] focus:ring-blue-500/30"}`} />
              </div>
              <button type="button" onClick={() => setDelta((d) => d + 1)}
                className="w-9 h-9 rounded-lg border border-[hsl(var(--border))] flex items-center justify-center hover:bg-green-50 dark:hover:bg-green-950/30 hover:border-green-300 hover:text-green-600 transition-all">
                <Plus className="w-4 h-4" />
              </button>
            </div>
            {errors.delta && <p className="text-[11px] text-red-500 mt-0.5 text-center">{errors.delta}</p>}
            {delta !== 0 && (
              <p className={`text-xs text-center mt-2 font-semibold ${newStock < 0 ? "text-red-500" : newStock < product.minStock ? "text-amber-500" : "text-emerald-600"}`}>
                Stok baru: {newStock}
                {newStock < 0 && " ⚠ akan negatif"}
              </p>
            )}
          </div>

          <div>
            <label className="text-xs font-semibold text-[hsl(var(--muted-fg))] block mb-1">
              Catatan * <span className="font-normal">(wajib diisi)</span>
            </label>
            <input type="text" value={note} onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Stok opname, kerusakan, dll."
              className={`w-full px-3 py-2 rounded-lg border bg-[hsl(var(--background))] text-sm focus:outline-none focus:ring-2 ${errors.note ? "border-red-500 focus:ring-red-500/30" : "border-[hsl(var(--border))] focus:ring-blue-500/30"}`} />
            {errors.note && <p className="text-[11px] text-red-500 mt-0.5">{errors.note}</p>}
          </div>

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-[hsl(var(--border))] text-sm font-semibold">
              Batal
            </button>
            <button type="submit"
              className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-colors">
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============================================================
// Main Page (E3)
// ============================================================

export default function StokPage() {
  const { canView, canManage } = usePermission("stok");
  const products = useStore((s) => s.products);
  const orders = useStore((s) => s.orders);
  const [adjustTarget, setAdjustTarget] = useState<Product | null>(null);

  if (!canView) redirect("/tidak-ada-akses");

  // Pre-compute per product
  const productMetrics = useMemo(() => {
    return products.map((p) => {
      const tracked = p.trackStock !== false;
      const dailySales = calcDailySales(p.id, orders, 28);
      const daysLeft = dailySales > 0 ? Math.round(p.stock / dailySales) : null;
      const restockQty = Math.max(0, Math.round(dailySales * 14) - p.stock);

      // Dead stock: stok > 0 tapi tidak ada penjualan 60 hari
      const lastSale = calcLastSaleDate(p.id, orders);
      const daysSinceLastSale = lastSale
        ? Math.floor((Date.now() - new Date(lastSale).getTime()) / (1000 * 60 * 60 * 24))
        : Infinity;
      const isDeadStock = tracked && p.stock > 0 && daysSinceLastSale >= 60;

      return { product: p, dailySales, daysLeft, restockQty, isDeadStock, daysSinceLastSale };
    });
  }, [products, orders]);

  const lowStock = products.filter((p) => p.trackStock !== false && p.stock <= p.minStock);
  const negStock = products.filter((p) => p.stock < 0);
  const deadStock = productMetrics.filter((m) => m.isDeadStock);

  return (
    <DashboardLayout title="Stok" subtitle="Manajemen & analitik stok semua produk">
      <div className="space-y-5 animate-fade-in pb-12">
        <PageIntro
          title="Stok Barang"
          description="Pantau ketersediaan barang fisik, sisa hari stok aman, dan rekomendasi belanja restock untuk mencegah kehabisan barang."
          guideTitle="Panduan Manajemen Stok"
          guideSteps={[
            "Kolom 'Stok' menunjukkan unit barang fisik yang tersedia di toko/gudang.",
            "Batas 'Min' adalah jumlah minimal persediaan sebelum sistem memberi sinyal peringatan.",
            "'Cukup Berapa Hari' menghitung estimasi hari hingga stok habis berdasarkan kecepatan penjualan 28 hari terakhir.",
            "'Saran Restock' menghitung jumlah unit belanja yang disarankan untuk mencukupi operasional 14 hari ke depan.",
            "Gunakan tombol 'Sesuaikan' untuk mencatat selisih fisik barang (stok opname / barang rusak) dengan catatan wajib.",
          ]}
        />

        {/* Empty state if no products */}
        {products.length === 0 ? (
          <EmptyState
            icon={Package}
            title="Belum ada data produk untuk dipantau"
            description="Daftarkan produk Anda terlebih dahulu di menu Produk & Stok untuk melacak persediaan fisik dan rekomendasi belanja."
            actionLabel="Tambah Produk Baru"
            onAction={() => {
              window.location.href = "/produk";
            }}
          />
        ) : (
          <>
            {/* Alerts */}
            {negStock.length > 0 && (
              <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800">
                <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-red-800 dark:text-red-300 text-sm">Stok negatif — periksa pencatatan</p>
                  <p className="text-xs text-red-700 dark:text-red-400 mt-0.5">
                    {negStock.map((p) => `${p.name} (${p.stock})`).join(", ")}
                  </p>
                </div>
              </div>
            )}

            {lowStock.length > 0 && (
              <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
                <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-amber-800 dark:text-amber-300 text-sm">{lowStock.length} produk stok menipis</p>
                  <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
                    {lowStock.map((p) => `${p.name} (${p.stock} unit)`).join(", ")}
                  </p>
                </div>
              </div>
            )}

            {/* Summary cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {products.slice(0, 4).map((p) => (
                <div key={p.id} className="card">
                  <p className="text-xs font-medium text-[hsl(var(--muted-fg))] truncate mb-1">{p.name}</p>
                  <p className={`text-2xl font-bold ${p.stock < 0 ? "text-red-600" : p.stock <= p.minStock ? "text-amber-500" : ""}`}>{p.stock}</p>
                  <div className="mt-1 h-1.5 rounded-full bg-[hsl(var(--muted))] overflow-hidden">
                    <div className={`h-full rounded-full transition-all ${p.stock < 0 ? "bg-red-500" : p.stock <= p.minStock ? "bg-amber-500" : "bg-blue-500"}`}
                      style={{ width: `${Math.min(100, Math.max(0, (p.stock / (p.minStock * 3)) * 100))}%` }} />
                  </div>
                  <p className="text-[10px] text-[hsl(var(--muted-fg))] mt-1">Min: {p.minStock} unit</p>
                </div>
              ))}
            </div>

            {/* Main table */}
            <div className="card !p-0 overflow-hidden">
              <div className="px-4 py-3 border-b border-[hsl(var(--border))] flex items-center justify-between">
                <h3 className="font-semibold text-sm">Semua Produk</h3>
                {deadStock.length > 0 && (
                  <span className="flex items-center gap-1 text-xs font-semibold text-slate-500">
                    <PackageX className="w-3.5 h-3.5" /> {deadStock.length} <Hint term="Dead Stock">dead stock</Hint>
                  </span>
                )}
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[hsl(var(--border))] bg-[hsl(var(--muted))]">
                      <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wide text-[hsl(var(--muted-fg))]">Produk</th>
                      <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wide text-[hsl(var(--muted-fg))]">SKU</th>
                      <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wide text-[hsl(var(--muted-fg))]">Stok</th>
                      <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wide text-[hsl(var(--muted-fg))]">Batas Min</th>
                      <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wide text-[hsl(var(--muted-fg))]">
                        <Hint term="Cukup Berapa Hari">Cukup Berapa Hari</Hint>
                      </th>
                      <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wide text-[hsl(var(--muted-fg))]">
                        <Hint term="Restock">Saran Restock</Hint>
                      </th>
                      <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wide text-[hsl(var(--muted-fg))]">Status</th>
                      {canManage && <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wide text-[hsl(var(--muted-fg))]">Aksi</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {productMetrics.map(({ product: p, dailySales, daysLeft, restockQty, isDeadStock }) => {
                      const tracked = p.trackStock !== false;
                      const isLow = tracked && p.stock <= p.minStock;
                      const isNeg = p.stock < 0;
                      const pct = Math.min(100, Math.max(0, Math.round((p.stock / (p.minStock * 2)) * 100)));
                      return (
                        <tr key={p.id}
                          className={`border-b border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))]/50 transition-colors ${isNeg ? "bg-red-50/30 dark:bg-red-950/10" : ""}`}>
                          <td className="px-4 py-3 font-medium">
                            <div className="flex items-center gap-2">
                              {p.name}
                              {isDeadStock && (
                                <span className="flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                                  <PackageX className="w-2.5 h-2.5" /> Dead Stock
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 font-mono text-xs text-[hsl(var(--muted-fg))]">{p.sku}</td>
                          <td className="px-4 py-3">
                            {tracked ? (
                              <div className="flex items-center gap-3">
                                <span className={`font-bold text-base w-8 ${isNeg ? "text-red-600" : isLow ? "text-amber-500" : ""}`}>{p.stock}</span>
                                <div className="flex-1 h-1.5 rounded-full bg-[hsl(var(--muted))] max-w-[70px] overflow-hidden">
                                  <div className={`h-full rounded-full ${isNeg ? "bg-red-500" : isLow ? "bg-amber-500" : "bg-blue-500"}`} style={{ width: `${pct}%` }} />
                                </div>
                              </div>
                            ) : (
                              <span className="text-[hsl(var(--muted-fg))] text-xs">—</span>
                            )}
                            {isNeg && <p className="text-[10px] text-red-600 font-semibold">Stok negatif — periksa pencatatan</p>}
                          </td>
                          <td className="px-4 py-3 text-[hsl(var(--muted-fg))]">{p.minStock}</td>

                          {/* Cukup berapa hari */}
                          <td className="px-4 py-3">
                            {!tracked ? <span className="text-[hsl(var(--muted-fg))] text-xs">—</span>
                              : p.stock <= 0 ? <span className="text-red-500 text-xs font-semibold">Habis</span>
                              : daysLeft === null ? <span className="text-[hsl(var(--muted-fg))] text-xs">∞</span>
                              : (
                                <span className={`font-semibold text-xs ${daysLeft <= 3 ? "text-red-600" : daysLeft <= 7 ? "text-amber-500" : "text-emerald-600"}`}>
                                  {daysLeft} hari
                                </span>
                              )
                            }
                          </td>

                          {/* Rekomendasi restock */}
                          <td className="px-4 py-3">
                            {!tracked ? <span className="text-[hsl(var(--muted-fg))] text-xs">—</span>
                              : restockQty === 0 ? <span className="text-emerald-600 text-xs font-semibold">Cukup</span>
                              : (
                                <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                                  +{restockQty} unit
                                </span>
                              )
                            }
                          </td>

                          <td className="px-4 py-3">
                            {!tracked ? <span className="text-[hsl(var(--muted-fg))] text-xs">No Track</span>
                              : isNeg ? <span className="flex items-center gap-1 text-[11px] font-semibold text-red-600"><AlertTriangle className="w-3 h-3" /> Negatif</span>
                              : isLow ? <span className="flex items-center gap-1 text-[11px] font-semibold text-amber-700 dark:text-amber-400"><AlertTriangle className="w-3 h-3" /> Menipis</span>
                              : isDeadStock ? <span className="text-[11px] font-semibold text-slate-500">Dead Stock</span>
                              : <span className="text-[11px] text-emerald-600 font-semibold">Aman</span>
                            }
                          </td>

                          {canManage && (
                            <td className="px-4 py-3">
                              <button onClick={() => setAdjustTarget(p)}
                                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-[hsl(var(--border))] text-xs font-semibold hover:bg-[hsl(var(--muted))] transition-colors">
                                <RefreshCw className="w-3 h-3" /> Sesuaikan
                              </button>
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>

      {adjustTarget && (
        <AdjustStockModal product={adjustTarget} onClose={() => setAdjustTarget(null)} />
      )}
    </DashboardLayout>
  );
}
