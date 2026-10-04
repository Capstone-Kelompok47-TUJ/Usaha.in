"use client";

import { useStore } from "@/lib/store";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { usePermission } from "@/hooks/usePermission";
import { formatDate, formatRp } from "@/lib/finance";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { redirect } from "next/navigation";
import {
  Search, X, Plus, ExternalLink, Package, Calendar,
  Upload, AlertTriangle, CheckCircle2, Ban, Crown,
  ChevronRight, FileUp, Info,
} from "lucide-react";
import { useState, useRef, useCallback } from "react";
import type { Channel, PaymentStatus, ShipmentStatus, Order, OrderItem } from "@/types";

// ============================================================
// Constants
// ============================================================

const CHANNEL_LABEL: Record<string, string> = {
  shopee: "Shopee", marketplace_a: "Shopee",
  tokopedia: "Tokopedia", marketplace_b: "Tokopedia",
  chat: "WhatsApp", offline: "Toko Offline",
};
const CHANNEL_FEE_PCT: Record<Channel, number> = {
  shopee: 7.5, marketplace_a: 7.5,
  tokopedia: 3.5, marketplace_b: 3.5,
  chat: 0, offline: 0,
};
const PAYMENT_LABEL: Record<PaymentStatus, string> = {
  lunas: "Lunas", sebagian: "Sebagian", belum: "Belum Lunas", gagal: "Gagal",
};
const SHIPMENT_LABEL: Record<ShipmentStatus, string> = {
  baru: "Baru", diproses: "Diproses", dikemas: "Dikemas", dikirim: "Dikirim", selesai: "Selesai",
};

// ============================================================
// Badges
// ============================================================

function ChannelBadge({ channel }: { channel: Channel }) {
  const colors: Record<string, string> = {
    marketplace_a: "bg-orange-100 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300",
    shopee: "bg-orange-100 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300",
    marketplace_b: "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-300",
    tokopedia: "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-300",
    chat: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
    offline: "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300",
  };
  return (
    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${colors[channel] ?? ""}`}>
      {CHANNEL_LABEL[channel]}
    </span>
  );
}

function PaymentBadge({ status }: { status: PaymentStatus }) {
  const colors: Record<PaymentStatus, string> = {
    lunas: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
    sebagian: "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
    belum: "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300",
    gagal: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
  };
  return (
    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${colors[status]}`}>
      {PAYMENT_LABEL[status]}
    </span>
  );
}

function ShipmentBadge({ status }: { status: ShipmentStatus }) {
  const colors: Record<ShipmentStatus, string> = {
    baru: "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300",
    diproses: "bg-violet-100 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300",
    dikemas: "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
    dikirim: "bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300",
    selesai: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
  };
  return (
    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${colors[status]}`}>
      {SHIPMENT_LABEL[status]}
    </span>
  );
}

// ============================================================
// C1 — Add Manual Order Modal
// ============================================================

function AddManualOrderModal({ onClose }: { onClose: () => void }) {
  const products = useStore((s) => s.products);
  const customers = useStore((s) => s.customers);
  const addOrder = useStore((s) => s.addOrder);
  const activeTenantId = useStore((s) => s.activeTenantId);

  const [channel, setChannel] = useState<Channel>("offline");
  const [customerName, setCustomerName] = useState("");
  const [customerSuggestions, setCustomerSuggestions] = useState<typeof customers>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
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

  function handleCustomerInput(val: string) {
    setCustomerName(val);
    setSelectedCustomerId("");
    if (val.length >= 1) {
      setCustomerSuggestions(
        customers.filter((c) => c.name.toLowerCase().includes(val.toLowerCase())).slice(0, 5)
      );
    } else {
      setCustomerSuggestions([]);
    }
  }

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
  const adminFee = Math.round(((subtotal - discount) * CHANNEL_FEE_PCT[channel]) / 100);
  const totalDiterima = subtotal - discount - adminFee - shippingCost;

  function validate() {
    const errs: Record<string, string> = {};
    if (!customerName.trim()) errs.customer = "Nama pelanggan wajib diisi";
    if (items.some((it) => it.qty <= 0)) errs.items = "Qty harus lebih dari 0";
    if (items.some((it) => !it.productId)) errs.items = "Pilih produk untuk semua baris";
    if (!payNow && !dueDate) errs.dueDate = "Tanggal jatuh tempo wajib jika tempo";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    // Cari atau gunakan customerId
    const customerId = selectedCustomerId ||
      customers.find((c) => c.name.toLowerCase() === customerName.trim().toLowerCase())?.id ||
      `cust-new-${Date.now()}`;

    addOrder({
      date,
      channel,
      customerId,
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
    onClose();
  }

  const CHANNELS: { value: Channel; label: string }[] = [
    { value: "marketplace_a", label: "Shopee" },
    { value: "marketplace_b", label: "Tokopedia" },
    { value: "chat", label: "WhatsApp" },
    { value: "offline", label: "Toko Offline" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[hsl(var(--card))] rounded-2xl border border-[hsl(var(--border))] shadow-2xl w-full max-w-2xl p-6 animate-fade-in my-4">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold text-base">Input Penjualan Manual</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[hsl(var(--muted))] transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Baris 1: Tanggal + Kanal */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-[hsl(var(--muted-fg))] block mb-1">Tanggal *</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
            </div>
            <div>
              <label className="text-xs font-semibold text-[hsl(var(--muted-fg))] block mb-1">Kanal *</label>
              <div className="grid grid-cols-2 gap-1.5">
                {CHANNELS.map(({ value, label }) => (
                  <button key={value} type="button" onClick={() => setChannel(value)}
                    className={`py-1.5 rounded-lg border text-xs font-semibold transition-all ${channel === value ? "border-blue-500 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300" : "border-[hsl(var(--border))] text-[hsl(var(--muted-fg))] hover:border-blue-300"}`}>
                    {label}
                    {CHANNEL_FEE_PCT[value] > 0 && <span className="ml-1 text-[10px] opacity-70">({CHANNEL_FEE_PCT[value]}%)</span>}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Pelanggan */}
          <div className="relative">
            <label className="text-xs font-semibold text-[hsl(var(--muted-fg))] block mb-1">Pelanggan *</label>
            <input type="text" value={customerName} onChange={(e) => handleCustomerInput(e.target.value)}
              placeholder="Nama pelanggan atau ketik baru..."
              className={`w-full px-3 py-2 rounded-lg border bg-[hsl(var(--background))] text-sm focus:outline-none focus:ring-2 ${errors.customer ? "border-red-500 focus:ring-red-500/30" : "border-[hsl(var(--border))] focus:ring-blue-500/30"}`} />
            {errors.customer && <p className="text-[11px] text-red-500 mt-0.5">{errors.customer}</p>}
            {customerSuggestions.length > 0 && (
              <div className="absolute z-10 top-full left-0 right-0 mt-1 bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl shadow-xl overflow-hidden">
                {customerSuggestions.map((c) => (
                  <button key={c.id} type="button"
                    onClick={() => { setCustomerName(c.name); setSelectedCustomerId(c.id); setCustomerSuggestions([]); }}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-[hsl(var(--muted))] transition-colors flex items-center justify-between">
                    <span>{c.name}</span>
                    <span className="text-xs text-[hsl(var(--muted-fg))]">{CHANNEL_LABEL[c.channel]}</span>
                  </button>
                ))}
              </div>
            )}
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
                  <select value={item.productId}
                    onChange={(e) => updateItem(idx, "productId", e.target.value)}
                    className="px-2.5 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-xs focus:outline-none focus:ring-1 focus:ring-blue-500/30">
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>{p.name} (stok: {p.stock})</option>
                    ))}
                  </select>
                  <input type="number" min={1} value={item.qty}
                    onChange={(e) => updateItem(idx, "qty", +e.target.value)}
                    className="px-2.5 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-xs focus:outline-none focus:ring-1 focus:ring-blue-500/30"
                    placeholder="Qty" />
                  <input type="number" min={0} value={item.unitPrice}
                    onChange={(e) => updateItem(idx, "unitPrice", +e.target.value)}
                    className="px-2.5 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-xs focus:outline-none focus:ring-1 focus:ring-blue-500/30"
                    placeholder="Harga/unit" />
                  <button type="button" onClick={() => removeItem(idx)}
                    className="p-1.5 rounded-lg text-[hsl(var(--muted-fg))] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Diskon + Ongkir */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-[hsl(var(--muted-fg))] block mb-1">Diskon Penjual (Rp)</label>
              <input type="number" min={0} value={discount} onChange={(e) => setDiscount(+e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                placeholder="0" />
            </div>
            <div>
              <label className="text-xs font-semibold text-[hsl(var(--muted-fg))] block mb-1">Ongkir Ditanggung Penjual (Rp)</label>
              <input type="number" min={0} value={shippingCost} onChange={(e) => setShippingCost(+e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                placeholder="0" />
            </div>
          </div>

          {/* Rincian biaya */}
          <div className="rounded-xl bg-[hsl(var(--muted))] p-3 text-xs space-y-1.5">
            <div className="flex justify-between"><span className="text-[hsl(var(--muted-fg))]">Subtotal</span><span>{formatRp(subtotal)}</span></div>
            {discount > 0 && <div className="flex justify-between"><span className="text-[hsl(var(--muted-fg))]">Diskon</span><span className="text-red-500">−{formatRp(discount)}</span></div>}
            {adminFee > 0 && <div className="flex justify-between"><span className="text-[hsl(var(--muted-fg))]">Fee Marketplace ({CHANNEL_FEE_PCT[channel]}%)</span><span className="text-red-500">−{formatRp(adminFee)}</span></div>}
            {shippingCost > 0 && <div className="flex justify-between"><span className="text-[hsl(var(--muted-fg))]">Ongkir</span><span className="text-red-500">−{formatRp(shippingCost)}</span></div>}
            <div className="h-px bg-[hsl(var(--border))]" />
            <div className="flex justify-between font-bold"><span>Total Diterima</span><span className="text-emerald-600 dark:text-emerald-400">{formatRp(totalDiterima)}</span></div>
          </div>

          {/* Status Bayar */}
          <div>
            <label className="text-xs font-semibold text-[hsl(var(--muted-fg))] block mb-2">Pembayaran</label>
            <div className="flex gap-2">
              {[{ v: true, label: "Bayar Sekarang" }, { v: false, label: "Tempo" }].map(({ v, label }) => (
                <button key={String(v)} type="button" onClick={() => setPayNow(v)}
                  className={`flex-1 py-2 rounded-lg border text-xs font-semibold transition-all ${payNow === v ? "border-blue-500 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300" : "border-[hsl(var(--border))] text-[hsl(var(--muted-fg))] hover:border-blue-300"}`}>
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

          {/* Catatan */}
          <div>
            <label className="text-xs font-semibold text-[hsl(var(--muted-fg))] block mb-1">Catatan (opsional)</label>
            <input type="text" value={note} onChange={(e) => setNote(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              placeholder="Keterangan tambahan" />
          </div>

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-[hsl(var(--border))] text-sm font-semibold hover:bg-[hsl(var(--muted))] transition-colors">
              Batal
            </button>
            <button type="submit"
              className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-colors">
              Simpan Penjualan
            </button>
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
  const products = useStore((s) => s.products);
  const customers = useStore((s) => s.customers);
  const voidOrder = useStore((s) => s.voidOrder);
  const customer = customers.find((c) => c.id === order.customerId);
  const [showVoidConfirm, setShowVoidConfirm] = useState(false);

  const adminFee = order.adminFee;
  const discount = order.discount ?? 0;
  const shippingCost = order.shippingCost;
  const totalDiterima = order.subtotal - discount - adminFee - shippingCost;

  function handleVoid() {
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
            <p className="text-xs text-[hsl(var(--muted-fg))] mb-1">Kanal</p>
            <ChannelBadge channel={order.channel} />
          </div>
          <div className="card !p-3">
            <p className="text-xs text-[hsl(var(--muted-fg))] mb-1">Pembayaran</p>
            <PaymentBadge status={order.paymentStatus} />
          </div>
          <div className="card !p-3">
            <p className="text-xs text-[hsl(var(--muted-fg))] mb-1">Pengiriman</p>
            <ShipmentBadge status={order.shipmentStatus} />
          </div>
          <div className="card !p-3">
            <p className="text-xs text-[hsl(var(--muted-fg))] mb-1">Pelanggan</p>
            <p className="text-sm font-medium">{customer?.name ?? "—"}</p>
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
                <p className="text-sm font-semibold text-red-700 dark:text-red-300">Batalkan Pesanan?</p>
                <p className="text-xs text-red-600 dark:text-red-400 mt-0.5">
                  Stok akan dikembalikan. Tindakan ini tidak bisa dibatalkan.
                </p>
                <div className="flex gap-2 mt-3">
                  <button onClick={() => setShowVoidConfirm(false)}
                    className="flex-1 py-1.5 rounded-lg border border-[hsl(var(--border))] text-xs font-semibold">
                    Batal
                  </button>
                  <button onClick={handleVoid}
                    className="flex-1 py-1.5 rounded-lg bg-red-600 text-white text-xs font-semibold hover:bg-red-700 transition-colors">
                    Ya, Batalkan
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action buttons */}
        {(isOwner || canManage) && !order.voided && !showVoidConfirm && (
          <button onClick={() => setShowVoidConfirm(true)}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm font-semibold hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors">
            <Ban className="w-4 h-4" /> Batalkan Pesanan
          </button>
        )}
      </div>
    </div>
  );
}

// ============================================================
// C4 — Import CSV Modal
// ============================================================

type CsvRow = {
  externalOrderId?: string;
  date?: string;
  productName?: string;
  qty?: string;
  unitPrice?: string;
  platformFee?: string;
  [key: string]: string | undefined;
};

type ParsedCsvOrder = {
  externalOrderId: string;
  date: string;
  productId: string;
  productName: string;
  qty: number;
  unitPrice: number;
  adminFee: number;
  ok: boolean;
  skipReason?: string;
};

function ImportCsvModal({ onClose, channel }: { onClose: () => void; channel: Channel }) {
  const products = useStore((s) => s.products);
  const orders = useStore((s) => s.orders);
  const addOrder = useStore((s) => s.addOrder);

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [importChannel, setImportChannel] = useState<Channel>(channel);
  const [rawCsv, setRawCsv] = useState<CsvRow[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [colMap, setColMap] = useState<Record<string, string>>({
    externalOrderId: "", date: "", productName: "", qty: "", unitPrice: "", platformFee: "",
  });
  const [parsed, setParsed] = useState<ParsedCsvOrder[]>([]);
  const [result, setResult] = useState<{ ok: number; skipped: number; failed: number } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const lines = text.split("\n").filter((l) => l.trim());
      if (lines.length < 2) return;
      const hdrs = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""));
      setHeaders(hdrs);
      const rows: CsvRow[] = lines.slice(1).map((line) => {
        const vals = line.split(",").map((v) => v.trim().replace(/"/g, ""));
        const row: CsvRow = {};
        hdrs.forEach((h, i) => { row[h] = vals[i] ?? ""; });
        return row;
      });
      setRawCsv(rows);
      // Auto-map kolom
      const autoMap: Record<string, string> = { externalOrderId: "", date: "", productName: "", qty: "", unitPrice: "", platformFee: "" };
      for (const hdr of hdrs) {
        const lower = hdr.toLowerCase();
        if (lower.includes("order") || lower.includes("nomor")) autoMap.externalOrderId = hdr;
        else if (lower.includes("tanggal") || lower.includes("date")) autoMap.date = hdr;
        else if (lower.includes("produk") || lower.includes("product") || lower.includes("nama")) autoMap.productName = hdr;
        else if (lower.includes("qty") || lower.includes("jumlah")) autoMap.qty = hdr;
        else if (lower.includes("harga") || lower.includes("price")) autoMap.unitPrice = hdr;
        else if (lower.includes("fee") || lower.includes("admin")) autoMap.platformFee = hdr;
      }
      setColMap(autoMap);
      setStep(2);
    };
    reader.readAsText(file);
  }

  function handleParse() {
    const defaultFeePct = CHANNEL_FEE_PCT[importChannel];
    const existingIds = new Set(orders.map((o) => `${o.channel}||${o.externalOrderId}`).filter(Boolean));

    const result: ParsedCsvOrder[] = rawCsv.map((row) => {
      const ordId = (colMap.externalOrderId ? row[colMap.externalOrderId] : "") ?? "";
      const dateStr = (colMap.date ? row[colMap.date] : "") ?? new Date().toISOString().split("T")[0];
      const pName = (colMap.productName ? row[colMap.productName] : "") ?? "";
      const qtyStr = (colMap.qty ? row[colMap.qty] : "1") ?? "1";
      const priceStr = (colMap.unitPrice ? row[colMap.unitPrice] : "0") ?? "0";
      const feeStr = (colMap.platformFee ? row[colMap.platformFee] : "") ?? "";

      const qty = parseInt(qtyStr) || 0;
      const unitPrice = parseFloat(priceStr.replace(/[^0-9.]/g, "")) || 0;
      const feeRaw = parseFloat(feeStr.replace(/[^0-9.]/g, ""));
      const adminFee = isNaN(feeRaw) ? Math.round((qty * unitPrice * defaultFeePct) / 100) : feeRaw;

      const product = products.find((p) =>
        p.name.toLowerCase().includes(pName.toLowerCase()) || p.sku === pName
      );

      // Duplikat?
      const key = `${importChannel}||${ordId}`;
      if (ordId && existingIds.has(key)) {
        return { externalOrderId: ordId, date: dateStr, productId: "", productName: pName, qty, unitPrice, adminFee, ok: false, skipReason: "Duplikat (sudah ada)" };
      }
      if (!product) {
        return { externalOrderId: ordId, date: dateStr, productId: "", productName: pName, qty, unitPrice, adminFee, ok: false, skipReason: `Produk "${pName}" tidak ditemukan` };
      }
      if (qty <= 0 || unitPrice <= 0) {
        return { externalOrderId: ordId, date: dateStr, productId: product.id, productName: pName, qty, unitPrice, adminFee, ok: false, skipReason: "Qty atau harga tidak valid" };
      }
      return { externalOrderId: ordId, date: dateStr, productId: product.id, productName: product.name, qty, unitPrice, adminFee, ok: true };
    });
    setParsed(result);
    setStep(3);
  }

  function handleImport() {
    let ok = 0, skipped = 0, failed = 0;
    for (const row of parsed) {
      if (!row.ok) { row.skipReason ? skipped++ : failed++; continue; }
      const subtotal = row.qty * row.unitPrice;
      addOrder({
        date: row.date,
        channel: importChannel,
        customerId: "cust-import",
        items: [{ productId: row.productId, qty: row.qty, unitPrice: row.unitPrice }],
        subtotal,
        adminFee: row.adminFee,
        shippingCost: 0,
        paymentStatus: "lunas",
        shipmentStatus: "baru",
        externalOrderId: row.externalOrderId || undefined,
      });
      ok++;
    }
    setResult({ ok, skipped, failed: failed });
    setStep(4);
  }

  const CHANNELS_IMPORT: { value: Channel; label: string }[] = [
    { value: "marketplace_a", label: "Shopee" },
    { value: "marketplace_b", label: "Tokopedia" },
  ];
  const COL_KEYS = [
    { key: "externalOrderId", label: "No. Pesanan" },
    { key: "date", label: "Tanggal" },
    { key: "productName", label: "Nama Produk" },
    { key: "qty", label: "Qty" },
    { key: "unitPrice", label: "Harga Satuan" },
    { key: "platformFee", label: "Fee Platform" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[hsl(var(--card))] rounded-2xl border border-[hsl(var(--border))] shadow-2xl w-full max-w-2xl p-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-bold text-base flex items-center gap-2">
              <FileUp className="w-5 h-5 text-blue-500" /> Impor Berkas Penjualan
            </h2>
            <div className="flex items-center gap-2 mt-1">
              {[1, 2, 3, 4].map((s) => (
                <div key={s} className="flex items-center gap-1">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold transition-all ${step >= s ? "bg-blue-600 text-white" : "bg-[hsl(var(--muted))] text-[hsl(var(--muted-fg))]"}`}>{s}</div>
                  {s < 4 && <div className={`w-6 h-px transition-all ${step > s ? "bg-blue-600" : "bg-[hsl(var(--border))]"}`} />}
                </div>
              ))}
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[hsl(var(--muted))] transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step 1: Upload */}
        {step === 1 && (
          <div className="space-y-4">
            <p className="text-sm text-[hsl(var(--muted-fg))]">Pilih kanal dan upload file CSV dari dashboard penjual.</p>
            <div className="flex gap-2">
              {CHANNELS_IMPORT.map(({ value, label }) => (
                <button key={value} type="button" onClick={() => setImportChannel(value)}
                  className={`flex-1 py-2 rounded-lg border text-sm font-semibold transition-all ${importChannel === value ? "border-blue-500 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300" : "border-[hsl(var(--border))] text-[hsl(var(--muted-fg))]"}`}>
                  {label}
                </button>
              ))}
            </div>
            <label className="block w-full border-2 border-dashed border-[hsl(var(--border))] rounded-xl p-8 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 dark:hover:bg-blue-950/10 transition-all">
              <Upload className="w-8 h-8 text-[hsl(var(--muted-fg))] mx-auto mb-2" />
              <p className="text-sm font-semibold">Klik untuk upload file CSV</p>
              <p className="text-xs text-[hsl(var(--muted-fg))] mt-1">Format: .csv dari Shopee / Tokopedia Seller Center</p>
              <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleFile} />
            </label>
          </div>
        )}

        {/* Step 2: Pemetaan kolom */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <p className="text-sm font-semibold mb-1">Preview 5 baris pertama</p>
              <div className="overflow-x-auto rounded-lg border border-[hsl(var(--border))]">
                <table className="w-full text-[11px]">
                  <thead><tr className="bg-[hsl(var(--muted))]">
                    {headers.map((h) => <th key={h} className="px-2 py-1.5 text-left font-semibold">{h}</th>)}
                  </tr></thead>
                  <tbody>
                    {rawCsv.slice(0, 5).map((row, i) => (
                      <tr key={i} className="border-t border-[hsl(var(--border))]">
                        {headers.map((h) => <td key={h} className="px-2 py-1.5">{row[h] ?? ""}</td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold mb-2">Pemetaan Kolom</p>
              <div className="grid grid-cols-2 gap-2">
                {COL_KEYS.map(({ key, label }) => (
                  <div key={key} className="flex items-center gap-2">
                    <span className="text-xs text-[hsl(var(--muted-fg))] w-28 shrink-0">{label}</span>
                    <select value={colMap[key]}
                      onChange={(e) => setColMap({ ...colMap, [key]: e.target.value })}
                      className="flex-1 px-2 py-1.5 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-xs focus:outline-none">
                      <option value="">— Pilih kolom —</option>
                      {headers.map((h) => <option key={h} value={h}>{h}</option>)}
                    </select>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setStep(1)}
                className="flex-1 py-2.5 rounded-xl border border-[hsl(var(--border))] text-sm font-semibold">Kembali</button>
              <button type="button" onClick={handleParse}
                className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors">Pratinjau Hasil</button>
            </div>
          </div>
        )}

        {/* Step 3: Preview parsing */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-sm">
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 font-semibold">
                ✓ {parsed.filter((r) => r.ok).length} siap diimpor
              </span>
              <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 font-semibold">
                ⚠ {parsed.filter((r) => !r.ok).length} dilewati
              </span>
            </div>
            <div className="max-h-60 overflow-y-auto rounded-lg border border-[hsl(var(--border))]">
              <table className="w-full text-xs">
                <thead><tr className="bg-[hsl(var(--muted))] sticky top-0">
                  {["No.", "Produk", "Qty", "Harga", "Status"].map((h) => (
                    <th key={h} className="px-3 py-2 text-left font-semibold">{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {parsed.map((row, i) => (
                    <tr key={i} className={`border-t border-[hsl(var(--border))] ${!row.ok ? "bg-red-50/50 dark:bg-red-950/10" : ""}`}>
                      <td className="px-3 py-2 font-mono">{row.externalOrderId || i + 1}</td>
                      <td className="px-3 py-2">{row.productName}</td>
                      <td className="px-3 py-2">{row.qty}</td>
                      <td className="px-3 py-2">{formatRp(row.unitPrice)}</td>
                      <td className="px-3 py-2">
                        {row.ok
                          ? <span className="text-emerald-600 font-semibold">✓ OK</span>
                          : <span className="text-red-500 font-semibold">✗ {row.skipReason}</span>
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => setStep(2)}
                className="flex-1 py-2.5 rounded-xl border border-[hsl(var(--border))] text-sm font-semibold">Kembali</button>
              <button type="button" onClick={handleImport}
                className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors">
                Konfirmasi & Impor ({parsed.filter((r) => r.ok).length} pesanan)
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Hasil */}
        {step === 4 && result && (
          <div className="text-center py-4 space-y-4">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
            <h3 className="font-bold text-lg">Impor Selesai</h3>
            <div className="flex justify-center gap-6 text-sm">
              <div className="text-center">
                <p className="text-2xl font-black text-emerald-600">{result.ok}</p>
                <p className="text-[hsl(var(--muted-fg))]">Berhasil</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-black text-amber-600">{result.skipped}</p>
                <p className="text-[hsl(var(--muted-fg))]">Dilewati</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-black text-red-600">{result.failed}</p>
                <p className="text-[hsl(var(--muted-fg))]">Gagal</p>
              </div>
            </div>
            <button onClick={onClose}
              className="px-6 py-2.5 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition-colors">
              Selesai
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// Add Example Button (Owner Only)
// ============================================================

function AddExampleOrderButton({ userId }: { userId: string }) {
  const simulateOrder = useStore((s) => s.simulateOrder);
  const [loading, setLoading] = useState(false);
  function handleClick() {
    setLoading(true);
    simulateOrder(userId);
    setTimeout(() => setLoading(false), 600);
  }
  return (
    <button id="add-order-example-btn" onClick={handleClick} disabled={loading}
      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-60 cursor-pointer">
      <Crown className="w-4 h-4" />
      {loading ? "Memproses..." : "Tambah Pesanan Contoh"}
    </button>
  );
}

// ============================================================
// Main Page
// ============================================================

export default function PenjualanPage() {
  const { canView, canManage } = usePermission("penjualan");
  const user = useCurrentUser();
  const orders = useStore((s) => s.orders);
  const customers = useStore((s) => s.customers);

  const [search, setSearch] = useState("");
  const [filterChannel, setFilterChannel] = useState<Channel | "">("");
  const [filterPayment, setFilterPayment] = useState<PaymentStatus | "">("");
  const [filterShipment, setFilterShipment] = useState<ShipmentStatus | "">("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

  if (!canView) redirect("/tidak-ada-akses");

  // Filter + sembunyikan voided
  const filtered = orders.filter((o) => {
    if (o.voided) return false;
    const customer = customers.find((c) => c.id === o.customerId);
    const matchSearch =
      !search ||
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      customer?.name?.toLowerCase().includes(search.toLowerCase());
    const matchChannel = !filterChannel || o.channel === filterChannel;
    const matchPayment = !filterPayment || o.paymentStatus === filterPayment;
    const matchShipment = !filterShipment || o.shipmentStatus === filterShipment;
    return matchSearch && matchChannel && matchPayment && matchShipment;
  });

  const CHANNELS: Channel[] = ["marketplace_a", "marketplace_b", "chat", "offline"];
  const PAYMENTS: PaymentStatus[] = ["lunas", "sebagian", "belum", "gagal"];
  const SHIPMENTS: ShipmentStatus[] = ["baru", "diproses", "dikemas", "dikirim", "selesai"];

  const totalRevenue = filtered.reduce((s, o) => s + o.subtotal, 0);
  const voidedCount = orders.filter((o) => o.voided).length;

  return (
    <DashboardLayout
      title="Penjualan"
      subtitle={`${filtered.length} pesanan aktif`}
    >
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--muted-fg))]" />
          <input
            type="text"
            placeholder="Cari ID pesanan atau pelanggan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
          />
        </div>

        {/* Filters */}
        <select value={filterChannel} onChange={(e) => setFilterChannel(e.target.value as Channel | "")}
          className="px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30">
          <option value="">Semua Kanal</option>
          {CHANNELS.map((c) => <option key={c} value={c}>{CHANNEL_LABEL[c]}</option>)}
        </select>

        <select value={filterPayment} onChange={(e) => setFilterPayment(e.target.value as PaymentStatus | "")}
          className="px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30">
          <option value="">Status Bayar</option>
          {PAYMENTS.map((p) => <option key={p} value={p}>{PAYMENT_LABEL[p]}</option>)}
        </select>

        <select value={filterShipment} onChange={(e) => setFilterShipment(e.target.value as ShipmentStatus | "")}
          className="px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30">
          <option value="">Status Kirim</option>
          {SHIPMENTS.map((s) => <option key={s} value={s}>{SHIPMENT_LABEL[s]}</option>)}
        </select>

        {/* Action buttons */}
        {canManage && (
          <>
            <button onClick={() => setShowImportModal(true)} id="import-csv-btn"
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[hsl(var(--border))] text-sm font-semibold hover:bg-[hsl(var(--muted))] transition-colors">
              <Upload className="w-4 h-4" /> Impor CSV
            </button>
            <button onClick={() => setShowAddModal(true)} id="add-sale-btn"
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors shadow-md shadow-blue-500/20">
              <Plus className="w-4 h-4" /> Input Penjualan
            </button>
          </>
        )}
        {user?.isOwner && <AddExampleOrderButton userId={user.id} />}
      </div>

      {/* Summary mini */}
      <div className="flex items-center gap-4 mb-4 text-sm">
        <span className="text-[hsl(var(--muted-fg))]">Total: <strong className="text-[hsl(var(--foreground))]">{formatRp(totalRevenue)}</strong></span>
        {voidedCount > 0 && (
          <span className="text-[hsl(var(--muted-fg))]">{voidedCount} pesanan dibatalkan (tersembunyi)</span>
        )}
      </div>

      {/* Table */}
      <div className="card !p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[hsl(var(--border))] bg-[hsl(var(--muted))]">
                {["ID Pesanan", "Tanggal", "Kanal", "Pelanggan", "Total", "Bayar", "Kirim", ""].map((h) => (
                  <th key={h} className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wide text-[hsl(var(--muted-fg))]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-[hsl(var(--muted-fg))]">
                    Tidak ada pesanan ditemukan
                  </td>
                </tr>
              ) : (
                filtered.map((order) => {
                  const customer = customers.find((c) => c.id === order.customerId);
                  return (
                    <tr key={order.id}
                      className="border-b border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))]/50 transition-colors cursor-pointer"
                      onClick={() => setSelectedOrder(order)}>
                      <td className="px-4 py-3 font-mono text-xs text-blue-600 dark:text-blue-400">{order.id}</td>
                      <td className="px-4 py-3 text-[hsl(var(--muted-fg))] text-xs whitespace-nowrap">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />{formatDate(order.date)}
                        </span>
                      </td>
                      <td className="px-4 py-3"><ChannelBadge channel={order.channel} /></td>
                      <td className="px-4 py-3 font-medium max-w-[150px] truncate">{customer?.name ?? "—"}</td>
                      <td className="px-4 py-3 font-semibold">{formatRp(order.subtotal)}</td>
                      <td className="px-4 py-3"><PaymentBadge status={order.paymentStatus} /></td>
                      <td className="px-4 py-3"><ShipmentBadge status={order.shipmentStatus} /></td>
                      <td className="px-4 py-3">
                        <ExternalLink className="w-3.5 h-3.5 text-[hsl(var(--muted-fg))]" />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals & Drawer */}
      {showAddModal && <AddManualOrderModal onClose={() => setShowAddModal(false)} />}
      {showImportModal && (
        <ImportCsvModal
          onClose={() => setShowImportModal(false)}
          channel={filterChannel as Channel || "marketplace_a"}
        />
      )}
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
