"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { can } from "@/lib/permissions";
import { useStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard, ShoppingCart, Package, Warehouse,
  Receipt, CreditCard, Truck, Users, BarChart3,
  FileText, Bot, UsersRound, Activity, LogOut,
  Settings, PieChart, X, Menu,
} from "lucide-react";
import { LogoIcon } from "@/components/ui/Logo";
import type { ModuleKey } from "@/types";
import { useState, useEffect } from "react";

// ── Types ──────────────────────────────────────────────────────────
interface NavItem {
  key: ModuleKey | "manajemen_tim" | "log_aktivitas" | "pengaturan";
  label: string;
  hint: string;            // deskripsi singkat fungsi menu
  href: string;
  icon: React.ReactNode;
  ownerOnly?: boolean;
  parentKey?: ModuleKey | "manajemen_tim";
  requiresStock?: boolean;
  requiresShipping?: boolean;
}

interface NavGroup {
  groupLabel: string;
  emoji: string;
  items: NavItem[];
}

// ── Nav Config ─────────────────────────────────────────────────────
const NAV_GROUPS: NavGroup[] = [
  {
    groupLabel: "Operasional",
    emoji: "🏪",
    items: [
      {
        key: "dashboard",
        label: "Ringkasan Hari Ini",
        hint: "Kas, peringatan, transaksi terkini",
        href: "/dashboard",
        icon: <LayoutDashboard className="w-4 h-4" />,
      },
      {
        key: "penjualan",
        label: "Penjualan",
        hint: "Catat & pantau pesanan masuk",
        href: "/penjualan",
        icon: <ShoppingCart className="w-4 h-4" />,
      },
      {
        key: "produk",
        label: "Produk",
        hint: "Daftar barang & harga jual",
        href: "/produk",
        icon: <Package className="w-4 h-4" />,
      },
      {
        key: "stok",
        label: "Stok Barang",
        hint: "Kelola persediaan & mutasi stok",
        href: "/stok",
        icon: <Warehouse className="w-4 h-4" />,
        requiresStock: true,
      },
      {
        key: "pengeluaran",
        label: "Pengeluaran",
        hint: "Catat biaya & belanja toko",
        href: "/pengeluaran",
        icon: <Receipt className="w-4 h-4" />,
      },
      {
        key: "pembayaran",
        label: "Piutang & Pembayaran",
        hint: "Tagihan & pelunasan pelanggan",
        href: "/pembayaran",
        icon: <CreditCard className="w-4 h-4" />,
      },
      {
        key: "pengiriman",
        label: "Pengiriman",
        hint: "Status & kanban paket keluar",
        href: "/pengiriman",
        icon: <Truck className="w-4 h-4" />,
        requiresShipping: true,
      },
      {
        key: "pelanggan",
        label: "Pelanggan",
        hint: "Data & segmentasi pembeli",
        href: "/pelanggan",
        icon: <Users className="w-4 h-4" />,
      },
    ],
  },
  {
    groupLabel: "Laporan & Wawasan",
    emoji: "📊",
    items: [
      {
        key: "laporan_keuangan",
        label: "Laporan Keuangan",
        hint: "Laba/rugi, neraca, arus kas",
        href: "/keuangan",
        icon: <BarChart3 className="w-4 h-4" />,
      },
      {
        key: "laporan_periodik",
        label: "Laporan Periodik",
        hint: "Rekap bulanan & cetak laporan",
        href: "/laporan",
        icon: <FileText className="w-4 h-4" />,
      },
      {
        key: "analitik",
        label: "Analitik Usaha",
        hint: "Tren penjualan & produk terlaris",
        href: "/analitik",
        icon: <PieChart className="w-4 h-4" />,
        ownerOnly: true,
      },
      {
        key: "copilot",
        label: "AI Konsultan",
        hint: "Tanya AI soal kondisi usahamu",
        href: "/copilot",
        icon: <Bot className="w-4 h-4" />,
        ownerOnly: true,
      },
    ],
  },
  {
    groupLabel: "Kelola",
    emoji: "⚙️",
    items: [
      {
        key: "manajemen_tim",
        label: "Tim & Karyawan",
        hint: "Tambah akun & atur hak akses",
        href: "/tim",
        icon: <UsersRound className="w-4 h-4" />,
        ownerOnly: true,
      },
      {
        key: "log_aktivitas",
        label: "Riwayat Aktivitas",
        hint: "Rekam jejak tindakan di sistem",
        href: "/tim/log",
        icon: <Activity className="w-4 h-4" />,
        ownerOnly: true,
        parentKey: "manajemen_tim",
      },
      {
        key: "pengaturan",
        label: "Pengaturan Toko",
        hint: "Profil usaha, batas biaya, fee",
        href: "/pengaturan",
        icon: <Settings className="w-4 h-4" />,
        ownerOnly: true,
      },
    ],
  },
];

// Flatten all items for convenience
const ALL_ITEMS = NAV_GROUPS.flatMap((g) => g.items);

// ── Component ─────────────────────────────────────────────────────
export function Sidebar() {
  const user = useCurrentUser();
  const logout = useStore((s) => s.logout);
  const router = useRouter();
  const pathname = usePathname();
  const getActiveTenant = useStore((s) => s.getActiveTenant);
  const activeTenant = getActiveTenant();

  const useStock = activeTenant?.businessSettings?.useStock ?? true;
  const useShipping = activeTenant?.businessSettings?.useShipping ?? true;

  // Mobile sidebar open state
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Close mobile sidebar on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setMobileOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  function handleLogout() {
    logout();
    router.push("/login");
  }

  function isVisible(item: NavItem): boolean {
    if (item.requiresStock && !useStock) return false;
    if (item.requiresShipping && !useShipping) return false;
    if (item.ownerOnly) return user?.isOwner ?? false;
    return can(user, item.key as ModuleKey, "view");
  }

  function isActive(item: NavItem): boolean {
    if (item.href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(item.href);
  }

  const sidebarContent = (
    <aside className="w-60 shrink-0 flex flex-col h-full bg-[hsl(var(--sidebar-bg))] border-r border-white/5">
      {/* Logo */}
      <div className="flex items-center justify-between px-4 h-16 border-b border-white/5 shrink-0">
        <Link
          href="/dashboard"
          className="flex items-center gap-2.5 hover:opacity-80 transition-opacity group"
        >
          <LogoIcon className="w-8 h-8 group-hover:scale-105 transition-transform" />
          <div>
            <div className="font-bold text-white text-sm leading-tight flex items-center gap-1.5">
              Usaha.in
              <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-400/20">
                UMKM
              </span>
            </div>
            <div className="text-[10px] text-white/40 leading-tight">
              {activeTenant?.name ?? "Manajemen Toko"}
            </div>
          </div>
        </Link>
        {/* Mobile close button */}
        <button
          onClick={() => setMobileOpen(false)}
          className="lg:hidden p-1.5 rounded-md text-white/40 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-2 py-3">
        {NAV_GROUPS.map((group) => {
          const visibleItems = group.items.filter(isVisible);
          if (visibleItems.length === 0) return null;

          return (
            <div key={group.groupLabel} className="mb-4">
              {/* Group header */}
              <div className="flex items-center gap-1.5 px-3 mb-1.5">
                <span className="text-[10px] leading-none">{group.emoji}</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-white/30 leading-none">
                  {group.groupLabel}
                </span>
              </div>

              {/* Items */}
              <div className="space-y-0.5">
                {visibleItems.map((item) => {
                  const active = isActive(item);
                  return (
                    <Link
                      key={item.key}
                      href={item.href}
                      className={`
                        relative flex items-center gap-3 rounded-lg transition-all group
                        ${item.parentKey ? "pl-5 pr-3 py-2" : "px-3 py-2"}
                        ${active
                          ? "bg-white/12 text-white"
                          : "text-white/55 hover:bg-white/6 hover:text-white/85"
                        }
                      `}
                    >
                      {/* Active indicator strip */}
                      {active && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full bg-blue-400" />
                      )}

                      {/* Icon */}
                      <span className={`shrink-0 transition-colors ${active ? "text-blue-300" : "text-white/35 group-hover:text-white/60"}`}>
                        {item.icon}
                      </span>

                      {/* Label + hint */}
                      <span className="flex-1 min-w-0">
                        <span className="block text-sm font-medium leading-tight truncate">
                          {item.label}
                        </span>
                        {!active && (
                          <span className="block text-[10px] text-white/28 group-hover:text-white/40 leading-tight truncate transition-colors mt-0.5">
                            {item.hint}
                          </span>
                        )}
                      </span>

                      {/* AI badge for copilot */}
                      {item.key === "copilot" && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white uppercase tracking-wide shrink-0">
                          AI
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      {/* User card */}
      <div className="p-3 border-t border-white/5 bg-black/10 shrink-0">
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
                {user?.isOwner ? "👑 Pemilik Usaha" : (user?.template || "Karyawan")}
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

  return (
    <>
      {/* Desktop: always visible */}
      <div className="hidden lg:flex h-full">
        {sidebarContent}
      </div>

      {/* Mobile: hamburger button (rendered inside Header slot via portal-like approach) */}
      <button
        onClick={() => setMobileOpen(true)}
        id="sidebar-mobile-open-btn"
        className="lg:hidden fixed top-4 left-4 z-40 p-2 rounded-lg bg-[hsl(var(--sidebar-bg))] text-white shadow-lg border border-white/10"
        aria-label="Buka menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile: overlay */}
      {mobileOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm animate-fade-in"
            onClick={() => setMobileOpen(false)}
          />
          <div className="lg:hidden fixed inset-y-0 left-0 z-50 h-full animate-fade-in">
            {sidebarContent}
          </div>
        </>
      )}
    </>
  );
}
