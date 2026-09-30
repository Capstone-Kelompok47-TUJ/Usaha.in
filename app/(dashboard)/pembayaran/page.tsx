"use client";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { usePermission } from "@/hooks/usePermission";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useStore } from "@/lib/store";
import { formatRp, formatDate } from "@/lib/finance";
import { redirect } from "next/navigation";
import { CheckCircle } from "lucide-react";
import type { PaymentStatus } from "@/types";

const PAYMENT_LABEL: Record<PaymentStatus, string> = { lunas: "Lunas", belum: "Belum Lunas", gagal: "Gagal" };

export default function PembayaranPage() {
  const { canView, canManage } = usePermission("pembayaran");
  const user = useCurrentUser();
  const orders = useStore((s) => s.orders);
  const customers = useStore((s) => s.customers);
  const markPaymentPaid = useStore((s) => s.markPaymentPaid);

  if (!canView) redirect("/tidak-ada-akses");

  const sorted = [...orders].sort((a, b) => {
    // Belum lunas dulu
    if (a.paymentStatus === "belum" && b.paymentStatus !== "belum") return -1;
    if (b.paymentStatus === "belum" && a.paymentStatus !== "belum") return 1;
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  const unpaidCount = orders.filter((o) => o.paymentStatus === "belum").length;

  return (
    <DashboardLayout title="Pembayaran" subtitle={`${unpaidCount} pesanan belum lunas`}>
      <div className="card !p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[hsl(var(--border))] bg-[hsl(var(--muted))]">
                {["ID Pesanan", "Tanggal", "Pelanggan", "Total", "Status", ...(canManage ? ["Aksi"] : [])].map((h) => (
                  <th key={h} className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wide text-[hsl(var(--muted-fg))]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map((o) => {
                const customer = customers.find((c) => c.id === o.customerId);
                return (
                  <tr key={o.id} className={`border-b border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))] transition-colors ${o.paymentStatus === "belum" ? "bg-yellow-50/50 dark:bg-yellow-900/10" : ""}`}>
                    <td className="px-4 py-3 font-mono text-xs text-blue-600 dark:text-blue-400">{o.id}</td>
                    <td className="px-4 py-3 text-[hsl(var(--muted-fg))] text-xs whitespace-nowrap">{formatDate(o.date)}</td>
                    <td className="px-4 py-3 font-medium">{customer?.name ?? "—"}</td>
                    <td className="px-4 py-3 font-semibold">{formatRp(o.subtotal)}</td>
                    <td className="px-4 py-3">
                      <span className={`badge-${o.paymentStatus} text-[11px] px-2 py-0.5 rounded-full font-semibold`}>
                        {PAYMENT_LABEL[o.paymentStatus]}
                      </span>
                    </td>
                    {canManage && (
                      <td className="px-4 py-3">
                        {o.paymentStatus === "belum" && user && (
                          <button
                            onClick={() => markPaymentPaid(o.id, user.id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-semibold hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            Tandai Lunas
                          </button>
                        )}
                      </td>
                    )}
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
