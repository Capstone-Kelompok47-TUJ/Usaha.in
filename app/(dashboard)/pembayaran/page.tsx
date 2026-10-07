"use client";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageIntro } from "@/components/ui/PageIntro";
import { EmptyState } from "@/components/ui/EmptyState";
import { Hint } from "@/components/ui/Hint";
import { usePermission } from "@/hooks/usePermission";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useStore } from "@/lib/store";
import { formatRp, formatDate } from "@/lib/finance";
import { redirect } from "next/navigation";
import { useState, useMemo } from "react";
import {
  CheckCircle2, Clock, Copy, CreditCard, AlertTriangle,
  X, DollarSign, ChevronRight, Banknote,
} from "lucide-react";
import type { PaymentStatus, Order } from "@/types";

// ============================================================
// Constants & Helpers
// ============================================================

const PAYMENT_LABEL: Record<PaymentStatus, string> = {
  lunas: "Lunas", sebagian: "Sebagian", belum: "Belum Lunas", gagal: "Gagal",
};

const PAYMENT_BADGE: Record<PaymentStatus, string> = {
  lunas: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
  sebagian: "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
  belum: "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300",
  gagal: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
};

// D1: Bucket umur piutang
type AgeBucket = "current" | "1-7" | "8-30" | "30+";

function getAgeBucket(dueDate?: string): AgeBucket {
  if (!dueDate) return "current";
  const diff = Math.floor((Date.now() - new Date(dueDate).getTime()) / (1000 * 60 * 60 * 24));
  if (diff <= 0) return "current";
  if (diff <= 7) return "1-7";
  if (diff <= 30) return "8-30";
  return "30+";
}

function getAgeLabel(dueDate?: string): string {
  if (!dueDate) return "Belum jatuh tempo";
  const diff = Math.floor((Date.now() - new Date(dueDate).getTime()) / (1000 * 60 * 60 * 24));
  if (diff <= 0) return `Jatuh tempo ${formatDate(dueDate)}`;
  if (diff === 1) return "Jatuh tempo kemarin";
  return `Lewat ${diff} hari`;
}

const BUCKET_ROW_COLOR: Record<AgeBucket, string> = {
  current: "",
  "1-7": "bg-amber-50/60 dark:bg-amber-950/10",
  "8-30": "bg-orange-50/60 dark:bg-orange-950/10",
  "30+": "bg-red-50/60 dark:bg-red-950/10",
};

const BUCKET_BADGE: Record<AgeBucket, string> = {
  current: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
  "1-7": "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
  "8-30": "bg-orange-100 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300",
  "30+": "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300",
};

function amountDue(order: Order): number {
  return order.subtotal - (order.discount ?? 0) - order.adminFee - order.shippingCost;
}

function amountPaid(order: Order): number {
  return (order.payments ?? []).reduce((s, p) => s + p.amount, 0);
}

// ============================================================
// D2 — Record Payment Modal
// ============================================================

function RecordPaymentModal({ order, onClose }: { order: Order; onClose: () => void }) {
  const recordPayment = useStore((s) => s.recordPayment);
  const customers = useStore((s) => s.customers);
  const customer = customers.find((c) => c.id === order.customerId);

  const due = amountDue(order);
  const paid = amountPaid(order);
  const remaining = due - paid;

  const [amount, setAmount] = useState(remaining);
  const [note, setNote] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (amount <= 0) { setError("Nominal harus lebih dari 0"); return; }
    if (amount > remaining) { setError(`Nominal melebihi sisa piutang (${formatRp(remaining)})`); return; }
    recordPayment(order.id, amount, note || undefined);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[hsl(var(--card))] rounded-2xl border border-[hsl(var(--border))] shadow-2xl w-full max-w-md p-6 animate-fade-in">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold text-base flex items-center gap-2">
            <Banknote className="w-5 h-5 text-blue-500" /> Catat Pembayaran
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[hsl(var(--muted))] transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Info pesanan */}
        <div className="rounded-xl bg-[hsl(var(--muted))] p-3.5 mb-4 text-sm space-y-1.5">
          <div className="flex justify-between">
            <span className="text-[hsl(var(--muted-fg))]">Pesanan</span>
            <span className="font-mono text-xs text-blue-600 dark:text-blue-400">{order.id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[hsl(var(--muted-fg))]">Pelanggan</span>
            <span className="font-medium">{customer?.name ?? "—"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[hsl(var(--muted-fg))]">Total Tagihan</span>
            <span className="font-semibold">{formatRp(due)}</span>
          </div>
          {paid > 0 && (
            <div className="flex justify-between">
              <span className="text-[hsl(var(--muted-fg))]">Sudah Dibayar</span>
              <span className="text-emerald-600 font-semibold">{formatRp(paid)}</span>
            </div>
          )}
          <div className="h-px bg-[hsl(var(--border))]" />
          <div className="flex justify-between font-bold">
            <span>Sisa Piutang</span>
            <span className="text-red-600 dark:text-red-400">{formatRp(remaining)}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-[hsl(var(--muted-fg))] block mb-1">
              Nominal Dibayar (Rp) *
            </label>
            <input
              type="number" min={1} max={remaining} value={amount}
              onChange={(e) => { setAmount(+e.target.value); setError(""); }}
              className={`w-full px-3 py-2 rounded-lg border bg-[hsl(var(--background))] text-sm focus:outline-none focus:ring-2 ${error ? "border-red-500 focus:ring-red-500/30" : "border-[hsl(var(--border))] focus:ring-blue-500/30"}`}
            />
            {error && <p className="text-[11px] text-red-500 mt-0.5">{error}</p>}
            {/* Quick fill buttons */}
            <div className="flex gap-2 mt-2">
              <button type="button" onClick={() => setAmount(remaining)}
                className="text-xs px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-semibold hover:bg-blue-100 transition-colors">
                Bayar Penuh ({formatRp(remaining)})
              </button>
              <button type="button" onClick={() => setAmount(Math.round(remaining / 2))}
                className="text-xs px-2.5 py-1 rounded-lg bg-[hsl(var(--muted))] text-[hsl(var(--muted-fg))] font-semibold hover:bg-[hsl(var(--border))] transition-colors">
                Setengah
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-[hsl(var(--muted-fg))] block mb-1">
              Catatan (opsional)
            </label>
            <input type="text" value={note} onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Transfer BCA, Tunai, dll."
              className="w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
          </div>

          {/* Preview sisa */}
          {amount > 0 && amount <= remaining && (
            <div className={`text-xs rounded-lg px-3 py-2 font-semibold ${amount >= remaining ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300" : "bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300"}`}>
              {amount >= remaining
                ? "✓ Lunas setelah pembayaran ini"
                : `Sisa setelah bayar: ${formatRp(remaining - amount)} → status Sebagian`}
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-[hsl(var(--border))] text-sm font-semibold">
              Batal
            </button>
            <button type="submit"
              className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-colors">
              Simpan Pembayaran
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

export default function PembayaranPage() {
  const { canView, canManage } = usePermission("pembayaran");
  const user = useCurrentUser();
  const orders = useStore((s) => s.orders);
  const customers = useStore((s) => s.customers);
  const addToast = useStore((s) => s.addToast);

  if (!canView) redirect("/tidak-ada-akses");

  const [filterStatus, setFilterStatus] = useState<PaymentStatus | "">("");
  const [filterBucket, setFilterBucket] = useState<AgeBucket | "">("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Hanya tampilkan yang belum/sebagian, exclude voided
  const unpaid = orders.filter((o) =>
    !o.voided && (o.paymentStatus === "belum" || o.paymentStatus === "sebagian")
  );

  const filtered = unpaid.filter((o) => {
    const bucket = getAgeBucket(o.dueDate);
    const matchStatus = !filterStatus || o.paymentStatus === filterStatus;
    const matchBucket = !filterBucket || bucket === filterBucket;
    return matchStatus && matchBucket;
  }).sort((a, b) => {
    const bucketOrder = { "30+": 0, "8-30": 1, "1-7": 2, current: 3 };
    const ba = getAgeBucket(a.dueDate), bb = getAgeBucket(b.dueDate);
    if (ba !== bb) return bucketOrder[ba] - bucketOrder[bb];
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });

  // Summary buckets
  const bucketSummary = useMemo(() => {
    const summary: Record<AgeBucket, { count: number; total: number }> = {
      current: { count: 0, total: 0 },
      "1-7": { count: 0, total: 0 },
      "8-30": { count: 0, total: 0 },
      "30+": { count: 0, total: 0 },
    };
    for (const o of unpaid) {
      const b = getAgeBucket(o.dueDate);
      const rem = amountDue(o) - amountPaid(o);
      summary[b].count++;
      summary[b].total += rem;
    }
    return summary;
  }, [unpaid]);

  const totalPiutang = unpaid.reduce((s, o) => s + (amountDue(o) - amountPaid(o)), 0);

  // D3: Copy collection message
  function handleCopyMessage(order: Order) {
    const customer = customers.find((c) => c.id === order.customerId);
    const rem = amountDue(order) - amountPaid(order);
    const dueStr = order.dueDate ? formatDate(order.dueDate) : "—";
    const msg = `Halo ${customer?.name ?? "Pelanggan"}, kami mengingatkan pembayaran pesanan ${order.id} sebesar ${formatRp(rem)} yang jatuh tempo ${dueStr}. Terima kasih atas kerjasamanya. 🙏`;
    navigator.clipboard.writeText(msg).then(() => {
      setCopiedId(order.id);
      addToast("Pesan tagihan berhasil disalin ke clipboard", "success");
      setTimeout(() => setCopiedId(null), 2000);
    }).catch(() => {
      addToast("Gagal menyalin pesan", "error");
    });
  }

  const BUCKET_LABELS: Record<AgeBucket, string> = {
    current: "Belum jatuh tempo",
    "1-7": "1–7 hari lewat",
    "8-30": "8–30 hari lewat",
    "30+": "> 30 hari lewat",
  };

  return (
    <DashboardLayout
      title="Tagihan dan Utang"
      subtitle={`${unpaid.length} tagihan belum lunas — total ${formatRp(totalPiutang)}`}
    >
      {/* Page Intro with Help Tips */}
      <PageIntro
        title="Tagihan & Piutang Pelanggan"
        description="Pantau seluruh tagihan pesanan yang belum lunas dari pembeli, umur jatuh tempo piutang, dan catat pelunasan pembayaran secara bertahap."
        badge={`${unpaid.length} Tagihan Aktif`}
        helpTips={[
          {
            title: "Kategori Umur Tagihan (Aging)",
            description: "Tagihan dikelompokkan: Belum Jatuh Tempo, 1–7 Hari Lewat, 8–30 Hari Lewat, dan >30 Hari Lewat untuk mempermudah prioritas penagihan.",
          },
          {
            title: "Catat Pembayaran Bertahap",
            description: "Klik tombol 'Bayar' untuk mencatat setoran uang tunai atau transfer sebagian saat pembeli mencicil tagihannya.",
          },
          {
            title: "Salin Pesan Pengingat",
            description: "Klik tombol ikon salin di sebelah kanan untuk menyalin draf pesan ramah pengingat pembayaran ke WhatsApp pembeli.",
          },
        ]}
      />

      {/* D1: Bucket Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {(["current", "1-7", "8-30", "30+"] as AgeBucket[]).map((bucket) => {
          const { count, total } = bucketSummary[bucket];
          const isActive = filterBucket === bucket;
          return (
            <button
              key={bucket}
              onClick={() => setFilterBucket(isActive ? "" : bucket)}
              className={`p-4 rounded-2xl border bg-[hsl(var(--card))] text-left transition-all hover:shadow-md cursor-pointer shadow-2xs ${isActive ? "ring-2 ring-blue-500 border-blue-500" : "border-[hsl(var(--border))]"} ${count === 0 ? "opacity-60" : ""}`}
            >
              <div className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold mb-2 ${BUCKET_BADGE[bucket]}`}>
                {BUCKET_LABELS[bucket]}
              </div>
              <p className="font-black text-base text-[hsl(var(--foreground))]">{formatRp(total)}</p>
              <p className="text-xs text-[hsl(var(--muted-fg))]">{count} tagihan</p>
            </button>
          );
        })}
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {(["belum", "sebagian"] as PaymentStatus[]).map((s) => (
          <button
            key={s}
            onClick={() => setFilterStatus(filterStatus === s ? "" : s)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${filterStatus === s ? "border-blue-500 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300" : "border-[hsl(var(--border))] text-[hsl(var(--muted-fg))] hover:border-blue-300"}`}
          >
            {PAYMENT_LABEL[s]}
          </button>
        ))}
        {(filterStatus || filterBucket) && (
          <button
            onClick={() => { setFilterStatus(""); setFilterBucket(""); }}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold text-[hsl(var(--muted-fg))] hover:text-red-500 flex items-center gap-1 cursor-pointer transition-colors"
          >
            <X className="w-3.5 h-3.5" /> Reset filter
          </button>
        )}
        <span className="ml-auto text-xs text-[hsl(var(--muted-fg))]">{filtered.length} tagihan ditampilkan</span>
      </div>

      {/* Table or Empty State */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={<CheckCircle2 className="w-7 h-7 text-emerald-500" />}
          title={filterStatus || filterBucket ? "Tidak Ada Tagihan Sesuai Filter" : "Semua Tagihan Sudah Lunas!"}
          description={
            filterStatus || filterBucket
              ? "Tidak ada tagihan yang cocok dengan pilihan filter saat ini. Coba klik 'Reset Filter'."
              : "Luar biasa! Tidak ada tagihan piutang pembeli yang tertunggak saat ini. Seluruh transaksi berstatus lunas."
          }
          secondaryActionText={filterStatus || filterBucket ? "Reset Filter" : undefined}
          onSecondaryAction={() => { setFilterStatus(""); setFilterBucket(""); }}
        />
      ) : (
        <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[hsl(var(--border))] bg-[hsl(var(--muted))]/50">
                  {["ID Pesanan", "Pelanggan", "Total Tagihan", "Sudah Dibayar", "Sisa Tagihan", "Umur Piutang", "Status", "Aksi"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wide text-[hsl(var(--muted-fg))]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((order) => {
                  const customer = customers.find((c) => c.id === order.customerId);
                  const bucket = getAgeBucket(order.dueDate);
                  const due = amountDue(order);
                  const paid = amountPaid(order);
                  const remaining = due - paid;
                  return (
                    <tr
                      key={order.id}
                      className={`border-b border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))]/60 transition-colors ${BUCKET_ROW_COLOR[bucket]}`}
                    >
                      <td className="px-4 py-3 font-mono text-xs text-blue-600 dark:text-blue-400 whitespace-nowrap font-semibold">
                        {order.id}
                      </td>
                      <td className="px-4 py-3 font-medium max-w-[140px] truncate text-[hsl(var(--foreground))]">
                        {customer?.name ?? "—"}
                      </td>
                      <td className="px-4 py-3 font-semibold whitespace-nowrap text-[hsl(var(--foreground))]">
                        {formatRp(due)}
                      </td>
                      <td className="px-4 py-3 text-emerald-600 dark:text-emerald-400 whitespace-nowrap font-semibold">
                        {paid > 0 ? formatRp(paid) : <span className="text-[hsl(var(--muted-fg))] font-normal">—</span>}
                      </td>
                      <td className="px-4 py-3 font-bold text-red-600 dark:text-red-400 whitespace-nowrap">
                        {formatRp(remaining)}
                      </td>
                      {/* D1: Umur piutang */}
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-0.5">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold w-fit ${BUCKET_BADGE[bucket]}`}>
                            {BUCKET_LABELS[bucket]}
                          </span>
                          <span className="text-[10px] text-[hsl(var(--muted-fg))]">
                            {getAgeLabel(order.dueDate)}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${PAYMENT_BADGE[order.paymentStatus]}`}>
                          {PAYMENT_LABEL[order.paymentStatus]}
                        </span>
                      </td>
                      {/* D2 + D3 Actions */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          {canManage && (
                            <button
                              onClick={() => setSelectedOrder(order)}
                              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
                            >
                              <DollarSign className="w-3.5 h-3.5" /> Bayar
                            </button>
                          )}
                          {/* D3: Salin pesan tagihan */}
                          <button
                            onClick={() => handleCopyMessage(order)}
                            title="Salin pesan tagihan pengingat ke WA"
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${copiedId === order.id ? "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30" : "text-[hsl(var(--muted-fg))] hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30"}`}
                          >
                            {copiedId === order.id
                              ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              : <Copy className="w-3.5 h-3.5" />
                            }
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* D2: Record Payment Modal */}
      {selectedOrder && (
        <RecordPaymentModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </DashboardLayout>
  );
}
