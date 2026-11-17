"use client";

import { useStore } from "@/lib/store";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { usePermission } from "@/hooks/usePermission";
import { formatDate, formatRp } from "@/lib/finance";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageIntro } from "@/components/ui/PageIntro";
import { EmptyState } from "@/components/ui/EmptyState";
import { redirect } from "next/navigation";
import {
  Search, X, Plus, ExternalLink, Package, Calendar,
  AlertTriangle, Ban, ChevronRight, ChevronDown, Sparkles,
} from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import type { PaymentStatus, ShipmentStatus, Order, OrderItem, Product } from "@/types";

// ============================================================
// Constants
// ============================================================

const PAYMENT_LABEL: Record<PaymentStatus, string> = {
  lunas: "Lunas", sebagian: "Sebagian", belum: "Belum Lunas", gagal: "Gagal",
};
const SHIPMENT_LABEL: Record<ShipmentStatus, string> = {
  baru: "Baru", diproses: "Diproses", dikemas: "Dikemas", dikirim: "Dikirim", selesai: "Selesai",
};

// ============================================================
// Badges
// ============================================================

function PaymentBadge({ status }: { status: PaymentStatus }) {
  const colors: Record<PaymentStatus, string> = {
    lunas: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
    sebagian: "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 hover:ring-1 hover:ring-amber-400",
    belum: "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300 hover:ring-1 hover:ring-red-400",
    gagal: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
  };

  const badgeContent = (
    <span
      className={`text-[11px] font-semibold px-2 py-0.5 rounded-full transition-all inline-flex items-center gap-1 ${
        colors[status]
      }`}
    >
      {PAYMENT_LABEL[status]}
    </span>
  );

  if (status === "belum" || status === "sebagian") {
    return (
      <Link
        href="/pembayaran"
        title="Klik untuk melihat tagihan & mencatat pembayaran"
        className="cursor-pointer inline-block"
      >
        {badgeContent}
      </Link>
    );
  }

  return badgeContent;
}

function ShipmentBadge({ status }: { status: ShipmentStatus }) {
  const colors: Record<ShipmentStatus, string> = {
    baru: "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 hover:ring-1 hover:ring-blue-400",
    diproses: "bg-violet-100 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300 hover:ring-1 hover:ring-violet-400",
    dikemas: "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 hover:ring-1 hover:ring-amber-400",
    dikirim: "bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 hover:ring-1 hover:ring-indigo-400",
    selesai: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
  };

  return (
    <Link
      href="/pengiriman"
      title="Klik untuk membuka papan pengiriman"
      className="cursor-pointer inline-block"
    >
      <span
        className={`text-[11px] font-semibold px-2 py-0.5 rounded-full transition-all inline-flex items-center gap-1 ${
          colors[status]
        }`}
      >
        {SHIPMENT_LABEL[status]}
      </span>
    </Link>
  );
}

// ============================================================
// C1 — Add Manual Order Modal
// ============================================================



function ProductAutocomplete({
  products,
  selectedId,
  onSelect,
  row,
}: {
  products: Product[];
  selectedId: string;
  onSelect: (productId: string) => void;
  row: number;
}) {
  const selected = products.find((product) => product.id === selectedId);
  const [query, setQuery] = useState(selected?.name ?? "");
  const [open, setOpen] = useState(false);
  const [filterType, setFilterType] = useState<"all" | "dagang" | "produksi">("all");

  useEffect(() => {
    if (selected) {
      setQuery(selected.name);
    }
  }, [selected?.name]);

  const dagangCount = useMemo(
    () => products.filter((p) => (p.productType ?? "dagang") === "dagang").length,
    [products]
  );
  const produksiCount = useMemo(
    () => products.filter((p) => p.productType === "produksi").length,
    [products]
  );

  const filteredByType = useMemo(() => {
    if (filterType === "all") return products;
    return products.filter((p) => (p.productType ?? "dagang") === filterType);
  }, [products, filterType]);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    // Jika dropdown dibuka dan teks masih sama dengan produk yang terpilih, tampilkan semua opsi
    if (!q || (selected && q === selected.name.toLowerCase())) {
      return filteredByType;
    }
    return filteredByType.filter((product) =>
      product.name.toLowerCase().includes(q) ||
      product.sku.toLowerCase().includes(q)
    );
  }, [filteredByType, query, selected]);

  return (
    <div className="relative min-w-0">
      <div className="relative">
        <input
          type="text"
          value={query}
          onFocus={() => setOpen(true)}
          onClick={() => setOpen(true)}
          onChange={(event) => {
            setQuery(event.target.value);
            onSelect("");
            setOpen(true);
          }}
          onBlur={() => window.setTimeout(() => setOpen(false), 200)}
          placeholder="Cari atau pilih produk..."
          autoComplete="off"
          role="combobox"
          aria-expanded={open && matches.length > 0}
          aria-controls={`product-options-${row}`}
          aria-autocomplete="list"
          aria-label={`Cari produk baris ${row + 1}`}
          className="w-full pr-7 pl-2.5 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-xs focus:outline-none focus:ring-1 focus:ring-blue-500/30"
        />
        <button
          type="button"
          tabIndex={-1}
          onMouseDown={(e) => {
            e.preventDefault();
            setOpen((prev) => !prev);
          }}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-fg))] hover:text-[hsl(var(--foreground))]"
        >
          <ChevronDown className="w-3.5 h-3.5" />
        </button>
      </div>

      {open && (
        <div
          id={`product-options-${row}`}
          role="listbox"
          className="absolute z-30 top-full left-0 right-0 mt-1 max-h-64 overflow-hidden flex flex-col rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-xl"
        >
          {/* Sub-selector Filter Kategori: Produk Jadi vs Produksi Sendiri */}
          <div className="p-1.5 border-b border-[hsl(var(--border))] bg-[hsl(var(--muted))]/50 flex gap-1 items-center flex-wrap">
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => setFilterType("all")}
              className={`px-2 py-0.5 rounded-md text-[10px] font-semibold transition-all cursor-pointer ${
                filterType === "all"
                  ? "bg-blue-600 text-white shadow-2xs"
                  : "bg-[hsl(var(--card))] border border-[hsl(var(--border))] text-[hsl(var(--muted-fg))] hover:text-[hsl(var(--foreground))]"
              }`}
            >
              Semua ({products.length})
            </button>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => setFilterType("dagang")}
              className={`px-2 py-0.5 rounded-md text-[10px] font-semibold transition-all flex items-center gap-1 cursor-pointer ${
                filterType === "dagang"
                  ? "bg-blue-600 text-white shadow-2xs"
                  : "bg-[hsl(var(--card))] border border-[hsl(var(--border))] text-[hsl(var(--muted-fg))] hover:text-blue-600"
              }`}
            >
              <Package className="w-2.5 h-2.5" />
              Produk Jadi ({dagangCount})
            </button>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => setFilterType("produksi")}
              className={`px-2 py-0.5 rounded-md text-[10px] font-semibold transition-all flex items-center gap-1 cursor-pointer ${
                filterType === "produksi"
                  ? "bg-violet-600 text-white shadow-2xs"
                  : "bg-[hsl(var(--card))] border border-[hsl(var(--border))] text-[hsl(var(--muted-fg))] hover:text-violet-600"
              }`}
            >
              <Sparkles className="w-2.5 h-2.5" />
              Produksi Sendiri ({produksiCount})
            </button>
          </div>

          <div className="max-h-52 overflow-y-auto divide-y divide-[hsl(var(--border))]/50">
            {matches.length > 0 ? (
              matches.map((product) => {
                const isProduksi = product.productType === "produksi";
                return (
                  <button
                    key={product.id}
                    type="button"
                    role="option"
                    aria-selected={product.id === selectedId}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => {
                      setQuery(product.name);
                      onSelect(product.id);
                      setOpen(false);
                    }}
                    className={`w-full min-h-11 px-3 py-2 text-left text-xs hover:bg-[hsl(var(--muted))] transition-colors flex items-center justify-between gap-2 cursor-pointer ${
                      product.id === selectedId ? "bg-blue-50/70 dark:bg-blue-950/30" : ""
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-semibold text-[hsl(var(--foreground))]">{product.name}</span>
                        <span
                          className={`text-[9px] font-semibold px-1.5 py-0.2 rounded-full ${
                            isProduksi
                              ? "bg-violet-100 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300"
                              : "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300"
                          }`}
                        >
                          {isProduksi ? "🍳 Produksi Sendiri" : "📦 Produk Jadi"}
                        </span>
                      </div>
                      <span className="text-[10px] text-[hsl(var(--muted-fg))]">
                        Kode: {product.sku} · Stok: {product.stock}
                      </span>
                    </div>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400 shrink-0">
                      {formatRp(product.sellPrice)}
                    </span>
                  </button>
                );
              })
            ) : (
              <p className="px-3 py-4 text-xs text-[hsl(var(--muted-fg))] text-center">
                Produk tidak ditemukan. Coba ketik nama atau kode lain.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function AddManualOrderModal({ onClose }: { onClose: () => void }) {
  const rawProducts = useStore((s) => s.products);
  const activeTenantId = useStore((s) => s.activeTenantId);
  const products = useMemo(
    () => rawProducts.filter((p) => p.tenantId === activeTenantId),
    [rawProducts, activeTenantId]
  );
  const addOrder = useStore((s) => s.addOrder);

  const [step, setStep] = useState<1 | 2>(1);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [payNow, setPayNow] = useState(true);
  const [dueDate, setDueDate] = useState("");
  const [discount, setDiscount] = useState(0);
  const [shippingCost, setShippingCost] = useState(0);
  const [note, setNote] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [items, setItems] = useState<OrderItem[]>([
    { productId: products[0]?.id ?? "", qty: 1, unitPrice: products[0]?.sellPrice ?? 0 },
  ]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function addItem() {
    const p = products[0];
    setItems([...items, { productId: p?.id ?? "", qty: 1, unitPrice: p?.sellPrice ?? 0 }]);
  }

  function updateItem(idx: number, field: keyof OrderItem, value: string | number) {
    setItems(items.map((it, i) => {
      if (i !== idx) return it;
      if (field === "productId") {
        const p = products.find((p) => p.id === value);
        return { ...it, productId: value as string, unitPrice: p?.sellPrice ?? it.unitPrice };
      }
      return { ...it, [field]: value };
    }));
  }

  function removeItem(idx: number) {
    if (items.length > 1) setItems(items.filter((_, i) => i !== idx));
  }

  const subtotal = items.reduce((s, it) => s + it.qty * it.unitPrice, 0);
  const adminFee = 0;
  const totalDiterima = subtotal - discount - adminFee - shippingCost;

  function validateItems() {
    const errs: Record<string, string> = {};
    if (!date) errs.date = "Pilih tanggal transaksi.";
    if (items.length === 0 || items.some((it) => !it.productId)) errs.items = "Pilih produk untuk setiap baris.";
    else if (items.some((it) => it.qty <= 0 || it.unitPrice <= 0)) {
      errs.items = "Jumlah dan harga setiap barang harus lebih dari 0.";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function saveOrder(keepOpen: boolean) {
    const errs: Record<string, string> = {};
    if (!date) errs.date = "Pilih tanggal transaksi.";
    if (items.some((it) => !it.productId)) errs.items = "Pilih produk untuk setiap baris.";
    if (items.some((it) => it.qty <= 0)) errs.items = "Jumlah setiap barang harus lebih dari 0.";
    if (items.some((it) => it.unitPrice <= 0)) errs.items = "Harga setiap barang harus lebih dari 0.";
    if (!payNow && !dueDate) errs.dueDate = "Pilih tanggal jatuh tempo untuk penjualan tempo.";
    if (totalDiterima < 0) errs.amount = "Total yang diterima tidak boleh kurang dari Rp0. Kurangi diskon atau ongkir.";
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    addOrder({
      date,
      items,
      subtotal,
      discount,
      adminFee,
      shippingCost,
      paymentStatus: payNow ? "lunas" : "belum",
      shipmentStatus: "baru",
      dueDate: !payNow ? dueDate : undefined,
      note: note || undefined,
    });
    if (keepOpen) {
      setPayNow(true);
      setDueDate("");
      setDiscount(0);
      setShippingCost(0);
      setNote("");
      setDate(new Date().toISOString().split("T")[0]);
      setItems([{ productId: products[0]?.id ?? "", qty: 1, unitPrice: products[0]?.sellPrice ?? 0 }]);
      setErrors({});
      setShowAdvanced(false);
      setStep(1);
    } else {
      onClose();
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (step === 1) {
      if (validateItems()) {
        setErrors({});
        setStep(2);
      }
      return;
    }
    saveOrder(false);
  }



  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[hsl(var(--card))] rounded-2xl border border-[hsl(var(--border))] shadow-2xl w-full max-w-2xl p-6 animate-fade-in my-4">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="font-bold text-base">Input Penjualan</h2>
            <p className="text-xs text-[hsl(var(--muted-fg))] mt-1">
              Langkah {step} dari 2: {step === 1 ? "Daftar barang" : "Pembayaran"}
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[hsl(var(--muted))] transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-2" aria-label="Langkah input penjualan">
            {[1, 2].map((number) => (
              <div key={number} className={`h-1.5 flex-1 rounded-full ${step >= number ? "bg-blue-600" : "bg-[hsl(var(--muted))]"}`} />
            ))}
          </div>
          {step === 1 && (
            <>
          {/* Tanggal transaksi */}
          <div>
            <label className="text-xs font-semibold text-[hsl(var(--muted-fg))] block mb-1">Tanggal *</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
            {errors.date && <p className="text-[11px] text-red-500 mt-0.5" role="alert">{errors.date}</p>}
          </div>

          {/* Item */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-[hsl(var(--muted-fg))]">Item Produk *</label>
              <button type="button" onClick={addItem}
                className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1">
                <Plus className="w-3 h-3" /> Tambah Baris
              </button>
            </div>
            {errors.items && <p className="text-[11px] text-red-500 mb-1">{errors.items}</p>}
            <div className="space-y-2">
              {items.map((item, idx) => (
                <div key={idx} className="grid grid-cols-[1fr_70px_110px_auto] gap-2 items-center">
                  <ProductAutocomplete
                    products={products}
                    selectedId={item.productId}
                    row={idx}
                    onSelect={(productId) => updateItem(idx, "productId", productId)}
                  />
                  <input type="number" min={1} value={item.qty}
                    aria-label={`Jumlah baris ${idx + 1}`}
                    onChange={(e) => updateItem(idx, "qty", +e.target.value)}
                    className="px-2.5 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-xs focus:outline-none focus:ring-1 focus:ring-blue-500/30"
                    placeholder="Contoh: 2" />
                  <input type="number" min={0} value={item.unitPrice}
                    aria-label={`Harga satuan baris ${idx + 1}`}
                    onChange={(e) => updateItem(idx, "unitPrice", +e.target.value)}
                    className="px-2.5 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-xs focus:outline-none focus:ring-1 focus:ring-blue-500/30"
                    placeholder="Contoh: 25000" />
                  <button type="button" onClick={() => removeItem(idx)}
                    className="p-1.5 rounded-lg text-[hsl(var(--muted-fg))] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Ringkasan Total Penjualan */}
            <div className="mt-3 p-3 rounded-xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-[hsl(var(--foreground))]">Total Harga Penjualan</p>
                <p className="text-[11px] text-[hsl(var(--muted-fg))]">
                  {items.reduce((acc, it) => acc + (Number(it.qty) || 0), 0)} pcs ({items.length} item)
                </p>
              </div>
              <div className="text-right">
                <span className="text-base font-bold text-blue-600 dark:text-blue-400">
                  {formatRp(subtotal)}
                </span>
              </div>
            </div>
          </div>
            </>
          )}

          {step === 2 && (
            <>
          {/* Diskon + Ongkir */}
          <div className="rounded-xl bg-[hsl(var(--muted))]/60 p-3 flex items-center justify-between">
            <div>
              <p className="font-semibold text-sm">{items.length} jenis barang</p>
              <p className="text-xs text-[hsl(var(--muted-fg))] mt-0.5">Pilih cara pembayaran untuk transaksi ini.</p>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-[hsl(var(--muted-fg))] block">Total Penjualan</span>
              <span className="text-base font-bold text-blue-600 dark:text-blue-400">{formatRp(subtotal)}</span>
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-[hsl(var(--muted-fg))] block mb-2">Pembayaran</label>
            <div className="flex gap-2">
              {[{ v: true, label: "Bayar Sekarang" }, { v: false, label: "Tempo" }].map(({ v, label }) => (
                <button key={String(v)} type="button" onClick={() => setPayNow(v)}
                  className={`flex-1 min-h-11 rounded-lg border text-xs font-semibold transition-all ${payNow === v ? "border-blue-500 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300" : "border-[hsl(var(--border))] text-[hsl(var(--muted-fg))] hover:border-blue-300"}`}>
                  {label}
                </button>
              ))}
            </div>
            {!payNow && (
              <div className="mt-2">
                <label className="text-xs font-semibold text-[hsl(var(--muted-fg))] block mb-1">Tanggal Jatuh Tempo *</label>
                <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border bg-[hsl(var(--background))] text-sm focus:outline-none focus:ring-2 ${errors.dueDate ? "border-red-500 focus:ring-red-500/30" : "border-[hsl(var(--border))] focus:ring-blue-500/30"}`} />
                {errors.dueDate && <p className="text-[11px] text-red-500 mt-0.5">{errors.dueDate}</p>}
              </div>
            )}
          </div>
          <div>
            <button type="button" onClick={() => setShowAdvanced((open) => !open)}
              aria-expanded={showAdvanced}
              className="min-h-11 flex items-center gap-2 text-xs font-semibold text-blue-700 dark:text-blue-300">
              {showAdvanced ? "Sembunyikan" : "Atur diskon, ongkir, dan catatan"}
              <ChevronRight className={`w-4 h-4 transition-transform ${showAdvanced ? "rotate-90" : ""}`} />
            </button>
            {showAdvanced && (
              <div className="mt-2 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-[hsl(var(--muted-fg))] block mb-1">Diskon Penjual (Rp)</label>
              <input type="number" min={0} value={discount} onChange={(e) => setDiscount(+e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                placeholder="Contoh: 5000" />
            </div>
            <div>
              <label className="text-xs font-semibold text-[hsl(var(--muted-fg))] block mb-1">Ongkir Ditanggung Penjual (Rp)</label>
              <input type="number" min={0} value={shippingCost} onChange={(e) => setShippingCost(+e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                placeholder="Contoh: 10000" />
            </div>
          </div>

          {/* Rincian biaya */}
          <div className="rounded-xl bg-[hsl(var(--muted))] p-3 text-xs space-y-1.5">
            <div className="flex justify-between"><span className="text-[hsl(var(--muted-fg))]">Subtotal</span><span>{formatRp(subtotal)}</span></div>
            {discount > 0 && <div className="flex justify-between"><span className="text-[hsl(var(--muted-fg))]">Diskon</span><span className="text-red-500">−{formatRp(discount)}</span></div>}

            {shippingCost > 0 && <div className="flex justify-between"><span className="text-[hsl(var(--muted-fg))]">Ongkir</span><span className="text-red-500">−{formatRp(shippingCost)}</span></div>}
            <div className="h-px bg-[hsl(var(--border))]" />
            <div className="flex justify-between font-bold"><span>Total Diterima</span><span className="text-emerald-600 dark:text-emerald-400">{formatRp(totalDiterima)}</span></div>
          </div>

          {/* Catatan */}
          <div>
            <label className="text-xs font-semibold text-[hsl(var(--muted-fg))] block mb-1">Catatan (opsional)</label>
            <input type="text" value={note} onChange={(e) => setNote(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              placeholder="Contoh: Pesanan diambil sore ini" />
          </div>
              </div>
            )}
          </div>
          {errors.amount && <p className="text-xs text-red-600" role="alert">{errors.amount}</p>}
            </>
          )}

          <div className="flex gap-3 pt-1">
            {step === 1 ? (
              <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-[hsl(var(--border))] text-sm font-semibold hover:bg-[hsl(var(--muted))] transition-colors">
              Batal
              </button>
            ) : (
              <button type="button" onClick={() => setStep(1)}
                className="flex-1 py-2.5 rounded-xl border border-[hsl(var(--border))] text-sm font-semibold hover:bg-[hsl(var(--muted))] transition-colors">
                Kembali
              </button>
            )}
            {step === 1 ? (
              <button type="submit"
              className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-colors">
                Lanjut ke Pembayaran
              </button>
            ) : (
              <>
                <button type="button" onClick={() => saveOrder(true)}
                  className="flex-1 py-2.5 rounded-xl border border-blue-600 text-blue-700 dark:text-blue-300 font-semibold text-sm transition-colors">
                  Simpan dan Tambah Lagi
                </button>
                <button type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-colors">
                  Simpan Penjualan
                </button>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

// ============================================================
// C3 — Order Detail Drawer (enriched)
// ============================================================

function OrderDetailDrawer({ order, onClose, canManage, isOwner }: {
  order: Order; onClose: () => void; canManage: boolean; isOwner: boolean;
}) {
  const rawProducts = useStore((s) => s.products);
  const activeTenantId = useStore((s) => s.activeTenantId);
  const products = useMemo(
    () => rawProducts.filter((p) => p.tenantId === activeTenantId),
    [rawProducts, activeTenantId]
  );
  const voidOrder = useStore((s) => s.voidOrder);
  const [showVoidConfirm, setShowVoidConfirm] = useState(false);
  const [showReturnConfirm, setShowReturnConfirm] = useState(false);

  const adminFee = order.adminFee;
  const discount = order.discount ?? 0;
  const shippingCost = order.shippingCost;
  const totalDiterima = order.subtotal - discount - adminFee - shippingCost;

  function handleVoid() {
    voidOrder(order.id);
    onClose();
  }

  function handleReturn() {
    voidOrder(order.id);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="w-full max-w-md bg-[hsl(var(--card))] border-l border-[hsl(var(--border))] h-full overflow-y-auto p-6 space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-base">{order.id}</h2>
              {order.voided && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400 flex items-center gap-1">
                  <Ban className="w-3 h-3" /> Dibatalkan
                </span>
              )}
            </div>
            <p className="text-sm text-[hsl(var(--muted-fg))]">{formatDate(order.date)}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[hsl(var(--muted))] transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Status grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="card !p-3">
            <p className="text-xs text-[hsl(var(--muted-fg))] mb-1">Pembayaran</p>
            <PaymentBadge status={order.paymentStatus} />
          </div>
          <div className="card !p-3">
            <p className="text-xs text-[hsl(var(--muted-fg))] mb-1">Pengiriman</p>
            <ShipmentBadge status={order.shipmentStatus} />
          </div>
        </div>

        {/* Items */}
        <div className="card !p-4 space-y-3">
          <h3 className="font-semibold text-sm">Item Pesanan</h3>
          {order.items.map((item, i) => {
            const product = products.find((p) => p.id === item.productId);
            return (
              <div key={i} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Package className="w-3.5 h-3.5 text-[hsl(var(--muted-fg))]" />
                  <span>{product?.name ?? item.productId}</span>
                  <span className="text-[hsl(var(--muted-fg))]">×{item.qty}</span>
                </div>
                <span className="font-medium">{formatRp(item.qty * item.unitPrice)}</span>
              </div>
            );
          })}
        </div>

        {/* Rincian biaya */}
        <div className="card !p-4 space-y-2 text-sm">
          <h3 className="font-semibold mb-2">Rincian Biaya</h3>
          <div className="flex justify-between">
            <span className="text-[hsl(var(--muted-fg))]">Subtotal</span>
            <span>{formatRp(order.subtotal)}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between">
              <span className="text-[hsl(var(--muted-fg))]">Diskon Penjual</span>
              <span className="text-red-600">−{formatRp(discount)}</span>
            </div>
          )}
          {adminFee > 0 && (
            <div className="flex justify-between">
              <span className="text-[hsl(var(--muted-fg))]">Fee Marketplace</span>
              <span className="text-red-600">−{formatRp(adminFee)}</span>
            </div>
          )}
          {shippingCost > 0 && (
            <div className="flex justify-between">
              <span className="text-[hsl(var(--muted-fg))]">Ongkir Penjual</span>
              <span className="text-red-600">−{formatRp(shippingCost)}</span>
            </div>
          )}
          <div className="h-px bg-[hsl(var(--border))]" />
          <div className="flex justify-between font-bold">
            <span>Total Diterima</span>
            <span className="text-emerald-600 dark:text-emerald-400">{formatRp(totalDiterima)}</span>
          </div>
        </div>

        {/* Catatan */}
        {order.note && (
          <div className="card !p-4">
            <p className="text-xs text-[hsl(var(--muted-fg))] mb-1">Catatan</p>
            <p className="text-sm">{order.note}</p>
          </div>
        )}

        {/* Void confirm */}
        {showVoidConfirm && (
          <div className="card !p-4 border-red-200 dark:border-red-800/60 bg-red-50/40 dark:bg-red-950/10">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-red-700 dark:text-red-300">Batalkan Pesanan Ini?</p>
                <p className="text-xs text-red-600 dark:text-red-400 mt-0.5">
                  Seluruh stok barang pada pesanan ini akan otomatis dikembalikan ke persediaan toko.
                </p>
                <div className="flex gap-2 mt-3">
                  <button onClick={() => setShowVoidConfirm(false)}
                    className="flex-1 py-1.5 rounded-lg border border-[hsl(var(--border))] text-xs font-semibold">
                    Batal
                  </button>
                  <button onClick={handleVoid}
                    className="flex-1 py-1.5 rounded-lg bg-red-600 text-white text-xs font-semibold hover:bg-red-700 transition-colors">
                    Ya, Batalkan Pesanan
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Return confirm */}
        {showReturnConfirm && (
          <div className="card !p-4 border-amber-200 dark:border-amber-800/60 bg-amber-50/40 dark:bg-amber-950/10">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">Proses Retur Barang?</p>
                <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
                  Barang yang diretur pembeli akan dicatat dan stok dikembalikan ke persediaan.
                </p>
                <div className="flex gap-2 mt-3">
                  <button onClick={() => setShowReturnConfirm(false)}
                    className="flex-1 py-1.5 rounded-lg border border-[hsl(var(--border))] text-xs font-semibold">
                    Batal
                  </button>
                  <button onClick={handleReturn}
                    className="flex-1 py-1.5 rounded-lg bg-amber-600 text-white text-xs font-semibold hover:bg-amber-700 transition-colors">
                    Ya, Proses Retur
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action buttons */}
        {(isOwner || canManage) && !order.voided && !showVoidConfirm && !showReturnConfirm && (
          <div className="grid grid-cols-2 gap-2 pt-2">
            <button onClick={() => setShowReturnConfirm(true)}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 text-xs font-semibold hover:bg-amber-50 dark:hover:bg-amber-950/30 transition-colors">
              Retur Barang
            </button>
            <button onClick={() => setShowVoidConfirm(true)}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs font-semibold hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors">
              <Ban className="w-3.5 h-3.5" /> Batalkan
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// Main Page
// ============================================================

export default function PenjualanPage() {
  const { canView, canManage } = usePermission("penjualan");
  const user = useCurrentUser();
  const rawOrders = useStore((s) => s.orders);
  const activeTenantId = useStore((s) => s.activeTenantId);
  const orders = useMemo(
    () => rawOrders.filter((o) => o.tenantId === activeTenantId),
    [rawOrders, activeTenantId]
  );

  const [search, setSearch] = useState("");
  const [filterPayment, setFilterPayment] = useState<PaymentStatus | "">("");
  const [filterShipment, setFilterShipment] = useState<ShipmentStatus | "">("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  if (!canView) redirect("/tidak-ada-akses");

  // Filter + sembunyikan voided
  const filtered = orders.filter((o) => {
    if (o.voided) return false;
    const matchSearch =
      !search ||
      o.id.toLowerCase().includes(search.toLowerCase());
    const matchPayment = !filterPayment || o.paymentStatus === filterPayment;
    const matchShipment = !filterShipment || o.shipmentStatus === filterShipment;
    return matchSearch && matchPayment && matchShipment;
  });

  const PAYMENTS: PaymentStatus[] = ["lunas", "sebagian", "belum", "gagal"];
  const SHIPMENTS: ShipmentStatus[] = ["baru", "diproses", "dikemas", "dikirim", "selesai"];

  const totalRevenue = filtered.reduce((s, o) => s + o.subtotal, 0);
  const voidedCount = orders.filter((o) => o.voided).length;

  return (
    <DashboardLayout
      title="Penjualan"
      subtitle={`${filtered.length} pesanan aktif`}
    >
      {/* Page Intro with Help and Action Bar */}
      <PageIntro
        title="Penjualan"
        description="Daftar transaksi penjualan yang dicatat untuk usahamu. Pilih pesanan untuk melihat detail barang, tagihan, atau mencatat pembayaran."
        badge={`${filtered.length} Pesanan`}
        helpTips={[
          {
            title: "Catat Penjualan Manual",
            description: "Gunakan tombol 'Input Penjualan' untuk mencatat transaksi usaha secara manual.",
          },
          {
            title: "Filter & Pencarian",
            description: "Cari berdasarkan nama pembeli, atau gunakan filter status pembayaran dan pengiriman.",
          },
          {
            title: "Rincian & Pelunasan Piutang",
            description: "Klik baris pesanan untuk melihat rincian barang, total, ongkos kirim, atau mencatat pelunasan bertahap.",
          },
        ]}
        primaryAction={
          canManage ? (
            <button
              onClick={() => setShowAddModal(true)}
              id="add-sale-btn"
              data-shortcut="new"
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors shadow-md shadow-blue-500/20 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Input Penjualan
            </button>
          ) : undefined
        }
      />

      {/* Search & Filters Toolbar */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--muted-fg))]" />
          <input
            type="text"
            placeholder="Cari ID pesanan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500/30"
          />
        </div>

        {/* Filters */}
        <select
          value={filterPayment}
          onChange={(e) => setFilterPayment(e.target.value as PaymentStatus | "")}
          className="px-3 py-2 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500/30 text-[hsl(var(--foreground))]"
        >
          <option value="">Status Bayar</option>
          {PAYMENTS.map((p) => (
            <option key={p} value={p}>
              {PAYMENT_LABEL[p]}
            </option>
          ))}
        </select>

        <select
          value={filterShipment}
          onChange={(e) => setFilterShipment(e.target.value as ShipmentStatus | "")}
          className="px-3 py-2 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500/30 text-[hsl(var(--foreground))]"
        >
          <option value="">Status Kirim</option>
          {SHIPMENTS.map((s) => (
            <option key={s} value={s}>
              {SHIPMENT_LABEL[s]}
            </option>
          ))}
        </select>
      </div>

      {/* Summary mini */}
      <div className="flex items-center gap-4 mb-4 text-xs sm:text-sm">
        <span className="text-[hsl(var(--muted-fg))]">
          Total Omzet Tampil:{" "}
          <strong className="text-[hsl(var(--foreground))]">{formatRp(totalRevenue)}</strong>
        </span>
        {voidedCount > 0 && (
          <span className="text-[hsl(var(--muted-fg))]">
            • {voidedCount} pesanan dibatalkan (tersembunyi)
          </span>
        )}
      </div>

      {/* Table or Empty State */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={<Package className="w-7 h-7" />}
          title={search || filterPayment || filterShipment ? "Tidak Ada Pesanan yang Cocok" : "Belum Ada Pesanan Penjualan"}
          description={
            search || filterPayment || filterShipment
              ? "Coba ubah kata kunci pencarian atau sesuaikan pilihan filter untuk menemukan transaksi yang kamu cari."
              : "Mulai catat transaksi penjualan pertamamu untuk memantau omzet, sisa stok, dan status kiriman paket."
          }
          actionText={canManage ? "Input Penjualan Sekarang" : undefined}
          onAction={canManage ? () => setShowAddModal(true) : undefined}
          secondaryActionText={search || filterPayment || filterShipment ? "Reset Filter" : undefined}
          onSecondaryAction={() => {
            setSearch("");
            setFilterPayment("");
            setFilterShipment("");
          }}
        />
      ) : (
        <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[hsl(var(--border))] bg-[hsl(var(--muted))]/50">
                  {["ID Pesanan", "Tanggal", "Total", "Bayar", "Kirim", ""].map((h) => (
                    <th key={h} className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wide text-[hsl(var(--muted-fg))]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((order) => {
                  return (
                    <tr
                      key={order.id}
                      className="border-b border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))]/50 transition-colors cursor-pointer"
                      onClick={() => setSelectedOrder(order)}
                    >
                      <td className="px-4 py-3 font-mono text-xs text-blue-600 dark:text-blue-400 font-semibold">{order.id}</td>
                      <td className="px-4 py-3 text-[hsl(var(--muted-fg))] text-xs whitespace-nowrap">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />{formatDate(order.date)}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-semibold">{formatRp(order.subtotal)}</td>
                      <td className="px-4 py-3"><PaymentBadge status={order.paymentStatus} /></td>
                      <td className="px-4 py-3"><ShipmentBadge status={order.shipmentStatus} /></td>
                      <td className="px-4 py-3">
                        <ExternalLink className="w-3.5 h-3.5 text-[hsl(var(--muted-fg))]" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modals & Drawer */}
      {showAddModal && <AddManualOrderModal onClose={() => setShowAddModal(false)} />}
      {selectedOrder && (
        <OrderDetailDrawer
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          canManage={canManage}
          isOwner={user?.isOwner ?? false}
        />
      )}
    </DashboardLayout>
  );
}
