"use client";

import { useCurrentUser } from "@/hooks/useCurrentUser";
import { ALL_MODULES } from "@/lib/permissions";
import { useStore } from "@/lib/store";
import { can } from "@/lib/permissions";
import {
  ShoppingCart, Warehouse, CreditCard, Truck, User,
} from "lucide-react";
import type { ModuleKey } from "@/types";

// Widget kartu "Penugasan Saya"
function AssignmentCard() {
  const user = useCurrentUser();
  if (!user) return null;

  const assigned = ALL_MODULES.filter(
    (m) => user.permissions[m.key as ModuleKey] !== "none"
  );

  return (
    <div className="card">
      <div className="flex items-center gap-2 mb-3">
        <User className="w-4 h-4 text-[hsl(var(--muted-fg))]" />
        <h3 className="font-semibold text-sm">Penugasan Saya</h3>
      </div>
      <p className="text-xs text-[hsl(var(--muted-fg))] mb-3">
        Template: <span className="font-medium text-[hsl(var(--foreground))]">{user.template}</span>
      </p>
      <div className="flex flex-wrap gap-1.5">
        {assigned.map((m) => {
          const level = user.permissions[m.key as ModuleKey];
          return (
            <span
              key={m.key}
              className="text-[11px] px-2 py-0.5 rounded-full border font-medium"
              style={{
                background: level === "manage" ? "hsl(224 76% 93%)" : "hsl(220 14% 93%)",
                color: level === "manage" ? "hsl(224 76% 30%)" : "hsl(220 10% 40%)",
                borderColor: level === "manage" ? "hsl(224 76% 82%)" : "hsl(220 14% 82%)",
              }}
            >
              {m.label} · {level === "manage" ? "Kelola" : "Lihat"}
            </span>
          );
        })}
      </div>
    </div>
  );
}

// Widget untuk karyawan yang punya akses penjualan
function SalesWidget() {
  const orders = useStore((s) => s.orders);
  const today = new Date().toISOString().split("T")[0];
  const todayOrders = orders.filter((o) => o.date === today);

  return (
    <div className="card">
      <div className="flex items-center gap-2 mb-2">
        <ShoppingCart className="w-4 h-4 text-blue-500" />
        <h3 className="font-semibold text-sm">Pesanan Hari Ini</h3>
      </div>
      <p className="text-3xl font-bold">{todayOrders.length}</p>
      <p className="text-xs text-[hsl(var(--muted-fg))] mt-1">pesanan masuk hari ini</p>
    </div>
  );
}

// Widget stok menipis
function LowStockWidget() {
  const products = useStore((s) => s.products);
  const lowStock = products.filter((p) => p.stock <= p.minStock);

  return (
    <div className="card">
      <div className="flex items-center gap-2 mb-2">
        <Warehouse className="w-4 h-4 text-yellow-500" />
        <h3 className="font-semibold text-sm">Stok Menipis</h3>
      </div>
      <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">{lowStock.length}</p>
      <p className="text-xs text-[hsl(var(--muted-fg))] mt-1">produk perlu di-restock</p>
      {lowStock.length > 0 && (
        <ul className="mt-2 space-y-1">
          {lowStock.slice(0, 3).map((p) => (
            <li key={p.id} className="text-xs text-yellow-700 dark:text-yellow-400">
              • {p.name}: {p.stock} unit
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// Widget pengiriman
function ShipmentWidget() {
  const orders = useStore((s) => s.orders);
  const pending = orders.filter(
    (o) => o.shipmentStatus === "baru" || o.shipmentStatus === "diproses" || o.shipmentStatus === "dikemas"
  );

  return (
    <div className="card">
      <div className="flex items-center gap-2 mb-2">
        <Truck className="w-4 h-4 text-purple-500" />
        <h3 className="font-semibold text-sm">Perlu Dikemas/Dikirim</h3>
      </div>
      <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{pending.length}</p>
      <p className="text-xs text-[hsl(var(--muted-fg))] mt-1">pesanan menunggu proses</p>
    </div>
  );
}

// Widget pembayaran belum lunas
function PaymentWidget() {
  const orders = useStore((s) => s.orders);
  const unpaid = orders.filter((o) => o.paymentStatus === "belum");

  return (
    <div className="card">
      <div className="flex items-center gap-2 mb-2">
        <CreditCard className="w-4 h-4 text-red-500" />
        <h3 className="font-semibold text-sm">Pembayaran Belum Lunas</h3>
      </div>
      <p className="text-3xl font-bold text-red-600 dark:text-red-400">{unpaid.length}</p>
      <p className="text-xs text-[hsl(var(--muted-fg))] mt-1">pesanan menunggu pembayaran</p>
    </div>
  );
}

export function EmployeeWidgets() {
  const user = useCurrentUser();
  if (!user || user.isOwner) return null;

  return (
    <div className="space-y-4">
      <AssignmentCard />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {can(user, "penjualan", "view") && <SalesWidget />}
        {can(user, "stok", "view") && <LowStockWidget />}
        {can(user, "pengiriman", "view") && <ShipmentWidget />}
        {can(user, "pembayaran", "view") && <PaymentWidget />}
      </div>
    </div>
  );
}
