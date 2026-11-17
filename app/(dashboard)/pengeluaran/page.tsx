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
  TrendingDown, Wallet, CreditCard, Crown, Package, Boxes, Sparkles,
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
  const remaining = Math.max(0, limit - used);
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
      <p className={`text-[11px] mt-1 font-medium ${textColor}`}>
        {used >= limit ? `Batas terlampaui ${formatRp(used - limit)}` : `Sisa batas ${formatRp(remaining)}`}
      </p>
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
  const rawProducts = useStore((s) => s.products);
  const rawMaterials = useStore((s) => s.rawMaterials ?? []);
  const activeTenantId = useStore((s) => s.activeTenantId);
  const products = useMemo(
    () => rawProducts.filter((p) => p.tenantId === activeTenantId),
    [rawProducts, activeTenantId]
  );
  const expenseCategories = useStore((s) => s.expenseCategories);
  const budgets = useStore((s) => s.budgets);
  const addExpense = useStore((s) => s.addExpense);
  const getExpenseSumByCategory = useStore((s) => s.getExpenseSumByCategory);

  const categories = isPrive
    ? expenseCategories.filter((c) => c.id === "cat-prive")
    : expenseCategories.filter((c) => c.group !== "non_expense");

  const [form, setForm] = useState({
    date: new Date().toISOString().split("T")[0],
    categoryId: isPrive ? "cat-prive" : "",
    amount: 0,
    paid: true,
    dueDate: "",
    vendor: "",
    note: "",
  });

  const [items, setItems] = useState<ExpenseItem[]>([]);
  const [stockType, setStockType] = useState<"dagang" | "produksi" | "kemasan">("dagang");
  const [showBudgetWarning, setShowBudgetWarning] = useState(false);
  const [budgetExceedReason, setBudgetExceedReason] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const selectedCat = expenseCategories.find((c) => c.id === form.categoryId);
  const isKemasanCategory = Boolean(
    selectedCat?.id === "cat-kemasan" ||
    selectedCat?.stockKind === "kemasan" ||
    selectedCat?.name.toLowerCase().includes("kemasan")
  );
  const isStockRelated = Boolean(
    selectedCat?.isStockRelated ||
    selectedCat?.stockKind ||
    selectedCat?.id === "cat-belanja-dagang" ||
    selectedCat?.id === "cat-belanja-bahan" ||
    selectedCat?.id === "cat-belanja-stok" ||
    isKemasanCategory
  );

  const budgetLimit = budgets[form.categoryId] ?? 0;
  const usedBudget = getExpenseSumByCategory(form.categoryId);

  function addStockItem(typeOverride?: "dagang" | "produksi" | "kemasan") {
    const type = typeOverride ?? (isKemasanCategory ? "kemasan" : stockType);
    if (type === "kemasan") {
      setItems((prev) => [
        ...prev,
        {
          kind: "kemasan",
          target: "kemasan",
          productName: "",
          packageQty: 1,
          packageUnitSize: 1,
          unit: "pcs",
          qty: 1,
          unitCost: 0,
          totalCost: 0,
        },
      ]);
    } else if (type === "produksi") {
      setItems((prev) => [
        ...prev,
        {
          kind: "produksi",
          target: "produksi",
          productName: "",
          packageQty: 1,
          packageUnitSize: 1000,
          unit: "gram",
          qty: 1000,
          unitCost: 0,
          totalCost: 0,
        },
      ]);
    } else {
      setItems((prev) => [
        ...prev,
        {
          kind: "dagang",
          target: "dagang",
          productId: "",
          productName: "",
          qty: 1,
          unitCost: 0,
          totalCost: 0,
        },
      ]);
    }
  }

  function updateItem(idx: number, updates: Partial<ExpenseItem>) {
    setErrors((prev) => {
      if (!prev.items && !prev.amount) return prev;
      const next = { ...prev };
      delete next.items;
      delete next.amount;
      return next;
    });
    setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, ...updates } : it)));
  }

  function removeItem(idx: number) {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  }

  // Active items based on current category and stockType
  const activeItems = useMemo(() => {
    if (isKemasanCategory) {
      return items.filter((it) => it.kind === "kemasan");
    }
    if (stockType === "produksi") {
      return items.filter((it) => it.kind === "produksi");
    }
    return items.filter((it) => it.kind === "dagang" || !it.kind);
  }, [items, isKemasanCategory, stockType]);

  // Auto-calculate amount from active items
  const itemsTotal = activeItems.reduce((s, it) => {
    if (it.totalCost && it.totalCost > 0) return s + it.totalCost;
    return s + it.qty * it.unitCost;
  }, 0);
  const effectiveAmount = isStockRelated && activeItems.length > 0 ? itemsTotal : form.amount;

  function validate() {
    const errs: Record<string, string> = {};
    if (!form.date) errs.date = "Tanggal wajib diisi";
    if (!form.categoryId) errs.categoryId = "Kategori wajib dipilih";
    if (isStockRelated && activeItems.length === 0) {
      errs.items = isKemasanCategory
        ? "Tambahkan minimal satu kemasan yang dibeli."
        : stockType === "produksi"
        ? "Tambahkan minimal satu bahan mentah yang dibeli."
        : "Tambahkan minimal satu produk jadi yang dibeli.";
    }
    if (isStockRelated && activeItems.some((item) => {
      if (item.kind === "kemasan") {
        return !item.productName?.trim() || (item.packageQty ?? 0) <= 0 || (item.totalCost ?? 0) <= 0;
      }
      if (item.kind === "produksi") {
        return !item.productName?.trim() || (item.packageQty ?? 0) <= 0 || (item.totalCost ?? 0) <= 0;
      }
      return !item.productName?.trim() || item.qty <= 0 || (item.totalCost ?? 0) <= 0;
    })) {
      errs.items = "Lengkapi nama, jumlah, dan total bayar untuk semua item belanja.";
    }
    if (effectiveAmount <= 0) {
      errs.amount = isStockRelated
        ? "Total belanja harus lebih dari Rp0."
        : "Nominal pengeluaran harus lebih dari Rp0.";
    }
    if (!form.paid && !form.dueDate) errs.dueDate = "Tanggal jatuh tempo wajib diisi jika belum lunas";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function saveExpense() {
    if (showBudgetWarning && !budgetExceedReason.trim()) {
      setErrors((current) => ({ ...current, budgetExceedReason: "Tuliskan alasan agar pengeluaran di atas batas dapat dicatat." }));
      return;
    }

    const processedItems: ExpenseItem[] | undefined = isStockRelated && activeItems.length > 0
      ? items.map((it) => {
          if (it.kind === "kemasan") {
            const totalUnits = (it.packageQty || 1) * (it.packageUnitSize || 1);
            const unitCost = totalUnits > 0 ? Math.round((it.totalCost || 0) / totalUnits) : 0;
            return {
              ...it,
              kind: "kemasan" as const,
              target: "kemasan" as const,
              qty: totalUnits,
              unitCost,
              totalCost: it.totalCost || 0,
              unit: it.unit || "pcs",
            };
          } else if (it.kind === "produksi") {
            const totalUnits = (it.packageQty || 1) * (it.packageUnitSize || 1);
            const unitCost = totalUnits > 0 ? Math.round((it.totalCost || 0) / totalUnits) : 0;
            return {
              ...it,
              kind: "produksi" as const,
              target: "produksi" as const,
              qty: totalUnits,
              unitCost,
              totalCost: it.totalCost || 0,
              unit: it.unit || "gram",
            };
          } else {
            const qty = it.qty > 0 ? it.qty : 1;
            const unitCost = Math.round((it.totalCost || 0) / qty);
            return {
              ...it,
              kind: "dagang" as const,
              target: "dagang" as const,
              qty,
              unitCost,
              totalCost: it.totalCost || 0,
              unit: "pcs",
            };
          }
        })
      : undefined;

    addExpense({
      date: form.date,
      categoryId: form.categoryId,
      amount: effectiveAmount,
      paid: form.paid,
      dueDate: form.paid ? undefined : form.dueDate || undefined,
      vendor: form.vendor || undefined,
      note: form.note || undefined,
      items: processedItems,
      budgetExceedReason: showBudgetWarning ? budgetExceedReason : undefined,
      isPrive,
    });
    setShowBudgetWarning(false);
    onClose();
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    if (budgetLimit > 0 && usedBudget + effectiveAmount > budgetLimit) {
      setShowBudgetWarning(true);
      return;
    }
    saveExpense();
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

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isPrive && (
            <div>
              <label className="text-xs font-semibold text-[hsl(var(--muted-fg))] block mb-1">Pilih kategori dahulu *</label>
              <select value={form.categoryId}
                onChange={(e) => {
                  const newCatId = e.target.value;
                  const cat = categories.find((c) => c.id === newCatId);
                  const isKem = Boolean(cat?.id === "cat-kemasan" || cat?.stockKind === "kemasan" || cat?.name.toLowerCase().includes("kemasan"));
                  const isStk = Boolean(cat?.isStockRelated || cat?.stockKind || isKem || newCatId === "cat-belanja-stok" || newCatId === "cat-belanja-dagang" || newCatId === "cat-belanja-bahan");

                  setShowBudgetWarning(false);
                  setBudgetExceedReason("");
                  setErrors({});
                  setForm({ ...form, categoryId: newCatId });

                  if (isKem) {
                    setStockType("kemasan");
                    setItems([
                      {
                        kind: "kemasan",
                        target: "kemasan",
                        productName: "",
                        packageQty: 1,
                        packageUnitSize: 1,
                        unit: "pcs",
                        qty: 1,
                        unitCost: 0,
                        totalCost: 0,
                      },
                    ]);
                  } else if (isStk) {
                    setStockType("dagang");
                    setItems([
                      {
                        kind: "dagang",
                        target: "dagang",
                        productId: "",
                        productName: "",
                        qty: 1,
                        unitCost: 0,
                        totalCost: 0,
                      },
                    ]);
                  } else {
                    setItems([]);
                  }
                }}
                className={`w-full px-3 py-2 rounded-lg border bg-[hsl(var(--background))] text-sm focus:outline-none focus:ring-2 ${errors.categoryId ? "border-red-500" : "border-[hsl(var(--border))] focus:ring-blue-500/30"}`}>
                <option value="">Pilih kategori pengeluaran</option>
                {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
              </select>
              {errors.categoryId && <p className="text-[11px] text-red-500 mt-0.5" role="alert">{errors.categoryId}</p>}
              {budgetLimit > 0 && form.categoryId && <BudgetIndicator used={usedBudget} limit={budgetLimit} />}
            </div>
          )}

          {!isPrive && !form.categoryId ? (
            <p className="rounded-lg bg-[hsl(var(--muted))]/60 px-3 py-3 text-xs text-[hsl(var(--muted-fg))]">
              Pilih kategori untuk menampilkan isian yang sesuai dengan pengeluaranmu.
            </p>
          ) : (
            <>
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

          {/* Items stok jika kategori stock-related */}
          {isStockRelated && !isPrive && (
            <div className="space-y-3">
              {/* JIKA KATEGORI KEMASAN: Tampilkan Langsung Form Kemasan & Packing */}
              {isKemasanCategory ? (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <label className="text-xs font-semibold text-[hsl(var(--foreground))]">Kemasan & Perlengkapan Packing yang Dibeli</label>
                      <p className="text-[11px] text-[hsl(var(--muted-fg))]">Input kardus, bubble wrap, polymailer, cup, kantong, dll. Modal per pcs otomatis dihitung & disimpan ke persediaan.</p>
                    </div>
                    <button type="button" onClick={() => addStockItem("kemasan")}
                      className="text-xs text-amber-600 hover:text-amber-700 font-semibold flex items-center gap-1 shrink-0">
                      <Plus className="w-3.5 h-3.5" /> Tambah Kemasan
                    </button>
                  </div>
                  {errors.items && <p className="text-[11px] text-red-500 mb-2">{errors.items}</p>}
                  {items.filter(it => it.kind === "kemasan").length === 0 ? (
                    <div className="text-center py-4 rounded-xl border border-dashed border-[hsl(var(--border))] bg-[hsl(var(--muted))]/30">
                      <p className="text-xs text-[hsl(var(--muted-fg))]">Klik &quot;Tambah Kemasan&quot; untuk mencatat kardus, box, atau plastik packing</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {items.map((item, idx) => {
                        if (item.kind !== "kemasan") return null;
                        const totalUnits = (item.packageQty || 1) * (item.packageUnitSize || 1);
                        const unitCost = totalUnits > 0 && (item.totalCost ?? 0) > 0 ? Math.round((item.totalCost ?? 0) / totalUnits) : 0;
                        return (
                          <div key={idx} className="p-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))]/20 space-y-2">
                            <div className="flex items-center gap-2">
                              <div className="flex-1">
                                <label className="text-[10px] font-semibold text-[hsl(var(--muted-fg))] uppercase">Nama Kemasan / Packing</label>
                                <input
                                  type="text"
                                  list="kemasan-suggestions"
                                  value={item.productName || ""}
                                  onChange={(e) => updateItem(idx, { productName: e.target.value })}
                                  placeholder="Contoh: Kardus Box Uk. 20x15 / Bubble Wrap 50m / Cup Dingin 16oz"
                                  className="w-full px-2.5 py-1.5 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-xs focus:ring-1 focus:ring-amber-500/30"
                                />
                                <datalist id="kemasan-suggestions">
                                  {rawMaterials.filter(m => m.category === "kemasan").map(m => (
                                    <option key={m.id} value={m.name} />
                                  ))}
                                </datalist>
                              </div>
                              <button type="button" onClick={() => removeItem(idx)} className="p-1 rounded hover:bg-red-50 text-[hsl(var(--muted-fg))] hover:text-red-500 mt-4">
                                <X className="w-4 h-4" />
                              </button>
                            </div>

                            <div className="grid grid-cols-3 gap-2">
                              <div>
                                <label className="text-[10px] font-semibold text-[hsl(var(--muted-fg))] uppercase">Beli (Pack/Roll)</label>
                                <input
                                  type="number"
                                  min={1}
                                  value={item.packageQty || ""}
                                  onChange={(e) => {
                                    const pq = Math.max(1, parseInt(e.target.value) || 0);
                                    const pus = item.packageUnitSize || 1;
                                    const tot = pq * pus;
                                    const tCost = item.totalCost || 0;
                                    updateItem(idx, {
                                      packageQty: pq,
                                      qty: tot,
                                      unitCost: tot > 0 ? Math.round(tCost / tot) : 0,
                                    });
                                  }}
                                  placeholder="Contoh: 1"
                                  className="w-full px-2.5 py-1.5 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-xs"
                                />
                              </div>
                              <div>
                                <label className="text-[10px] font-semibold text-[hsl(var(--muted-fg))] uppercase">Isi / Kemasan</label>
                                <input
                                  type="number"
                                  min={1}
                                  value={item.packageUnitSize || ""}
                                  onChange={(e) => {
                                    const pus = Math.max(1, parseInt(e.target.value) || 0);
                                    const pq = item.packageQty || 1;
                                    const tot = pq * pus;
                                    const tCost = item.totalCost || 0;
                                    updateItem(idx, {
                                      packageUnitSize: pus,
                                      qty: tot,
                                      unitCost: tot > 0 ? Math.round(tCost / tot) : 0,
                                    });
                                  }}
                                  placeholder="Contoh: 100"
                                  className="w-full px-2.5 py-1.5 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-xs"
                                />
                              </div>
                              <div>
                                <label className="text-[10px] font-semibold text-[hsl(var(--muted-fg))] uppercase">Satuan</label>
                                <select
                                  value={item.unit || "pcs"}
                                  onChange={(e) => updateItem(idx, { unit: e.target.value })}
                                  className="w-full px-2 py-1.5 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-xs"
                                >
                                  <option value="pcs">pcs</option>
                                  <option value="lembar">lembar</option>
                                  <option value="roll">roll</option>
                                  <option value="meter">meter</option>
                                  <option value="pack">pack</option>
                                  <option value="box">box</option>
                                </select>
                              </div>
                            </div>

                            <div>
                              <label className="text-[10px] font-semibold text-[hsl(var(--muted-fg))] uppercase">Total Bayar (Rp)</label>
                              <input
                                type="number"
                                min={0}
                                value={item.totalCost || ""}
                                onChange={(e) => {
                                  const tCost = Math.max(0, parseInt(e.target.value) || 0);
                                  const tot = (item.packageQty || 1) * (item.packageUnitSize || 1);
                                  updateItem(idx, {
                                    totalCost: tCost,
                                    unitCost: tot > 0 ? Math.round(tCost / tot) : 0,
                                  });
                                }}
                                placeholder="Contoh: 120000"
                                className="w-full px-2.5 py-1.5 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-xs"
                              />
                            </div>

                            <div className="flex items-center justify-between text-xs pt-1 border-t border-[hsl(var(--border))]/50">
                              <span className="text-[11px] text-[hsl(var(--muted-fg))]">
                                Total Stok: <strong className="text-[hsl(var(--foreground))]">{totalUnits.toLocaleString()} {item.unit || "pcs"}</strong>
                              </span>
                              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                                {unitCost > 0 ? `${formatRp(unitCost)} / ${item.unit || "pcs"}` : "—"}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                      <div className="text-right text-xs font-semibold text-amber-600">
                        Total Belanja Kemasan: {formatRp(itemsTotal)}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* JIKA KATEGORI BELANJA STOK: Hanya 2 Pilihan (Produk Jadi vs Produksi Sendiri) */
                <div>
                  <div className="mb-3">
                    <label className="text-xs font-semibold text-[hsl(var(--foreground))] block mb-1.5">
                      Tipe Belanja Persediaan:
                    </label>
                    <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-[hsl(var(--muted))]/70 border border-[hsl(var(--border))]">
                      <button
                        type="button"
                        onClick={() => {
                          setStockType("dagang");
                          setErrors({});
                          if (items.length === 0 || !items.some(it => (it.kind === "dagang" || !it.kind) && it.productName?.trim())) {
                            setItems([
                              {
                                kind: "dagang",
                                target: "dagang",
                                productId: "",
                                productName: "",
                                qty: 1,
                                unitCost: 0,
                                totalCost: 0,
                              },
                            ]);
                          }
                        }}
                        className={`py-2 px-3 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                          stockType === "dagang"
                            ? "bg-[hsl(var(--card))] text-blue-600 dark:text-blue-400 shadow-xs border border-[hsl(var(--border))]"
                            : "text-[hsl(var(--muted-fg))] hover:text-[hsl(var(--foreground))]"
                        }`}
                      >
                        <Package className="w-3.5 h-3.5" />
                        Produk Jadi (Reseller)
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setStockType("produksi");
                          setErrors({});
                          if (items.length === 0 || !items.some(it => it.kind === "produksi" && it.productName?.trim())) {
                            setItems([
                              {
                                kind: "produksi",
                                target: "produksi",
                                productName: "",
                                packageQty: 1,
                                packageUnitSize: 1000,
                                unit: "gram",
                                qty: 1000,
                                unitCost: 0,
                                totalCost: 0,
                              },
                            ]);
                          }
                        }}
                        className={`py-2 px-3 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                          stockType === "produksi"
                            ? "bg-[hsl(var(--card))] text-violet-600 dark:text-violet-400 shadow-xs border border-[hsl(var(--border))]"
                            : "text-[hsl(var(--muted-fg))] hover:text-[hsl(var(--foreground))]"
                        }`}
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        Produksi Sendiri (Olahan)
                      </button>
                    </div>
                  </div>

                  {/* 1. PRODUK JADI */}
                  {stockType === "dagang" && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <label className="text-xs font-semibold text-[hsl(var(--foreground))]">Produk Jadi yang Dibeli (Siap Jual)</label>
                          <p className="text-[11px] text-[hsl(var(--muted-fg))]">Input barang siap jual, jumlah pcs, & total harga beli. Modal per pcs otomatis dihitung.</p>
                        </div>
                        <button type="button" onClick={() => addStockItem("dagang")}
                          className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1 shrink-0">
                          <Plus className="w-3.5 h-3.5" /> Tambah Produk Jadi
                        </button>
                      </div>
                      {errors.items && <p className="text-[11px] text-red-500 mb-2">{errors.items}</p>}
                      {items.filter(it => it.kind === "dagang" || !it.kind).length === 0 ? (
                        <div className="text-center py-4 rounded-xl border border-dashed border-[hsl(var(--border))] bg-[hsl(var(--muted))]/30">
                          <p className="text-xs text-[hsl(var(--muted-fg))]">Klik &quot;Tambah Produk Jadi&quot; untuk mencatat produk kulakan/grosir</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {items.map((item, idx) => {
                            if (item.kind && item.kind !== "dagang") return null;
                            const unitCost = item.qty > 0 && (item.totalCost ?? 0) > 0 ? Math.round((item.totalCost ?? 0) / item.qty) : 0;
                            return (
                              <div key={idx} className="p-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))]/20 space-y-2">
                                <div className="flex items-center gap-2">
                                  <div className="flex-1">
                                    <label className="text-[10px] font-semibold text-[hsl(var(--muted-fg))] uppercase">Nama Produk Jadi</label>
                                    <input
                                      type="text"
                                      list="dagang-suggestions"
                                      value={item.productName || ""}
                                      onChange={(e) => {
                                        const val = e.target.value;
                                        const matched = products.find(p => p.name.toLowerCase() === val.toLowerCase());
                                        if (matched) {
                                          updateItem(idx, {
                                            productName: val,
                                            productId: matched.id,
                                            ...(item.totalCost ? {} : matched.buyPrice > 0 ? {
                                              totalCost: matched.buyPrice * (item.qty || 1),
                                              unitCost: matched.buyPrice,
                                            } : {}),
                                          });
                                        } else {
                                          updateItem(idx, {
                                            productName: val,
                                            productId: "",
                                          });
                                        }
                                      }}
                                      placeholder="Contoh: Kemeja Flannel / Sepatu Sneakers"
                                      className="w-full px-2.5 py-1.5 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-xs focus:ring-1 focus:ring-blue-500/30"
                                    />
                                    <datalist id="dagang-suggestions">
                                      {products.map(p => (
                                        <option key={p.id} value={p.name} />
                                      ))}
                                    </datalist>
                                  </div>
                                  <button type="button" onClick={() => removeItem(idx)} className="p-1 rounded hover:bg-red-50 text-[hsl(var(--muted-fg))] hover:text-red-500 mt-4">
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                  <div>
                                    <label className="text-[10px] font-semibold text-[hsl(var(--muted-fg))] uppercase">Jumlah (Pcs)</label>
                                    <input
                                      type="number"
                                      min={1}
                                      value={item.qty || ""}
                                      onChange={(e) => {
                                        const q = Math.max(1, parseInt(e.target.value) || 0);
                                        const tCost = item.totalCost || 0;
                                        updateItem(idx, {
                                          qty: q,
                                          unitCost: q > 0 ? Math.round(tCost / q) : 0,
                                        });
                                      }}
                                      placeholder="Contoh: 12"
                                      className="w-full px-2.5 py-1.5 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-xs"
                                    />
                                  </div>
                                  <div>
                                    <label className="text-[10px] font-semibold text-[hsl(var(--muted-fg))] uppercase">Total Bayar (Rp)</label>
                                    <input
                                      type="number"
                                      min={0}
                                      value={item.totalCost || ""}
                                      onChange={(e) => {
                                        const t = Math.max(0, parseInt(e.target.value) || 0);
                                        const q = item.qty || 1;
                                        updateItem(idx, {
                                          totalCost: t,
                                          unitCost: q > 0 ? Math.round(t / q) : 0,
                                        });
                                      }}
                                      placeholder="Contoh: 360000"
                                      className="w-full px-2.5 py-1.5 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-xs"
                                    />
                                  </div>
                                </div>

                                <div className="flex items-center justify-between text-xs pt-1 border-t border-[hsl(var(--border))]/50">
                                  <span className="text-[11px] text-[hsl(var(--muted-fg))]">Modal Pokok (HPP) / Pcs:</span>
                                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                                    {unitCost > 0 ? `${formatRp(unitCost)} / pcs` : "—"}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                          <div className="text-right text-xs font-semibold text-blue-600">
                            Total Belanja: {formatRp(itemsTotal)}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* 2. PRODUKSI SENDIRI */}
                  {stockType === "produksi" && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <label className="text-xs font-semibold text-[hsl(var(--foreground))]">Bahan Baku Olahan Produksi Sendiri</label>
                          <p className="text-[11px] text-[hsl(var(--muted-fg))]">Input bahan mentah dapur. Sistem akan menghitung modal per takaran & menyimpan ke stok.</p>
                        </div>
                        <button type="button" onClick={() => addStockItem("produksi")}
                          className="text-xs text-violet-600 hover:text-violet-700 font-semibold flex items-center gap-1 shrink-0">
                          <Plus className="w-3.5 h-3.5" /> Tambah Bahan Mentah
                        </button>
                      </div>
                      {errors.items && <p className="text-[11px] text-red-500 mb-2">{errors.items}</p>}
                      {items.filter(it => it.kind === "produksi").length === 0 ? (
                        <div className="text-center py-4 rounded-xl border border-dashed border-[hsl(var(--border))] bg-[hsl(var(--muted))]/30">
                          <p className="text-xs text-[hsl(var(--muted-fg))]">Klik &quot;Tambah Bahan Mentah&quot; untuk mencatat bahan dapur yang dibeli</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {items.map((item, idx) => {
                            if (item.kind !== "produksi") return null;
                            const totalUnits = (item.packageQty || 1) * (item.packageUnitSize || 1);
                            const unitCost = totalUnits > 0 && (item.totalCost ?? 0) > 0 ? Math.round((item.totalCost ?? 0) / totalUnits) : 0;
                            return (
                              <div key={idx} className="p-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))]/20 space-y-2">
                                <div className="flex items-center gap-2">
                                  <div className="flex-1">
                                    <label className="text-[10px] font-semibold text-[hsl(var(--muted-fg))] uppercase">Nama Bahan Mentah</label>
                                    <input
                                      type="text"
                                      list="produksi-suggestions"
                                      value={item.productName || ""}
                                      onChange={(e) => updateItem(idx, { productName: e.target.value })}
                                      placeholder="Contoh: Biji Kopi Arabika / Tepung Terigu / Daging Sapi"
                                      className="w-full px-2.5 py-1.5 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-xs focus:ring-1 focus:ring-violet-500/30"
                                    />
                                    <datalist id="produksi-suggestions">
                                      {rawMaterials.filter(m => (m.category ?? "produksi") === "produksi").map(m => (
                                        <option key={m.id} value={m.name} />
                                      ))}
                                    </datalist>
                                  </div>
                                  <button type="button" onClick={() => removeItem(idx)} className="p-1 rounded hover:bg-red-50 text-[hsl(var(--muted-fg))] hover:text-red-500 mt-4">
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>

                                <div className="grid grid-cols-3 gap-2">
                                  <div>
                                    <label className="text-[10px] font-semibold text-[hsl(var(--muted-fg))] uppercase">Beli (Kemasan)</label>
                                    <input
                                      type="number"
                                      min={1}
                                      value={item.packageQty || ""}
                                      onChange={(e) => {
                                        const pq = Math.max(1, parseInt(e.target.value) || 0);
                                        const pus = item.packageUnitSize || 1;
                                        const tot = pq * pus;
                                        const tCost = item.totalCost || 0;
                                        updateItem(idx, {
                                          packageQty: pq,
                                          qty: tot,
                                          unitCost: tot > 0 ? Math.round(tCost / tot) : 0,
                                        });
                                      }}
                                      placeholder="Contoh: 2"
                                      className="w-full px-2.5 py-1.5 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-xs"
                                    />
                                  </div>
                                  <div>
                                    <label className="text-[10px] font-semibold text-[hsl(var(--muted-fg))] uppercase">Isi / Kemasan</label>
                                    <input
                                      type="number"
                                      min={1}
                                      value={item.packageUnitSize || ""}
                                      onChange={(e) => {
                                        const pus = Math.max(1, parseInt(e.target.value) || 0);
                                        const pq = item.packageQty || 1;
                                        const tot = pq * pus;
                                        const tCost = item.totalCost || 0;
                                        updateItem(idx, {
                                          packageUnitSize: pus,
                                          qty: tot,
                                          unitCost: tot > 0 ? Math.round(tCost / tot) : 0,
                                        });
                                      }}
                                      placeholder="Contoh: 1000"
                                      className="w-full px-2.5 py-1.5 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-xs"
                                    />
                                  </div>
                                  <div>
                                    <label className="text-[10px] font-semibold text-[hsl(var(--muted-fg))] uppercase">Satuan</label>
                                    <select
                                      value={item.unit || "gram"}
                                      onChange={(e) => updateItem(idx, { unit: e.target.value })}
                                      className="w-full px-2 py-1.5 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-xs"
                                    >
                                      <option value="gram">gram (g)</option>
                                      <option value="ml">ml / cc</option>
                                      <option value="kg">kg</option>
                                      <option value="liter">liter</option>
                                      <option value="pcs">pcs / butir</option>
                                    </select>
                                  </div>
                                </div>

                                <div>
                                  <label className="text-[10px] font-semibold text-[hsl(var(--muted-fg))] uppercase">Total Bayar (Rp)</label>
                                  <input
                                    type="number"
                                    min={0}
                                    value={item.totalCost || ""}
                                    onChange={(e) => {
                                      const tCost = Math.max(0, parseInt(e.target.value) || 0);
                                      const tot = (item.packageQty || 1) * (item.packageUnitSize || 1);
                                      updateItem(idx, {
                                        totalCost: tCost,
                                        unitCost: tot > 0 ? Math.round(tCost / tot) : 0,
                                      });
                                    }}
                                    placeholder="Contoh: 150000"
                                    className="w-full px-2.5 py-1.5 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-xs"
                                  />
                                </div>

                                <div className="flex items-center justify-between text-xs pt-1 border-t border-[hsl(var(--border))]/50">
                                  <span className="text-[11px] text-[hsl(var(--muted-fg))]">
                                    Total Stok: <strong className="text-[hsl(var(--foreground))]">{totalUnits.toLocaleString()} {item.unit || "gram"}</strong>
                                  </span>
                                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                                    {unitCost > 0 ? `${formatRp(unitCost)} / ${item.unit || "gram"}` : "—"}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                          <div className="text-right text-xs font-semibold text-violet-600">
                            Total Belanja: {formatRp(itemsTotal)}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Nominal (hanya jika bukan stock-related atau tidak ada items) */}
          {!isStockRelated && (
            <div>
              <label className="text-xs font-semibold text-[hsl(var(--muted-fg))] block mb-1">Nominal (Rp) *</label>
              <input type="number" min={0} value={form.amount}
                onChange={(e) => setForm({ ...form, amount: +e.target.value })}
                className={`w-full px-3 py-2 rounded-lg border bg-[hsl(var(--background))] text-sm focus:outline-none focus:ring-2 ${errors.amount ? "border-red-500 focus:ring-red-500/30" : "border-[hsl(var(--border))] focus:ring-blue-500/30"}`}
                placeholder="Contoh: 25000" />
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
                placeholder="Contoh: Toko Sumber Makmur" />
            </div>
            <div>
              <label className="text-xs font-semibold text-[hsl(var(--muted-fg))] block mb-1">Catatan <span className="font-normal">(opsional)</span></label>
              <input type="text" value={form.note}
                onChange={(e) => setForm({ ...form, note: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                placeholder="Contoh: Beli 20 kg tepung terigu" />
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
            </>
          )}
        </form>
        {showBudgetWarning && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50" role="presentation">
            <section className="w-full max-w-md rounded-2xl border border-red-200 dark:border-red-900 bg-[hsl(var(--card))] p-5 shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="expense-budget-title">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 id="expense-budget-title" className="font-semibold text-sm text-red-700 dark:text-red-300">Pengeluaran melewati batas anggaran</h3>
                  <p className="text-xs text-[hsl(var(--muted-fg))] mt-1">
                    Setelah disimpan, kategori {selectedCat?.name} akan mencapai {formatRp(usedBudget + effectiveAmount)} dari batas {formatRp(budgetLimit)}. Tulis alasan untuk tetap mencatat pengeluaran ini.
                  </p>
                  <textarea
                    value={budgetExceedReason}
                    onChange={(e) => {
                      setBudgetExceedReason(e.target.value);
                      setErrors((current) => ({ ...current, budgetExceedReason: "" }));
                    }}
                    placeholder="Contoh: Perlu tambahan stok untuk pesanan besar"
                    rows={3}
                    className="mt-3 w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-sm"
                    aria-invalid={Boolean(errors.budgetExceedReason)}
                  />
                  {errors.budgetExceedReason && <p className="text-xs text-red-600 mt-1" role="alert">{errors.budgetExceedReason}</p>}
                  <div className="flex gap-2 mt-3">
                    <button type="button" onClick={() => setShowBudgetWarning(false)}
                      className="flex-1 min-h-11 rounded-lg border border-[hsl(var(--border))] text-sm font-semibold">
                      Kembali
                    </button>
                    <button type="button" onClick={saveExpense}
                      className="flex-1 min-h-11 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-semibold">
                      Simpan dengan alasan
                    </button>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}
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
  const rawExpenses = useStore((s) => s.expenses);
  const activeTenantId = useStore((s) => s.activeTenantId);
  const expenses = useMemo(
    () => rawExpenses.filter((e) => e.tenantId === activeTenantId),
    [rawExpenses, activeTenantId]
  );
  const expenseCategories = useStore((s) => s.expenseCategories);
  const markExpensePaid = useStore((s) => s.markExpensePaid);

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
  const totalBulanIni = (() => {
    const now = new Date();
    const ym = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    return tenantExpenses
      .filter((e) => !e.isPrive && e.date.startsWith(ym))
      .reduce((s, e) => s + e.amount, 0);
  })();

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
