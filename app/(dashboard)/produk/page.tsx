"use client";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageIntro } from "@/components/ui/PageIntro";
import { EmptyState } from "@/components/ui/EmptyState";
import { Hint } from "@/components/ui/Hint";
import { usePermission } from "@/hooks/usePermission";
import { useStore } from "@/lib/store";
import { formatRp } from "@/lib/finance";
import { redirect, useRouter } from "next/navigation";
import {
  AlertTriangle, Package, X, History, TrendingDown,
  TrendingUp, Plus, ToggleLeft, ToggleRight, Boxes,
  Calculator, Edit2, Trash2, Check, Sparkles, Percent
} from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import type { Product, ProductType, RawMaterial, RecipeItem } from "@/types";

// ============================================================
// Constants
// ============================================================

const PRODUCT_TYPE_LABEL: Record<ProductType, string> = {
  dagang: "Produk Jadi (Reseller)",
  produksi: "Produksi Sendiri (Olahan)",
};
const PRODUCT_TYPE_COLOR: Record<ProductType, string> = {
  dagang: "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300",
  produksi: "bg-violet-100 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300",
};

// ============================================================
// Stock Ledger Drawer
// ============================================================

function StockLedgerDrawer({ product, onClose }: { product: Product; onClose: () => void }) {
  const rawMovements = useStore((s) => s.stockMovements);
  const activeTenantId = useStore((s) => s.activeTenantId);
  const movements = useMemo(
    () =>
      rawMovements
        .filter((m) => m.productId === product.id && m.tenantId === activeTenantId)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 25),
    [rawMovements, product.id, activeTenantId]
  );
  const { canView: canViewFinance } = usePermission("laporan_keuangan");

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="w-full max-w-md bg-[hsl(var(--card))] border-l border-[hsl(var(--border))] h-full overflow-y-auto p-6 space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="font-bold text-base">{product.name}</h2>
            <p className="text-xs text-[hsl(var(--muted-fg))] font-mono">{product.sku}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[hsl(var(--muted))] transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="card !p-3 text-center">
            <p className="text-xs text-[hsl(var(--muted-fg))]">Stok</p>
            <p className={`text-xl font-bold ${product.stock < 0 ? "text-red-600" : product.stock <= product.minStock ? "text-amber-500" : ""}`}>
              {product.stock}
            </p>
            {product.stock < 0 && <p className="text-[10px] text-red-500 mt-0.5">Stok negatif</p>}
          </div>
          <div className="card !p-3 text-center">
            <p className="text-xs text-[hsl(var(--muted-fg))]">Min Stok</p>
            <p className="text-xl font-bold">{product.minStock}</p>
          </div>
          <div className="card !p-3 text-center">
            <p className="text-xs text-[hsl(var(--muted-fg))]">Harga Jual</p>
            <p className="text-sm font-bold">{formatRp(product.sellPrice)}</p>
          </div>
        </div>

        {/* HPP hanya jika punya akses laporan_keuangan */}
        {canViewFinance && product.avgCost && product.avgCost > 0 && (
          <div className="card !p-3 flex items-center justify-between">
            <div>
              <p className="text-xs text-[hsl(var(--muted-fg))]">HPP rata-rata (avg cost)</p>
              <p className="font-bold text-sm">{formatRp(product.avgCost)}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-[hsl(var(--muted-fg))]">Margin</p>
              <p className="font-bold text-sm text-emerald-600">
                {product.avgCost > 0
                  ? `${Math.round(((product.sellPrice - product.avgCost) / product.sellPrice) * 100)}%`
                  : "—"}
              </p>
            </div>
          </div>
        )}

        {/* Jika produk produksi, tampilkan komposisi resep */}
        {product.productType === "produksi" && product.recipe && product.recipe.length > 0 && (
          <div className="card !p-3 space-y-2">
            <p className="text-xs font-semibold text-[hsl(var(--foreground))] flex items-center gap-1.5">
              <Calculator className="w-3.5 h-3.5 text-blue-500" /> Resep / Bahan Baku (BOM)
            </p>
            <div className="divide-y divide-[hsl(var(--border))]/50 text-xs">
              {product.recipe.map((r, i) => (
                <div key={i} className="py-1.5 flex items-center justify-between">
                  <div>
                    <span className="font-medium text-[hsl(var(--foreground))]">{r.materialName}</span>
                    <span className="text-[10px] text-[hsl(var(--muted-fg))] ml-1.5">
                      ({r.qty} {r.unit} @ {formatRp(r.costPerUnit)})
                    </span>
                  </div>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    {formatRp(r.subtotal)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
            <History className="w-4 h-4" /> Riwayat Pergerakan Stok
          </h3>
          <div className="space-y-2">
            {movements.length === 0 ? (
              <p className="text-sm text-[hsl(var(--muted-fg))] text-center py-4">Belum ada pergerakan stok</p>
            ) : (
              movements.map((m) => (
                <div key={m.id} className="flex items-center gap-3 p-2.5 rounded-lg border border-[hsl(var(--border))]">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${m.qty > 0 ? "bg-green-100 dark:bg-green-900/30" : "bg-red-100 dark:bg-red-900/30"}`}>
                    {m.qty > 0 ? <TrendingUp className="w-3.5 h-3.5 text-green-600" /> : <TrendingDown className="w-3.5 h-3.5 text-red-600" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium capitalize">
                      {m.type === "sale" ? "Penjualan" : m.type === "purchase" ? "Pembelian" : "Penyesuaian"}
                    </p>
                    <p className="text-[10px] text-[hsl(var(--muted-fg))] font-mono truncate">{m.refId}</p>
                    {m.note && <p className="text-[10px] text-[hsl(var(--muted-fg))] italic">{m.note}</p>}
                  </div>
                  <span className={`text-sm font-bold ${m.qty > 0 ? "text-green-600" : "text-red-600"}`}>
                    {m.qty > 0 ? "+" : ""}{m.qty}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Add / Edit Bahan & Kemasan Modal
// ============================================================

function RawMaterialModal({
  material,
  onClose,
  initialCategory = "produksi",
}: {
  material?: RawMaterial | null;
  onClose: () => void;
  initialCategory?: "dagang" | "produksi";
}) {
  const addRawMaterial = useStore((s) => s.addRawMaterial);
  const updateRawMaterial = useStore((s) => s.updateRawMaterial);

  const [form, setForm] = useState({
    name: material?.name ?? "",
    category: material?.category ?? initialCategory,
    unit: material?.unit ?? "gram",
    stock: material?.stock ?? 0,
    minStock: material?.minStock ?? 10,
    avgCost: material?.avgCost ?? 0,
  });
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) {
      setError("Nama bahan/kemasan wajib diisi");
      return;
    }
    if (material) {
      updateRawMaterial(material.id, form);
    } else {
      addRawMaterial(form);
    }
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[hsl(var(--card))] rounded-2xl border border-[hsl(var(--border))] shadow-2xl w-full max-w-md p-6 animate-fade-in my-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-base flex items-center gap-2">
            <Boxes className="w-5 h-5 text-amber-500" />
            {material ? "Ubah Data Persediaan" : "Tambah Persediaan Baru"}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[hsl(var(--muted))] transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Kategori Persediaan */}
          <div>
            <label className="text-xs font-semibold text-[hsl(var(--muted-fg))] block mb-1.5">Kategori Persediaan</label>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => setForm({ ...form, category: "dagang" })}
                className={`p-2 rounded-xl border text-xs font-semibold text-center transition-all cursor-pointer ${
                  form.category === "dagang"
                    ? "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 shadow-xs"
                    : "border-[hsl(var(--border))] text-[hsl(var(--muted-fg))] hover:border-blue-300"
                }`}
              >
                📦 Produk Jadi
              </button>
              <button
                type="button"
                onClick={() => setForm({ ...form, category: "produksi" })}
                className={`p-2 rounded-xl border text-xs font-semibold text-center transition-all cursor-pointer ${
                  form.category === "produksi"
                    ? "border-violet-500 bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300 shadow-xs"
                    : "border-[hsl(var(--border))] text-[hsl(var(--muted-fg))] hover:border-violet-300"
                }`}
              >
                🍳 Produksi Sendiri
              </button>
              <button
                type="button"
                onClick={() => setForm({ ...form, category: "kemasan" })}
                className={`p-2 rounded-xl border text-xs font-semibold text-center transition-all cursor-pointer ${
                  form.category === "kemasan"
                    ? "border-amber-500 bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 shadow-xs"
                    : "border-[hsl(var(--border))] text-[hsl(var(--muted-fg))] hover:border-amber-300"
                }`}
              >
                📦 Kemasan
              </button>
            </div>
            <p className="text-[10px] text-[hsl(var(--muted-fg))] mt-1 leading-relaxed">
              {form.category === "dagang"
                ? "Produk siap jual hasil kulakan reseller/distributor."
                : form.category === "kemasan"
                ? "Kardus box, bubble wrap, plastik polymailer, lakban, tas belanja, cup, dll."
                : "Bahan mentah dapur (biji kopi, susu, tepung, bumbu, telur, dll)."}
            </p>
          </div>

          <div>
            <label className="text-xs font-semibold text-[hsl(var(--muted-fg))] block mb-1">Nama Barang / Bahan / Kemasan *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => {
                setForm({ ...form, name: e.target.value });
                setError("");
              }}
              placeholder={
                form.category === "dagang"
                  ? "Contoh: Kemeja Flannel / Sepatu Sneakers"
                  : form.category === "kemasan"
                  ? "Contoh: Kardus Box Uk. 20x15, Bubble Wrap 50m"
                  : "Contoh: Biji Kopi Arabika, Susu Segar, Tepung Terigu"
              }
              className="w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-sm focus:ring-2 focus:ring-blue-500/30"
            />
            {error && <p className="text-[11px] text-red-500 mt-0.5">{error}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-[hsl(var(--muted-fg))] block mb-1">Satuan Dasar</label>
              <select
                value={form.unit}
                onChange={(e) => setForm({ ...form, unit: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-sm"
              >
                <option value="gram">gram (g)</option>
                <option value="ml">ml / cc</option>
                <option value="pcs">pcs / butir</option>
                <option value="kg">kg</option>
                <option value="liter">liter</option>
                <option value="meter">meter</option>
                <option value="roll">roll</option>
                <option value="lembar">lembar</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-[hsl(var(--muted-fg))] block mb-1">Modal per Satuan (Rp)</label>
              <input
                type="number"
                min={0}
                value={form.avgCost || ""}
                onChange={(e) => setForm({ ...form, avgCost: Math.max(0, parseInt(e.target.value) || 0) })}
                placeholder="Contoh: 150"
                className="w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-[hsl(var(--muted-fg))] block mb-1">Sisa Stok ({form.unit})</label>
              <input
                type="number"
                min={0}
                value={form.stock || ""}
                onChange={(e) => setForm({ ...form, stock: Math.max(0, parseInt(e.target.value) || 0) })}
                placeholder="Contoh: 2000"
                className="w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-[hsl(var(--muted-fg))] block mb-1">Batas Minimum Alert</label>
              <input
                type="number"
                min={0}
                value={form.minStock || ""}
                onChange={(e) => setForm({ ...form, minStock: Math.max(0, parseInt(e.target.value) || 0) })}
                placeholder="Contoh: 100"
                className="w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-sm"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-[hsl(var(--border))] text-sm font-semibold hover:bg-[hsl(var(--muted))]"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-colors"
            >
              {material ? "Simpan Perubahan" : "Simpan Bahan & Kemasan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============================================================
// Add Product Modal (E1 + Recipe BOM + Markup Shortcuts)
// ============================================================

function AddProductModal({
  onClose,
  initialType = "dagang",
}: {
  onClose: () => void;
  initialType?: ProductType;
}) {
  const addProduct = useStore((s) => s.addProduct);
  const rawMaterials = useStore((s) => s.rawMaterials ?? []);
  const expenses = useStore((s) => s.expenses ?? []);

  const [form, setForm] = useState({
    name: "",
    sku: "",
    productType: initialType,
    trackStock: true,
    sellPrice: 0,
    buyPrice: 0,
    stock: 0,
    minStock: 5,
  });

  const [recipe, setRecipe] = useState<RecipeItem[]>([]);
  const [selectedMarkupPct, setSelectedMarkupPct] = useState<number | null>(null);
  const [customMarkupPct, setCustomMarkupPct] = useState<string>("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Riwayat belanja stok dagang terakhir untuk auto-fill
  const recentDagangPurchases = useMemo(() => {
    const list: { name: string; qty: number; unitCost: number }[] = [];
    expenses.forEach((exp) => {
      exp.items?.forEach((it) => {
        if (it.kind === "dagang" || !it.kind) {
          const pName = it.productName?.trim();
          if (pName && !list.some((l) => l.name.toLowerCase() === pName.toLowerCase())) {
            list.push({
              name: pName,
              qty: it.qty || 1,
              unitCost: it.unitCost || 0,
            });
          }
        }
      });
    });
    return list.slice(0, 4);
  }, [expenses]);

  // Kalkulasi total resep BOM
  const recipeTotal = useMemo(() => {
    return recipe.reduce((sum, item) => sum + (item.subtotal || 0), 0);
  }, [recipe]);

  // Sinkronisasi recipeTotal ke form.buyPrice jika jenis produksi
  useEffect(() => {
    if (form.productType === "produksi") {
      setForm((prev) => ({
        ...prev,
        buyPrice: recipeTotal,
      }));
    }
  }, [recipeTotal, form.productType]);

  // Recalculate harga jual saat markup aktif & buyPrice berubah
  function applyMarkup(pct: number) {
    setSelectedMarkupPct(pct);
    setCustomMarkupPct(String(pct));
    if (form.buyPrice > 0) {
      const calculated = Math.round(form.buyPrice * (1 + pct / 100));
      setForm((prev) => ({ ...prev, sellPrice: calculated }));
    }
  }

  function handleCustomMarkupChange(val: string) {
    setCustomMarkupPct(val);
    const num = parseFloat(val);
    if (!isNaN(num)) {
      setSelectedMarkupPct(num);
      if (form.buyPrice > 0) {
        const calculated = Math.round(form.buyPrice * (1 + num / 100));
        setForm((prev) => ({ ...prev, sellPrice: calculated }));
      }
    } else {
      setSelectedMarkupPct(null);
    }
  }

  // Resep BOM helpers
  function addRecipeRow() {
    if (rawMaterials.length === 0) return;
    const first = rawMaterials[0];
    const defaultQty = 1;
    setRecipe([
      ...recipe,
      {
        materialId: first.id,
        materialName: first.name,
        qty: defaultQty,
        unit: first.unit,
        costPerUnit: first.avgCost,
        subtotal: defaultQty * first.avgCost,
      },
    ]);
  }

  function updateRecipeRow(idx: number, field: string, val: any) {
    setRecipe(
      recipe.map((row, i) => {
        if (i !== idx) return row;
        if (field === "materialId") {
          const mat = rawMaterials.find((m) => m.id === val);
          if (!mat) return row;
          return {
            ...row,
            materialId: mat.id,
            materialName: mat.name,
            unit: mat.unit,
            costPerUnit: mat.avgCost,
            subtotal: row.qty * mat.avgCost,
          };
        }
        if (field === "qty") {
          const qty = Math.max(0, parseFloat(val) || 0);
          return {
            ...row,
            qty,
            subtotal: qty * row.costPerUnit,
          };
        }
        return row;
      })
    );
  }

  function removeRecipeRow(idx: number) {
    setRecipe(recipe.filter((_, i) => i !== idx));
  }

  function autofillFromDagangPurchase(item: { name: string; qty: number; unitCost: number }) {
    const cleanSku = "BDG-" + item.name.replace(/[^a-zA-Z0-9]/g, "").slice(0, 4).toUpperCase() + "-" + Math.floor(100 + Math.random() * 900);
    setForm((prev) => {
      const next = {
        ...prev,
        name: item.name,
        sku: cleanSku,
        buyPrice: item.unitCost,
        stock: item.qty,
      };
      if (selectedMarkupPct !== null && item.unitCost > 0) {
        next.sellPrice = Math.round(item.unitCost * (1 + selectedMarkupPct / 100));
      }
      return next;
    });
  }

  function validate() {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = "Nama produk wajib diisi";
    if (!form.sku.trim()) errs.sku = "SKU wajib diisi";
    if (form.sellPrice <= 0) errs.sellPrice = "Harga jual harus > 0";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    addProduct({
      ...form,
      tenantId: undefined,
      avgCost: form.buyPrice > 0 ? form.buyPrice : undefined,
      recipe: form.productType === "produksi" && recipe.length > 0 ? recipe : undefined,
    });
    onClose();
  }

  // Margin profit live calculation
  const profitPerPcs = form.sellPrice - form.buyPrice;
  const marginPct = form.buyPrice > 0 ? Math.round((profitPerPcs / form.buyPrice) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[hsl(var(--card))] rounded-2xl border border-[hsl(var(--border))] shadow-2xl w-full max-w-lg p-6 animate-fade-in my-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-base flex items-center gap-2">
            <Package className="w-5 h-5 text-blue-500" /> Tambah Produk Baru
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[hsl(var(--muted))] transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Jenis Produk + Lacak Stok */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-[hsl(var(--muted-fg))] block mb-1">Jenis Produk</label>
              <div className="flex flex-col gap-1">
                {(["dagang", "produksi"] as ProductType[]).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => {
                      setForm({ ...form, productType: t });
                      if (t === "produksi" && recipe.length > 0) {
                        setForm((prev) => ({ ...prev, productType: t, buyPrice: recipeTotal }));
                      }
                    }}
                    className={`text-left px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                      form.productType === t
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300"
                        : "border-[hsl(var(--border))] text-[hsl(var(--muted-fg))]"
                    }`}
                  >
                    {PRODUCT_TYPE_LABEL[t]}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-[hsl(var(--muted-fg))] block mb-1">Lacak Stok</label>
              <button
                type="button"
                onClick={() => setForm({ ...form, trackStock: !form.trackStock })}
                className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[hsl(var(--border))] text-sm cursor-pointer"
              >
                {form.trackStock ? (
                  <ToggleRight className="w-5 h-5 text-blue-500" />
                ) : (
                  <ToggleLeft className="w-5 h-5 text-[hsl(var(--muted-fg))]" />
                )}
                <span className="text-sm">{form.trackStock ? "Aktif" : "Nonaktif"}</span>
              </button>
              {!form.trackStock && (
                <p className="text-[11px] text-[hsl(var(--muted-fg))] mt-1">Stok produk ini tidak akan dipantau otomatis</p>
              )}
            </div>
          </div>

          {/* Quick Select dari Belanja Stok Terakhir jika Produk Jadi */}
          {form.productType === "dagang" && recentDagangPurchases.length > 0 && (
            <div className="p-3 rounded-xl border border-blue-200 dark:border-blue-900/40 bg-blue-50/50 dark:bg-blue-950/20">
              <label className="text-[11px] font-semibold text-blue-700 dark:text-blue-300 block mb-1.5">
                💡 Pilih dari Belanja Produk Jadi Terakhir (Opsional):
              </label>
              <div className="flex flex-wrap gap-1.5">
                {recentDagangPurchases.map((it, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => autofillFromDagangPurchase(it)}
                    className="text-xs px-2.5 py-1 rounded-lg border border-blue-300 dark:border-blue-800 bg-[hsl(var(--card))] hover:bg-blue-100 dark:hover:bg-blue-900/50 text-[hsl(var(--foreground))] transition-colors flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3 text-blue-600" />
                    <span className="font-medium">{it.name}</span>
                    <span className="text-[10px] text-[hsl(var(--muted-fg))]">
                      ({it.qty} pcs @ {formatRp(it.unitCost)})
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Resep BOM jika Jenis Produk Produksi */}
          {form.productType === "produksi" && (
            <div className="p-3.5 rounded-xl border border-violet-200 dark:border-violet-900/40 bg-violet-50/40 dark:bg-violet-950/20 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-semibold text-violet-700 dark:text-violet-300 flex items-center gap-1.5">
                    <Calculator className="w-3.5 h-3.5" /> Kalkulator Resep Bahan Baku (Produksi Sendiri)
                  </h4>
                  <p className="text-[10px] text-[hsl(var(--muted-fg))]">
                    Pilih takaran bahan per 1 porsi/unit. Modal HPP terisi otomatis.
                  </p>
                </div>
                {rawMaterials.length > 0 && (
                  <button
                    type="button"
                    onClick={addRecipeRow}
                    className="text-xs px-2 py-1 rounded-lg bg-violet-600 hover:bg-violet-700 text-white font-semibold flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Tambah Bahan
                  </button>
                )}
              </div>

              {rawMaterials.length === 0 ? (
                <p className="text-xs text-[hsl(var(--muted-fg))] bg-[hsl(var(--background))] p-2.5 rounded-lg border border-[hsl(var(--border))]">
                  Belum ada bahan baku. Kamu bisa input belanja bahan di menu <strong>Pengeluaran</strong> atau tab <strong>Bahan & Kemasan Packing</strong>.
                </p>
              ) : recipe.length === 0 ? (
                <div className="text-center py-3 bg-[hsl(var(--background))] rounded-lg border border-dashed border-[hsl(var(--border))]">
                  <p className="text-xs text-[hsl(var(--muted-fg))]">
                    Klik &quot;Tambah Bahan&quot; untuk menyusun resep produk ini
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {recipe.map((row, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-[hsl(var(--background))] p-2 rounded-lg border border-[hsl(var(--border))]">
                      <select
                        value={row.materialId}
                        onChange={(e) => updateRecipeRow(idx, "materialId", e.target.value)}
                        className="flex-1 px-2 py-1 rounded border border-[hsl(var(--border))] text-xs bg-transparent"
                      >
                        {rawMaterials.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.name} ({formatRp(m.avgCost)}/{m.unit})
                          </option>
                        ))}
                      </select>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          min={0.1}
                          step="any"
                          value={row.qty || ""}
                          onChange={(e) => updateRecipeRow(idx, "qty", e.target.value)}
                          placeholder="Takaran"
                          className="w-16 px-1.5 py-1 rounded border border-[hsl(var(--border))] text-xs text-right bg-transparent"
                        />
                        <span className="text-[10px] text-[hsl(var(--muted-fg))] font-medium w-9 truncate">
                          {row.unit}
                        </span>
                      </div>
                      <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 w-20 text-right">
                        {formatRp(row.subtotal)}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeRecipeRow(idx)}
                        className="p-1 rounded text-[hsl(var(--muted-fg))] hover:text-red-500"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}

                  <div className="flex items-center justify-between text-xs pt-2 border-t border-violet-200 dark:border-violet-900/50">
                    <span className="font-semibold text-violet-800 dark:text-violet-300">
                      Total Biaya Resep (HPP Produksi):
                    </span>
                    <span className="font-bold text-sm text-emerald-600 dark:text-emerald-400">
                      {formatRp(recipeTotal)} / unit
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Nama & SKU */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-[hsl(var(--muted-fg))] block mb-1">Nama Produk *</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className={`w-full px-3 py-2 rounded-lg border bg-[hsl(var(--background))] text-sm focus:outline-none focus:ring-2 ${
                  errors.name ? "border-red-500 focus:ring-red-500/30" : "border-[hsl(var(--border))] focus:ring-blue-500/30"
                }`}
                placeholder="Contoh: Es Kopi Susu Aren"
              />
              {errors.name && <p className="text-[11px] text-red-500 mt-0.5">{errors.name}</p>}
            </div>
            <div>
              <label className="text-xs font-semibold text-[hsl(var(--muted-fg))] block mb-1">SKU *</label>
              <input
                value={form.sku}
                onChange={(e) => setForm({ ...form, sku: e.target.value })}
                className={`w-full px-3 py-2 rounded-lg border bg-[hsl(var(--background))] text-sm focus:outline-none focus:ring-2 ${
                  errors.sku ? "border-red-500 focus:ring-red-500/30" : "border-[hsl(var(--border))] focus:ring-blue-500/30"
                }`}
                placeholder="e.g. SKU-001"
              />
              {errors.sku && <p className="text-[11px] text-red-500 mt-0.5">{errors.sku}</p>}
            </div>
          </div>

          {/* Modal / HPP Awal & Harga Jual */}
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-[hsl(var(--muted-fg))] block mb-1">
                  Modal Pokok / HPP (Rp)
                </label>
                <input
                  type="number"
                  min={0}
                  value={form.buyPrice || ""}
                  onChange={(e) => {
                    const bp = Math.max(0, parseInt(e.target.value) || 0);
                    setForm((prev) => {
                      const next = { ...prev, buyPrice: bp };
                      if (selectedMarkupPct !== null && bp > 0) {
                        next.sellPrice = Math.round(bp * (1 + selectedMarkupPct / 100));
                      }
                      return next;
                    });
                  }}
                  disabled={form.productType === "produksi" && recipe.length > 0}
                  className={`w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-sm ${
                    form.productType === "produksi" && recipe.length > 0 ? "opacity-80 cursor-not-allowed" : ""
                  }`}
                  placeholder="Contoh: 15000"
                />
                {form.productType === "produksi" && recipe.length > 0 && (
                  <p className="text-[10px] text-[hsl(var(--muted-fg))] mt-0.5">Dihitung otomatis dari resep</p>
                )}
              </div>

              <div>
                <label className="text-xs font-semibold text-[hsl(var(--muted-fg))] block mb-1">Harga Jual (Rp) *</label>
                <input
                  type="number"
                  min={0}
                  value={form.sellPrice || ""}
                  onChange={(e) => {
                    setForm({ ...form, sellPrice: Math.max(0, parseInt(e.target.value) || 0) });
                    setSelectedMarkupPct(null);
                  }}
                  className={`w-full px-3 py-2 rounded-lg border bg-[hsl(var(--background))] text-sm focus:outline-none focus:ring-2 ${
                    errors.sellPrice ? "border-red-500" : "border-[hsl(var(--border))] focus:ring-blue-500/30"
                  }`}
                  placeholder="Contoh: 20000"
                />
                {errors.sellPrice && <p className="text-[11px] text-red-500 mt-0.5">{errors.sellPrice}</p>}
              </div>
            </div>

            {/* Markup Shortcut Buttons */}
            <div className="p-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))]/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-[hsl(var(--muted-fg))] flex items-center gap-1">
                  <Percent className="w-3 h-3 text-blue-500" /> Tentukan Kenaikan Harga dari Modal:
                </span>
                {form.buyPrice > 0 && (
                  <span
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                      profitPerPcs >= 0
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                        : "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300"
                    }`}
                  >
                    {profitPerPcs >= 0
                      ? `Untung: +${formatRp(profitPerPcs)} (+${marginPct}%)`
                      : `Rugi: -${formatRp(Math.abs(profitPerPcs))} (${marginPct}%)`}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5 flex-wrap">
                {[5, 10, 20, 30, 50].map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => applyMarkup(pct)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                      selectedMarkupPct === pct
                        ? "border-blue-500 bg-blue-600 text-white"
                        : "border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--foreground))] hover:border-blue-400"
                    }`}
                  >
                    +{pct}%
                  </button>
                ))}
                <div className="flex items-center gap-1 ml-auto">
                  <input
                    type="number"
                    min={0}
                    value={customMarkupPct}
                    onChange={(e) => handleCustomMarkupChange(e.target.value)}
                    placeholder="Custom"
                    className="w-16 px-2 py-1 text-xs rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-right"
                  />
                  <span className="text-xs text-[hsl(var(--muted-fg))] font-semibold">%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Stok awal & Min */}
          {form.trackStock && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-[hsl(var(--muted-fg))] block mb-1">Stok Awal</label>
                <input
                  type="number"
                  min={0}
                  value={form.stock}
                  onChange={(e) => setForm({ ...form, stock: Math.max(0, parseInt(e.target.value) || 0) })}
                  className="w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-[hsl(var(--muted-fg))] block mb-1">Min Stok (alert)</label>
                <input
                  type="number"
                  min={0}
                  value={form.minStock}
                  onChange={(e) => setForm({ ...form, minStock: Math.max(0, parseInt(e.target.value) || 0) })}
                  className="w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                />
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-[hsl(var(--border))] text-sm font-semibold hover:bg-[hsl(var(--muted))]"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-colors"
            >
              Simpan Produk
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============================================================
// Main Page (3 Clear Main Tabs)
// ============================================================

export default function ProdukPage() {
  const { canView, canManage } = usePermission("produk");
  const { canView: canViewFinance } = usePermission("laporan_keuangan");
  const rawProducts = useStore((s) => s.products);
  const rawMaterials = useStore((s) => s.rawMaterials ?? []);
  const deleteRawMaterial = useStore((s) => s.deleteRawMaterial);
  const activeTenantId = useStore((s) => s.activeTenantId);

  const products = useMemo(
    () => rawProducts.filter((p) => p.tenantId === activeTenantId),
    [rawProducts, activeTenantId]
  );

  const dagangProducts = useMemo(
    () => products.filter((p) => (p.productType ?? "dagang") === "dagang"),
    [products]
  );

  const produksiProducts = useMemo(
    () => products.filter((p) => p.productType === "produksi"),
    [products]
  );

  // 3 Tab Utama: dagang | produksi | bahan
  const [activeTab, setActiveTab] = useState<"dagang" | "produksi" | "bahan">("dagang");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<RawMaterial | null | undefined>(undefined);

  // Sub-filter khusus untuk Tab Bahan & Kemasan Packing
  const [bahanFilter, setBahanFilter] = useState<"all" | "dagang" | "produksi" | "kemasan">("all");

  const filteredMaterials = useMemo(() => {
    if (bahanFilter === "all") return rawMaterials;
    return rawMaterials.filter((m) => (m.category ?? "produksi") === bahanFilter);
  }, [rawMaterials, bahanFilter]);

  const dagangMaterialsCount = useMemo(
    () => rawMaterials.filter((m) => m.category === "dagang").length,
    [rawMaterials]
  );
  const produksiMaterialsCount = useMemo(
    () => rawMaterials.filter((m) => (m.category ?? "produksi") === "produksi").length,
    [rawMaterials]
  );
  const kemasanMaterialsCount = useMemo(
    () => rawMaterials.filter((m) => m.category === "kemasan").length,
    [rawMaterials]
  );

  const router = useRouter();

  if (!canView) redirect("/tidak-ada-akses");

  return (
    <DashboardLayout
      title="Produk & Stok Toko"
      subtitle={`${dagangProducts.length} produk jadi · ${produksiProducts.length} olahan sendiri · ${rawMaterials.length} bahan & kemasan`}
    >
      {/* Page Intro */}
      <PageIntro
        title="Katalog Produk & Persediaan"
        description="Kelola barang jadi siap edar (reseller), produk olahan resep sendiri, serta stok bahan mentah & kemasan packing toko Anda."
        badge={`${products.length} Produk · ${rawMaterials.length} Bahan & Kemasan`}
        helpTips={[
          {
            title: "Produk Jadi (Reseller)",
            description: "Barang siap jual yang dibeli langsung dari kulakan grosir/distributor tanpa proses pengolahan.",
          },
          {
            title: "Produksi Sendiri (Olahan)",
            description: "Produk buatan dapur/workshop yang memiliki komposisi resep bahan baku dan HPP terhitung otomatis.",
          },
          {
            title: "Bahan & Kemasan Packing",
            description: "Stok bahan mentah (biji kopi, tepung, susu) serta perlengkapan kemas (kardus box, bubble wrap, cup) yang masuk otomatis dari menu Pengeluaran.",
          },
          {
            title: "Kalkulator Kenaikan Harga Jual (+%)",
            description: "Gunakan jalan pintas persentase (+5%, +10%, +20%) untuk menentukan harga jual aman dengan margin keuntungan terjamin.",
          },
        ]}
        primaryAction={
          canManage ? (
            activeTab === "dagang" ? (
              <button
                onClick={() => setShowAddProductModal(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors shadow-md shadow-blue-500/20 cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Tambah Produk Jadi
              </button>
            ) : activeTab === "produksi" ? (
              <button
                onClick={() => setShowAddProductModal(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600 text-white text-sm font-semibold hover:bg-violet-700 transition-colors shadow-md shadow-violet-500/20 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" /> Buat Produk Olahan
              </button>
            ) : undefined
          ) : undefined
        }
      />

      {/* 3 Tab Utama Sejajar */}
      <div className="flex border-b border-[hsl(var(--border))] mb-5 gap-6 flex-wrap">
        <button
          onClick={() => setActiveTab("dagang")}
          className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === "dagang"
              ? "border-blue-600 text-blue-600 dark:text-blue-400"
              : "border-transparent text-[hsl(var(--muted-fg))] hover:text-[hsl(var(--foreground))]"
          }`}
        >
          <Package className="w-4 h-4" /> Produk Jadi (Reseller) ({dagangProducts.length})
        </button>
        <button
          onClick={() => setActiveTab("produksi")}
          className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === "produksi"
              ? "border-violet-600 text-violet-600 dark:text-violet-400"
              : "border-transparent text-[hsl(var(--muted-fg))] hover:text-[hsl(var(--foreground))]"
          }`}
        >
          <Sparkles className="w-4 h-4" /> Produksi Sendiri (Olahan) ({produksiProducts.length})
        </button>
        <button
          onClick={() => setActiveTab("bahan")}
          className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === "bahan"
              ? "border-amber-600 text-amber-600 dark:text-amber-400"
              : "border-transparent text-[hsl(var(--muted-fg))] hover:text-[hsl(var(--foreground))]"
          }`}
        >
          <Boxes className="w-4 h-4" /> Bahan & Kemasan Packing ({rawMaterials.length})
        </button>
      </div>

      {/* ============================================================ */}
      {/* TAB 1: PRODUK JADI (RESELLER) */}
      {/* ============================================================ */}
      {activeTab === "dagang" && (
        <>
          {dagangProducts.length === 0 ? (
            <EmptyState
              icon={<Package className="w-7 h-7 text-blue-600" />}
              title="Belum Ada Produk Jadi (Reseller)"
              description="Tambahkan produk kulakan/grosir yang Anda beli jadi untuk langsung dijual kembali ke konsumen."
              actionText={canManage ? "Tambah Produk Jadi Pertama" : undefined}
              onAction={canManage ? () => setShowAddProductModal(true) : undefined}
            />
          ) : (
            <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] overflow-hidden shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[hsl(var(--border))] bg-[hsl(var(--muted))]/50">
                      {[
                        "SKU",
                        "Nama Produk Jadi",
                        "Harga Jual",
                        ...(canViewFinance ? ["Modal per Pcs (HPP)"] : []),
                        "Stok",
                        "Min",
                        "Status",
                      ].map((h) => (
                        <th
                          key={h}
                          className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wide text-[hsl(var(--muted-fg))]"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {dagangProducts.map((p) => {
                      const isLow = p.trackStock !== false && p.stock <= p.minStock;
                      const isNeg = p.stock < 0;
                      return (
                        <tr
                          key={p.id}
                          onClick={() => setSelectedProduct(p)}
                          className="border-b border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))]/50 transition-colors cursor-pointer"
                        >
                          <td className="px-4 py-3 font-mono text-xs text-[hsl(var(--muted-fg))]">{p.sku}</td>
                          <td className="px-4 py-3 font-medium">
                            <div className="flex items-center gap-2">
                              <span className="text-[hsl(var(--foreground))]">{p.name}</span>
                              {p.trackStock === false && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-[hsl(var(--muted))] text-[hsl(var(--muted-fg))]">
                                  Tanpa Stok
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 font-semibold text-[hsl(var(--foreground))]">
                            {formatRp(p.sellPrice)}
                          </td>
                          {canViewFinance && (
                            <td className="px-4 py-3 text-[hsl(var(--muted-fg))]">
                              {p.avgCost ? formatRp(p.avgCost) : formatRp(p.buyPrice)}
                            </td>
                          )}
                          <td className="px-4 py-3">
                            {p.trackStock === false ? (
                              <span className="text-[hsl(var(--muted-fg))] text-xs">—</span>
                            ) : isNeg ? (
                              <span className="font-bold text-red-600">
                                {p.stock} <span className="text-[10px] font-normal">⚠ minus</span>
                              </span>
                            ) : (
                              <span className={`font-bold ${isLow ? "text-amber-500" : ""}`}>{p.stock}</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-[hsl(var(--muted-fg))]">{p.minStock}</td>
                          <td className="px-4 py-3">
                            {isNeg ? (
                              <span className="text-[11px] font-semibold text-red-600 flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3" /> Minus
                              </span>
                            ) : isLow ? (
                              <span className="flex items-center gap-1 text-[11px] font-semibold text-amber-700 dark:text-amber-400">
                                <AlertTriangle className="w-3 h-3" /> Menipis
                              </span>
                            ) : (
                              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                                Aman
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* ============================================================ */}
      {/* TAB 2: PRODUKSI SENDIRI (OLAHAN) */}
      {/* ============================================================ */}
      {activeTab === "produksi" && (
        <>
          {produksiProducts.length === 0 ? (
            <EmptyState
              icon={<Sparkles className="w-7 h-7 text-violet-600" />}
              title="Belum Ada Produk Olahan Sendiri"
              description="Buat produk olahan dapur/racikan dengan resep bahan baku otomatis. Sistem akan menghitung HPP modal dari bahan yang digunakan."
              actionText={canManage ? "Buat Produk Olahan Pertama" : undefined}
              onAction={canManage ? () => setShowAddProductModal(true) : undefined}
            />
          ) : (
            <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] overflow-hidden shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[hsl(var(--border))] bg-[hsl(var(--muted))]/50">
                      {[
                        "SKU",
                        "Nama Produk Olahan",
                        "Harga Jual",
                        ...(canViewFinance ? ["HPP Resep (Modal)"] : []),
                        "Komposisi Resep",
                        "Stok Siap Jual",
                        "Status",
                      ].map((h) => (
                        <th
                          key={h}
                          className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wide text-[hsl(var(--muted-fg))]"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {produksiProducts.map((p) => {
                      const isLow = p.trackStock !== false && p.stock <= p.minStock;
                      const isNeg = p.stock < 0;
                      return (
                        <tr
                          key={p.id}
                          onClick={() => setSelectedProduct(p)}
                          className="border-b border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))]/50 transition-colors cursor-pointer"
                        >
                          <td className="px-4 py-3 font-mono text-xs text-[hsl(var(--muted-fg))]">{p.sku}</td>
                          <td className="px-4 py-3 font-medium">
                            <div className="flex items-center gap-2">
                              <span className="text-[hsl(var(--foreground))]">{p.name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 font-semibold text-[hsl(var(--foreground))]">
                            {formatRp(p.sellPrice)}
                          </td>
                          {canViewFinance && (
                            <td className="px-4 py-3 text-[hsl(var(--muted-fg))] font-medium">
                              {p.avgCost ? formatRp(p.avgCost) : formatRp(p.buyPrice)}
                            </td>
                          )}
                          <td className="px-4 py-3">
                            {p.recipe && p.recipe.length > 0 ? (
                              <span className="text-xs text-[hsl(var(--muted-fg))] font-medium">
                                {p.recipe.length} bahan racikan
                              </span>
                            ) : (
                              <span className="text-xs text-[hsl(var(--muted-fg))] italic">Resep belum diisi</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            {p.trackStock === false ? (
                              <span className="text-[hsl(var(--muted-fg))] text-xs">—</span>
                            ) : isNeg ? (
                              <span className="font-bold text-red-600">
                                {p.stock} <span className="text-[10px] font-normal">⚠ minus</span>
                              </span>
                            ) : (
                              <span className={`font-bold ${isLow ? "text-amber-500" : ""}`}>{p.stock}</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            {isNeg ? (
                              <span className="text-[11px] font-semibold text-red-600 flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3" /> Minus
                              </span>
                            ) : isLow ? (
                              <span className="flex items-center gap-1 text-[11px] font-semibold text-amber-700 dark:text-amber-400">
                                <AlertTriangle className="w-3 h-3" /> Menipis
                              </span>
                            ) : (
                              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                                Aman
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* ============================================================ */}
      {/* TAB 3: BAHAN & KEMASAN PACKING (SEMUA PERSEDIAAN DARI PENGELUARAN) */}
      {/* ============================================================ */}
      {activeTab === "bahan" && (
        <div className="space-y-4">
          {/* Sub-selector Filter Kategori Persediaan */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold text-[hsl(var(--muted-fg))]">Filter Persediaan:</span>
            <div className="flex gap-1.5 flex-wrap">
              {[
                { value: "all", label: `Semua (${rawMaterials.length})` },
                { value: "dagang", label: `📦 Produk Jadi (${dagangMaterialsCount})` },
                { value: "produksi", label: `🍳 Produksi Sendiri (${produksiMaterialsCount})` },
                { value: "kemasan", label: `📦 Kemasan (${kemasanMaterialsCount})` },
              ].map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => setBahanFilter(value as any)}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                    bahanFilter === value
                      ? "border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 shadow-xs"
                      : "border-[hsl(var(--border))] text-[hsl(var(--muted-fg))] hover:border-amber-300"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {filteredMaterials.length === 0 ? (
            <EmptyState
              icon={<Boxes className="w-7 h-7 text-amber-500" />}
              title="Belum Ada Persediaan Terdata"
              description="Stok produk jadi, bahan mentah olahan, dan kemasan packing akan otomatis terisi dan bertambah setiap kali Anda mencatat belanja di menu Pengeluaran."
              actionText="Catat Belanja di Pengeluaran"
              onAction={() => router.push("/pengeluaran")}
            />
          ) : (
            <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] overflow-hidden shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[hsl(var(--border))] bg-[hsl(var(--muted))]/50">
                      {[
                        "Nama Barang / Bahan / Kemasan",
                        "Kategori",
                        "Satuan",
                        "Sisa Stok",
                        "Modal Dasar / Satuan",
                        "Total Nilai Aset",
                        "Status",
                        ...(canManage ? ["Aksi"] : []),
                      ].map((h) => (
                        <th
                          key={h}
                          className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wide text-[hsl(var(--muted-fg))]"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMaterials.map((m) => {
                      const isLow = m.stock <= m.minStock;
                      const totalAsset = m.stock * m.avgCost;
                      const cat = m.category ?? "produksi";
                      return (
                        <tr
                          key={m.id}
                          className="border-b border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))]/50 transition-colors"
                        >
                          <td className="px-4 py-3 font-medium text-[hsl(var(--foreground))]">
                            <div className="flex items-center gap-2">
                              <span
                                className={`w-2 h-2 rounded-full shrink-0 ${
                                  cat === "dagang"
                                    ? "bg-blue-500"
                                    : cat === "kemasan"
                                    ? "bg-amber-500"
                                    : "bg-violet-500"
                                }`}
                              />
                              {m.name}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                                cat === "dagang"
                                  ? "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300"
                                  : cat === "kemasan"
                                  ? "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
                                  : "bg-violet-100 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300"
                              }`}
                            >
                              {cat === "dagang"
                                ? "📦 Produk Jadi"
                                : cat === "kemasan"
                                ? "📦 Kemasan"
                                : "🍳 Produksi Sendiri"}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-xs text-[hsl(var(--muted-fg))] font-mono">{m.unit}</td>
                          <td className="px-4 py-3 font-bold text-[hsl(var(--foreground))]">
                            {m.stock.toLocaleString()} {m.unit}
                          </td>
                          <td className="px-4 py-3 font-medium text-[hsl(var(--foreground))]">
                            {formatRp(m.avgCost)} / {m.unit}
                          </td>
                          <td className="px-4 py-3 font-semibold text-emerald-600 dark:text-emerald-400">
                            {formatRp(totalAsset)}
                          </td>
                          <td className="px-4 py-3">
                            {isLow ? (
                              <span className="flex items-center gap-1 text-[11px] font-semibold text-amber-700 dark:text-amber-400">
                                <AlertTriangle className="w-3 h-3" /> Menipis (&le; {m.minStock} {m.unit})
                              </span>
                            ) : (
                              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                                Aman
                              </span>
                            )}
                          </td>
                          {canManage && (
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => setEditingMaterial(m)}
                                  className="p-1.5 rounded-lg border border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))] text-[hsl(var(--muted-fg))] hover:text-blue-600 transition-colors"
                                  title="Edit Bahan"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (confirm(`Hapus bahan/kemasan "${m.name}"?`)) {
                                      deleteRawMaterial(m.id);
                                    }
                                  }}
                                  className="p-1.5 rounded-lg border border-[hsl(var(--border))] hover:bg-red-50 text-[hsl(var(--muted-fg))] hover:text-red-600 transition-colors"
                                  title="Hapus Bahan"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          )}
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

      {selectedProduct && <StockLedgerDrawer product={selectedProduct} onClose={() => setSelectedProduct(null)} />}
      {showAddProductModal && (
        <AddProductModal
          initialType={activeTab === "produksi" ? "produksi" : "dagang"}
          onClose={() => setShowAddProductModal(false)}
        />
      )}
      {editingMaterial !== undefined && (
        <RawMaterialModal
          material={editingMaterial}
          initialCategory={bahanFilter === "dagang" ? "dagang" : "produksi"}
          onClose={() => setEditingMaterial(undefined)}
        />
      )}
    </DashboardLayout>
  );
}
