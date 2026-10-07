"use client";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageIntro } from "@/components/ui/PageIntro";
import { EmptyState } from "@/components/ui/EmptyState";
import { Hint } from "@/components/ui/Hint";
import { usePermission } from "@/hooks/usePermission";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useStore } from "@/lib/store";
import { formatRp, formatDate } from "@/lib/finance";
import { redirect } from "next/navigation";
import { useState, useMemo } from "react";
import type { ExpenseItem } from "@/types";
import {
  Plus, X, AlertTriangle, CheckCircle2, Clock,
  TrendingDown, Wallet, CreditCard, Crown, ChevronDown,
} from "lucide-react";

// ============================================================
// Helpers
// ============================================================

function daysDiff(dateStr: string): number {
  const target = new Date(dateStr);
  const now = new Date();
  return Math.floor((now.getTime() - target.getTime()) / (1000 * 60 * 60 * 24));
}

function BudgetIndicator({ used, limit }: { used: number; limit: number }) {
  const pct = limit > 0 ? Math.min((used / limit) * 100, 120) : 0;
  const color =
    pct < 80 ? "bg-emerald-500" : pct <= 100 ? "bg-amber-500" : "bg-red-500";
  const textColor =
    pct < 80 ? "text-emerald-600 dark:text-emerald-400"
      : pct <= 100 ? "text-amber-600 dark:text-amber-400"
      : "text-red-600 dark:text-red-400";
  return (
    <div className="mt-1.5">
      <div className="flex items-center justify-between text-[11px] mb-1">
        <span className="text-[hsl(var(--muted-fg))]">Terpakai bulan ini</span>
        <span className={`font-semibold ${textColor}`}>
          {formatRp(used)} / {formatRp(limit)} ({Math.round(pct)}%)
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-[hsl(var(--muted))] overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${Math.min(pct, 100)}%` }} />
      </div>
      {pct > 100 && (
        <p className="text-[10px] text-red-500 mt-1 flex items-center gap-1">
          <AlertTriangle className="w-3 h-3" /> Melebihi batas anggaran
        </p>
      )}
    </div>
  );
}

// ============================================================
// Add Expense Modal
// ============================================================

function AddExpenseModal({ onClose, isPrive = false }: { onClose: () => void; isPrive?: boolean }) {
  const products = useStore((s) => s.products);
  const expenseCategories = useStore((s) => s.expenseCategories);
  const budgets = useStore((s) => s.budgets);
  const addExpense = useStore((s) => s.addExpense);
  const getExpenseSumByCategory = useStore((s) => s.getExpenseSumByCategory);
  const user = useCurrentUser();

  const categories = isPrive
    ? expenseCategories.filter((c) => c.id === "cat-prive")
    : expenseCategories.filter((c) => c.group !== "non_expense");

  const [form, setForm] = useState({
    date: new Date().toISOString().split("T")[0],
    categoryId: isPrive ? "cat-prive" : categories[0]?.id ?? "",
    amount: 0,
    paid: true,
    dueDate: "",
    vendor: "",
    note: "",
  });

  const [items, setItems] = useState<ExpenseItem[]>([]);
  const [showBudgetWarning, setShowBudgetWarning] = useState(false);
  const [budgetExceedReason, setBudgetExceedReason] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const selectedCat = expenseCategories.find((c) => c.id === form.categoryId);
  const budgetLimit = budgets[form.categoryId] ?? 0;
  const usedBudget = getExpenseSumByCategory(form.categoryId);

  function addStockItem() {
    setItems([...items, { productId: products[0]?.id ?? "", qty: 1, unitCost: products[0]?.buyPrice ?? 0 }]);
  }

  function updateItem(idx: number, field: keyof ExpenseItem, value: string | number) {
    setItems(items.map((it, i) => i === idx ? { ...it, [field]: value } : it));
  }

  function removeItem(idx: number) {
    setItems(items.filter((_, i) => i !== idx));
  }

  // Auto-calculate amount from items
  const itemsTotal = items.reduce((s, it) => s + it.qty * it.unitCost, 0);
  const effectiveAmount = selectedCat?.isStockRelated && items.length > 0 ? itemsTotal : form.amount;

  function validate() {
    const errs: Record<string, string> = {};
    if (!form.date) errs.date = "Tanggal wajib diisi";
    if (!form.categoryId) errs.categoryId = "Kategori wajib dipilih";
    if (effectiveAmount <= 0) errs.amount = "Nominal harus lebih dari 0";
    if (!form.paid && !form.dueDate) errs.dueDate = "Tanggal jatuh tempo wajib diisi jika belum lunas";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    // Cek batas anggaran
    if (budgetLimit > 0 && (usedBudget + effectiveAmount) > budgetLimit && !showBudgetWarning) {
      setShowBudgetWarning(true);
      return;
    }
    if (showBudgetWarning && !budgetExceedReason.trim()) {
      return; // wajib isi alasan
    }

    addExpense({
      date: form.date,
      categoryId: form.categoryId,
      amount: effectiveAmount,
      paid: form.paid,
      dueDate: form.paid ? undefined : form.dueDate || undefined,
      vendor: form.vendor || undefined,
      note: form.note || undefined,
      items: selectedCat?.isStockRelated && items.length > 0 ? items : undefined,
      budgetExceedReason: showBudgetWarning ? budgetExceedReason : undefined,
      isPrive,
    });
    onClose();
  }

  const title = isPrive ? "Tambah Prive" : "Tambah Pengeluaran";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[hsl(var(--card))] rounded-2xl border border-[hsl(var(--border))] shadow-2xl w-full max-w-lg p-6 animate-fade-in my-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="font-bold text-base flex items-center gap-2">
              {isPrive && <Crown className="w-4 h-4 text-amber-500" />}
              {title}
            </h2>
            {isPrive && (
              <p className="text-xs text-[hsl(var(--muted-fg))] mt-0.5">
                Prive tidak dihitung dalam laba/rugi usaha.
              </p>
            )}
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[hsl(var(--muted))] transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Budget Warning Banner */}
        {showBudgetWarning && (
          <div className="mb-4 p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-red-700 dark:text-red-300">Melebihi Batas Anggaran</p>
                <p className="text-xs text-red-600 dark:text-red-400 mt-0.5">
                  Anggaran {selectedCat?.name}: {formatRp(budgetLimit)}, sudah terpakai {formatRp(usedBudget)}.
                  Pengeluaran ini akan melebihi batas. Isi alasan untuk tetap menyimpan.
                </p>
                <textarea
                  value={budgetExceedReason}
                  onChange={(e) => setBudgetExceedReason(e.target.value)}
                  placeholder="Alasan melebihi anggaran (wajib)..."
                  rows={2}
                  className="mt-2 w-full px-3 py-2 rounded-lg border border-red-300 dark:border-red-700 bg-white dark:bg-red-950/60 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/30 resize-none"
                />
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Tanggal */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-[hsl(var(--muted-fg))] block mb-1">Tanggal *</label>
              <input type="date" value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className={`w-full px-3 py-2 rounded-lg border bg-[hsl(var(--background))] text-sm focus:outline-none focus:ring-2 ${errors.date ? "border-red-500 focus:ring-red-500/30" : "border-[hsl(var(--border))] focus:ring-blue-500/30"}`} />
              {errors.date && <p className="text-[11px] text-red-500 mt-0.5">{errors.date}</p>}
            </div>

            {/* Status Pembayaran */}
            <div>
              <label className="text-xs font-semibold text-[hsl(var(--muted-fg))] block mb-1">Status</label>
              <div className="flex gap-2 mt-1">
                {[{ v: true, label: "Lunas" }, { v: false, label: "Belum Lunas" }].map(({ v, label }) => (
                  <button key={String(v)} type="button"
                    onClick={() => setForm({ ...form, paid: v })}
                    className={`flex-1 py-2 rounded-lg border text-xs font-semibold transition-all ${form.paid === v ? "border-blue-500 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300" : "border-[hsl(var(--border))] text-[hsl(var(--muted-fg))] hover:border-blue-300"}`}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Due date jika belum lunas */}
          {!form.paid && (
            <div>
              <label className="text-xs font-semibold text-[hsl(var(--muted-fg))] block mb-1">Tanggal Jatuh Tempo *</label>
              <input type="date" value={form.dueDate}
                onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                className={`w-full px-3 py-2 rounded-lg border bg-[hsl(var(--background))] text-sm focus:outline-none focus:ring-2 ${errors.dueDate ? "border-red-500 focus:ring-red-500/30" : "border-[hsl(var(--border))] focus:ring-blue-500/30"}`} />
              {errors.dueDate && <p className="text-[11px] text-red-500 mt-0.5">{errors.dueDate}</p>}
            </div>
          )}

          {/* Kategori */}
          {!isPrive && (
            <div>
              <label className="text-xs font-semibold text-[hsl(var(--muted-fg))] block mb-1">Kategori *</label>
              <select value={form.categoryId}
                onChange={(e) => { setItems([]); setForm({ ...form, categoryId: e.target.value }); }}
                className={`w-full px-3 py-2 rounded-lg border bg-[hsl(var(--background))] text-sm focus:outline-none focus:ring-2 ${errors.categoryId ? "border-red-500" : "border-[hsl(var(--border))] focus:ring-blue-500/30"}`}>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>

              {/* Budget indicator */}
              {budgetLimit > 0 && (
                <BudgetIndicator used={usedBudget} limit={budgetLimit} />
              )}
            </div>
          )}

          {/* Items stok jika kategori stock-related */}
          {selectedCat?.isStockRelated && !isPrive && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-[hsl(var(--muted-fg))]">Item Stok</label>
                <button type="button" onClick={addStockItem}
                  className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1">
                  <Plus className="w-3 h-3" /> Tambah Item
                </button>
              </div>
              {items.length === 0 ? (
                <p className="text-xs text-[hsl(var(--muted-fg))] text-center py-3 rounded-lg border border-dashed border-[hsl(var(--border))]">
                  Klik "Tambah Item" untuk menambah produk yang dibeli
                </p>
              ) : (
                <div className="space-y-2">
                  {items.map((item, idx) => (
                    <div key={idx} className="grid grid-cols-[1fr_80px_100px_auto] gap-2 items-center">
                      <select value={item.productId}
                        onChange={(e) => {
                          const p = products.find(p => p.id === e.target.value);
                          updateItem(idx, "productId", e.target.value);
                          if (p) updateItem(idx, "unitCost", p.buyPrice);
                        }}
                        className="px-2.5 py-1.5 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-xs focus:outline-none focus:ring-1 focus:ring-blue-500/30">
                        {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                      </select>
                      <input type="number" min={1} value={item.qty}
                        onChange={(e) => updateItem(idx, "qty", +e.target.value)}
                        className="px-2.5 py-1.5 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-xs focus:outline-none focus:ring-1 focus:ring-blue-500/30"
                        placeholder="Qty" />
                      <input type="number" min={0} value={item.unitCost}
                        onChange={(e) => updateItem(idx, "unitCost", +e.target.value)}
                        className="px-2.5 py-1.5 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-xs focus:outline-none focus:ring-1 focus:ring-blue-500/30"
                        placeholder="Harga/unit" />
                      <button type="button" onClick={() => removeItem(idx)} className="p-1 rounded text-[hsl(var(--muted-fg))] hover:text-red-500">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  <div className="text-right text-xs font-semibold text-blue-600 mt-1">
                    Total: {formatRp(itemsTotal)}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Nominal (hanya jika bukan stock-related atau tidak ada items) */}
          {(!selectedCat?.isStockRelated || items.length === 0) && (
            <div>
              <label className="text-xs font-semibold text-[hsl(var(--muted-fg))] block mb-1">Nominal (Rp) *</label>
              <input type="number" min={0} value={form.amount}
                onChange={(e) => setForm({ ...form, amount: +e.target.value })}
                className={`w-full px-3 py-2 rounded-lg border bg-[hsl(var(--background))] text-sm focus:outline-none focus:ring-2 ${errors.amount ? "border-red-500 focus:ring-red-500/30" : "border-[hsl(var(--border))] focus:ring-blue-500/30"}`}
                placeholder="0" />
              {errors.amount && <p className="text-[11px] text-red-500 mt-0.5">{errors.amount}</p>}
            </div>
          )}

          {/* Vendor & Catatan */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-[hsl(var(--muted-fg))] block mb-1">Vendor/Pemasok <span className="font-normal">(opsional)</span></label>
              <input type="text" value={form.vendor}
                onChange={(e) => setForm({ ...form, vendor: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                placeholder="Nama vendor" />
            </div>
            <div>
              <label className="text-xs font-semibold text-[hsl(var(--muted-fg))] block mb-1">Catatan <span className="font-normal">(opsional)</span></label>
              <input type="text" value={form.note}
                onChange={(e) => setForm({ ...form, note: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                placeholder="Keterangan" />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-[hsl(var(--border))] text-sm font-semibold hover:bg-[hsl(var(--muted))] transition-colors">
              Batal
            </button>
            <button type="submit"
              className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-colors">
              {showBudgetWarning ? "Simpan (Melebihi Batas)" : "Simpan Pengeluaran"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============================================================
// Tab: Semua Pengeluaran
// ============================================================

type TabKey = "semua" | "utang" | "prive";

const GROUP_LABEL: Record<string, string> = {
  cogs: "Harga Pokok",
  selling: "Beban Penjualan",
  operating: "Operasional",
  other: "Lain-lain",
  non_expense: "Non-Beban",
};

const GROUP_COLOR: Record<string, string> = {
  cogs: "bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300",
  selling: "bg-violet-100 text-violet-700 dark:bg-violet-950/50 dark:text-violet-300",
  operating: "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300",
  other: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
  non_expense: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300",
};

// ============================================================
// Main Page
// ============================================================

export default function PengeluaranPage() {
  const { canView, canManage } = usePermission("pengeluaran");
  const user = useCurrentUser();
  const expenses = useStore((s) => s.expenses);
  const expenseCategories = useStore((s) => s.expenseCategories);
  const markExpensePaid = useStore((s) => s.markExpensePaid);
  const activeTenantId = useStore((s) => s.activeTenantId);

  if (!canView) redirect("/tidak-ada-akses");

  const [activeTab, setActiveTab] = useState<TabKey>("semua");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPriveModal, setShowPriveModal] = useState(false);
  const [filterCat, setFilterCat] = useState("all");

  // Filter by tenant
  const tenantExpenses = expenses.filter((e) =>
    !e.tenantId || e.tenantId === activeTenantId
  );

  // Semua (non-prive)
  const allExpenses = tenantExpenses
    .filter((e) => !e.isPrive)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Utang (belum lunas)
  const utangExpenses = allExpenses
    .filter((e) => !e.paid)
    .sort((a, b) => {
      // Overdue dulu
      if (a.dueDate && b.dueDate) return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      return 0;
    });

  // Prive
  const priveExpenses = tenantExpenses
    .filter((e) => e.isPrive)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Filtered for semua tab
  const filteredExpenses = filterCat === "all"
    ? allExpenses
    : allExpenses.filter((e) => e.categoryId === filterCat);

  // Summary
  const totalBulanIni = useMemo(() => {
    const now = new Date();
    const ym = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    return tenantExpenses
      .filter((e) => !e.isPrive && e.date.startsWith(ym))
      .reduce((s, e) => s + e.amount, 0);
  }, [tenantExpenses]);

  const totalUtang = utangExpenses.reduce((s, e) => s + e.amount, 0);
  const totalPrive = priveExpenses.reduce((s, e) => s + e.amount, 0);

  const getCat = (id: string) => expenseCategories.find((c) => c.id === id);

  const TABS = [
    { key: "semua" as TabKey, label: "Semua Pengeluaran", count: allExpenses.length },
    { key: "utang" as TabKey, label: "Utang Usaha", count: utangExpenses.length },
    ...(user?.isOwner ? [{ key: "prive" as TabKey, label: "Prive", count: priveExpenses.length }] : []),
  ];

  return (
    <DashboardLayout
      title="Pengeluaran"
      subtitle="Kelola semua beban operasional dan utang usaha"
    >
      {/* Page Intro with Help Tips & Single Primary Action */}
      <PageIntro
        title="Pengeluaran Toko"
        description="Catat seluruh pengeluaran operasional tokomu, belanja stok barang, serta pantau jadwal pelunasan utang usaha ke supplier."
        helpTips={[
          {
            title: "Belanja Stok vs Beban Operasional",
            description: "Kategori 'Belanja Stok' otomatis menambah persediaan produk dan tidak langsung memotong laba bersih sebagai beban.",
          },
          {
            title: "Batas Anggaran Bulanan",
            description: "Setiap kategori biaya memiliki batas anggaran. Jika melebihi batas, sistem akan meminta alasan pengeluaran sebagai kontrol keuangan.",
          },
          {
            title: "Utang Usaha & Jatuh Tempo",
            description: "Pengeluaran yang belum lunas otomatis masuk ke tab Utang Usaha dengan penanda waktu jatuh tempo agar kas toko tetap terjaga.",
          },
          {
            title: "Penarikan Pribadi (Prive)",
            description: "Catat penarikan dana pribadi pemilik di tab Prive agar tidak tercampur dan tidak merusak perhitungan laba/rugi usaha.",
          },
        ]}
        primaryAction={
          canManage ? (
            activeTab === "prive" && user?.isOwner ? (
              <button
                onClick={() => setShowPriveModal(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold transition-colors shadow-xs cursor-pointer"
              >
                <Crown className="w-4 h-4" /> Catat Prive
              </button>
            ) : (
              <button
                onClick={() => setShowAddModal(true)}
                id="add-expense-btn"
                data-shortcut="new"
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors shadow-md shadow-blue-500/20 cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Catat Pengeluaran
              </button>
            )
          ) : undefined
        }
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="card flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950/40 flex items-center justify-center shrink-0">
            <TrendingDown className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <div className="text-xs text-[hsl(var(--muted-fg))] font-medium flex items-center gap-1">
              <span>Total Biaya Bulan Ini</span>
            </div>
            <p className="text-lg font-black text-red-600 dark:text-red-400">{formatRp(totalBulanIni)}</p>
          </div>
        </div>
        <div className="card flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center shrink-0">
            <CreditCard className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <div className="text-xs text-[hsl(var(--muted-fg))] font-medium flex items-center gap-1">
              <Hint term="utang_usaha" text="Utang yang Harus Dibayar" />
            </div>
            <p className="text-lg font-black text-amber-600 dark:text-amber-400">{formatRp(totalUtang)}</p>
            <p className="text-[10px] text-[hsl(var(--muted-fg))]">{utangExpenses.length} tagihan belum lunas</p>
          </div>
        </div>
        {user?.isOwner && (
          <div className="card flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center shrink-0">
              <Wallet className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <div className="text-xs text-[hsl(var(--muted-fg))] font-medium flex items-center gap-1">
                <Hint term="prive" text="Uang Pribadi Ditarik (Prive)" />
              </div>
              <p className="text-lg font-black text-emerald-600 dark:text-emerald-400">{formatRp(totalPrive)}</p>
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div className="flex gap-1 bg-[hsl(var(--muted))] rounded-xl p-1">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === tab.key
                  ? "bg-[hsl(var(--card))] text-[hsl(var(--foreground))] shadow-xs"
                  : "text-[hsl(var(--muted-fg))] hover:text-[hsl(var(--foreground))]"
              }`}
            >
              {tab.key === "prive" && <Crown className="w-3.5 h-3.5 text-amber-500" />}
              {tab.label}
              {tab.count > 0 && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                  activeTab === tab.key ? "bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300" : "bg-[hsl(var(--border))] text-[hsl(var(--muted-fg))]"
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ====== TAB: SEMUA PENGELUARAN ====== */}
      {activeTab === "semua" && (
        <div>
          {/* Filter kategori */}
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <button
              onClick={() => setFilterCat("all")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border cursor-pointer ${filterCat === "all" ? "border-blue-500 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300" : "border-[hsl(var(--border))] text-[hsl(var(--muted-fg))] hover:border-blue-300"}`}
            >
              Semua
            </button>
            {expenseCategories.filter(c => c.group !== "non_expense").map((cat) => (
              <button
                key={cat.id}
                onClick={() => setFilterCat(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border cursor-pointer ${filterCat === cat.id ? "border-blue-500 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300" : "border-[hsl(var(--border))] text-[hsl(var(--muted-fg))] hover:border-blue-300"}`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {filteredExpenses.length === 0 ? (
            <EmptyState
              icon={<TrendingDown className="w-7 h-7" />}
              title="Belum Ada Catatan Pengeluaran"
              description="Catat seluruh biaya operasional toko, sewa, listrik, gaji, atau belanja stok barang untuk menjaga laporan laba/rugi tetap akurat."
              actionText={canManage ? "Catat Pengeluaran Pertama" : undefined}
              onAction={canManage ? () => setShowAddModal(true) : undefined}
            />
          ) : (
            <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] overflow-hidden shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[hsl(var(--border))] bg-[hsl(var(--muted))]/50">
                      {["Tanggal", "Kategori", "Vendor / Toko", "Nominal", "Status", "Catatan"].map((h) => (
                        <th key={h} className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wide text-[hsl(var(--muted-fg))]">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredExpenses.map((exp) => {
                      const cat = getCat(exp.categoryId);
                      return (
                        <tr key={exp.id} className="border-b border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))]/50 transition-colors">
                          <td className="px-4 py-3 text-xs text-[hsl(var(--muted-fg))] whitespace-nowrap">{formatDate(exp.date)}</td>
                          <td className="px-4 py-3">
                            <div className="flex flex-col gap-1">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold w-fit ${GROUP_COLOR[cat?.group ?? "other"]}`}>
                                {GROUP_LABEL[cat?.group ?? "other"]}
                              </span>
                              <span className="text-xs font-medium">{cat?.name ?? exp.categoryId}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm">{exp.vendor ?? <span className="text-[hsl(var(--muted-fg))]">—</span>}</td>
                          <td className="px-4 py-3 font-bold text-red-600 dark:text-red-400 whitespace-nowrap">{formatRp(exp.amount)}</td>
                          <td className="px-4 py-3">
                            {exp.paid ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                                <CheckCircle2 className="w-3 h-3" /> Lunas
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
                                <Clock className="w-3 h-3" /> Belum Lunas
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-xs text-[hsl(var(--muted-fg))] max-w-[180px] truncate">
                            {exp.note ?? "—"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ====== TAB: UTANG USAHA ====== */}
      {activeTab === "utang" && (
        <div>
          {utangExpenses.length === 0 ? (
            <EmptyState
              icon={<CheckCircle2 className="w-7 h-7 text-emerald-500" />}
              title="Tidak Ada Utang Usaha yang Belum Lunas"
              description="Hebat! Seluruh tagihan operasional dan belanja persediaan barang usahamu saat ini berstatus lunas."
            />
          ) : (
            <div className="space-y-3">
              {utangExpenses.map((exp) => {
                const cat = getCat(exp.categoryId);
                const isOverdue = exp.dueDate && new Date(exp.dueDate) < new Date();
                const dueAge = exp.dueDate ? daysDiff(exp.dueDate) : null;
                const age = daysDiff(exp.date);
                return (
                  <div
                    key={exp.id}
                    className={`p-4 rounded-2xl border bg-[hsl(var(--card))] flex flex-col sm:flex-row sm:items-center gap-4 shadow-2xs ${
                      isOverdue
                        ? "border-red-200 dark:border-red-800/60 bg-red-50/30 dark:bg-red-950/10"
                        : "border-[hsl(var(--border))]"
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isOverdue ? "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300" : "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"}`}>
                          {isOverdue ? `⚠ Lewat Tempo +${dueAge} Hari` : `Jatuh Tempo: ${exp.dueDate ? formatDate(exp.dueDate) : "—"}`}
                        </span>
                        <span className="text-[10px] text-[hsl(var(--muted-fg))]">Umur tagihan: {age} hari</span>
                      </div>
                      <p className="font-semibold text-sm mt-1">{cat?.name ?? exp.categoryId}</p>
                      {exp.vendor && <p className="text-xs text-[hsl(var(--muted-fg))]">Vendor: {exp.vendor}</p>}
                      {exp.note && <p className="text-xs text-[hsl(var(--muted-fg))] mt-0.5 italic">{exp.note}</p>}
                      <p className="text-xs text-[hsl(var(--muted-fg))] mt-1">Tanggal Transaksi: {formatDate(exp.date)}</p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <p className="font-black text-lg text-red-600 dark:text-red-400">{formatRp(exp.amount)}</p>
                      {canManage && (
                        <button
                          onClick={() => markExpensePaid(exp.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-colors cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" /> Tandai Lunas
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ====== TAB: PRIVE (Owner only) ====== */}
      {activeTab === "prive" && user?.isOwner && (
        <div>
          {priveExpenses.length === 0 ? (
            <EmptyState
              icon={<Wallet className="w-7 h-7 text-amber-500" />}
              title="Belum Ada Catatan Penarikan Pribadi (Prive)"
              description="Saat kamu mengambil uang kas usaha untuk keperluan pribadi, catat di sini agar pemisahan uang usaha dan uang pribadi tetap rapi."
              actionText="Catat Prive Sekarang"
              onAction={() => setShowPriveModal(true)}
            />
          ) : (
            <div className="space-y-3">
              {priveExpenses.map((exp) => (
                <div key={exp.id} className="p-4 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] flex items-center justify-between gap-4 shadow-2xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300">
                        Prive Pemilik
                      </span>
                      <span className="text-xs text-[hsl(var(--muted-fg))]">{formatDate(exp.date)}</span>
                    </div>
                    {exp.note && <p className="text-sm font-medium mt-1">{exp.note}</p>}
                  </div>
                  <p className="font-black text-lg text-amber-600 dark:text-amber-400 shrink-0">{formatRp(exp.amount)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      {showAddModal && <AddExpenseModal onClose={() => setShowAddModal(false)} />}
      {showPriveModal && <AddExpenseModal onClose={() => setShowPriveModal(false)} isPrive />}
    </DashboardLayout>
  );
}
