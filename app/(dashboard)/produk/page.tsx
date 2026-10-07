"use client";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageIntro } from "@/components/ui/PageIntro";
import { EmptyState } from "@/components/ui/EmptyState";
import { Hint } from "@/components/ui/Hint";
import { usePermission } from "@/hooks/usePermission";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useStore } from "@/lib/store";
import { formatRp } from "@/lib/finance";
import { redirect } from "next/navigation";
import {
  AlertTriangle, Package, X, History, TrendingDown,
  TrendingUp, Plus, ToggleLeft, ToggleRight,
} from "lucide-react";
import { useState } from "react";
import type { Product, ProductType, Channel } from "@/types";

// ============================================================
// Constants
// ============================================================

const PRODUCT_TYPE_LABEL: Record<ProductType, string> = {
  dagang: "Barang Dagangan",
  produksi: "Produksi",
  jasa: "Jasa",
};
const PRODUCT_TYPE_COLOR: Record<ProductType, string> = {
  dagang: "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300",
  produksi: "bg-violet-100 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300",
  jasa: "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
};

// ============================================================
// Stock Ledger Drawer
// ============================================================

function StockLedgerDrawer({ product, onClose }: { product: Product; onClose: () => void }) {
  const movements = useStore((s) =>
    s.stockMovements
      .filter((m) => m.productId === product.id)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 25)
  );
  const { canView: canViewFinance } = usePermission("laporan_keuangan");

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="w-full max-w-md bg-[hsl(var(--card))] border-l border-[hsl(var(--border))] h-full overflow-y-auto p-6 space-y-4">
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
            <p className={`text-xl font-bold ${product.stock < 0 ? "text-red-600" : product.stock <= product.minStock ? "text-amber-500" : ""}`}>
              {product.stock}
            </p>
            {product.stock < 0 && <p className="text-[10px] text-red-500 mt-0.5">Stok negatif</p>}
          </div>
          <div className="card !p-3 text-center">
            <p className="text-xs text-[hsl(var(--muted-fg))]">Min Stok</p>
            <p className="text-xl font-bold">{product.minStock}</p>
          </div>
          <div className="card !p-3 text-center">
            <p className="text-xs text-[hsl(var(--muted-fg))]">Harga Jual</p>
            <p className="text-sm font-bold">{formatRp(product.sellPrice)}</p>
          </div>
        </div>

        {/* HPP hanya jika punya akses laporan_keuangan */}
        {canViewFinance && product.avgCost && product.avgCost > 0 && (
          <div className="card !p-3 flex items-center justify-between">
            <div>
              <p className="text-xs text-[hsl(var(--muted-fg))]">HPP rata-rata (avg cost)</p>
              <p className="font-bold text-sm">{formatRp(product.avgCost)}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-[hsl(var(--muted-fg))]">Margin</p>
              <p className="font-bold text-sm text-emerald-600">
                {product.avgCost > 0
                  ? `${Math.round(((product.sellPrice - product.avgCost) / product.sellPrice) * 100)}%`
                  : "—"}
              </p>
            </div>
          </div>
        )}

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
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${m.qty > 0 ? "bg-green-100 dark:bg-green-900/30" : "bg-red-100 dark:bg-red-900/30"}`}>
                    {m.qty > 0 ? <TrendingUp className="w-3.5 h-3.5 text-green-600" /> : <TrendingDown className="w-3.5 h-3.5 text-red-600" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium capitalize">
                      {m.type === "sale" ? "Penjualan" : m.type === "purchase" ? "Pembelian" : "Penyesuaian"}
                    </p>
                    <p className="text-[10px] text-[hsl(var(--muted-fg))] font-mono truncate">{m.refId}</p>
                    {m.note && <p className="text-[10px] text-[hsl(var(--muted-fg))] italic">{m.note}</p>}
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

// ============================================================
// Add Product Modal (E1)
// ============================================================

function AddProductModal({ onClose }: { onClose: () => void }) {
  const addProduct = useStore((s) => s.addProduct);
  const [form, setForm] = useState({
    name: "",
    sku: "",
    productType: "dagang" as ProductType,
    trackStock: true,
    sellPrice: 0,
    buyPrice: 0,
    stock: 0,
    minStock: 5,
    channels: ["marketplace_a", "marketplace_b", "offline"] as Channel[],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate() {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = "Nama produk wajib diisi";
    if (!form.sku.trim()) errs.sku = "SKU wajib diisi";
    if (form.sellPrice <= 0) errs.sellPrice = "Harga jual harus > 0";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    addProduct({
      ...form,
      tenantId: undefined,
      avgCost: form.buyPrice > 0 ? form.buyPrice : undefined,
    });
    onClose();
  }

  const CHANNELS_OPTS: { value: Channel; label: string }[] = [
    { value: "marketplace_a", label: "Shopee" },
    { value: "marketplace_b", label: "Tokopedia" },
    { value: "chat", label: "WhatsApp" },
    { value: "offline", label: "Offline" },
  ];

  function toggleChannel(ch: Channel) {
    setForm((f) => ({
      ...f,
      channels: f.channels.includes(ch)
        ? f.channels.filter((c) => c !== ch)
        : [...f.channels, ch],
    }));
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[hsl(var(--card))] rounded-2xl border border-[hsl(var(--border))] shadow-2xl w-full max-w-lg p-6 animate-fade-in my-4">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold text-base flex items-center gap-2">
            <Package className="w-5 h-5 text-blue-500" /> Tambah Produk Baru
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[hsl(var(--muted))] transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nama & SKU */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-[hsl(var(--muted-fg))] block mb-1">Nama Produk *</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                className={`w-full px-3 py-2 rounded-lg border bg-[hsl(var(--background))] text-sm focus:outline-none focus:ring-2 ${errors.name ? "border-red-500 focus:ring-red-500/30" : "border-[hsl(var(--border))] focus:ring-blue-500/30"}`}
                placeholder="Nama produk" />
              {errors.name && <p className="text-[11px] text-red-500 mt-0.5">{errors.name}</p>}
            </div>
            <div>
              <label className="text-xs font-semibold text-[hsl(var(--muted-fg))] block mb-1">SKU *</label>
              <input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })}
                className={`w-full px-3 py-2 rounded-lg border bg-[hsl(var(--background))] text-sm focus:outline-none focus:ring-2 ${errors.sku ? "border-red-500 focus:ring-red-500/30" : "border-[hsl(var(--border))] focus:ring-blue-500/30"}`}
                placeholder="e.g. SKU-001" />
              {errors.sku && <p className="text-[11px] text-red-500 mt-0.5">{errors.sku}</p>}
            </div>
          </div>

          {/* Jenis Produk + Lacak Stok */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-[hsl(var(--muted-fg))] block mb-1">Jenis Produk</label>
              <div className="flex flex-col gap-1">
                {(["dagang", "produksi", "jasa"] as ProductType[]).map((t) => (
                  <button key={t} type="button" onClick={() => setForm({ ...form, productType: t })}
                    className={`text-left px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${form.productType === t ? "border-blue-500 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300" : "border-[hsl(var(--border))] text-[hsl(var(--muted-fg))]"}`}>
                    {PRODUCT_TYPE_LABEL[t]}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-[hsl(var(--muted-fg))] block mb-1">Lacak Stok</label>
              <button type="button" onClick={() => setForm({ ...form, trackStock: !form.trackStock })}
                className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[hsl(var(--border))] text-sm">
                {form.trackStock
                  ? <ToggleRight className="w-5 h-5 text-blue-500" />
                  : <ToggleLeft className="w-5 h-5 text-[hsl(var(--muted-fg))]" />}
                <span className="text-sm">{form.trackStock ? "Aktif" : "Nonaktif"}</span>
              </button>
              {!form.trackStock && (
                <p className="text-[11px] text-[hsl(var(--muted-fg))] mt-1">Produk jasa biasanya tidak perlu lacak stok</p>
              )}
            </div>
          </div>

          {/* Harga */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-[hsl(var(--muted-fg))] block mb-1">Harga Jual (Rp) *</label>
              <input type="number" min={0} value={form.sellPrice}
                onChange={(e) => setForm({ ...form, sellPrice: +e.target.value })}
                className={`w-full px-3 py-2 rounded-lg border bg-[hsl(var(--background))] text-sm focus:outline-none focus:ring-2 ${errors.sellPrice ? "border-red-500" : "border-[hsl(var(--border))] focus:ring-blue-500/30"}`} />
              {errors.sellPrice && <p className="text-[11px] text-red-500 mt-0.5">{errors.sellPrice}</p>}
            </div>
            <div>
              <label className="text-xs font-semibold text-[hsl(var(--muted-fg))] block mb-1">Harga Beli / HPP Awal (Rp)</label>
              <input type="number" min={0} value={form.buyPrice}
                onChange={(e) => setForm({ ...form, buyPrice: +e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
            </div>
          </div>

          {/* Stok awal & Min */}
          {form.trackStock && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-[hsl(var(--muted-fg))] block mb-1">Stok Awal</label>
                <input type="number" min={0} value={form.stock}
                  onChange={(e) => setForm({ ...form, stock: +e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
              </div>
              <div>
                <label className="text-xs font-semibold text-[hsl(var(--muted-fg))] block mb-1">Min Stok (alert)</label>
                <input type="number" min={0} value={form.minStock}
                  onChange={(e) => setForm({ ...form, minStock: +e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
              </div>
            </div>
          )}

          {/* Kanal */}
          <div>
            <label className="text-xs font-semibold text-[hsl(var(--muted-fg))] block mb-2">Kanal Penjualan</label>
            <div className="flex gap-2 flex-wrap">
              {CHANNELS_OPTS.map(({ value, label }) => (
                <button key={value} type="button" onClick={() => toggleChannel(value)}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${form.channels.includes(value) ? "border-blue-500 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300" : "border-[hsl(var(--border))] text-[hsl(var(--muted-fg))]"}`}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-[hsl(var(--border))] text-sm font-semibold">
              Batal
            </button>
            <button type="submit"
              className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-colors">
              Simpan Produk
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============================================================
// Main Page
// ============================================================

export default function ProdukPage() {
  const { canView, canManage } = usePermission("produk");
  const { canView: canViewFinance } = usePermission("laporan_keuangan");
  const products = useStore((s) => s.products);
  const [selected, setSelected] = useState<Product | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [filterType, setFilterType] = useState<ProductType | "">("");

  if (!canView) redirect("/tidak-ada-akses");

  const filtered = filterType
    ? products.filter((p) => (p.productType ?? "dagang") === filterType)
    : products;

  return (
    <DashboardLayout title="Produk" subtitle={`${products.length} produk terdaftar`}>
      {/* Page Intro with Help and Action Button */}
      <PageIntro
        title="Produk dan Stok"
        description="Katalog barang dagangan, pengaturan harga jual, modal pokok barang (HPP), batas stok minimum, dan kanal distribusi tokomu."
        badge={`${products.length} Produk`}
        helpTips={[
          {
            title: "Tambah Produk Baru",
            description: "Klik 'Tambah Produk' untuk memasukkan SKU, nama barang, harga jual, dan modal awal.",
          },
          {
            title: "Batas Stok Minimum",
            description: "Atur batas stok minimum pada setiap barang agar kamu menerima notifikasi sebelum persediaan habis total.",
          },
          {
            title: "Modal Pokok (HPP Moving Average)",
            description: "Sistem otomatis menghitung rata-rata modal pokok barang setiap kali kamu mencatat belanja stok baru di menu Pengeluaran.",
          },
          {
            title: "Kartu Mutasi Stok",
            description: "Klik pada baris produk untuk melihat buku besar riwayat keluar/masuk stok akibat penjualan atau belanja.",
          },
        ]}
        primaryAction={
          canManage ? (
            <button
              onClick={() => setShowAddModal(true)}
              id="add-product-btn"
              data-shortcut="new"
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors shadow-md shadow-blue-500/20 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Tambah Produk
            </button>
          ) : undefined
        }
      />

      {/* Filter Toolbar */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div className="flex gap-1.5 flex-wrap">
          {([
            { value: "", label: "Semua" },
            { value: "dagang", label: "Barang Dagangan" },
            { value: "produksi", label: "Produksi" },
            { value: "jasa", label: "Jasa" },
          ] as { value: ProductType | ""; label: string }[]).map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setFilterType(value)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${filterType === value ? "border-blue-500 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300" : "border-[hsl(var(--border))] text-[hsl(var(--muted-fg))] hover:border-blue-300"}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Package className="w-7 h-7" />}
          title={filterType ? "Tidak Ada Produk untuk Filter Ini" : "Belum Ada Produk Terdaftar"}
          description={
            filterType
              ? "Tidak ada produk yang cocok dengan tipe yang dipilih. Coba pilih kategori 'Semua'."
              : "Tambahkan produk pertamamu untuk mulai mencatat transaksi penjualan dan melacak mutasi persediaan barang."
          }
          actionText={canManage ? "Tambah Produk Pertama" : undefined}
          onAction={canManage ? () => setShowAddModal(true) : undefined}
          secondaryActionText={filterType ? "Tampilkan Semua" : undefined}
          onSecondaryAction={() => setFilterType("")}
        />
      ) : (
        <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[hsl(var(--border))] bg-[hsl(var(--muted))]/50">
                  {[
                    "SKU", "Nama Produk", "Jenis", "Harga Jual",
                    ...(canViewFinance ? ["Modal per Barang"] : []),
                    "Stok", "Min", "Kanal", "Status"
                  ].map((h) => (
                    <th key={h} className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wide text-[hsl(var(--muted-fg))]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => {
                  const isLow = (p.trackStock !== false) && p.stock <= p.minStock;
                  const isNeg = p.stock < 0;
                  const pType: ProductType = p.productType ?? "dagang";
                  return (
                    <tr
                      key={p.id}
                      onClick={() => setSelected(p)}
                      className="border-b border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))]/50 transition-colors cursor-pointer"
                    >
                      <td className="px-4 py-3 font-mono text-xs text-[hsl(var(--muted-fg))]">{p.sku}</td>
                      <td className="px-4 py-3 font-medium">
                        <div className="flex items-center gap-2">
                          <span className="text-[hsl(var(--foreground))]">{p.name}</span>
                          {p.trackStock === false && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[hsl(var(--muted))] text-[hsl(var(--muted-fg))]">Tanpa Stok</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${PRODUCT_TYPE_COLOR[pType]}`}>
                          {PRODUCT_TYPE_LABEL[pType]}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-semibold text-[hsl(var(--foreground))]">{formatRp(p.sellPrice)}</td>
                      {/* E1: HPP disembunyikan jika tidak punya akses laporan_keuangan */}
                      {canViewFinance && (
                        <td className="px-4 py-3 text-[hsl(var(--muted-fg))]">
                          {p.avgCost ? formatRp(p.avgCost) : formatRp(p.buyPrice)}
                        </td>
                      )}
                      <td className="px-4 py-3">
                        {p.trackStock === false ? (
                          <span className="text-[hsl(var(--muted-fg))] text-xs">—</span>
                        ) : isNeg ? (
                          <span className="font-bold text-red-600">{p.stock} <span className="text-[10px] font-normal">⚠ minus</span></span>
                        ) : (
                          <span className={`font-bold ${isLow ? "text-amber-500" : ""}`}>{p.stock}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-[hsl(var(--muted-fg))]">{p.minStock}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1 flex-wrap">
                          {(p.channels.includes("marketplace_a") || (p.channels as string[]).includes("shopee")) && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold bg-orange-100 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300">Shopee</span>
                          )}
                          {(p.channels.includes("marketplace_b") || (p.channels as string[]).includes("tokopedia")) && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-300">Tokopedia</span>
                          )}
                          {p.channels.includes("offline") && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">Offline</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {isNeg ? (
                          <span className="text-[11px] font-semibold text-red-600 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" /> Minus
                          </span>
                        ) : isLow ? (
                          <span className="flex items-center gap-1 text-[11px] font-semibold text-amber-700 dark:text-amber-400">
                            <AlertTriangle className="w-3 h-3" /> Menipis
                          </span>
                        ) : (
                          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">Aman</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selected && <StockLedgerDrawer product={selected} onClose={() => setSelected(null)} />}
      {showAddModal && <AddProductModal onClose={() => setShowAddModal(false)} />}
    </DashboardLayout>
  );
}
