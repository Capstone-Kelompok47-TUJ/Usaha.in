// ============================================================
// USAHA.IN — Mock Data
// Bisnis: UMKM makanan/minuman kemasan
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
  Channel,
  PaymentStatus,
  ShipmentStatus,
} from "@/types";
import { FULL_ACCESS, TEMPLATES, NO_ACCESS } from "@/lib/permissions";

// ============================================================
// TENANT CONTOH
// ============================================================

export const INITIAL_TENANTS: Tenant[] = [
  {
    id: "tenant-tokosejahtera",
    name: "Toko Sejahtera",
    slug: "tokosejahtera",
    businessType: "Kuliner & F&B",
    city: "Bandung",
    province: "Jawa Barat",
    address: "Jl. Riau No. 45, Bandung",
    phone: "0812-3456-7890",
    channels: ["marketplace", "chat", "offline"],
    nib: "1234567890123",
    createdAt: "2026-01-01T00:00:00.000Z",
  },
];

// ============================================================
// PENGGUNA
// ============================================================

export const INITIAL_USERS: User[] = [
  {
    id: "owner-1",
    tenantId: "tenant-tokosejahtera",
    username: "ahmad",
    loginEmail: "ahmad@tokosejahtera.usaha.in",
    contactEmail: "ahmad@gmail.com",
    phone: "0812-3456-7890",
    password: "owner123",
    name: "Pak Ahmad (Pemilik)",
    isOwner: true,
    active: true,
    template: "Kustom",
    permissions: FULL_ACCESS,
  },
  {
    id: "emp-sari",
    tenantId: "tenant-tokosejahtera",
    username: "sari",
    loginEmail: "sari@tokosejahtera.usaha.in",
    contactEmail: "sari@gmail.com",
    phone: "0813-4567-8901",
    password: "sari123",
    name: "Sari",
    isOwner: false,
    active: true,
    template: "Staf Penjualan",
    permissions: TEMPLATES["Staf Penjualan"],
  },
  {
    id: "emp-budi",
    tenantId: "tenant-tokosejahtera",
    username: "budi",
    loginEmail: "budi@tokosejahtera.usaha.in",
    contactEmail: "budi@gmail.com",
    phone: "0814-5678-9012",
    password: "budi123",
    name: "Budi",
    isOwner: false,
    active: true,
    template: "Staf Gudang",
    permissions: TEMPLATES["Staf Gudang"],
  },
  {
    id: "emp-rina",
    tenantId: "tenant-tokosejahtera",
    username: "rina",
    loginEmail: "rina@tokosejahtera.usaha.in",
    contactEmail: "rina@gmail.com",
    phone: "0815-6789-0123",
    password: "rina123",
    name: "Rina",
    isOwner: false,
    active: true,
    template: "Staf Keuangan",
    permissions: TEMPLATES["Staf Keuangan"],
  },
];

// ============================================================
// SUPPLIER
// ============================================================

export const INITIAL_SUPPLIERS: Supplier[] = [
  {
    id: "sup-1",
    name: "CV Nusantara Kopi",
    contact: "0812-1111-2222",
    address: "Jl. Kebun Kopi No. 12, Bandung",
  },
  {
    id: "sup-2",
    name: "UD Teh Sejahtera",
    contact: "0813-3333-4444",
    address: "Jl. Perkebunan Teh Blok B, Puncak",
  },
  {
    id: "sup-3",
    name: "PT Gula Aren Makmur",
    contact: "0821-5555-6666",
    address: "Jl. Industri Pangan No. 7, Bogor",
  },
];

// ============================================================
// PRODUK
// ============================================================

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: "prod-1",
    sku: "KOP-ARA-250",
    name: "Kopi Arabika 250g",
    sellPrice: 85000,
    buyPrice: 52000,
    stock: 8, // di bawah minStock → alert
    minStock: 15,
    channels: ["marketplace_a", "marketplace_b"],
  },
  {
    id: "prod-2",
    sku: "KOP-ROB-500",
    name: "Kopi Robusta 500g",
    sellPrice: 72000,
    buyPrice: 42000,
    stock: 34,
    minStock: 20,
    channels: ["marketplace_a", "marketplace_b"],
  },
  {
    id: "prod-3",
    sku: "TEH-MEL-100",
    name: "Teh Melati Premium 100g",
    sellPrice: 45000,
    buyPrice: 25000,
    stock: 12, // di bawah minStock → alert
    minStock: 20,
    channels: ["marketplace_b"],
  },
  {
    id: "prod-4",
    sku: "GUL-ARN-500",
    name: "Gula Aren Cair 500ml",
    sellPrice: 38000,
    buyPrice: 20000,
    stock: 55,
    minStock: 25,
    channels: ["marketplace_a"],
  },
  {
    id: "prod-5",
    sku: "COO-CHO-BOX",
    name: "Cookies Coklat Box",
    sellPrice: 65000,
    buyPrice: 35000,
    stock: 28,
    minStock: 15,
    channels: ["marketplace_a", "marketplace_b"],
  },
  {
    id: "prod-6",
    sku: "TEH-HIJ-50",
    name: "Teh Hijau Organik 50g",
    sellPrice: 55000,
    buyPrice: 30000,
    stock: 40,
    minStock: 15,
    channels: ["marketplace_b"],
  },
  {
    id: "prod-7",
    sku: "KOP-ARA-100",
    name: "Kopi Arabika 100g (Sachet)",
    sellPrice: 42000,
    buyPrice: 24000,
    stock: 60,
    minStock: 25,
    channels: ["marketplace_a"],
  },
  {
    id: "prod-8",
    sku: "COO-VAN-BOX",
    name: "Cookies Vanilla Box",
    sellPrice: 58000,
    buyPrice: 32000,
    stock: 22,
    minStock: 10,
    channels: ["marketplace_a", "marketplace_b"],
  },
  {
    id: "prod-9",
    sku: "GUL-ARN-250",
    name: "Gula Aren Cair 250ml",
    sellPrice: 22000,
    buyPrice: 12000,
    stock: 70,
    minStock: 30,
    channels: ["marketplace_a"],
  },
  {
    id: "prod-10",
    sku: "TEH-CAM-MIX",
    name: "Teh Campur Mix Box",
    sellPrice: 78000,
    buyPrice: 45000,
    stock: 18,
    minStock: 10,
    channels: ["marketplace_b"],
  },
];

// ============================================================
// PELANGGAN
// ============================================================

export const INITIAL_CUSTOMERS: Customer[] = [
  { id: "cust-1", name: "Ibu Dewi Rahayu", channel: "marketplace_a", phone: "0812-0001-0001" },
  { id: "cust-2", name: "Bpk. Rudi Santoso", channel: "marketplace_b", phone: "0813-0002-0002" },
  { id: "cust-3", name: "Ibu Lia Purnama", channel: "chat", phone: "0821-0003-0003" },
  { id: "cust-4", name: "Toko Warung Pintar", channel: "offline", phone: "0812-0004-0004" },
  { id: "cust-5", name: "Kafe Nusantara", channel: "offline", phone: "0813-0005-0005" },
  { id: "cust-6", name: "Ibu Sinta Melani", channel: "marketplace_a", phone: "0821-0006-0006" },
  { id: "cust-7", name: "Bpk. Hendra Wijaya", channel: "marketplace_b", phone: "0812-0007-0007" },
  { id: "cust-8", name: "Ibu Ratna Kusuma", channel: "chat", phone: "0813-0008-0008" },
  { id: "cust-9", name: "Toko Sehat Alami", channel: "marketplace_a", phone: "0821-0009-0009" },
  { id: "cust-10", name: "Ibu Fitri Handayani", channel: "marketplace_b", phone: "0812-0010-0010" },
  { id: "cust-11", name: "Mas Agus Prasetyo", channel: "chat", phone: "0813-0011-0011" },
  { id: "cust-12", name: "Warung Barokah", channel: "offline", phone: "0821-0012-0012" },
  { id: "cust-13", name: "Ibu Maya Indah", channel: "marketplace_a", phone: "0812-0013-0013" },
  { id: "cust-14", name: "Bpk. Doni Kurniawan", channel: "marketplace_b", phone: "0813-0014-0014" },
  { id: "cust-15", name: "Ibu Nurul Aini", channel: "chat", phone: "0821-0015-0015" },
  { id: "cust-16", name: "Kantin Maju Jaya", channel: "offline", phone: "0812-0016-0016" },
  { id: "cust-17", name: "Ibu Sri Wahyuni", channel: "marketplace_a", phone: "0813-0017-0017" },
  { id: "cust-18", name: "Bpk. Tono Susanto", channel: "marketplace_b", phone: "0821-0018-0018" },
];

// ============================================================
// HELPER: buat tanggal mundur dari hari ini
// ============================================================
function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split("T")[0];
}

// ============================================================
// PESANAN (40–60 pesanan, tersebar 30 hari)
// Marketplace A ±40%, Marketplace B ±30%, Chat ±17%, Offline ±13%
// Minggu ini (0–6 hari lalu): laba lebih rendah karena adminFee naik
// ============================================================

interface RawOrder {
  id: string;
  date: string;
  channel: Channel;
  customerId: string;
  productId: string;
  qty: number;
  unitPrice: number;
  adminFeePct: number; // persen dari subtotal
  shippingCost: number;
  paymentStatus: PaymentStatus;
  shipmentStatus: ShipmentStatus;
}

const rawOrders: RawOrder[] = [
  // --- Marketplace A (22 pesanan, ~40%) ---
  // Minggu ini: adminFee naik ke 7–8% (skenario laba turun)
  { id: "ORD-001", date: daysAgo(0), channel: "marketplace_a", customerId: "cust-1", productId: "prod-1", qty: 2, unitPrice: 85000, adminFeePct: 8, shippingCost: 9000, paymentStatus: "lunas", shipmentStatus: "baru" },
  { id: "ORD-002", date: daysAgo(1), channel: "marketplace_a", customerId: "cust-6", productId: "prod-5", qty: 3, unitPrice: 65000, adminFeePct: 7.5, shippingCost: 9000, paymentStatus: "lunas", shipmentStatus: "diproses" },
  { id: "ORD-003", date: daysAgo(2), channel: "marketplace_a", customerId: "cust-9", productId: "prod-2", qty: 1, unitPrice: 72000, adminFeePct: 7.5, shippingCost: 9000, paymentStatus: "lunas", shipmentStatus: "dikemas" },
  { id: "ORD-004", date: daysAgo(3), channel: "marketplace_a", customerId: "cust-13", productId: "prod-7", qty: 2, unitPrice: 42000, adminFeePct: 7, shippingCost: 9000, paymentStatus: "belum", shipmentStatus: "baru" },
  { id: "ORD-005", date: daysAgo(4), channel: "marketplace_a", customerId: "cust-17", productId: "prod-4", qty: 4, unitPrice: 38000, adminFeePct: 7, shippingCost: 9000, paymentStatus: "lunas", shipmentStatus: "dikirim" },
  { id: "ORD-006", date: daysAgo(5), channel: "marketplace_a", customerId: "cust-1", productId: "prod-8", qty: 2, unitPrice: 58000, adminFeePct: 8, shippingCost: 9000, paymentStatus: "lunas", shipmentStatus: "selesai" },
  { id: "ORD-007", date: daysAgo(6), channel: "marketplace_a", customerId: "cust-6", productId: "prod-1", qty: 1, unitPrice: 85000, adminFeePct: 7.5, shippingCost: 9000, paymentStatus: "gagal", shipmentStatus: "baru" },
  // Minggu lalu (7–13 hari): adminFee normal 5–6%
  { id: "ORD-008", date: daysAgo(7), channel: "marketplace_a", customerId: "cust-9", productId: "prod-2", qty: 2, unitPrice: 72000, adminFeePct: 6, shippingCost: 9000, paymentStatus: "lunas", shipmentStatus: "selesai" },
  { id: "ORD-009", date: daysAgo(8), channel: "marketplace_a", customerId: "cust-13", productId: "prod-5", qty: 1, unitPrice: 65000, adminFeePct: 6, shippingCost: 9000, paymentStatus: "lunas", shipmentStatus: "selesai" },
  { id: "ORD-010", date: daysAgo(10), channel: "marketplace_a", customerId: "cust-17", productId: "prod-7", qty: 3, unitPrice: 42000, adminFeePct: 5.5, shippingCost: 9000, paymentStatus: "lunas", shipmentStatus: "selesai" },
  { id: "ORD-011", date: daysAgo(11), channel: "marketplace_a", customerId: "cust-1", productId: "prod-4", qty: 2, unitPrice: 38000, adminFeePct: 5.5, shippingCost: 9000, paymentStatus: "lunas", shipmentStatus: "selesai" },
  { id: "ORD-012", date: daysAgo(13), channel: "marketplace_a", customerId: "cust-6", productId: "prod-8", qty: 2, unitPrice: 58000, adminFeePct: 5, shippingCost: 9000, paymentStatus: "lunas", shipmentStatus: "selesai" },
  { id: "ORD-013", date: daysAgo(15), channel: "marketplace_a", customerId: "cust-9", productId: "prod-9", qty: 5, unitPrice: 22000, adminFeePct: 5, shippingCost: 9000, paymentStatus: "lunas", shipmentStatus: "selesai" },
  { id: "ORD-014", date: daysAgo(17), channel: "marketplace_a", customerId: "cust-13", productId: "prod-1", qty: 1, unitPrice: 85000, adminFeePct: 5, shippingCost: 9000, paymentStatus: "lunas", shipmentStatus: "selesai" },
  { id: "ORD-015", date: daysAgo(19), channel: "marketplace_a", customerId: "cust-17", productId: "prod-2", qty: 2, unitPrice: 72000, adminFeePct: 5, shippingCost: 9000, paymentStatus: "lunas", shipmentStatus: "selesai" },
  { id: "ORD-016", date: daysAgo(21), channel: "marketplace_a", customerId: "cust-1", productId: "prod-5", qty: 1, unitPrice: 65000, adminFeePct: 5, shippingCost: 9000, paymentStatus: "lunas", shipmentStatus: "selesai" },
  { id: "ORD-017", date: daysAgo(22), channel: "marketplace_a", customerId: "cust-6", productId: "prod-7", qty: 3, unitPrice: 42000, adminFeePct: 5, shippingCost: 9000, paymentStatus: "lunas", shipmentStatus: "selesai" },
  { id: "ORD-018", date: daysAgo(24), channel: "marketplace_a", customerId: "cust-9", productId: "prod-4", qty: 2, unitPrice: 38000, adminFeePct: 5, shippingCost: 9000, paymentStatus: "lunas", shipmentStatus: "selesai" },
  { id: "ORD-019", date: daysAgo(25), channel: "marketplace_a", customerId: "cust-13", productId: "prod-8", qty: 1, unitPrice: 58000, adminFeePct: 5, shippingCost: 9000, paymentStatus: "lunas", shipmentStatus: "selesai" },
  { id: "ORD-020", date: daysAgo(27), channel: "marketplace_a", customerId: "cust-17", productId: "prod-9", qty: 4, unitPrice: 22000, adminFeePct: 5, shippingCost: 9000, paymentStatus: "lunas", shipmentStatus: "selesai" },
  { id: "ORD-021", date: daysAgo(28), channel: "marketplace_a", customerId: "cust-1", productId: "prod-1", qty: 1, unitPrice: 85000, adminFeePct: 5, shippingCost: 9000, paymentStatus: "lunas", shipmentStatus: "selesai" },
  { id: "ORD-022", date: daysAgo(29), channel: "marketplace_a", customerId: "cust-6", productId: "prod-2", qty: 2, unitPrice: 72000, adminFeePct: 5, shippingCost: 9000, paymentStatus: "lunas", shipmentStatus: "selesai" },

  // --- Marketplace B (16 pesanan, ~30%) — margin lebih baik, adminFee 3–4% ---
  { id: "ORD-023", date: daysAgo(0), channel: "marketplace_b", customerId: "cust-2", productId: "prod-3", qty: 2, unitPrice: 45000, adminFeePct: 4, shippingCost: 7000, paymentStatus: "lunas", shipmentStatus: "baru" },
  { id: "ORD-024", date: daysAgo(2), channel: "marketplace_b", customerId: "cust-7", productId: "prod-6", qty: 1, unitPrice: 55000, adminFeePct: 3.5, shippingCost: 7000, paymentStatus: "lunas", shipmentStatus: "diproses" },
  { id: "ORD-025", date: daysAgo(3), channel: "marketplace_b", customerId: "cust-10", productId: "prod-10", qty: 1, unitPrice: 78000, adminFeePct: 4, shippingCost: 7000, paymentStatus: "belum", shipmentStatus: "baru" },
  { id: "ORD-026", date: daysAgo(5), channel: "marketplace_b", customerId: "cust-14", productId: "prod-3", qty: 3, unitPrice: 45000, adminFeePct: 3.5, shippingCost: 7000, paymentStatus: "lunas", shipmentStatus: "dikirim" },
  { id: "ORD-027", date: daysAgo(7), channel: "marketplace_b", customerId: "cust-18", productId: "prod-6", qty: 2, unitPrice: 55000, adminFeePct: 3.5, shippingCost: 7000, paymentStatus: "lunas", shipmentStatus: "selesai" },
  { id: "ORD-028", date: daysAgo(9), channel: "marketplace_b", customerId: "cust-2", productId: "prod-8", qty: 1, unitPrice: 58000, adminFeePct: 3.5, shippingCost: 7000, paymentStatus: "lunas", shipmentStatus: "selesai" },
  { id: "ORD-029", date: daysAgo(11), channel: "marketplace_b", customerId: "cust-7", productId: "prod-10", qty: 2, unitPrice: 78000, adminFeePct: 3.5, shippingCost: 7000, paymentStatus: "lunas", shipmentStatus: "selesai" },
  { id: "ORD-030", date: daysAgo(13), channel: "marketplace_b", customerId: "cust-10", productId: "prod-5", qty: 1, unitPrice: 65000, adminFeePct: 3, shippingCost: 7000, paymentStatus: "lunas", shipmentStatus: "selesai" },
  { id: "ORD-031", date: daysAgo(15), channel: "marketplace_b", customerId: "cust-14", productId: "prod-6", qty: 2, unitPrice: 55000, adminFeePct: 3, shippingCost: 7000, paymentStatus: "lunas", shipmentStatus: "selesai" },
  { id: "ORD-032", date: daysAgo(17), channel: "marketplace_b", customerId: "cust-18", productId: "prod-3", qty: 1, unitPrice: 45000, adminFeePct: 3, shippingCost: 7000, paymentStatus: "lunas", shipmentStatus: "selesai" },
  { id: "ORD-033", date: daysAgo(19), channel: "marketplace_b", customerId: "cust-2", productId: "prod-10", qty: 1, unitPrice: 78000, adminFeePct: 3, shippingCost: 7000, paymentStatus: "lunas", shipmentStatus: "selesai" },
  { id: "ORD-034", date: daysAgo(21), channel: "marketplace_b", customerId: "cust-7", productId: "prod-8", qty: 2, unitPrice: 58000, adminFeePct: 3, shippingCost: 7000, paymentStatus: "lunas", shipmentStatus: "selesai" },
  { id: "ORD-035", date: daysAgo(23), channel: "marketplace_b", customerId: "cust-10", productId: "prod-2", qty: 1, unitPrice: 72000, adminFeePct: 3, shippingCost: 7000, paymentStatus: "lunas", shipmentStatus: "selesai" },
  { id: "ORD-036", date: daysAgo(25), channel: "marketplace_b", customerId: "cust-14", productId: "prod-6", qty: 3, unitPrice: 55000, adminFeePct: 3, shippingCost: 7000, paymentStatus: "lunas", shipmentStatus: "selesai" },
  { id: "ORD-037", date: daysAgo(27), channel: "marketplace_b", customerId: "cust-18", productId: "prod-5", qty: 1, unitPrice: 65000, adminFeePct: 3, shippingCost: 7000, paymentStatus: "lunas", shipmentStatus: "selesai" },
  { id: "ORD-038", date: daysAgo(29), channel: "marketplace_b", customerId: "cust-2", productId: "prod-3", qty: 2, unitPrice: 45000, adminFeePct: 3, shippingCost: 7000, paymentStatus: "lunas", shipmentStatus: "selesai" },

  // --- Chat (9 pesanan, ~17%) ---
  { id: "ORD-039", date: daysAgo(1), channel: "chat", customerId: "cust-3", productId: "prod-2", qty: 3, unitPrice: 72000, adminFeePct: 0, shippingCost: 15000, paymentStatus: "lunas", shipmentStatus: "dikemas" },
  { id: "ORD-040", date: daysAgo(4), channel: "chat", customerId: "cust-8", productId: "prod-1", qty: 1, unitPrice: 85000, adminFeePct: 0, shippingCost: 15000, paymentStatus: "belum", shipmentStatus: "baru" },
  { id: "ORD-041", date: daysAgo(6), channel: "chat", customerId: "cust-11", productId: "prod-4", qty: 6, unitPrice: 38000, adminFeePct: 0, shippingCost: 15000, paymentStatus: "lunas", shipmentStatus: "dikirim" },
  { id: "ORD-042", date: daysAgo(10), channel: "chat", customerId: "cust-15", productId: "prod-9", qty: 10, unitPrice: 22000, adminFeePct: 0, shippingCost: 15000, paymentStatus: "lunas", shipmentStatus: "selesai" },
  { id: "ORD-043", date: daysAgo(14), channel: "chat", customerId: "cust-3", productId: "prod-5", qty: 2, unitPrice: 65000, adminFeePct: 0, shippingCost: 15000, paymentStatus: "lunas", shipmentStatus: "selesai" },
  { id: "ORD-044", date: daysAgo(18), channel: "chat", customerId: "cust-8", productId: "prod-7", qty: 4, unitPrice: 42000, adminFeePct: 0, shippingCost: 15000, paymentStatus: "lunas", shipmentStatus: "selesai" },
  { id: "ORD-045", date: daysAgo(21), channel: "chat", customerId: "cust-11", productId: "prod-2", qty: 2, unitPrice: 72000, adminFeePct: 0, shippingCost: 15000, paymentStatus: "lunas", shipmentStatus: "selesai" },
  { id: "ORD-046", date: daysAgo(25), channel: "chat", customerId: "cust-15", productId: "prod-4", qty: 5, unitPrice: 38000, adminFeePct: 0, shippingCost: 15000, paymentStatus: "lunas", shipmentStatus: "selesai" },
  { id: "ORD-047", date: daysAgo(28), channel: "chat", customerId: "cust-3", productId: "prod-7", qty: 3, unitPrice: 42000, adminFeePct: 0, shippingCost: 15000, paymentStatus: "lunas", shipmentStatus: "selesai" },

  // --- Offline (7 pesanan, ~13%) ---
  { id: "ORD-048", date: daysAgo(0), channel: "offline", customerId: "cust-4", productId: "prod-4", qty: 10, unitPrice: 35000, adminFeePct: 0, shippingCost: 0, paymentStatus: "lunas", shipmentStatus: "selesai" },
  { id: "ORD-049", date: daysAgo(3), channel: "offline", customerId: "cust-5", productId: "prod-9", qty: 12, unitPrice: 20000, adminFeePct: 0, shippingCost: 0, paymentStatus: "lunas", shipmentStatus: "selesai" },
  { id: "ORD-050", date: daysAgo(8), channel: "offline", customerId: "cust-12", productId: "prod-7", qty: 5, unitPrice: 40000, adminFeePct: 0, shippingCost: 0, paymentStatus: "lunas", shipmentStatus: "selesai" },
  { id: "ORD-051", date: daysAgo(12), channel: "offline", customerId: "cust-16", productId: "prod-5", qty: 3, unitPrice: 62000, adminFeePct: 0, shippingCost: 0, paymentStatus: "lunas", shipmentStatus: "selesai" },
  { id: "ORD-052", date: daysAgo(16), channel: "offline", customerId: "cust-4", productId: "prod-2", qty: 4, unitPrice: 70000, adminFeePct: 0, shippingCost: 0, paymentStatus: "lunas", shipmentStatus: "selesai" },
  { id: "ORD-053", date: daysAgo(22), channel: "offline", customerId: "cust-5", productId: "prod-4", qty: 8, unitPrice: 35000, adminFeePct: 0, shippingCost: 0, paymentStatus: "lunas", shipmentStatus: "selesai" },
  { id: "ORD-054", date: daysAgo(26), channel: "offline", customerId: "cust-12", productId: "prod-1", qty: 2, unitPrice: 80000, adminFeePct: 0, shippingCost: 0, paymentStatus: "lunas", shipmentStatus: "selesai" },
];

// Transformasi rawOrders → Order[]
export const INITIAL_ORDERS: Order[] = rawOrders.map((r) => {
  const subtotal = r.qty * r.unitPrice;
  const adminFee = Math.round((subtotal * r.adminFeePct) / 100);
  return {
    id: r.id,
    date: r.date,
    channel: r.channel,
    customerId: r.customerId,
    items: [{ productId: r.productId, qty: r.qty, unitPrice: r.unitPrice }],
    subtotal,
    adminFee,
    shippingCost: r.shippingCost,
    paymentStatus: r.paymentStatus,
    shipmentStatus: r.shipmentStatus,
  };
});

// ============================================================
// PEMBELIAN
// ============================================================

export const INITIAL_PURCHASES: Purchase[] = [
  { id: "PUR-001", supplierId: "sup-1", productId: "prod-1", qty: 30, buyPrice: 52000, date: daysAgo(25), paid: true },
  { id: "PUR-002", supplierId: "sup-1", productId: "prod-2", qty: 50, buyPrice: 42000, date: daysAgo(20), paid: true },
  { id: "PUR-003", supplierId: "sup-2", productId: "prod-3", qty: 40, buyPrice: 25000, date: daysAgo(18), paid: true },
  { id: "PUR-004", supplierId: "sup-3", productId: "prod-4", qty: 80, buyPrice: 20000, date: daysAgo(15), paid: true },
  { id: "PUR-005", supplierId: "sup-1", productId: "prod-7", qty: 60, buyPrice: 24000, date: daysAgo(12), paid: true },
  { id: "PUR-006", supplierId: "sup-2", productId: "prod-6", qty: 50, buyPrice: 30000, date: daysAgo(10), paid: true },
  // Pembelian terbaru: harga beli Kopi Arabika naik (skenario laba turun)
  { id: "PUR-007", supplierId: "sup-1", productId: "prod-1", qty: 20, buyPrice: 62000, date: daysAgo(5), paid: false },
  { id: "PUR-008", supplierId: "sup-3", productId: "prod-9", qty: 100, buyPrice: 12000, date: daysAgo(3), paid: false },
  { id: "PUR-009", supplierId: "sup-2", productId: "prod-10", qty: 25, buyPrice: 45000, date: daysAgo(2), paid: true },
  { id: "PUR-010", supplierId: "sup-1", productId: "prod-2", qty: 30, buyPrice: 42000, date: daysAgo(1), paid: false },
];

// ============================================================
// STOCK MOVEMENTS (ledger)
// ============================================================

// Bangun dari pesanan dan pembelian (simplified)
export const INITIAL_STOCK_MOVEMENTS: StockMovement[] = [
  // Penjualan (negatif)
  ...INITIAL_ORDERS.flatMap((o, idx) =>
    o.items.map((item) => ({
      id: `SM-SALE-${idx}`,
      productId: item.productId,
      type: "sale" as const,
      qty: -item.qty,
      date: o.date,
      refId: o.id,
    }))
  ),
  // Pembelian (positif)
  ...INITIAL_PURCHASES.map((p) => ({
    id: `SM-PUR-${p.id}`,
    productId: p.productId,
    type: "purchase" as const,
    qty: p.qty,
    date: p.date,
    refId: p.id,
  })),
];

// ============================================================
// LOG AKTIVITAS AWAL
// ============================================================

export const INITIAL_ACTIVITY_LOGS: ActivityLog[] = [
  {
    id: "LOG-001",
    userId: "owner-1",
    userName: "Pak Ahmad (Pemilik)",
    action: "mengatur penugasan Sari sebagai Staf Penjualan",
    module: "manajemen_tim",
    timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "LOG-002",
    userId: "owner-1",
    userName: "Pak Ahmad (Pemilik)",
    action: "mengatur penugasan Budi sebagai Staf Gudang",
    module: "manajemen_tim",
    timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "LOG-003",
    userId: "owner-1",
    userName: "Pak Ahmad (Pemilik)",
    action: "mengatur penugasan Rina sebagai Staf Keuangan",
    module: "manajemen_tim",
    timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "LOG-004",
    userId: "emp-sari",
    userName: "Sari",
    action: "menambah pesanan #ORD-001 dari Marketplace A",
    module: "penjualan",
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "LOG-005",
    userId: "emp-budi",
    userName: "Budi",
    action: "memindahkan pesanan #ORD-002 ke status Diproses",
    module: "pengiriman",
    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  },
];

// ============================================================
// GENERATOR DATA AWAL UNTUK TENANT BARU
// ============================================================

export function createInitialTenantData(tenant: Tenant, owner: User) {
  const tId = tenant.id;
  const now = new Date().toISOString();

  const products: Product[] = [
    {
      id: `prod-${tId}-1`,
      tenantId: tId,
      sku: "PRD-001",
      name: `Produk Unggulan ${tenant.name}`,
      sellPrice: 75000,
      buyPrice: 45000,
      stock: 50,
      minStock: 10,
      channels: ["marketplace_a", "chat", "offline"],
    },
    {
      id: `prod-${tId}-2`,
      tenantId: tId,
      sku: "PRD-002",
      name: `Paket Hemat ${tenant.name}`,
      sellPrice: 120000,
      buyPrice: 80000,
      stock: 35,
      minStock: 5,
      channels: ["marketplace_a", "marketplace_b", "chat"],
    },
    {
      id: `prod-${tId}-3`,
      tenantId: tId,
      sku: "PRD-003",
      name: `Varian Spesial ${tenant.name}`,
      sellPrice: 45000,
      buyPrice: 25000,
      stock: 20,
      minStock: 5,
      channels: ["chat", "offline"],
    },
  ];

  const suppliers: Supplier[] = [
    {
      id: `sup-${tId}-1`,
      tenantId: tId,
      name: "Supplier Utama Mitra UMKM",
      contact: "0812-8888-9999",
      address: `Sentra Bahan Baku, ${tenant.city}`,
    },
  ];

  const customers: Customer[] = [
    {
      id: `cust-${tId}-1`,
      tenantId: tId,
      name: "Pelanggan Setia 1",
      channel: "marketplace_a",
      phone: "0812-3333-4444",
      email: "pelanggan1@gmail.com",
    },
    {
      id: `cust-${tId}-2`,
      tenantId: tId,
      name: "Pelanggan Langsung 2",
      channel: "chat",
      phone: "0813-5555-6666",
      email: "pelanggan2@gmail.com",
    },
  ];

  const orders: Order[] = [
    {
      id: `ORD-${tId}-101`,
      tenantId: tId,
      date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      channel: "marketplace_a",
      customerId: `cust-${tId}-1`,
      items: [{ productId: `prod-${tId}-1`, qty: 2, unitPrice: 75000 }],
      subtotal: 150000,
      adminFee: 7500,
      shippingCost: 15000,
      paymentStatus: "lunas",
      shipmentStatus: "diproses",
    },
    {
      id: `ORD-${tId}-102`,
      tenantId: tId,
      date: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      channel: "chat",
      customerId: `cust-${tId}-2`,
      items: [{ productId: `prod-${tId}-2`, qty: 1, unitPrice: 120000 }],
      subtotal: 120000,
      adminFee: 0,
      shippingCost: 10000,
      paymentStatus: "lunas",
      shipmentStatus: "baru",
    },
  ];

  const purchases: Purchase[] = [
    {
      id: `pur-${tId}-1`,
      tenantId: tId,
      supplierId: `sup-${tId}-1`,
      productId: `prod-${tId}-1`,
      qty: 60,
      buyPrice: 45000,
      date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      paid: true,
    },
  ];

  const stockMovements: StockMovement[] = [
    {
      id: `sm-${tId}-1`,
      tenantId: tId,
      productId: `prod-${tId}-1`,
      type: "purchase",
      qty: 60,
      date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      refId: `pur-${tId}-1`,
      note: "Stok awal pembelian",
    },
    {
      id: `sm-${tId}-2`,
      tenantId: tId,
      productId: `prod-${tId}-1`,
      type: "sale",
      qty: -2,
      date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      refId: `ORD-${tId}-101`,
      note: "Penjualan order ORD-101",
    },
  ];

  const activityLogs: ActivityLog[] = [
    {
      id: `log-${tId}-1`,
      tenantId: tId,
      userId: owner.id,
      userName: owner.name,
      action: `mendaftarkan UMKM ${tenant.name} dan mengaktifkan akun pemilik`,
      module: "registrasi",
      timestamp: now,
    },
  ];

  return {
    products,
    suppliers,
    customers,
    orders,
    purchases,
    stockMovements,
    activityLogs,
  };
}
