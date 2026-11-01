// ============================================================
// USAHA.IN — Master Data Awal (Multi-Tenant Bersih)
// Bebas data dummy: setiap toko baru mulai dari nol dan terisolasi
// ============================================================

import {
  Tenant,
  User,
  Product,
  StockMovement,
  Order,
  Purchase,
  Supplier,
  Customer,
  ActivityLog,
  ExpenseCategory,
  Expense,
} from "@/types";

// ============================================================
// KATEGORI PENGELUARAN STANDAR (Tipe: Dagang / Jasa / Produksi)
// ============================================================

export const INITIAL_EXPENSE_CATEGORIES: ExpenseCategory[] = [
  { id: "cat-bahan-baku",   name: "Belanja stok (masuk persediaan, bukan beban)", group: "cogs", active: true, isStockRelated: true },
  { id: "cat-kemasan",      name: "Kemasan",                    group: "cogs",      active: true },
  { id: "cat-iklan",        name: "Iklan & Promosi",            group: "selling",   active: true },
  { id: "cat-ongkir",       name: "Ongkir Ditanggung Penjual",  group: "selling",   active: true },
  { id: "cat-sewa",         name: "Sewa",                       group: "operating", active: true },
  { id: "cat-gaji",         name: "Gaji & Upah",               group: "operating", active: true },
  { id: "cat-listrik",      name: "Listrik / Air / Internet",   group: "operating", active: true },
  { id: "cat-transportasi", name: "Transportasi",               group: "operating", active: true },
  { id: "cat-admin-bank",   name: "Biaya Admin Bank",           group: "other",     active: true },
  { id: "cat-lainnya",      name: "Lainnya",                    group: "other",     active: true },
  { id: "cat-prive",        name: "Prive (Pengambilan Pribadi Pemilik)", group: "non_expense", active: true },
];

// Seluruh data transaksi, tenant, pengguna, dan produk awal dikosongkan.
// Setiap toko yang dibuat atau login via Supabase akan memiliki data unik sendiri.
export const INITIAL_EXPENSES: Expense[] = [];
export const INITIAL_TENANTS: Tenant[] = [];
export const INITIAL_USERS: User[] = [];
export const INITIAL_SUPPLIERS: Supplier[] = [];
export const INITIAL_PRODUCTS: Product[] = [];
export const INITIAL_CUSTOMERS: Customer[] = [];
export const INITIAL_ORDERS: Order[] = [];
export const INITIAL_PURCHASES: Purchase[] = [];
export const INITIAL_STOCK_MOVEMENTS: StockMovement[] = [];
export const INITIAL_ACTIVITY_LOGS: ActivityLog[] = [];

// ============================================================
// INISIALISASI UNTUK TENANT BARU (BERSIH DARI DATA PALSU)
// ============================================================

export function createInitialTenantData(tenant: Tenant, owner: User) {
  const activityLogs: ActivityLog[] = [
    {
      id: `LOG-REG-${Date.now()}`,
      tenantId: tenant.id,
      userId: owner.id,
      userName: owner.name,
      action: `mendaftarkan usaha ${tenant.name} dan mengaktifkan akun pemilik`,
      module: "manajemen_tim",
      timestamp: new Date().toISOString(),
    },
  ];

  return {
    products: [] as Product[],
    suppliers: [] as Supplier[],
    customers: [] as Customer[],
    orders: [] as Order[],
    purchases: [] as Purchase[],
    stockMovements: [] as StockMovement[],
    activityLogs,
  };
}
