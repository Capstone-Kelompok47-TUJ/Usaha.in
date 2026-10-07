"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { can } from "@/lib/permissions";
import { useStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Receipt,
  CreditCard,
  Truck,
  Users,
  BarChart3,
  Bot,
  UsersRound,
  Activity,
  LogOut,
  Settings,
  PieChart,
  X,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { LogoIcon } from "@/components/ui/Logo";
import type { ModuleKey } from "@/types";
import { useState, useEffect } from "react";

// ── Types ──────────────────────────────────────────────────────────
interface NavItem {
  key: ModuleKey | "manajemen_tim" | "log_aktivitas" | "pengaturan" | "dashboard";
  label: string;
  href: string;
  icon: React.ReactNode;
  ownerOnly?: boolean;
  parentKey?: ModuleKey | "manajemen_tim";
  requiresStock?: boolean;
  requiresShipping?: boolean;
}

interface NavGroup {
  groupLabel?: string;
  items: NavItem[];
}

// ── Nav Config ─────────────────────────────────────────────────────
const NAV_GROUPS: NavGroup[] = [
  {
    groupLabel: "Beranda",
    items: [
      {
        key: "dashboard",
        label: "Beranda",
        href: "/dashboard",
        icon: <LayoutDashboard className="w-4 h-4" />,
      },
    ],
  },
  {
    groupLabel: "Kerja Harian",
    items: [
      {
        key: "penjualan",
        label: "Penjualan",
        href: "/penjualan",
        icon: <ShoppingCart className="w-4 h-4" />,
      },
      {
        key: "pengiriman",
        label: "Pengiriman",
        href: "/pengiriman",
        icon: <Truck className="w-4 h-4" />,
        requiresShipping: true,
      },
      {
        key: "pelanggan",
        label: "Pelanggan",
        href: "/pelanggan",
        icon: <Users className="w-4 h-4" />,
      },
      {
        key: "produk",
        label: "Produk dan Stok",
        href: "/produk",
        icon: <Package className="w-4 h-4" />,
        requiresStock: true,
      },
    ],
  },
  {
    groupLabel: "Uang",
    items: [
      {
        key: "pengeluaran",
        label: "Pengeluaran",
        href: "/pengeluaran",
        icon: <Receipt className="w-4 h-4" />,
      },
      {
        key: "pembayaran",
        label: "Tagihan dan Utang",
        href: "/pembayaran",
        icon: <CreditCard className="w-4 h-4" />,
      },
      {
        key: "laporan_keuangan",
        label: "Laporan Keuangan",
        href: "/keuangan",
        icon: <BarChart3 className="w-4 h-4" />,
      },
    ],
  },
  {
    groupLabel: "Bantuan Cerdas",
    items: [
      {
        key: "analitik",
        label: "Saran dan Analisis",
        href: "/analitik",
        icon: <PieChart className="w-4 h-4" />,
        ownerOnly: true,
      },
      {
        key: "copilot",
        label: "Tanya AI",
        href: "/copilot",
        icon: <Bot className="w-4 h-4" />,
        ownerOnly: true,
      },
    ],
  },
  {
    groupLabel: "Pengaturan",
    items: [
      {
        key: "manajemen_tim",
        label: "Tim",
        href: "/tim",
        icon: <UsersRound className="w-4 h-4" />,
        ownerOnly: true,
      },
      {
        key: "log_aktivitas",
        label: "Log Aktivitas",
        href: "/tim/log",
        icon: <Activity className="w-4 h-4" />,
        ownerOnly: true,
      },
      {
        key: "pengaturan",
        label: "Pengaturan Usaha",
        href: "/pengaturan",
        icon: <Settings className="w-4 h-4" />,
        ownerOnly: true,
      },
    ],
  },
];

export function Sidebar() {
  const user = useCurrentUser();
  const logout = useStore((s) => s.logout);
  const router = useRouter();
  const pathname = usePathname();
  const getActiveTenant = useStore((s) => s.getActiveTenant);
  const activeTenant = getActiveTenant();

  const useStock = activeTenant?.businessSettings?.useStock ?? true;
  const useShipping = activeTenant?.businessSettings?.useShipping ?? true;

  // Sidebar collapse state (desktop)
  const [collapsed, setCollapsed] = useState<boolean>(false);

  // Mobile sidebar open state
  const [mobileOpen, setMobileOpen] = useState(false);

  // Read collapsed state from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("usaha_in_sidebar_collapsed");
      if (saved !== null) {
        setCollapsed(saved === "true");
      }
    } catch {
      // ignore
    }
  }, []);

  function toggleCollapse() {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("usaha_in_sidebar_collapsed", String(next));
      } catch {
        // ignore
      }
      return next;
    });
  }

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
    if (item.key === "dashboard" || item.key === "manajemen_tim" || item.key === "log_aktivitas" || item.key === "pengaturan") {
      return true;
    }
    return can(user, item.key as ModuleKey, "view");
  }

  function isActive(item: NavItem): boolean {
    if (item.href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(item.href);
  }

  const renderSidebarContent = (isMobile: boolean = false) => {
    const isIconOnly = collapsed && !isMobile;

    return (
      <aside
        className={`flex flex-col h-full bg-[hsl(var(--sidebar-bg))] border-r border-white/5 transition-all duration-200 select-none ${
          isIconOnly ? "w-[68px]" : "w-60"
        }`}
      >
        {/* Logo / Header */}
        <div
          className={`flex items-center border-b border-white/5 shrink-0 ${
            isIconOnly
              ? "h-20 flex-col justify-center gap-1 px-1.5"
              : "h-16 justify-between px-4"
          }`}
        >
          <Link
            href="/dashboard"
            className={`flex items-center gap-2.5 hover:opacity-85 transition-opacity group ${
              isIconOnly ? "justify-center" : ""
            }`}
            title={isIconOnly ? `Usaha.in — ${activeTenant?.name ?? "UMKM"}` : undefined}
          >
            <LogoIcon className="w-8 h-8 group-hover:scale-105 transition-transform shrink-0" />
            {!isIconOnly && (
              <div className="min-w-0">
                <div className="font-bold text-white text-sm leading-tight flex items-center gap-1.5">
                  <span className="truncate">Usaha.in</span>
                  <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-400/20 shrink-0">
                    UMKM
                  </span>
                </div>
                <div className="text-[10px] text-white/40 leading-tight truncate">
                  {activeTenant?.name ?? "Manajemen Toko"}
                </div>
              </div>
            )}
          </Link>

          {/* Mobile close button */}
          {isMobile && (
            <button
              onClick={() => setMobileOpen(false)}
              className="p-1.5 rounded-md text-white/40 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Tutup menu"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          {!isMobile && (
            <button
              onClick={toggleCollapse}
              id="sidebar-collapse-toggle-btn"
              title={collapsed ? "Lebarkan menu" : "Ciutkan menu"}
              aria-label={collapsed ? "Lebarkan menu" : "Ciutkan menu"}
              className={`shrink-0 rounded-md text-white/40 hover:text-white hover:bg-white/10 transition-colors cursor-pointer ${
                isIconOnly ? "p-1.5" : "p-2"
              }`}
            >
              {collapsed ? (
                <PanelLeftOpen className="w-4 h-4" />
              ) : (
                <PanelLeftClose className="w-4 h-4" />
              )}
            </button>
          )}
        </div>

        {/* Nav groups */}
        <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-4 custom-scrollbar">
          {NAV_GROUPS.map((group) => {
            const visibleItems = group.items.filter(isVisible);
            if (visibleItems.length === 0) return null;

            return (
              <div key={group.groupLabel || "main"} className="space-y-1">
                {/* Group label */}
                {group.groupLabel && !isIconOnly && (
                  <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white/30">
                    {group.groupLabel}
                  </div>
                )}

                {/* Items */}
                <div className="space-y-0.5">
                  {visibleItems.map((item) => {
                    const active = isActive(item);
                    return (
                      <Link
                        key={item.key}
                        href={item.href}
                        title={isIconOnly ? item.label : undefined}
                        className={`
                          relative flex items-center rounded-xl transition-all group cursor-pointer
                          ${
                            isIconOnly
                              ? "justify-center p-2.5 my-1"
                              : "gap-3 px-3 py-2"
                          }
                          ${
                            active
                              ? "bg-white/12 text-white font-medium"
                              : "text-white/60 hover:bg-white/6 hover:text-white/90"
                          }
                        `}
                      >
                        {/* Active indicator strip */}
                        {active && (
                          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full bg-blue-400" />
                        )}

                        {/* Icon */}
                        <span
                          className={`shrink-0 transition-colors ${
                            active
                              ? "text-blue-300"
                              : "text-white/40 group-hover:text-white/70"
                          }`}
                        >
                          {item.icon}
                        </span>

                        {/* Label */}
                        {!isIconOnly && (
                          <span className="flex-1 min-w-0">
                            <span className="block text-sm leading-tight truncate">
                              {item.label}
                            </span>
                          </span>
                        )}

                        {/* AI badge */}
                        {!isIconOnly && item.key === "copilot" && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white uppercase tracking-wide shrink-0 shadow-2xs">
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

        {/* Footer / User controls */}
        <div className="p-2 border-t border-white/5 bg-black/15 shrink-0 space-y-1.5">
          {/* User badge */}
          <div
            className={`flex items-center rounded-lg bg-white/5 border border-white/5 ${
              isIconOnly ? "justify-center p-2" : "justify-between gap-2 p-2"
            }`}
          >
            <div
              className={`flex items-center min-w-0 ${
                isIconOnly ? "justify-center" : "gap-2.5"
              }`}
              title={`${user?.name ?? "Pengguna"} (${user?.isOwner ? "Pemilik Usaha" : "Karyawan"})`}
            >
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-semibold text-xs shrink-0 shadow-xs">
                {user?.name?.slice(0, 2).toUpperCase() ?? "U"}
              </div>
              {!isIconOnly && (
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-semibold text-white truncate leading-tight">
                    {user?.name ?? "Pengguna"}
                  </div>
                  <div className="text-[10px] text-white/50 truncate leading-tight mt-0.5">
                    {user?.isOwner ? "👑 Pemilik Usaha" : (user?.template || "Karyawan")}
                  </div>
                </div>
              )}
            </div>

            {!isIconOnly && (
              <button
                onClick={handleLogout}
                title="Keluar (Logout)"
                className="p-1.5 rounded-md text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-colors shrink-0"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </aside>
    );
  };

  return (
    <>
      {/* Desktop: always visible in-flow */}
      <div className="hidden lg:flex h-full shrink-0">
        {renderSidebarContent(false)}
      </div>

      {/* Mobile: hamburger button */}
      <button
        onClick={() => setMobileOpen(true)}
        id="sidebar-mobile-open-btn"
        className="lg:hidden fixed top-3.5 left-4 z-30 p-2 rounded-lg bg-[hsl(var(--sidebar-bg))] text-white shadow-lg border border-white/10"
        aria-label="Buka menu navigasi"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile: overlay */}
      {mobileOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-xs animate-fade-in"
            onClick={() => setMobileOpen(false)}
          />
          <div className="lg:hidden fixed inset-y-0 left-0 z-50 h-full animate-fade-in">
            {renderSidebarContent(true)}
          </div>
        </>
      )}
    </>
  );
}
