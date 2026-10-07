"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { can } from "@/lib/permissions";
import { formatRp } from "@/lib/finance";
import type { ModuleKey } from "@/types";
import {
  Search,
  ShoppingCart,
  Package,
  Users,
  Receipt,
  LayoutDashboard,
  Truck,
  CreditCard,
  BarChart3,
  PieChart,
  Bot,
  UsersRound,
  Activity,
  Settings,
  ArrowRight,
  Sparkles,
  X,
  CornerDownLeft,
} from "lucide-react";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SearchResultItem {
  id: string;
  category: "Halaman" | "Pesanan" | "Produk" | "Pelanggan" | "Pengeluaran";
  title: string;
  subtitle: string;
  href: string;
  icon: React.ReactNode;
  badge?: string;
  badgeColor?: string;
}

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const router = useRouter();
  const user = useCurrentUser();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const orders = useStore((s) => s.orders);
  const products = useStore((s) => s.products);
  const customers = useStore((s) => s.customers);
  const expenses = useStore((s) => s.expenses);
  const expenseCategories = useStore((s) => s.expenseCategories);
  const getActiveTenant = useStore((s) => s.getActiveTenant);
  const activeTenant = getActiveTenant();

  const useStock = activeTenant?.businessSettings?.useStock ?? true;
  const useShipping = activeTenant?.businessSettings?.useShipping ?? true;

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Define navigation pages
  const navigationItems = useMemo(() => {
    const items: Array<{
      key: ModuleKey | "tim" | "audit" | "pengaturan" | "dashboard";
      title: string;
      subtitle: string;
      href: string;
      icon: React.ReactNode;
      ownerOnly?: boolean;
      requiresStock?: boolean;
      requiresShipping?: boolean;
    }> = [
      {
        key: "dashboard",
        title: "Beranda",
        subtitle: "Ringkasan kas, peringatan, dan transaksi terkini",
        href: "/dashboard",
        icon: <LayoutDashboard className="w-4 h-4 text-blue-500" />,
      },
      {
        key: "penjualan",
        title: "Penjualan",
        subtitle: "Daftar pesanan & input transaksi penjualan",
        href: "/penjualan",
        icon: <ShoppingCart className="w-4 h-4 text-emerald-500" />,
      },
      {
        key: "pengiriman",
        title: "Pengiriman",
        subtitle: "Status kiriman ekspedisi dan kurir",
        href: "/pengiriman",
        icon: <Truck className="w-4 h-4 text-cyan-500" />,
        requiresShipping: true,
      },
      {
        key: "pelanggan",
        title: "Pelanggan",
        subtitle: "Data kontak & riwayat belanja pelanggan",
        href: "/pelanggan",
        icon: <Users className="w-4 h-4 text-indigo-500" />,
      },
      {
        key: "produk",
        title: "Produk & Stok",
        subtitle: "Katalog produk, harga jual, dan persediaan",
        href: "/produk",
        icon: <Package className="w-4 h-4 text-amber-500" />,
      },
      {
        key: "pengeluaran",
        title: "Pengeluaran",
        subtitle: "Catatan belanja operasional & utang toko",
        href: "/pengeluaran",
        icon: <Receipt className="w-4 h-4 text-rose-500" />,
      },
      {
        key: "pembayaran",
        title: "Tagihan & Utang",
        subtitle: "Piutang pelanggan & tagihan belum lunas",
        href: "/pembayaran",
        icon: <CreditCard className="w-4 h-4 text-violet-500" />,
      },
      {
        key: "laporan_keuangan",
        title: "Laporan Keuangan",
        subtitle: "Laba/rugi, neraca aset, dan arus kas",
        href: "/keuangan",
        icon: <BarChart3 className="w-4 h-4 text-teal-500" />,
      },
      {
        key: "analitik",
        title: "Saran & Analisis",
        subtitle: "Diagnosis laba, tren repeat order, dan anomali",
        href: "/analitik",
        icon: <PieChart className="w-4 h-4 text-orange-500" />,
        ownerOnly: true,
      },
      {
        key: "copilot",
        title: "Tanya AI",
        subtitle: "Konsultasi cerdas analisis bisnis UMKM",
        href: "/copilot",
        icon: <Bot className="w-4 h-4 text-purple-500" />,
        ownerOnly: true,
      },
      {
        key: "tim",
        title: "Tim & Karyawan",
        subtitle: "Kelola anggota tim dan hak akses modul",
        href: "/tim",
        icon: <UsersRound className="w-4 h-4 text-sky-500" />,
        ownerOnly: true,
      },
      {
        key: "audit",
        title: "Log Aktivitas",
        subtitle: "Rekam jejak tindakan staf di sistem",
        href: "/tim/log",
        icon: <Activity className="w-4 h-4 text-zinc-500" />,
        ownerOnly: true,
      },
      {
        key: "pengaturan",
        title: "Pengaturan Usaha",
        subtitle: "Profil toko, batas anggaran, dan fee kanal",
        href: "/pengaturan",
        icon: <Settings className="w-4 h-4 text-gray-500" />,
        ownerOnly: true,
      },
    ];

    return items.filter((item) => {
      if (item.requiresStock && !useStock) return false;
      if (item.requiresShipping && !useShipping) return false;
      if (item.ownerOnly) return user?.isOwner ?? false;
      if (item.key === "dashboard" || item.key === "tim" || item.key === "audit" || item.key === "pengaturan") return true;
      return can(user, item.key as ModuleKey, "view");
    });
  }, [user, useStock, useShipping]);

  // Customer map lookup for fast customer name resolution
  const customerMap = useMemo(() => {
    const map = new Map<string, string>();
    customers.forEach((c) => map.set(c.id, c.name));
    return map;
  }, [customers]);

  // Category map lookup for expenses
  const categoryMap = useMemo(() => {
    const map = new Map<string, string>();
    expenseCategories.forEach((cat) => map.set(cat.id, cat.name));
    return map;
  }, [expenseCategories]);

  // Compute search results across entities
  const results: SearchResultItem[] = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list: SearchResultItem[] = [];

    // Filter pages
    const filteredPages = navigationItems.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.subtitle.toLowerCase().includes(q)
    );
    filteredPages.forEach((p) => {
      list.push({
        id: `page-${p.href}`,
        category: "Halaman",
        title: p.title,
        subtitle: p.subtitle,
        href: p.href,
        icon: p.icon,
        badge: "Menu",
        badgeColor: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
      });
    });

    if (q.length > 0) {
      // Search Orders / Penjualan
      if (can(user, "penjualan", "view")) {
        const matchingOrders = orders
          .filter((o) => {
            const custName = customerMap.get(o.customerId) || "";
            return (
              (o.externalOrderId && o.externalOrderId.toLowerCase().includes(q)) ||
              (o.id && o.id.toLowerCase().includes(q)) ||
              custName.toLowerCase().includes(q) ||
              (o.channel && o.channel.toLowerCase().includes(q))
            );
          })
          .slice(0, 5);

        matchingOrders.forEach((o) => {
          const custName = customerMap.get(o.customerId) || "Pelanggan";
          list.push({
            id: `order-${o.id}`,
            category: "Pesanan",
            title: `Pesanan ${o.externalOrderId || o.id.slice(0, 8)} — ${custName}`,
            subtitle: `${o.channel.toUpperCase()} • Total ${formatRp(o.subtotal)} • Status: ${o.paymentStatus}`,
            href: `/penjualan?orderId=${o.id}`,
            icon: <ShoppingCart className="w-4 h-4 text-emerald-500" />,
            badge: o.channel.toUpperCase(),
            badgeColor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
          });
        });
      }

      // Search Products
      if (can(user, "produk", "view")) {
        const matchingProducts = products
          .filter(
            (p) =>
              p.name.toLowerCase().includes(q) ||
              (p.sku && p.sku.toLowerCase().includes(q))
          )
          .slice(0, 5);

        matchingProducts.forEach((p) => {
          list.push({
            id: `prod-${p.id}`,
            category: "Produk",
            title: p.name,
            subtitle: `SKU: ${p.sku || "-"} • Harga: ${formatRp(p.sellPrice)} • Stok: ${p.stock ?? "-"}`,
            href: `/produk?search=${encodeURIComponent(p.name)}`,
            icon: <Package className="w-4 h-4 text-amber-500" />,
            badge: "Produk",
            badgeColor: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
          });
        });
      }

      // Search Customers
      if (can(user, "pelanggan", "view")) {
        const matchingCustomers = customers
          .filter(
            (c) =>
              c.name.toLowerCase().includes(q) ||
              (c.phone && c.phone.includes(q)) ||
              (c.email && c.email.toLowerCase().includes(q))
          )
          .slice(0, 4);

        matchingCustomers.forEach((c) => {
          list.push({
            id: `cust-${c.id}`,
            category: "Pelanggan",
            title: c.name,
            subtitle: `Telp: ${c.phone || "-"} • Kanal: ${c.channel.toUpperCase()}`,
            href: `/pelanggan?search=${encodeURIComponent(c.name)}`,
            icon: <Users className="w-4 h-4 text-indigo-500" />,
            badge: c.channel.toUpperCase(),
            badgeColor: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
          });
        });
      }

      // Search Expenses / Pengeluaran
      if (can(user, "pengeluaran", "view")) {
        const matchingExpenses = expenses
          .filter((e) => {
            const catName = categoryMap.get(e.categoryId) || "";
            return (
              (e.note && e.note.toLowerCase().includes(q)) ||
              (e.vendor && e.vendor.toLowerCase().includes(q)) ||
              catName.toLowerCase().includes(q)
            );
          })
          .slice(0, 4);

        matchingExpenses.forEach((e) => {
          const catName = categoryMap.get(e.categoryId) || "Pengeluaran";
          list.push({
            id: `exp-${e.id}`,
            category: "Pengeluaran",
            title: e.note || catName,
            subtitle: `${catName} • ${formatRp(e.amount)} • ${e.vendor || "Toko"}`,
            href: `/pengeluaran?search=${encodeURIComponent(e.note || catName)}`,
            icon: <Receipt className="w-4 h-4 text-rose-500" />,
            badge: catName,
            badgeColor: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
          });
        });
      }
    }

    return list;
  }, [query, navigationItems, orders, products, customers, expenses, customerMap, categoryMap, user]);

  // Adjust selected index if it exceeds list size
  useEffect(() => {
    if (selectedIndex >= results.length) {
      setSelectedIndex(Math.max(0, results.length - 1));
    }
  }, [results.length, selectedIndex]);

  // Scroll active item into view
  useEffect(() => {
    if (listRef.current) {
      const activeEl = listRef.current.querySelector(`[data-index="${selectedIndex}"]`);
      if (activeEl) {
        activeEl.scrollIntoView({ block: "nearest" });
      }
    }
  }, [selectedIndex]);

  function handleSelect(item: SearchResultItem) {
    onClose();
    router.push(item.href);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1 < results.length ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 >= 0 ? prev - 1 : results.length - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (results[selectedIndex]) {
        handleSelect(results[selectedIndex]);
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    }
  }

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 p-4 bg-black/60 backdrop-blur-xs animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl rounded-2xl bg-[hsl(var(--card))] border border-[hsl(var(--border))] shadow-2xl overflow-hidden animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[hsl(var(--border))] bg-[hsl(var(--card))]">
          <Search className="w-5 h-5 text-[hsl(var(--muted-fg))] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Cari pesanan, produk, pelanggan, pengeluaran, atau menu..."
            className="flex-1 bg-transparent text-sm text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-fg))] focus:outline-hidden font-medium"
          />
          {query ? (
            <button
              onClick={() => {
                setQuery("");
                inputRef.current?.focus();
              }}
              className="p-1 rounded-md text-[hsl(var(--muted-fg))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))]"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 text-[10px] font-mono font-medium rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--muted))] text-[hsl(var(--muted-fg))]">
              ESC
            </kbd>
          )}
        </div>

        {/* Results List */}
        <div
          ref={listRef}
          className="max-h-[60vh] overflow-y-auto p-2 divide-y divide-[hsl(var(--border))]/40"
        >
          {results.length === 0 ? (
            <div className="py-12 text-center text-sm text-[hsl(var(--muted-fg))]">
              <Search className="w-8 h-8 mx-auto mb-2 text-[hsl(var(--muted-fg))]/50" />
              <p className="font-semibold text-[hsl(var(--foreground))]">Tidak ditemukan hasil</p>
              <p className="text-xs mt-0.5">
                Coba kata kunci lain untuk mencari transaksi, produk, atau pelanggan.
              </p>
            </div>
          ) : (
            results.map((item, index) => {
              const isSelected = index === selectedIndex;
              return (
                <div
                  key={item.id}
                  data-index={index}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl cursor-pointer transition-all ${
                    isSelected
                      ? "bg-blue-600 text-white shadow-xs"
                      : "hover:bg-[hsl(var(--muted))]/70 text-[hsl(var(--foreground))]"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`p-2 rounded-lg shrink-0 transition-colors ${
                        isSelected
                          ? "bg-white/20 text-white"
                          : "bg-[hsl(var(--muted))] text-[hsl(var(--foreground))]"
                      }`}
                    >
                      {item.icon}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-sm font-semibold truncate ${
                            isSelected ? "text-white" : "text-[hsl(var(--foreground))]"
                          }`}
                        >
                          {item.title}
                        </span>
                        {item.badge && (
                          <span
                            className={`text-[10px] font-medium px-1.5 py-0.5 rounded-md border ${
                              isSelected
                                ? "bg-white/20 text-white border-white/30"
                                : item.badgeColor || "bg-[hsl(var(--muted))] text-[hsl(var(--muted-fg))] border-[hsl(var(--border))]"
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <div
                        className={`text-xs truncate mt-0.5 ${
                          isSelected ? "text-blue-100" : "text-[hsl(var(--muted-fg))]"
                        }`}
                      >
                        {item.subtitle}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    {isSelected ? (
                      <CornerDownLeft className="w-4 h-4 text-white/80" />
                    ) : (
                      <ArrowRight className="w-3.5 h-3.5 text-[hsl(var(--muted-fg))]/50" />
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info bar */}
        <div className="px-4 py-2.5 border-t border-[hsl(var(--border))] bg-[hsl(var(--muted))]/40 flex items-center justify-between text-[11px] text-[hsl(var(--muted-fg))]">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 font-mono text-[10px] rounded border border-[hsl(var(--border))] bg-[hsl(var(--card))]">↑</kbd>
              <kbd className="px-1.5 py-0.5 font-mono text-[10px] rounded border border-[hsl(var(--border))] bg-[hsl(var(--card))]">↓</kbd>
              Navigasi
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 font-mono text-[10px] rounded border border-[hsl(var(--border))] bg-[hsl(var(--card))]">↵</kbd>
              Pilih
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 font-mono text-[10px] rounded border border-[hsl(var(--border))] bg-[hsl(var(--card))]">Esc</kbd>
              Tutup
            </span>
          </div>

          <div className="flex items-center gap-1 text-[10px] font-medium text-blue-600 dark:text-blue-400">
            <Sparkles className="w-3 h-3" />
            <span>Pencarian Cepat Usaha.in</span>
          </div>
        </div>
      </div>
    </div>
  );
}
