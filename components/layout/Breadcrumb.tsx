"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";

interface BreadcrumbRouteMap {
  [path: string]: {
    group?: string;
    title: string;
    parentHref?: string;
  };
}

const ROUTE_MAP: BreadcrumbRouteMap = {
  "/dashboard": { title: "Beranda" },
  "/penjualan": { group: "Kerja Harian", title: "Penjualan" },
  "/pengiriman": { group: "Kerja Harian", title: "Pengiriman" },
  "/pelanggan": { group: "Kerja Harian", title: "Pelanggan" },
  "/produk": { group: "Kerja Harian", title: "Produk dan Stok" },
  "/stok": { group: "Kerja Harian", title: "Stok Barang", parentHref: "/produk" },
  "/pengeluaran": { group: "Uang", title: "Pengeluaran" },
  "/pembayaran": { group: "Uang", title: "Tagihan dan Utang" },
  "/keuangan": { group: "Uang", title: "Laporan Keuangan" },
  "/laporan": { group: "Uang", title: "Laporan Periodik", parentHref: "/keuangan" },
  "/analitik": { group: "Bantuan Cerdas", title: "Saran dan Analisis" },
  "/copilot": { group: "Bantuan Cerdas", title: "Tanya AI" },
  "/tim": { group: "Pengaturan", title: "Tim" },
  "/tim/log": { group: "Pengaturan", title: "Log Aktivitas", parentHref: "/tim" },
  "/pengaturan": { group: "Pengaturan", title: "Pengaturan Usaha" },
};

export function Breadcrumb() {
  const pathname = usePathname();

  // Don't show breadcrumb on dashboard home page to keep clean
  if (pathname === "/dashboard" || !pathname) {
    return null;
  }

  const currentRoute = ROUTE_MAP[pathname] || {
    title: pathname.replace("/", "").replace(/-/g, " "),
  };

  return (
    <nav
      aria-label="Breadcrumb"
      className="flex items-center gap-1.5 text-xs text-[hsl(var(--muted-fg))] mb-3 select-none flex-wrap"
    >
      {/* Home Root */}
      <Link
        href="/dashboard"
        className="flex items-center gap-1 text-[hsl(var(--muted-fg))] hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
      >
        <Home className="w-3.5 h-3.5" />
        <span className="hidden sm:inline font-medium">Beranda</span>
      </Link>

      {/* Group */}
      {currentRoute.group && (
        <>
          <ChevronRight className="w-3 h-3 text-[hsl(var(--muted-fg))]/50 shrink-0" />
          <span className="font-medium text-[hsl(var(--muted-fg))]/80">
            {currentRoute.group}
          </span>
        </>
      )}

      {/* Parent route if subpage */}
      {currentRoute.parentHref && ROUTE_MAP[currentRoute.parentHref] && (
        <>
          <ChevronRight className="w-3 h-3 text-[hsl(var(--muted-fg))]/50 shrink-0" />
          <Link
            href={currentRoute.parentHref}
            className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium"
          >
            {ROUTE_MAP[currentRoute.parentHref].title}
          </Link>
        </>
      )}

      {/* Current Page */}
      <ChevronRight className="w-3 h-3 text-[hsl(var(--muted-fg))]/50 shrink-0" />
      <span className="font-semibold text-[hsl(var(--foreground))]">
        {currentRoute.title}
      </span>
    </nav>
  );
}
