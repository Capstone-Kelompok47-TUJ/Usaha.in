// ============================================================
// USAHA.IN — Zustand Store (In-Memory State)
// ============================================================

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  User, Product, StockMovement, Order, Purchase,
  Supplier, Customer, ActivityLog, Toast,
  Channel, ShipmentStatus, ModuleKey, Level, TemplateKey,
} from "@/types";
import {
  INITIAL_USERS, INITIAL_PRODUCTS, INITIAL_STOCK_MOVEMENTS,
  INITIAL_ORDERS, INITIAL_PURCHASES, INITIAL_SUPPLIERS,
  INITIAL_CUSTOMERS, INITIAL_ACTIVITY_LOGS,
} from "@/lib/mock-data";

// ============================================================
// STATE SHAPE
// ============================================================

interface AppStore {
  // Data
  users: User[];
  currentUserId: string;
  products: Product[];
  stockMovements: StockMovement[];
  orders: Order[];
  purchases: Purchase[];
  suppliers: Supplier[];
  customers: Customer[];
  activityLogs: ActivityLog[];
  toasts: Toast[];

  // Auth
  isAuthenticated: boolean;
  login: (email: string, password: string) => { success: boolean; message?: string };
  logout: () => void;

  // --- GETTERS ---
  getCurrentUser: () => User | null;

  // --- USER ACTIONS ---
  setCurrentUser: (userId: string) => void;
  addUser: (user: User) => void;
  updateUserPermissions: (
    userId: string,
    permissions: Record<ModuleKey, Level>,
    template: string
  ) => void;
  toggleUserActive: (userId: string) => void;

  // --- SIMULATE ORDER ---
  simulateOrder: (triggeredByUserId: string) => void;

  // --- PURCHASE ---
  addPurchase: (purchase: Omit<Purchase, "id">) => void;

  // --- SHIPMENT ---
  moveShipmentStatus: (
    orderId: string,
    newStatus: ShipmentStatus,
    userId: string
  ) => void;

  // --- PAYMENT ---
  markPaymentPaid: (orderId: string, userId: string) => void;

  // --- TOAST ---
  addToast: (message: string, type: Toast["type"]) => void;
  removeToast: (id: string) => void;

  // --- RESET ---
  resetToInitial: () => void;
}

// ============================================================
// HELPERS
// ============================================================

function genId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

const CHANNELS: Channel[] = ["marketplace_a", "marketplace_b", "chat", "offline"];
const SHIPMENT_STATUSES: ShipmentStatus[] = [
  "baru", "diproses", "dikemas", "dikirim", "selesai",
];

// ============================================================
// INITIAL STATE
// ============================================================

const INITIAL_STATE = {
  users: INITIAL_USERS,
  currentUserId: "owner-1",
  isAuthenticated: false,
  products: INITIAL_PRODUCTS,
  stockMovements: INITIAL_STOCK_MOVEMENTS,
  orders: INITIAL_ORDERS,
  purchases: INITIAL_PURCHASES,
  suppliers: INITIAL_SUPPLIERS,
  customers: INITIAL_CUSTOMERS,
  activityLogs: INITIAL_ACTIVITY_LOGS,
  toasts: [] as Toast[],
};

// ============================================================
// STORE
// ============================================================

export const useStore = create<AppStore>()(
  persist(
    (set, get) => ({
      ...INITIAL_STATE,

      // ----- AUTH ACTIONS -----
      login: (email, password) => {
        const { users } = get();
        const user = users.find(
          (u) => u.email.trim().toLowerCase() === email.trim().toLowerCase()
        );
        if (!user) {
          return { success: false, message: "Email tidak terdaftar dalam sistem." };
        }
        if (user.password !== password) {
          return { success: false, message: "Kata sandi salah. Silakan coba lagi." };
        }
        if (!user.active) {
          return {
            success: false,
            message: "Akun ini dinonaktifkan. Hubungi pemilik usaha.",
          };
        }

        const log: ActivityLog = {
          id: genId("LOG"),
          userId: user.id,
          userName: user.name,
          action: "berhasil masuk ke sistem (login)",
          module: "manajemen_tim",
          timestamp: new Date().toISOString(),
        };

        set((s) => ({
          isAuthenticated: true,
          currentUserId: user.id,
          activityLogs: [log, ...s.activityLogs],
        }));

        get().addToast(`Selamat datang kembali, ${user.name}!`, "success");
        return { success: true };
      },

      logout: () => {
        const currentUser = get().getCurrentUser();
        if (currentUser) {
          const log: ActivityLog = {
            id: genId("LOG"),
            userId: currentUser.id,
            userName: currentUser.name,
            action: "keluar dari sistem (logout)",
            module: "manajemen_tim",
            timestamp: new Date().toISOString(),
          };
          set((s) => ({
            activityLogs: [log, ...s.activityLogs],
          }));
        }
        set({ isAuthenticated: false });
        get().addToast("Anda telah keluar dari akun.", "info");
      },

      // ----- GETTERS -----
      getCurrentUser: () => {
        const { users, currentUserId } = get();
        return users.find((u) => u.id === currentUserId) ?? null;
      },

      // ----- USER ACTIONS -----
      setCurrentUser: (userId) => {
        set({ currentUserId: userId });
      },

      addUser: (user) => {
        const { activityLogs, getCurrentUser } = get();
        const actor = getCurrentUser();
        const log: ActivityLog = {
          id: genId("LOG"),
          userId: actor?.id ?? "owner-1",
          userName: actor?.name ?? "Pemilik",
          action: `menambahkan akun karyawan baru: ${user.name}`,
          module: "manajemen_tim",
          timestamp: new Date().toISOString(),
        };
        set((s) => ({
          users: [...s.users, user],
          activityLogs: [log, ...activityLogs],
        }));
      },

      updateUserPermissions: (userId, permissions, template) => {
        const { getCurrentUser, activityLogs } = get();
        const actor = getCurrentUser();
        const target = get().users.find((u) => u.id === userId);
        const log: ActivityLog = {
          id: genId("LOG"),
          userId: actor?.id ?? "owner-1",
          userName: actor?.name ?? "Pemilik",
          action: `mengubah penugasan ${target?.name ?? userId} ke template ${template}`,
          module: "manajemen_tim",
          timestamp: new Date().toISOString(),
        };
        set((s) => ({
          users: s.users.map((u) =>
            u.id === userId ? { ...u, permissions, template } : u
          ),
          activityLogs: [log, ...activityLogs],
        }));
      },

      toggleUserActive: (userId) => {
        const { getCurrentUser, activityLogs } = get();
        const actor = getCurrentUser();
        const target = get().users.find((u) => u.id === userId);
        const newActive = !target?.active;
        const log: ActivityLog = {
          id: genId("LOG"),
          userId: actor?.id ?? "owner-1",
          userName: actor?.name ?? "Pemilik",
          action: `${newActive ? "mengaktifkan" : "menonaktifkan"} akun ${target?.name ?? userId}`,
          module: "manajemen_tim",
          timestamp: new Date().toISOString(),
        };
        set((s) => ({
          users: s.users.map((u) =>
            u.id === userId ? { ...u, active: newActive } : u
          ),
          activityLogs: [log, ...activityLogs],
        }));
      },

      // ----- SIMULATE ORDER -----
      simulateOrder: (triggeredByUserId) => {
        const { products, customers, activityLogs, users } = get();
        const actor = users.find((u) => u.id === triggeredByUserId);

        // Pilih kanal acak (distribusi sesuai spec)
        const channelRand = Math.random();
        const channel: Channel =
          channelRand < 0.4
            ? "marketplace_a"
            : channelRand < 0.7
              ? "marketplace_b"
              : channelRand < 0.87
                ? "chat"
                : "offline";

        const channelLabelMap: Record<Channel, string> = {
          marketplace_a: "Marketplace A",
          marketplace_b: "Marketplace B",
          chat: "Chat",
          offline: "Toko Offline",
        };

        // Pilih produk yang tersedia (stok > 0)
        const availableProducts = products.filter((p) => p.stock > 0);
        if (availableProducts.length === 0) return;
        const product =
          availableProducts[Math.floor(Math.random() * availableProducts.length)];

        // Qty acak 1–3
        const qty = Math.floor(Math.random() * 3) + 1;
        const finalQty = Math.min(qty, product.stock);

        // Pilih pelanggan sesuai kanal
        const channelCustomers = customers.filter((c) => c.channel === channel);
        const customer =
          channelCustomers[Math.floor(Math.random() * channelCustomers.length)] ??
          customers[0];

        // Admin fee sesuai kanal
        const adminFeePct =
          channel === "marketplace_a" ? 7.5 : channel === "marketplace_b" ? 3.5 : 0;
        const shippingCost =
          channel === "marketplace_a"
            ? 9000
            : channel === "marketplace_b"
              ? 7000
              : channel === "chat"
                ? 15000
                : 0;

        const subtotal = finalQty * product.sellPrice;
        const adminFee = Math.round((subtotal * adminFeePct) / 100);

        const newOrderId = `ORD-EX-${Date.now()}`;

        const newOrder: Order = {
          id: newOrderId,
          date: new Date().toISOString().split("T")[0],
          channel,
          customerId: customer.id,
          items: [
            {
              productId: product.id,
              qty: finalQty,
              unitPrice: product.sellPrice,
            },
          ],
          subtotal,
          adminFee,
          shippingCost,
          paymentStatus: "lunas",
          shipmentStatus: "baru",
        };

        const newStockMovement: StockMovement = {
          id: genId("SM-SALE"),
          productId: product.id,
          type: "sale",
          qty: -finalQty,
          date: new Date().toISOString().split("T")[0],
          refId: newOrderId,
        };

        const newStock = product.stock - finalQty;
        const isLowStock = newStock < product.minStock;

        const log: ActivityLog = {
          id: genId("LOG"),
          userId: triggeredByUserId,
          userName: actor?.name ?? "Sistem",
          action: `menambah pesanan ${newOrderId} dari ${channelLabelMap[channel]} — ${product.name} ×${finalQty}`,
          module: "penjualan",
          timestamp: new Date().toISOString(),
        };

        set((s) => ({
          orders: [newOrder, ...s.orders],
          stockMovements: [newStockMovement, ...s.stockMovements],
          products: s.products.map((p) =>
            p.id === product.id ? { ...p, stock: newStock } : p
          ),
          activityLogs: [log, ...s.activityLogs],
        }));

        // Toast notifikasi
        get().addToast(
          `Pesanan baru dari ${channelLabelMap[channel]} — ${product.name} ×${finalQty}`,
          "success"
        );

        if (isLowStock) {
          get().addToast(
            `⚠️ Stok menipis: ${product.name} tersisa ${newStock} unit (min: ${product.minStock})`,
            "warning"
          );
        }
      },

      // ----- PURCHASE -----
      addPurchase: (purchaseData) => {
        const { getCurrentUser, activityLogs } = get();
        const actor = getCurrentUser();
        const newPurchase: Purchase = {
          ...purchaseData,
          id: genId("PUR"),
        };
        const movement: StockMovement = {
          id: genId("SM-PUR"),
          productId: purchaseData.productId,
          type: "purchase",
          qty: purchaseData.qty,
          date: purchaseData.date,
          refId: newPurchase.id,
        };
        const log: ActivityLog = {
          id: genId("LOG"),
          userId: actor?.id ?? "owner-1",
          userName: actor?.name ?? "Pemilik",
          action: `menambah pembelian ${newPurchase.id} — ${purchaseData.qty} unit produk`,
          module: "pembelian",
          timestamp: new Date().toISOString(),
        };
        set((s) => ({
          purchases: [newPurchase, ...s.purchases],
          stockMovements: [movement, ...s.stockMovements],
          products: s.products.map((p) =>
            p.id === purchaseData.productId
              ? { ...p, stock: p.stock + purchaseData.qty }
              : p
          ),
          activityLogs: [log, ...s.activityLogs],
        }));
        get().addToast("Pembelian berhasil ditambahkan", "success");
      },

      // ----- SHIPMENT -----
      moveShipmentStatus: (orderId, newStatus, userId) => {
        const { activityLogs, users } = get();
        const actor = users.find((u) => u.id === userId);
        const log: ActivityLog = {
          id: genId("LOG"),
          userId,
          userName: actor?.name ?? "Karyawan",
          action: `memindahkan pesanan ${orderId} ke status "${newStatus}"`,
          module: "pengiriman",
          timestamp: new Date().toISOString(),
        };
        set((s) => ({
          orders: s.orders.map((o) =>
            o.id === orderId ? { ...o, shipmentStatus: newStatus } : o
          ),
          activityLogs: [log, ...activityLogs],
        }));
      },

      // ----- PAYMENT -----
      markPaymentPaid: (orderId, userId) => {
        const { activityLogs, users } = get();
        const actor = users.find((u) => u.id === userId);
        const log: ActivityLog = {
          id: genId("LOG"),
          userId,
          userName: actor?.name ?? "Karyawan",
          action: `menandai pesanan ${orderId} sebagai LUNAS`,
          module: "pembayaran",
          timestamp: new Date().toISOString(),
        };
        set((s) => ({
          orders: s.orders.map((o) =>
            o.id === orderId ? { ...o, paymentStatus: "lunas" } : o
          ),
          activityLogs: [log, ...activityLogs],
        }));
        get().addToast("Pembayaran ditandai lunas", "success");
      },

      // ----- TOAST -----
      addToast: (message, type) => {
        const id = genId("TOAST");
        set((s) => ({
          toasts: [...s.toasts, { id, message, type }],
        }));
        // Auto-remove setelah 4 detik
        setTimeout(() => get().removeToast(id), 4000);
      },

      removeToast: (id) => {
        set((s) => ({
          toasts: s.toasts.filter((t) => t.id !== id),
        }));
      },

      // ----- RESET -----
      resetToInitial: () => {
        set({ ...INITIAL_STATE, toasts: [] });
        get().addToast("Data berhasil direset ke kondisi awal", "info");
      },
    }),
    {
      name: "usaha-in-store",
      // Persist semua kecuali toasts
      partialize: (s) => ({
        users: s.users,
        currentUserId: s.currentUserId,
        isAuthenticated: s.isAuthenticated,
        products: s.products,
        stockMovements: s.stockMovements,
        orders: s.orders,
        purchases: s.purchases,
        suppliers: s.suppliers,
        customers: s.customers,
        activityLogs: s.activityLogs,
      }),
    }
  )
);
