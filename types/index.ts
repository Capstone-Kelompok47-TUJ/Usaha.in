// ============================================================
// USAHA.IN — Central Type Definitions
// ============================================================

// --- TENANT (UMKM) ---

export type BusinessChannel = "marketplace" | "chat" | "offline";

export type BusinessType = "dagang" | "produksi" | "jasa";

export interface BusinessSettings {
  businessType: BusinessType;
  useStock: boolean;
  useProduction: boolean;
  useShipping: boolean;
  useCredit: boolean;
  defaultShopeeFeePct: number;   // default 7.5 (untuk simulasi demo)
  defaultTokopediaFeePct: number; // default 3.5 (untuk simulasi demo)
}

export interface Tenant {
  id: string;
  name: string;
  slug: string; // e.g. "tokosejahtera"
  businessType: string; // deskripsi bebas (kuliner, fashion, dll.)
  businessSettings: BusinessSettings;
  city: string;
  province: string;
  address?: string;
  phone: string;
  channels: BusinessChannel[];
  nib?: string;
  createdAt: string;
}

// --- AKSES & PENGGUNA ---

export type Level = "none" | "view" | "manage";

export type ModuleKey =
  | "dashboard"
  | "penjualan"
  | "produk"
  | "stok"
  | "pengeluaran"
  | "pembayaran"
  | "pengiriman"
  | "pelanggan"
  | "laporan_keuangan"
  | "laporan_periodik"
  | "analitik"
  | "copilot";

export type TemplateKey =
  | "Staf Penjualan"
  | "Staf Gudang"
  | "Staf Pembelian"
  | "Staf Keuangan"
  | "Kustom";

export interface User {
  id: string;
  tenantId: string;
  username: string; // e.g. "ahmad"
  loginEmail: string; // e.g. "ahmad@tokosejahtera.usaha.in"
  contactEmail: string; // e.g. "ahmad@gmail.com"
  phone?: string;
  password: string; // state memori
  name: string;
  isOwner: boolean;
  active: boolean;
  template: TemplateKey | string;
  permissions: Record<ModuleKey, Level>;
}

// --- KANAL & STATUS ---

export type Channel =
  | "shopee"
  | "tokopedia"
  | "marketplace_a"
  | "marketplace_b"
  | "chat"
  | "offline";

export type PaymentStatus = "lunas" | "sebagian" | "belum" | "gagal";

export type ShipmentStatus =
  | "baru"
  | "diproses"
  | "dikemas"
  | "dikirim"
  | "selesai";

// --- PRODUK & STOK ---

export type ProductType = "dagang" | "produksi" | "jasa";

export interface Product {
  id: string;
  tenantId?: string;
  sku: string;
  name: string;
  productType?: ProductType;  // E1: Jenis produk
  trackStock?: boolean;       // E1: Lacak stok (default true)
  sellPrice: number;
  buyPrice: number;
  avgCost?: number;           // E2: Moving average HPP
  stock: number;
  minStock: number;
  channels: Channel[];
}

export type StockMovementType = "sale" | "purchase" | "adjustment";

export interface StockMovement {
  id: string;
  tenantId?: string;
  productId: string;
  type: StockMovementType;
  qty: number; // negatif = keluar, positif = masuk
  date: string;
  refId: string; // order ID atau purchase ID
  note?: string;
}

// --- PESANAN ---

export interface OrderItem {
  productId: string;
  qty: number;
  unitPrice: number;
  cogsUnit?: number; // snapshot HPP saat penjualan
}

export interface SalePayment {
  id: string;
  date: string;
  amount: number;
  note?: string;
}

export interface Order {
  id: string;
  tenantId?: string;
  date: string;
  channel: Channel;
  customerId: string;
  items: OrderItem[];
  subtotal: number;
  discount?: number;
  adminFee: number;
  shippingCost: number;
  paymentStatus: PaymentStatus;
  shipmentStatus: ShipmentStatus;
  dueDate?: string;
  note?: string;
  externalOrderId?: string;
  voided?: boolean;
  voidedAt?: string;
  payments?: SalePayment[]; // riwayat pembayaran
}

// --- PEMBELIAN ---

export interface Purchase {
  id: string;
  tenantId?: string;
  supplierId: string;
  productId: string;
  qty: number;
  buyPrice: number;
  date: string;
  paid: boolean;
}

// --- PENGELUARAN ---

export type ExpenseCategoryGroup =
  | "cogs"        // Harga Pokok (Bahan Baku, Stok)
  | "selling"     // Beban Penjualan (Fee, Iklan, Ongkir)
  | "operating"   // Beban Operasional (Sewa, Gaji, Listrik)
  | "other"       // Beban Lain-lain
  | "non_expense"; // Tidak masuk L/R (Prive)

export interface ExpenseCategory {
  id: string;
  name: string;
  group: ExpenseCategoryGroup;
  active: boolean;
  isStockRelated?: boolean; // true = tampilkan item stok saat input
}

export interface ExpenseItem {
  productId: string;
  qty: number;
  unitCost: number;
}

export interface Expense {
  id: string;
  tenantId?: string;
  date: string;
  categoryId: string;
  amount: number;
  paid: boolean;          // true = Lunas, false = Belum
  dueDate?: string;       // tanggal jatuh tempo jika belum lunas
  vendor?: string;        // pemasok/vendor (opsional)
  note?: string;
  items?: ExpenseItem[];  // hanya jika isStockRelated
  budgetExceedReason?: string; // alasan jika melebihi batas
  isPrive?: boolean;      // true = tab Prive
  paidDate?: string;      // tanggal dilunasi
}

// --- SUPPLIER ---

export interface Supplier {
  id: string;
  tenantId?: string;
  name: string;
  contact: string;
  address: string;
}

// --- PELANGGAN ---

export interface Customer {
  id: string;
  tenantId?: string;
  name: string;
  channel: Channel;
  phone?: string;
  email?: string;
}

// --- LOG AKTIVITAS ---

export interface ActivityLog {
  id: string;
  tenantId?: string;
  userId: string;
  userName: string;
  action: string;
  module: string;
  timestamp: string;
}

// --- KEUANGAN ---

export interface FinanceSummary {
  revenue: number;
  cogs: number; // HPP
  adminFee: number;
  shippingCost: number;
  operationalExpense: number;
  netProfit: number;
}

export interface ChannelFinance {
  channel: Channel;
  revenue: number;
  adminFee: number;
  shippingCost: number;
  cogs: number;
  netProfit: number;
  margin: number; // persen
}

// --- COPILOT ---

export interface CopilotMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

// --- STORE STATE ---

export interface AppState {
  // Multi-Tenant
  tenants: Tenant[];
  activeTenantId: string;

  // Pengguna
  users: User[];
  currentUserId: string;

  // Data bisnis
  products: Product[];
  stockMovements: StockMovement[];
  orders: Order[];
  purchases: Purchase[];
  suppliers: Supplier[];
  customers: Customer[];

  // Log
  activityLogs: ActivityLog[];

  // UI state
  toasts: Toast[];
}

export interface Toast {
  id: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
}
