// ============================================================
// USAHA.IN — Central Type Definitions
// ============================================================

// --- TENANT (UMKM) ---

export type BusinessChannel = "marketplace" | "chat" | "offline";

export interface Tenant {
  id: string;
  name: string;
  slug: string; // e.g. "tokosejahtera"
  businessType: string;
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
  | "pembelian"
  | "pembayaran"
  | "pengiriman"
  | "pelanggan"
  | "keuangan"
  | "laporan"
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

export type PaymentStatus = "lunas" | "belum" | "gagal";

export type ShipmentStatus =
  | "baru"
  | "diproses"
  | "dikemas"
  | "dikirim"
  | "selesai";

// --- PRODUK & STOK ---

export interface Product {
  id: string;
  tenantId?: string;
  sku: string;
  name: string;
  sellPrice: number;
  buyPrice: number;
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
}

export interface Order {
  id: string;
  tenantId?: string;
  date: string;
  channel: Channel;
  customerId: string;
  items: OrderItem[];
  subtotal: number;
  adminFee: number;
  shippingCost: number;
  paymentStatus: PaymentStatus;
  shipmentStatus: ShipmentStatus;
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
