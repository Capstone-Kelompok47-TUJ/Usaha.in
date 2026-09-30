"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { can } from "@/lib/permissions";
import { useStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard, ShoppingCart, Package, Warehouse,
  ShoppingBag, CreditCard, Truck, Users, BarChart3,
  FileText, Bot, UsersRound, Activity, ChevronRight, LogOut,
} from "lucide-react";
import { LogoIcon } from "@/components/ui/Logo";
import type { ModuleKey } from "@/types";

interface NavItem {
  key: ModuleKey | "manajemen_tim" | "log_aktivitas";
  label: string;
  href: string;
  icon: React.ReactNode;
  ownerOnly?: boolean;
  parentKey?: ModuleKey | "manajemen_tim";
}

const NAV_ITEMS: NavItem[] = [
  { key: "dashboard",   label: "Dashboard",      href: "/dashboard",     icon: <LayoutDashboard className="w-4 h-4" /> },
  { key: "penjualan",   label: "Penjualan",       href: "/penjualan",     icon: <ShoppingCart className="w-4 h-4" /> },
  { key: "produk",      label: "Produk",          href: "/produk",        icon: <Package className="w-4 h-4" /> },
  { key: "stok",        label: "Stok",            href: "/stok",          icon: <Warehouse className="w-4 h-4" /> },
  { key: "pembelian",   label: "Pembelian",       href: "/pembelian",     icon: <ShoppingBag className="w-4 h-4" /> },
  { key: "pembayaran",  label: "Pembayaran",      href: "/pembayaran",    icon: <CreditCard className="w-4 h-4" /> },
  { key: "pengiriman",  label: "Pengiriman",      href: "/pengiriman",    icon: <Truck className="w-4 h-4" /> },
  { key: "pelanggan",   label: "Pelanggan",       href: "/pelanggan",     icon: <Users className="w-4 h-4" /> },
  { key: "keuangan",    label: "Keuangan",        href: "/keuangan",      icon: <BarChart3 className="w-4 h-4" /> },
  { key: "laporan",     label: "Laporan",         href: "/laporan",       icon: <FileText className="w-4 h-4" /> },
  { key: "copilot",     label: "AI Copilot",      href: "/copilot",       icon: <Bot className="w-4 h-4" /> },
  { key: "manajemen_tim", label: "Manajemen Tim", href: "/tim",           icon: <UsersRound className="w-4 h-4" />, ownerOnly: true },
  { key: "log_aktivitas", label: "Log Aktivitas", href: "/tim/log",       icon: <Activity className="w-4 h-4" />, ownerOnly: true, parentKey: "manajemen_tim" },
];

export function Sidebar() {
  const user = useCurrentUser();
  const logout = useStore((s) => s.logout);
  const router = useRouter();
  const pathname = usePathname();

  function handleLogout() {
    logout();
    router.push("/login");
  }

  const visibleItems = NAV_ITEMS.filter((item) => {
    if (item.ownerOnly) return user?.isOwner ?? false;
    return can(user, item.key as ModuleKey, "view");
  });

  return (
    <aside className="w-60 shrink-0 flex flex-col h-full bg-[hsl(var(--sidebar-bg))] border-r border-white/5">
      {/* Logo */}
      <Link
        href="/dashboard"
        className="flex items-center gap-2.5 px-5 h-16 border-b border-white/5 shrink-0 hover:bg-white/5 transition-colors group"
      >
        <LogoIcon className="w-9 h-9 group-hover:scale-105 transition-transform" />
        <div>
          <div className="font-bold text-white text-sm leading-tight flex items-center gap-1.5">
            Usaha.in
            <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-400/20">
              UMKM
            </span>
          </div>
          <div className="text-[10px] text-white/40 leading-tight">Manajemen UMKM</div>
        </div>
      </Link>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-0.5">
        {visibleItems.map((item) => {
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.key}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group
                ${item.parentKey ? "pl-6" : ""}
                ${
                  isActive
                    ? "bg-white/10 text-white"
                    : "text-white/55 hover:bg-white/6 hover:text-white/85"
                }
              `}
            >
              <span
                className={`shrink-0 transition-colors ${
                  isActive
                    ? "text-white"
                    : "text-white/40 group-hover:text-white/70"
                }`}
              >
                {item.icon}
              </span>
              <span className="flex-1">{item.label}</span>
              {isActive && (
                <ChevronRight className="w-3 h-3 text-white/50 shrink-0" />
              )}
              {item.key === "copilot" && !item.parentKey && (
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white uppercase tracking-wide shrink-0">
                  AI
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User profile & logout bar */}
      <div className="p-3 border-t border-white/5 bg-black/10">
        <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-white/5 border border-white/5">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-semibold text-xs shrink-0 shadow">
              {user?.name?.slice(0, 2).toUpperCase() ?? "U"}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-semibold text-white truncate leading-tight">
                {user?.name ?? "Pengguna"}
              </div>
              <div className="text-[10px] text-white/50 truncate leading-tight mt-0.5">
                {user?.isOwner ? "👑 Pemilik" : user?.template}
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Keluar (Logout)"
            className="p-1.5 rounded-md text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-colors shrink-0"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
