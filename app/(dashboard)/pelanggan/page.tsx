"use client";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { usePermission } from "@/hooks/usePermission";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useStore } from "@/lib/store";
import { formatRp, formatDate } from "@/lib/finance";
import { redirect } from "next/navigation";
import { useMemo } from "react";
import { Bell, Crown, Users, TrendingUp, Clock } from "lucide-react";
import type { Channel } from "@/types";

// ============================================================
// Constants
// ============================================================

const CHANNEL_LABEL: Record<string, string> = {
  shopee: "Shopee", marketplace_a: "Shopee",
  tokopedia: "Tokopedia", marketplace_b: "Tokopedia",
  chat: "WhatsApp", offline: "Toko Offline",
};

const CHANNEL_BADGE: Record<string, string> = {
  marketplace_a: "bg-orange-100 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300",
  shopee: "bg-orange-100 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300",
  marketplace_b: "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-300",
  tokopedia: "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-300",
  chat: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
  offline: "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300",
};

// ============================================================
// F2 — RFM Segmentation
// ============================================================

type RfmSegment = "Juara" | "Setia" | "Berisiko" | "Baru" | "Hilang" | "Reguler";

const SEGMENT_COLOR: Record<RfmSegment, string> = {
  Juara: "bg-yellow-100 text-yellow-800 dark:bg-yellow-950/40 dark:text-yellow-300",
  Setia: "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300",
  Berisiko: "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300",
  Baru: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
  Hilang: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
  Reguler: "bg-violet-100 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300",
};

function calcRfmSegment(r: number, f: number, m: number): RfmSegment {
  // r=1 = terlama, r=3 = terbaru; f=1 = sedikit, f=3 = banyak
  if (r === 3 && f >= 3) return "Juara";
  if (f >= 3) return "Setia";
  if (r === 1 && f === 1) return "Hilang";
  if (r === 1 && (f >= 2 || m >= 2)) return "Berisiko";
  if (r === 3 && f === 1) return "Baru";
  return "Reguler";
}

function tertile(value: number, arr: number[]): 1 | 2 | 3 {
  const sorted = [...arr].sort((a, b) => a - b);
  const n = sorted.length;
  if (value <= sorted[Math.floor(n / 3)]) return 1;
  if (value <= sorted[Math.floor((2 * n) / 3)]) return 2;
  return 3;
}

// ============================================================
// F3 — Repeat Order Reminder
// ============================================================

function calcAvgInterval(dates: string[]): number | null {
  if (dates.length < 2) return null;
  const sorted = [...dates].sort();
  const diffs: number[] = [];
  for (let i = 1; i < sorted.length; i++) {
    const diff = (new Date(sorted[i]).getTime() - new Date(sorted[i - 1]).getTime()) / (1000 * 60 * 60 * 24);
    diffs.push(diff);
  }
  return diffs.reduce((s, d) => s + d, 0) / diffs.length;
}

// ============================================================
// Main Page
// ============================================================

export default function PelangganPage() {
  const { canView } = usePermission("pelanggan");
  const user = useCurrentUser();
  const customers = useStore((s) => s.customers);
  const orders = useStore((s) => s.orders);

  if (!canView) redirect("/tidak-ada-akses");

  const isOwner = user?.isOwner ?? false;

  // F1: Per-customer stats
  const customerStats = useMemo(() => {
    return customers.map((c) => {
      const custOrders = orders.filter(
        (o) => o.customerId === c.id && !o.voided
      );
      const paidOrders = custOrders.filter((o) => o.paymentStatus === "lunas");
      const totalSpend = paidOrders.reduce((s, o) => s + o.subtotal, 0);
      const orderCount = custOrders.length;
      const dates = custOrders.map((o) => o.date).sort();
      const lastOrderDate = dates[dates.length - 1] ?? null;
      const daysSinceLast = lastOrderDate
        ? Math.floor((Date.now() - new Date(lastOrderDate).getTime()) / (1000 * 60 * 60 * 24))
        : Infinity;
      const avgInterval = calcAvgInterval(dates);
      const isLate = avgInterval !== null && daysSinceLast > 1.5 * avgInterval && daysSinceLast >= 7;

      return { ...c, orderCount, totalSpend, lastOrderDate, daysSinceLast, avgInterval, isLate };
    }).sort((a, b) => b.totalSpend - a.totalSpend);
  }, [customers, orders]);

  // F2: RFM — only computed for Owner
  const customerWithRfm = useMemo(() => {
    if (!isOwner) return customerStats.map((c) => ({ ...c, rfm: null as null, segment: "Reguler" as RfmSegment }));

    const recencies = customerStats.map((c) => c.daysSinceLast === Infinity ? 999 : c.daysSinceLast);
    const frequencies = customerStats.map((c) => c.orderCount);
    const monetaries = customerStats.map((c) => c.totalSpend);

    return customerStats.map((c, i) => {
      const r = 4 - tertile(recencies[i], recencies); // invert: lower days = higher score
      const f = tertile(frequencies[i], frequencies);
      const m = tertile(monetaries[i], monetaries);
      const segment = calcRfmSegment(r as 1|2|3, f, m);
      return { ...c, rfm: { r, f, m }, segment };
    });
  }, [customerStats, isOwner]);

  // F3: Late customers
  const lateCustomers = useMemo(() => {
    if (!isOwner) return [];
    return customerWithRfm.filter((c) => c.isLate).slice(0, 10);
  }, [customerWithRfm, isOwner]);

  const totalCustomers = customers.length;
  const activeCustomers = customerStats.filter((c) => c.orderCount > 0).length;

  return (
    <DashboardLayout
      title="Pelanggan"
      subtitle={`${totalCustomers} pelanggan — ${activeCustomers} aktif`}
    >
      {/* F3: Pengingat repeat order (Owner only) */}
      {isOwner && lateCustomers.length > 0 && (
        <div className="mb-5 card border-amber-200 dark:border-amber-800/60 bg-amber-50/40 dark:bg-amber-950/10">
          <div className="flex items-center gap-2 mb-3">
            <Bell className="w-4 h-4 text-amber-500" />
            <h3 className="font-semibold text-sm text-amber-800 dark:text-amber-300">
              Pengingat Repeat Order — {lateCustomers.length} pelanggan terlambat
            </h3>
          </div>
          <div className="space-y-2">
            {lateCustomers.map((c) => (
              <div key={c.id} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-amber-200 dark:bg-amber-800 flex items-center justify-center text-xs font-bold text-amber-800 dark:text-amber-300">
                    {c.name[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{c.name}</p>
                    <p className="text-xs text-[hsl(var(--muted-fg))]">
                      Terakhir order {c.daysSinceLast} hari lalu · avg interval{" "}
                      {c.avgInterval ? Math.round(c.avgInterval) : "—"} hari
                    </p>
                  </div>
                </div>
                <span className="text-xs font-semibold text-amber-700 dark:text-amber-300 whitespace-nowrap">
                  {c.daysSinceLast === Infinity ? "Belum pernah" : `${c.daysSinceLast}h lalu`}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-4 mb-5">
        <div className="card">
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-4 h-4 text-blue-500" />
            <p className="text-xs text-[hsl(var(--muted-fg))]">Total Pelanggan</p>
          </div>
          <p className="text-2xl font-black">{totalCustomers}</p>
        </div>
        <div className="card">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            <p className="text-xs text-[hsl(var(--muted-fg))]">Pernah Belanja</p>
          </div>
          <p className="text-2xl font-black">{activeCustomers}</p>
        </div>
        <div className="card">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-amber-500" />
            <p className="text-xs text-[hsl(var(--muted-fg))]">Perlu Diingatkan</p>
          </div>
          <p className="text-2xl font-black">{lateCustomers.length}</p>
        </div>
      </div>

      {/* Main table */}
      <div className="card !p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[hsl(var(--border))] bg-[hsl(var(--muted))]">
                {[
                  "#", "Nama", "Kanal", "No. HP",
                  "Jml Pesanan", "Total Belanja", "Order Terakhir",
                  ...(isOwner ? ["Segmen"] : [])
                ].map((h) => (
                  <th key={h} className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wide text-[hsl(var(--muted-fg))]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {customerWithRfm.map((c, idx) => (
                <tr key={c.id}
                  className={`border-b border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))]/50 transition-colors ${c.isLate && isOwner ? "bg-amber-50/30 dark:bg-amber-950/10" : ""}`}>
                  {/* # */}
                  <td className="px-4 py-3 text-[hsl(var(--muted-fg))] text-xs">{idx + 1}</td>

                  {/* Nama */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {c.name[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium">{c.name}</p>
                        {c.isLate && isOwner && (
                          <p className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-0.5">
                            <Bell className="w-2.5 h-2.5" /> Terlambat repeat order
                          </p>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Kanal */}
                  <td className="px-4 py-3">
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${CHANNEL_BADGE[c.channel] ?? ""}`}>
                      {CHANNEL_LABEL[c.channel] ?? c.channel}
                    </span>
                  </td>

                  {/* No HP */}
                  <td className="px-4 py-3 font-mono text-xs text-[hsl(var(--muted-fg))]">
                    {c.phone ?? "—"}
                  </td>

                  {/* F1: Jumlah pesanan */}
                  <td className="px-4 py-3 font-semibold text-center">{c.orderCount}</td>

                  {/* F1: Total belanja */}
                  <td className="px-4 py-3 font-bold">
                    {c.totalSpend > 0 ? formatRp(c.totalSpend) : <span className="text-[hsl(var(--muted-fg))] font-normal">—</span>}
                  </td>

                  {/* F1: Tanggal order terakhir */}
                  <td className="px-4 py-3 text-xs text-[hsl(var(--muted-fg))] whitespace-nowrap">
                    {c.lastOrderDate ? (
                      <span>
                        {formatDate(c.lastOrderDate)}
                        <br />
                        <span className="text-[10px]">{c.daysSinceLast}h lalu</span>
                      </span>
                    ) : "—"}
                  </td>

                  {/* F2: RFM Segmen — Owner only */}
                  {isOwner && (
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {c.segment === "Juara" && <Crown className="w-3 h-3 text-yellow-500" />}
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${SEGMENT_COLOR[c.segment]}`}>
                          {c.segment}
                        </span>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* F2: Legend — Owner only */}
      {isOwner && (
        <div className="mt-4 card !p-4">
          <p className="text-xs font-semibold text-[hsl(var(--muted-fg))] mb-2 flex items-center gap-1">
            <Crown className="w-3.5 h-3.5 text-yellow-500" /> Segmen RFM (Owner)
          </p>
          <div className="flex flex-wrap gap-2">
            {(Object.entries(SEGMENT_COLOR) as [RfmSegment, string][]).map(([seg, cls]) => (
              <span key={seg} className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${cls}`}>
                {seg}
              </span>
            ))}
          </div>
          <p className="text-[10px] text-[hsl(var(--muted-fg))] mt-2">
            Juara (baru+sering) · Setia (sering) · Berisiko (lama+sering) · Baru (baru+sekali) · Hilang (lama+jarang) · Reguler (tengah)
          </p>
        </div>
      )}
    </DashboardLayout>
  );
}
