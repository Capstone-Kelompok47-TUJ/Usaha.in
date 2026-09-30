// ============================================================
// USAHA.IN — Permissions System
// ============================================================

import type { Level, ModuleKey, TemplateKey, User } from "@/types";

// Semua modul yang bisa ditugaskan
export const ALL_MODULES: { key: ModuleKey; label: string }[] = [
  { key: "dashboard", label: "Dashboard" },
  { key: "penjualan", label: "Penjualan" },
  { key: "produk", label: "Produk" },
  { key: "stok", label: "Stok" },
  { key: "pembelian", label: "Pembelian" },
  { key: "pembayaran", label: "Pembayaran" },
  { key: "pengiriman", label: "Pengiriman" },
  { key: "pelanggan", label: "Pelanggan" },
  { key: "keuangan", label: "Keuangan" },
  { key: "laporan", label: "Laporan" },
  { key: "copilot", label: "AI Copilot" },
];

// Semua module none
export const NO_ACCESS: Record<ModuleKey, Level> = {
  dashboard: "none",
  penjualan: "none",
  produk: "none",
  stok: "none",
  pembelian: "none",
  pembayaran: "none",
  pengiriman: "none",
  pelanggan: "none",
  keuangan: "none",
  laporan: "none",
  copilot: "none",
};

// Akses penuh (Pemilik)
export const FULL_ACCESS: Record<ModuleKey, Level> = {
  dashboard: "manage",
  penjualan: "manage",
  produk: "manage",
  stok: "manage",
  pembelian: "manage",
  pembayaran: "manage",
  pengiriman: "manage",
  pelanggan: "manage",
  keuangan: "manage",
  laporan: "manage",
  copilot: "manage",
};

// Template penugasan jabatan
export const TEMPLATES: Record<TemplateKey, Record<ModuleKey, Level>> = {
  "Staf Penjualan": {
    ...NO_ACCESS,
    dashboard: "view",
    penjualan: "manage",
    pelanggan: "manage",
    produk: "view",
    pembayaran: "view",
  },
  "Staf Gudang": {
    ...NO_ACCESS,
    dashboard: "view",
    stok: "manage",
    produk: "view",
    pengiriman: "manage",
    penjualan: "view",
  },
  "Staf Pembelian": {
    ...NO_ACCESS,
    dashboard: "view",
    pembelian: "manage",
    stok: "view",
    produk: "view",
  },
  "Staf Keuangan": {
    ...NO_ACCESS,
    dashboard: "view",
    pembayaran: "manage",
    keuangan: "view",
    laporan: "view",
    penjualan: "view",
  },
  Kustom: {
    ...NO_ACCESS,
  },
};

/**
 * Fungsi utama pengecekan hak akses.
 * Pemilik selalu mendapat akses penuh.
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
