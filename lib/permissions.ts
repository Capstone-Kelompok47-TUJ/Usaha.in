// ============================================================
// USAHA.IN — Permissions System
// ============================================================

import type { Level, ModuleKey, TemplateKey, User } from "@/types";

// Modul yang bisa didelegasikan ke Karyawan
export const ALL_MODULES: { key: ModuleKey; label: string }[] = [
  { key: "dashboard",        label: "Dashboard" },
  { key: "penjualan",        label: "Penjualan" },
  { key: "produk",           label: "Produk" },
  { key: "stok",             label: "Stok" },
  { key: "pengeluaran",      label: "Pengeluaran" },
  { key: "pembayaran",       label: "Pembayaran & Piutang" },
  { key: "pengiriman",       label: "Pengiriman" },
  { key: "pelanggan",        label: "Pelanggan" },
  { key: "laporan_keuangan", label: "Laporan Keuangan" },
  { key: "laporan_periodik", label: "Laporan Periodik" },
  // analitik & copilot adalah OWNER_ONLY — tidak muncul di sini
];

// Fitur eksklusif Owner (tidak bisa didelegasikan ke Karyawan)
export const OWNER_ONLY_FEATURES = [
  "pengaturan",
  "manajemen_tim",
  "log_aktivitas",
  "analitik",
  "copilot",
  "uang_aman",
  "batas_pengeluaran_edit",
] as const;

// Semua modul none
export const NO_ACCESS: Record<ModuleKey, Level> = {
  dashboard:        "none",
  penjualan:        "none",
  produk:           "none",
  stok:             "none",
  pengeluaran:      "none",
  pembayaran:       "none",
  pengiriman:       "none",
  pelanggan:        "none",
  laporan_keuangan: "none",
  laporan_periodik: "none",
  analitik:         "none",
  copilot:          "none",
};

// Akses penuh (Owner)
export const FULL_ACCESS: Record<ModuleKey, Level> = {
  dashboard:        "manage",
  penjualan:        "manage",
  produk:           "manage",
  stok:             "manage",
  pengeluaran:      "manage",
  pembayaran:       "manage",
  pengiriman:       "manage",
  pelanggan:        "manage",
  laporan_keuangan: "manage",
  laporan_periodik: "manage",
  analitik:         "manage",
  copilot:          "manage",
};

// Template penugasan jabatan
export const TEMPLATES: Record<TemplateKey, Record<ModuleKey, Level>> = {
  "Staf Penjualan": {
    ...NO_ACCESS,
    dashboard:  "view",
    penjualan:  "manage",
    pelanggan:  "manage",
    produk:     "view",
    pembayaran: "view",
  },
  "Kasir": {
    ...NO_ACCESS,
    dashboard:   "view",
    penjualan:   "manage",
    pelanggan:   "view",
    produk:      "view",
    pembayaran:  "manage",
  },
  "Staf Gudang": {
    ...NO_ACCESS,
    dashboard:  "view",
    stok:       "manage",
    produk:     "view",
    pengiriman: "manage",
    penjualan:  "view",
  },
  "Staf Keuangan": {
    ...NO_ACCESS,
    dashboard:        "view",
    pembayaran:       "manage",
    pengeluaran:      "manage",
    laporan_keuangan: "view",
    laporan_periodik: "view",
    penjualan:        "view",
  },
  Kustom: {
    ...NO_ACCESS,
  },
};

/**
 * Fungsi utama pengecekan hak akses.
 * Owner selalu mendapat akses penuh.
 */
export function can(
  user: User | null,
  module: ModuleKey,
  level: "view" | "manage"
): boolean {
  if (!user) return false;
  if (user.isOwner) return true;
  if (!user.active) return false;

  const userLevel = user.permissions[module];
  if (level === "view") {
    return userLevel === "view" || userLevel === "manage";
  }
  return userLevel === "manage";
}

/**
 * Ambil semua modul yang bisa dilihat oleh user.
 */
export function getVisibleModules(user: User | null): ModuleKey[] {
  if (!user) return [];
  if (user.isOwner) return ALL_MODULES.map((m) => m.key);
  return ALL_MODULES.map((m) => m.key).filter((key) =>
    can(user, key, "view")
  );
}

