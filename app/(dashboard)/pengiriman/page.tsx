"use client";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { usePermission } from "@/hooks/usePermission";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useStore } from "@/lib/store";
import { formatRp } from "@/lib/finance";
import { redirect } from "next/navigation";
import { ChevronRight } from "lucide-react";
import type { ShipmentStatus, Order, Channel } from "@/types";

const COLUMNS: { key: ShipmentStatus; label: string; color: string }[] = [
  { key: "baru",      label: "🆕 Baru Masuk",  color: "border-t-blue-500" },
  { key: "diproses",  label: "⚙️ Diproses",    color: "border-t-purple-500" },
  { key: "dikemas",   label: "📦 Dikemas",      color: "border-t-yellow-500" },
  { key: "dikirim",   label: "🚚 Dikirim",      color: "border-t-orange-500" },
  { key: "selesai",   label: "✅ Selesai",      color: "border-t-green-500" },
];

const NEXT_STATUS: Record<ShipmentStatus, ShipmentStatus | null> = {
  baru: "diproses",
  diproses: "dikemas",
  dikemas: "dikirim",
  dikirim: "selesai",
  selesai: null,
};

const CHANNEL_LABEL: Record<string, string> = {
  shopee: "Shopee",
  marketplace_a: "Shopee",
  tokopedia: "Tokopedia",
  marketplace_b: "Tokopedia",
  chat: "WhatsApp",
  offline: "Toko Offline",
};

function KanbanCard({ order, canManage, userId }: { order: Order; canManage: boolean; userId?: string }) {
  const customers = useStore((s) => s.customers);
  const products = useStore((s) => s.products);
  const moveShipmentStatus = useStore((s) => s.moveShipmentStatus);
  const customer = customers.find((c) => c.id === order.customerId);
  const nextStatus = NEXT_STATUS[order.shipmentStatus];

  return (
    <div className={`card !p-3 space-y-2 animate-fade-in border-l-2 ${
      order.id.startsWith("ORD-SIM-") ? "border-l-blue-500" : "border-l-transparent"
    }`}>
      <div className="flex items-start justify-between gap-1">
        <span className="font-mono text-[10px] text-blue-600 dark:text-blue-400">{order.id}</span>
        <span className={`badge-${order.channel} text-[10px] px-1.5 py-0.5 rounded-full font-semibold shrink-0`}>
          {CHANNEL_LABEL[order.channel]}
        </span>
      </div>
      <p className="text-xs font-medium truncate">{customer?.name ?? "—"}</p>
      <p className="text-[10px] text-[hsl(var(--muted-fg))] truncate">
        {order.items.map((item) => {
          const p = products.find((pr) => pr.id === item.productId);
          return `${p?.name ?? "?"} ×${item.qty}`;
        }).join(", ")}
      </p>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold">{formatRp(order.subtotal)}</span>
        {canManage && nextStatus && userId && (
          <button
            onClick={() => moveShipmentStatus(order.id, nextStatus, userId)}
            className="flex items-center gap-0.5 text-[10px] text-blue-600 dark:text-blue-400 hover:text-blue-800 font-semibold transition-colors"
          >
            Lanjut <ChevronRight className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  );
}

export default function PengirimanPage() {
  const { canView, canManage } = usePermission("pengiriman");
  const user = useCurrentUser();
  const orders = useStore((s) => s.orders);

  if (!canView) redirect("/tidak-ada-akses");

  return (
    <DashboardLayout title="Pengiriman" subtitle="Papan kanban status pengiriman">
      <div className="flex gap-4 overflow-x-auto pb-4 min-h-[calc(100vh-12rem)]">
        {COLUMNS.map((col) => {
          const colOrders = orders
            .filter((o) => o.shipmentStatus === col.key)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

          return (
            <div key={col.key} className={`min-w-[220px] w-[220px] flex-shrink-0 flex flex-col rounded-xl border-t-2 ${col.color} bg-[hsl(var(--muted))] p-3`}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold">{col.label}</h3>
                <span className="text-xs font-bold px-1.5 py-0.5 rounded-full bg-[hsl(var(--card))] border border-[hsl(var(--border))]">
                  {colOrders.length}
                </span>
              </div>
              <div className="flex-1 space-y-2 overflow-y-auto">
                {colOrders.length === 0 ? (
                  <div className="text-center py-8 text-xs text-[hsl(var(--muted-fg))]">Kosong</div>
                ) : (
                  colOrders.map((order) => (
                    <KanbanCard
                      key={order.id}
                      order={order}
                      canManage={canManage}
                      userId={user?.id}
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </DashboardLayout>
  );
}
