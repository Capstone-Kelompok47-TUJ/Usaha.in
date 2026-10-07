"use client";

import { useCurrentUser } from "@/hooks/useCurrentUser";
import { ALL_MODULES, can } from "@/lib/permissions";
import { useStore } from "@/lib/store";
import {
  CheckCircle2, CreditCard, ShoppingCart, Truck, User, Warehouse,
} from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import type { ModuleKey } from "@/types";

interface TaskCardProps {
  title: string;
  count: number;
  description: string;
  href: string;
  actionLabel: string;
  icon: ReactNode;
  tone: "blue" | "amber" | "purple" | "red";
}

function TaskCard({
  title,
  count,
  description,
  href,
  actionLabel,
  icon,
  tone,
}: TaskCardProps) {
  const toneStyles = {
    blue: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30",
    amber: "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30",
    purple: "text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/30",
    red: "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30",
  };

  return (
    <div className="card flex flex-col">
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${toneStyles[tone]}`}>
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-sm">{title}</h3>
          <p className="text-xs text-[hsl(var(--muted-fg))] mt-1">{description}</p>
        </div>
        <span className={`text-lg font-bold ${count > 0 ? toneStyles[tone].split(" ")[0] : "text-[hsl(var(--muted-fg))]"}`}>
          {count}
        </span>
      </div>
      <Link
        href={href}
        className="mt-4 inline-flex min-h-11 items-center justify-center rounded-lg border border-[hsl(var(--border))] px-3 text-xs font-semibold hover:bg-[hsl(var(--muted))] transition-colors"
      >
        {actionLabel}
      </Link>
    </div>
  );
}

function AssignmentCard() {
  const user = useCurrentUser();
  if (!user) return null;

  const assigned = ALL_MODULES.filter(
    (module) => user.permissions[module.key as ModuleKey] !== "none"
  );

  return (
    <div className="card">
      <div className="flex items-center gap-2 mb-3">
        <User className="w-4 h-4 text-[hsl(var(--muted-fg))]" />
        <h3 className="font-semibold text-sm">Penugasan Saya</h3>
      </div>
      <p className="text-xs text-[hsl(var(--muted-fg))] mb-3">
        Peran: <span className="font-medium text-[hsl(var(--foreground))]">{user.template}</span>
      </p>
      <div className="flex flex-wrap gap-1.5">
        {assigned.map((module) => {
          const level = user.permissions[module.key as ModuleKey];
          return (
            <span
              key={module.key}
              className="text-[11px] px-2 py-0.5 rounded-full border font-medium"
              style={{
                background: level === "manage" ? "hsl(224 76% 93%)" : "hsl(220 14% 93%)",
                color: level === "manage" ? "hsl(224 76% 30%)" : "hsl(220 10% 40%)",
                borderColor: level === "manage" ? "hsl(224 76% 82%)" : "hsl(220 14% 82%)",
              }}
            >
              {module.label} · {level === "manage" ? "Kelola" : "Lihat"}
            </span>
          );
        })}
      </div>
    </div>
  );
}

export function EmployeeWidgets() {
  const user = useCurrentUser();
  const orders = useStore((state) => state.orders);
  const products = useStore((state) => state.products);
  if (!user || user.isOwner) return null;

  const activeOrders = orders.filter((order) => !order.voided);
  const newOrders = activeOrders.filter(
    (order) => order.shipmentStatus === "baru" && order.paymentStatus !== "gagal"
  );
  const lowStockCount = products.filter(
    (product) => product.trackStock !== false && product.stock <= product.minStock
  ).length;
  const shipmentsToProcess = activeOrders.filter(
    (order) => ["baru", "diproses", "dikemas"].includes(order.shipmentStatus)
  ).length;
  const paymentsToFollowUp = activeOrders.filter(
    (order) => ["belum", "sebagian", "gagal"].includes(order.paymentStatus)
  ).length;

  const tasks: ReactNode[] = [];
  if (can(user, "penjualan", "view")) {
    tasks.push(
      <TaskCard
        key="sales"
        title="Pesanan baru"
        count={newOrders.length}
        description="Pesanan baru yang perlu dicatat atau diproses."
        href="/penjualan"
        actionLabel="Buka penjualan"
        icon={<ShoppingCart className="w-5 h-5" />}
        tone="blue"
      />
    );
  }
  if (can(user, "stok", "view")) {
    tasks.push(
      <TaskCard
        key="stock"
        title="Stok perlu diperiksa"
        count={lowStockCount}
        description="Produk yang sudah menyentuh batas stok minimum."
        href="/stok"
        actionLabel="Periksa stok"
        icon={<Warehouse className="w-5 h-5" />}
        tone="amber"
      />
    );
  }
  if (can(user, "pengiriman", "view")) {
    tasks.push(
      <TaskCard
        key="shipping"
        title="Pesanan perlu diproses"
        count={shipmentsToProcess}
        description="Pesanan baru, diproses, atau perlu dikemas."
        href="/pengiriman"
        actionLabel="Buka pengiriman"
        icon={<Truck className="w-5 h-5" />}
        tone="purple"
      />
    );
  }
  if (can(user, "pembayaran", "view")) {
    tasks.push(
      <TaskCard
        key="payments"
        title="Pembayaran perlu ditindaklanjuti"
        count={paymentsToFollowUp}
        description="Pesanan belum lunas, dibayar sebagian, atau gagal."
        href="/pembayaran"
        actionLabel="Cek pembayaran"
        icon={<CreditCard className="w-5 h-5" />}
        tone="red"
      />
    );
  }

  return (
    <div className="space-y-4">
      <section aria-labelledby="employee-tasks-title">
        <div className="flex items-start gap-2 mb-3">
          <div className="min-w-0">
            <h2 id="employee-tasks-title" className="text-base font-bold">Tugas Hari Ini</h2>
            <p className="text-xs text-[hsl(var(--muted-fg))] mt-1">
              Ringkasan pekerjaan sesuai akses dan penugasanmu.
            </p>
          </div>
        </div>
        {tasks.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {tasks}
          </div>
        ) : (
          <div className="card flex items-center gap-3 text-sm text-[hsl(var(--muted-fg))]">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
            Belum ada tugas operasional yang bisa ditampilkan untuk akses akunmu.
          </div>
        )}
      </section>
      <AssignmentCard />
    </div>
  );
}
