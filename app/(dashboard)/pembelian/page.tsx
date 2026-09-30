"use client";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { usePermission } from "@/hooks/usePermission";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useStore } from "@/lib/store";
import { formatRp, formatDate } from "@/lib/finance";
import { redirect } from "next/navigation";
import { Plus, X } from "lucide-react";
import { useState } from "react";

function AddPurchaseModal({ onClose }: { onClose: () => void }) {
  const products = useStore((s) => s.products);
  const suppliers = useStore((s) => s.suppliers);
  const addPurchase = useStore((s) => s.addPurchase);
  const user = useCurrentUser();

  const [form, setForm] = useState({
    supplierId: suppliers[0]?.id ?? "",
    productId: products[0]?.id ?? "",
    qty: 10,
    buyPrice: products[0]?.buyPrice ?? 0,
    date: new Date().toISOString().split("T")[0],
    paid: false,
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    addPurchase({ ...form });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[hsl(var(--card))] rounded-xl border border-[hsl(var(--border))] shadow-xl w-full max-w-md p-6 animate-fade-in">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold text-base">Tambah Pembelian</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[hsl(var(--muted))] transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-[hsl(var(--muted-fg))] block mb-1">Supplier</label>
            <select
              value={form.supplierId}
              onChange={(e) => setForm({ ...form, supplierId: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            >
              {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-[hsl(var(--muted-fg))] block mb-1">Produk</label>
            <select
              value={form.productId}
              onChange={(e) => {
                const p = products.find((p) => p.id === e.target.value);
                setForm({ ...form, productId: e.target.value, buyPrice: p?.buyPrice ?? 0 });
              }}
              className="w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            >
              {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-[hsl(var(--muted-fg))] block mb-1">Jumlah (unit)</label>
              <input type="number" min={1} value={form.qty} onChange={(e) => setForm({ ...form, qty: +e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
            </div>
            <div>
              <label className="text-xs font-medium text-[hsl(var(--muted-fg))] block mb-1">Harga Beli/unit</label>
              <input type="number" min={0} value={form.buyPrice} onChange={(e) => setForm({ ...form, buyPrice: +e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-[hsl(var(--muted-fg))] block mb-1">Tanggal</label>
            <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="paid-check" checked={form.paid} onChange={(e) => setForm({ ...form, paid: e.target.checked })}
              className="w-4 h-4 rounded accent-blue-600" />
            <label htmlFor="paid-check" className="text-sm">Sudah dibayar</label>
          </div>
          <div className="pt-1">
            <p className="text-xs text-[hsl(var(--muted-fg))] mb-3">
              Total: <span className="font-bold text-[hsl(var(--foreground))]">{formatRp(form.qty * form.buyPrice)}</span>
              {" "}→ stok bertambah <span className="font-bold text-green-600">+{form.qty} unit</span>
            </p>
            <button type="submit"
              className="w-full py-2 rounded-lg bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition-colors">
              Simpan Pembelian
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function PembelianPage() {
  const { canView, canManage } = usePermission("pembelian");
  const purchases = useStore((s) => s.purchases);
  const products = useStore((s) => s.products);
  const suppliers = useStore((s) => s.suppliers);
  const [showModal, setShowModal] = useState(false);

  if (!canView) redirect("/tidak-ada-akses");

  const sorted = [...purchases].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <DashboardLayout title="Pembelian" subtitle="Pembelian ke supplier">
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-[hsl(var(--muted-fg))]">{purchases.length} transaksi pembelian</p>
        {canManage && (
          <button onClick={() => setShowModal(true)} id="add-purchase-btn"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors">
            <Plus className="w-4 h-4" /> Tambah Pembelian
          </button>
        )}
      </div>

      <div className="card !p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[hsl(var(--border))] bg-[hsl(var(--muted))]">
                {["ID", "Tanggal", "Supplier", "Produk", "Qty", "Harga/unit", "Total", "Status"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wide text-[hsl(var(--muted-fg))]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map((p) => {
                const product = products.find((pr) => pr.id === p.productId);
                const supplier = suppliers.find((s) => s.id === p.supplierId);
                return (
                  <tr key={p.id} className="border-b border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))] transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-blue-600 dark:text-blue-400">{p.id}</td>
                    <td className="px-4 py-3 text-[hsl(var(--muted-fg))] text-xs whitespace-nowrap">{formatDate(p.date)}</td>
                    <td className="px-4 py-3 font-medium">{supplier?.name ?? "—"}</td>
                    <td className="px-4 py-3">{product?.name ?? "—"}</td>
                    <td className="px-4 py-3 font-semibold text-green-600">+{p.qty}</td>
                    <td className="px-4 py-3">{formatRp(p.buyPrice)}</td>
                    <td className="px-4 py-3 font-semibold">{formatRp(p.qty * p.buyPrice)}</td>
                    <td className="px-4 py-3">
                      {p.paid
                        ? <span className="badge-lunas text-[11px] px-2 py-0.5 rounded-full font-semibold">Lunas</span>
                        : <span className="badge-belum text-[11px] px-2 py-0.5 rounded-full font-semibold">Belum</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && <AddPurchaseModal onClose={() => setShowModal(false)} />}
    </DashboardLayout>
  );
}
