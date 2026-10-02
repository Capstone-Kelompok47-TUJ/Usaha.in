"use client";

import { useStore } from "@/lib/store";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { usePermission } from "@/hooks/usePermission";
import { formatDate, formatRp } from "@/lib/finance";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { redirect } from "next/navigation";
import {
  Search, Filter, ChevronDown, X, Plus,
  ExternalLink, Package, Calendar,
} from "lucide-react";
import { useState, useRef } from "react";
import type { Channel, PaymentStatus, ShipmentStatus, Order } from "@/types";

const CHANNEL_LABEL: Record<string, string> = {
  shopee: "Shopee",
  marketplace_a: "Shopee",
  tokopedia: "Tokopedia",
  marketplace_b: "Tokopedia",
  chat: "WhatsApp",
  offline: "Toko Offline",
};
const PAYMENT_LABEL: Record<PaymentStatus, string> = {
  lunas: "Lunas", belum: "Belum Lunas", gagal: "Gagal",
};
const SHIPMENT_LABEL: Record<ShipmentStatus, string> = {
  baru: "Baru", diproses: "Diproses", dikemas: "Dikemas", dikirim: "Dikirim", selesai: "Selesai",
};

function ChannelBadge({ channel }: { channel: Channel }) {
  return (
    <span className={`badge-${channel} text-[11px] font-semibold px-2 py-0.5 rounded-full`}>
      {CHANNEL_LABEL[channel]}
    </span>
  );
}
function PaymentBadge({ status }: { status: PaymentStatus }) {
  return (
    <span className={`badge-${status} text-[11px] font-semibold px-2 py-0.5 rounded-full`}>
      {PAYMENT_LABEL[status]}
    </span>
  );
}
function ShipmentBadge({ status }: { status: ShipmentStatus }) {
  return (
    <span className={`badge-${status} text-[11px] font-semibold px-2 py-0.5 rounded-full`}>
      {SHIPMENT_LABEL[status]}
    </span>
  );
}

// ---- Order Detail Drawer ----
function OrderDetailDrawer({
  order,
  onClose,
}: {
  order: Order;
  onClose: () => void;
}) {
  const products = useStore((s) => s.products);
  const customers = useStore((s) => s.customers);
  const customer = customers.find((c) => c.id === order.customerId);

  return (
    <div className="fixed inset-0 z-50 flex">
      <div
        className="flex-1 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="w-full max-w-md bg-[hsl(var(--card))] border-l border-[hsl(var(--border))] h-full overflow-y-auto animate-slide-in p-6 space-y-5">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="font-bold text-lg">{order.id}</h2>
            <p className="text-sm text-[hsl(var(--muted-fg))]">{formatDate(order.date)}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-[hsl(var(--muted))] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

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

        <div className="card !p-4 space-y-2 text-sm">
          <h3 className="font-semibold mb-2">Rincian Biaya</h3>
          <div className="flex justify-between">
            <span className="text-[hsl(var(--muted-fg))]">Subtotal</span>
            <span>{formatRp(order.subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[hsl(var(--muted-fg))]">Admin Marketplace</span>
            <span className="text-red-600">−{formatRp(order.adminFee)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[hsl(var(--muted-fg))]">Ongkir</span>
            <span>{formatRp(order.shippingCost)}</span>
          </div>
          <div className="h-px bg-[hsl(var(--border))]" />
          <div className="flex justify-between font-bold">
            <span>Total Diterima</span>
            <span>{formatRp(order.subtotal - order.adminFee)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---- Add Example Order Button ----
function AddExampleOrderButton({ userId }: { userId: string }) {
  const simulateOrder = useStore((s) => s.simulateOrder);
  const [loading, setLoading] = useState(false);

  function handleClick() {
    setLoading(true);
    simulateOrder(userId);
    setTimeout(() => setLoading(false), 600);
  }

  return (
    <button
      id="add-order-example-btn"
      onClick={handleClick}
      disabled={loading}
      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-60 cursor-pointer"
    >
      <Plus className="w-4 h-4" />
      {loading ? "Memproses..." : "Tambah Pesanan Contoh"}
    </button>
  );
}

// ---- Main Page ----
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

  if (!canView) redirect("/tidak-ada-akses");

  // Filter
  const filtered = orders.filter((o) => {
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
  const PAYMENTS: PaymentStatus[] = ["lunas", "belum", "gagal"];
  const SHIPMENTS: ShipmentStatus[] = ["baru", "diproses", "dikemas", "dikirim", "selesai"];

  return (
    <DashboardLayout
      title="Penjualan"
      subtitle={`${filtered.length} pesanan dari semua kanal`}
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
        <select
          value={filterChannel}
          onChange={(e) => setFilterChannel(e.target.value as Channel | "")}
          className="px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
        >
          <option value="">Semua Kanal</option>
          {CHANNELS.map((c) => <option key={c} value={c}>{CHANNEL_LABEL[c]}</option>)}
        </select>

        <select
          value={filterPayment}
          onChange={(e) => setFilterPayment(e.target.value as PaymentStatus | "")}
          className="px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
        >
          <option value="">Status Bayar</option>
          {PAYMENTS.map((p) => <option key={p} value={p}>{PAYMENT_LABEL[p]}</option>)}
        </select>

        <select
          value={filterShipment}
          onChange={(e) => setFilterShipment(e.target.value as ShipmentStatus | "")}
          className="px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
        >
          <option value="">Status Kirim</option>
          {SHIPMENTS.map((s) => <option key={s} value={s}>{SHIPMENT_LABEL[s]}</option>)}
        </select>

        {canManage && user && <AddExampleOrderButton userId={user.id} />}
      </div>

      {/* Table */}
      <div className="card !p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[hsl(var(--border))] bg-[hsl(var(--muted))]">
                <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wide text-[hsl(var(--muted-fg))]">ID</th>
                <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wide text-[hsl(var(--muted-fg))]">Tanggal</th>
                <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wide text-[hsl(var(--muted-fg))]">Kanal</th>
                <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wide text-[hsl(var(--muted-fg))]">Pelanggan</th>
                <th className="text-right px-4 py-3 font-semibold text-xs uppercase tracking-wide text-[hsl(var(--muted-fg))]">Total</th>
                <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wide text-[hsl(var(--muted-fg))]">Bayar</th>
                <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wide text-[hsl(var(--muted-fg))]">Kirim</th>
                <th className="px-4 py-3" />
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
                filtered.map((order, idx) => {
                  const customer = customers.find((c) => c.id === order.customerId);
                  const isNew = order.id.startsWith("ORD-SIM-");
                  return (
                    <tr
                      key={order.id}
                      className={`border-b border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))] transition-colors cursor-pointer ${
                        isNew && idx === 0 ? "animate-highlight" : ""
                      }`}
                      onClick={() => setSelectedOrder(order)}
                    >
                      <td className="px-4 py-3 font-mono text-xs text-blue-600 dark:text-blue-400">{order.id}</td>
                      <td className="px-4 py-3 text-[hsl(var(--muted-fg))] text-xs whitespace-nowrap">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(order.date)}
                        </span>
                      </td>
                      <td className="px-4 py-3"><ChannelBadge channel={order.channel} /></td>
                      <td className="px-4 py-3 font-medium max-w-[150px] truncate">{customer?.name ?? "—"}</td>
                      <td className="px-4 py-3 font-semibold text-right">{formatRp(order.subtotal)}</td>
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

      {/* Drawer */}
      {selectedOrder && (
        <OrderDetailDrawer
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </DashboardLayout>
  );
}
