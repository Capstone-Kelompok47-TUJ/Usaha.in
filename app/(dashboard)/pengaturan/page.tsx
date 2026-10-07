"use client";

import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageIntro } from "@/components/ui/PageIntro";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useStore } from "@/lib/store";
import { formatRp } from "@/lib/finance";
import { redirect } from "next/navigation";
import type { BusinessType, ExpenseCategoryGroup } from "@/types";
import {
  Building2, Percent, Tag, ShieldCheck, DollarSign,
  Plus, Save, Check, RefreshCw, AlertTriangle, Layers,
  Trash2, Sliders, ToggleLeft, ToggleRight, X, Info
} from "lucide-react";

export default function PengaturanPage() {
  const user = useCurrentUser();
  const getActiveTenant = useStore((s) => s.getActiveTenant);
  const activeTenant = getActiveTenant();
  const expenseCategories = useStore((s) => s.expenseCategories);
  const budgets = useStore((s) => s.budgets);
  const expenses = useStore((s) => s.expenses);

  const updateTenantSettings = useStore((s) => s.updateTenantSettings);
  const addExpenseCategory = useStore((s) => s.addExpenseCategory);
  const toggleExpenseCategoryActive = useStore((s) => s.toggleExpenseCategoryActive);
  const setBudget = useStore((s) => s.setBudget);
  const addToast = useStore((s) => s.addToast);

  // Guard: Owner only
  if (user && !user.isOwner) {
    redirect("/tidak-ada-akses");
  }

  // --- 1. Info Usaha State ---
  const [businessName, setBusinessName] = useState(activeTenant?.name ?? "Usaha Kopi Makmur");
  const [businessCategory, setBusinessCategory] = useState(activeTenant?.businessType ?? "Kuliner & Minuman");
  const [businessType, setBusinessType] = useState<BusinessType>(
    activeTenant?.businessSettings?.businessType ?? "dagang"
  );
  const [useStock, setUseStock] = useState(activeTenant?.businessSettings?.useStock ?? true);
  const [useShipping, setUseShipping] = useState(activeTenant?.businessSettings?.useShipping ?? true);

  // --- Saldo Awal State ---
  const [initialCash, setInitialCash] = useState(activeTenant?.businessSettings?.initialCash ?? 15000000);
  const [initialReceivable, setInitialReceivable] = useState(activeTenant?.businessSettings?.initialReceivable ?? 0);
  const [initialPayable, setInitialPayable] = useState(activeTenant?.businessSettings?.initialPayable ?? 0);

  const orders = useStore((s) => s.orders);
  const products = useStore((s) => s.products);
  const isInitialLocked = (orders.length > 0 || expenses.length > 0) || (activeTenant?.businessSettings?.initialLocked ?? false);
  const initialStockValue = useMemo(() => {
    return products.reduce((s, p) => s + Math.max(0, p.stock) * (p.avgCost ?? p.buyPrice), 0);
  }, [products]);

  // --- 2. Fee Defaults State ---
  const [shopeeFeePct, setShopeeFeePct] = useState(
    activeTenant?.businessSettings?.defaultShopeeFeePct ?? 7.5
  );
  const [tokopediaFeePct, setTokopediaFeePct] = useState(
    activeTenant?.businessSettings?.defaultTokopediaFeePct ?? 3.5
  );

  // --- 3. Category Modal State ---
  const [isAddCatModalOpen, setIsAddCatModalOpen] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [newCatGroup, setNewCatGroup] = useState<ExpenseCategoryGroup>("operating");
  const [newCatStockRelated, setNewCatStockRelated] = useState(false);

  // --- 4. Spending Limits State ---
  const [budgetInputs, setBudgetInputs] = useState<Record<string, number>>(budgets);

  // --- 5. Fixed Recurring Costs State ---
  const [fixedCosts, setFixedCosts] = useState<Array<{ id: string; name: string; amount: number }>>([
    { id: "fc-1", name: "Gaji Karyawan Operasional", amount: 1_800_000 },
    { id: "fc-2", name: "Sewa Tempat / Ruko Bulanan", amount: 500_000 },
    { id: "fc-3", name: "Tagihan Listrik, Air & Internet", amount: 200_000 },
  ]);
  const [newFixedCostName, setNewFixedCostName] = useState("");
  const [newFixedCostAmount, setNewFixedCostAmount] = useState("");

  // Spending month calculation for display
  const now = new Date();
  const d30 = new Date(now);
  d30.setDate(now.getDate() - 30);
  const currentMonthExpenses = useMemo(() => {
    return expenses.filter((e) => new Date(e.date) >= d30 && e.paid);
  }, [expenses]);

  function handleSaveBusinessInfo() {
    updateTenantSettings(businessName, businessType, {
      useStock,
      useShipping,
      defaultShopeeFeePct: shopeeFeePct,
      defaultTokopediaFeePct: tokopediaFeePct,
      initialCash: Number(initialCash) || 0,
      initialReceivable: Number(initialReceivable) || 0,
      initialPayable: Number(initialPayable) || 0,
    });
  }

  function handleAddCategory(e: React.FormEvent) {
    e.preventDefault();
    if (!newCatName.trim()) return;

    addExpenseCategory({
      name: newCatName.trim(),
      group: newCatGroup,
      active: true,
      isStockRelated: newCatStockRelated,
    });

    setNewCatName("");
    setIsAddCatModalOpen(false);
  }

  function handleSaveBudget(catId: string) {
    const val = budgetInputs[catId] ?? 0;
    setBudget(catId, val);
    addToast("Batas anggaran berhasil disimpan", "success");
  }

  function handleAddFixedCost(e: React.FormEvent) {
    e.preventDefault();
    const amountNum = parseFloat(newFixedCostAmount.replace(/[^0-9]/g, ""));
    if (!newFixedCostName.trim() || isNaN(amountNum) || amountNum <= 0) return;

    setFixedCosts((prev) => [
      ...prev,
      { id: `fc-${Date.now()}`, name: newFixedCostName.trim(), amount: amountNum },
    ]);
    setNewFixedCostName("");
    setNewFixedCostAmount("");
    addToast("Komponen biaya tetap berhasil ditambahkan", "success");
  }

  function handleDeleteFixedCost(id: string) {
    setFixedCosts((prev) => prev.filter((item) => item.id !== id));
    addToast("Komponen biaya tetap dihapus", "info");
  }

  const totalFixedCost = fixedCosts.reduce((s, fc) => s + fc.amount, 0);

  return (
    <DashboardLayout
      title="Pengaturan Usaha"
      subtitle="Kelola profil toko, saldo awal, batas anggaran, dan parameter biaya"
    >
      <div className="space-y-6 max-w-5xl pb-16 animate-fade-in">
        <PageIntro
          title="Pengaturan Usaha"
          description="Kelola profil toko, saldo modal awal, batas anggaran bulanan, dan parameter potongan biaya admin kanal penjualan."
          guideTitle="Panduan Pengaturan Usaha"
          guideSteps={[
            "Atur Nama dan Tipe Usaha (Dagang, Produksi, atau Jasa) untuk menyesuaikan modul yang aktif.",
            "Tentukan Saldo Awal (kas/bank) sebelum mulai mencatat transaksi. Saldo akan otomatis terkunci setelah transaksi pertama.",
            "Sesuaikan persentase potongan admin Shopee dan Tokopedia agar kalkulasi laba bersih akurat.",
            "Tentukan batas anggaran bulanan pada tiap kategori pengeluaran untuk memantau potensi pemborosan.",
            "Daftarkan biaya tetap bulanan (seperti gaji atau sewa ruko) untuk menghitung kalkulasi Uang Aman Ditarik.",
          ]}
          actions={
            <button
              onClick={handleSaveBusinessInfo}
              data-shortcut="save"
              className="px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-colors shadow-sm"
            >
              <Save className="w-4 h-4" /> Simpan Pengaturan
            </button>
          }
        />

        {/* SECTION 1: INFORMASI & MODEL USAHA */}
        <div className="p-6 rounded-xl bg-[hsl(var(--card))] border border-[hsl(var(--card-border))] shadow-sm space-y-6">
          <div className="flex items-center gap-2.5 border-b border-[hsl(var(--border))] pb-4">
            <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[hsl(var(--foreground))]">Informasi & Tipe Usaha</h3>
              <p className="text-xs text-[hsl(var(--muted-fg))] mt-0.5">
                Identitas toko dan alur model bisnis operasional
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[hsl(var(--foreground))]">Nama Usaha / Toko</label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="Contoh: Toko Sejahtera"
                className="w-full px-3.5 py-2.5 rounded-lg border border-[hsl(var(--input))] bg-[hsl(var(--card))] text-[hsl(var(--foreground))] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[hsl(var(--foreground))]">
                Jenis Usaha <span className="text-[hsl(var(--muted-fg))] font-normal">(Opsional)</span>
              </label>
              <input
                type="text"
                value={businessCategory}
                onChange={(e) => setBusinessCategory(e.target.value)}
                placeholder="Contoh: F&B / Kuliner, Fashion, Kopi, Jasa Desain"
                className="w-full px-3.5 py-2.5 rounded-lg border border-[hsl(var(--input))] bg-[hsl(var(--card))] text-[hsl(var(--foreground))] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-[hsl(var(--foreground))]">
              Tipe Usaha <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                {
                  key: "dagang" as const,
                  label: "Dagang (Retail / Reseller)",
                  desc: "Membeli barang jadi dan langsung menjualnya kembali tanpa mengolah.",
                },
                {
                  key: "produksi" as const,
                  label: "Produksi (Manufaktur / Olahan)",
                  desc: "Mengolah bahan baku menjadi produk jadi melalui resep/proses produksi.",
                },
                {
                  key: "jasa" as const,
                  label: "Jasa (Layanan)",
                  desc: "Menyediakan layanan atau keahlian tanpa mengelola stok fisik barang.",
                },
              ].map((t) => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => {
                    setBusinessType(t.key);
                    if (t.key === "jasa") {
                      setUseStock(false);
                      setUseShipping(false);
                    } else {
                      setUseStock(true);
                      setUseShipping(true);
                    }
                  }}
                  className={`p-3.5 rounded-xl border text-left transition-all ${
                    businessType === t.key
                      ? "bg-blue-50 dark:bg-blue-950/40 border-blue-500 text-blue-700 dark:text-blue-300 font-semibold shadow-xs ring-1 ring-blue-500"
                      : "bg-[hsl(var(--card))] border-[hsl(var(--border))] text-[hsl(var(--muted-fg))] hover:text-[hsl(var(--foreground))] hover:border-blue-300"
                  }`}
                >
                  <div className="text-sm font-bold text-[hsl(var(--foreground))] flex items-center justify-between">
                    {t.label}
                    {businessType === t.key && <Check className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
                  </div>
                  <div className="text-xs text-[hsl(var(--muted-fg))] mt-1.5 leading-relaxed">{t.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-[hsl(var(--border))] grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-[hsl(var(--muted))] border border-[hsl(var(--border))] flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-[hsl(var(--foreground))]">Modul Persediaan & Stok Gudang</div>
                <div className="text-[11px] text-[hsl(var(--muted-fg))] mt-0.5">
                  Lacak kuantitas barang masuk, keluar, dan peringatan batas stok minimum
                </div>
              </div>
              <button
                type="button"
                onClick={() => setUseStock(!useStock)}
                className={`p-1 rounded-md transition-colors ${useStock ? "text-blue-600" : "text-[hsl(var(--muted-fg))]"}`}
              >
                {useStock ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8" />}
              </button>
            </div>

            <div className="p-4 rounded-lg bg-[hsl(var(--muted))] border border-[hsl(var(--border))] flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-[hsl(var(--foreground))]">Modul Pengiriman & Resi Ekspedisi</div>
                <div className="text-[11px] text-[hsl(var(--muted-fg))] mt-0.5">
                  Kelola alur kirim pesanan (diproses, dikemas, dikirim, selesai)
                </div>
              </div>
              <button
                type="button"
                onClick={() => setUseShipping(!useShipping)}
                className={`p-1 rounded-md transition-colors ${useShipping ? "text-blue-600" : "text-[hsl(var(--muted-fg))]"}`}
              >
                {useShipping ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8" />}
              </button>
            </div>
          </div>
        </div>

        {/* SECTION SALDO AWAL (MODAL AWAL) */}
        <div className="p-6 rounded-xl bg-[hsl(var(--card))] border border-[hsl(var(--card-border))] shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[hsl(var(--border))] pb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[hsl(var(--foreground))]">Saldo Awal Usaha (Modal Awal)</h3>
                <p className="text-xs text-[hsl(var(--muted-fg))] mt-0.5">
                  Posisi keuangan awal saat pertama kali memakai sistem. Dikunci otomatis setelah ada transaksi.
                </p>
              </div>
            </div>
            {isInitialLocked ? (
              <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-300 dark:border-amber-800 flex items-center gap-1.5 w-fit">
                🔒 Saldo Awal Terkunci
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1.5 w-fit">
                ✓ Siap Dikonfigurasi
              </span>
            )}
          </div>

          {isInitialLocked && (
            <div className="p-3.5 rounded-lg bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs flex items-start gap-2.5">
              <Info className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <strong>Saldo awal dikunci</strong> karena transaksi operasional sudah tercatat. Perubahan saldo kas atau stok selanjutnya dilakukan melalui transaksi harian atau menu penyesuaian stok.
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg bg-[hsl(var(--muted))] border border-[hsl(var(--border))] space-y-1.5">
              <label className="text-xs font-semibold text-[hsl(var(--foreground))]">Kas Awal (Uang Tunai / Bank)</label>
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-[hsl(var(--muted-fg))] font-semibold">Rp</span>
                <input
                  type="number"
                  min="0"
                  step="50000"
                  disabled={isInitialLocked}
                  value={initialCash}
                  onChange={(e) => setInitialCash(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-1.5 rounded-md border border-[hsl(var(--input))] bg-[hsl(var(--card))] text-xs font-bold text-[hsl(var(--foreground))] focus:outline-none disabled:opacity-60"
                />
              </div>
              <p className="text-[10px] text-[hsl(var(--muted-fg))]">Uang kas usaha saat mulai</p>
            </div>

            {useStock && (
              <div className="p-4 rounded-lg bg-[hsl(var(--muted))] border border-[hsl(var(--border))] space-y-1.5">
                <label className="text-xs font-semibold text-[hsl(var(--foreground))]">Nilai Stok Awal</label>
                <div className="text-sm font-bold text-blue-600 dark:text-blue-400 py-1">
                  {formatRp(initialStockValue)}
                </div>
                <p className="text-[10px] text-[hsl(var(--muted-fg))]">Dihitung dari stok awal pada menu Produk</p>
              </div>
            )}

            <div className="p-4 rounded-lg bg-[hsl(var(--muted))] border border-[hsl(var(--border))] space-y-1.5">
              <label className="text-xs font-semibold text-[hsl(var(--foreground))]">Piutang Awal (Opsional)</label>
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-[hsl(var(--muted-fg))] font-semibold">Rp</span>
                <input
                  type="number"
                  min="0"
                  step="50000"
                  disabled={isInitialLocked}
                  value={initialReceivable}
                  onChange={(e) => setInitialReceivable(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-1.5 rounded-md border border-[hsl(var(--input))] bg-[hsl(var(--card))] text-xs font-bold text-[hsl(var(--foreground))] focus:outline-none disabled:opacity-60"
                />
              </div>
              <p className="text-[10px] text-[hsl(var(--muted-fg))]">Tagihan ke pelanggan lama</p>
            </div>

            <div className="p-4 rounded-lg bg-[hsl(var(--muted))] border border-[hsl(var(--border))] space-y-1.5">
              <label className="text-xs font-semibold text-[hsl(var(--foreground))]">Utang Awal (Opsional)</label>
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-[hsl(var(--muted-fg))] font-semibold">Rp</span>
                <input
                  type="number"
                  min="0"
                  step="50000"
                  disabled={isInitialLocked}
                  value={initialPayable}
                  onChange={(e) => setInitialPayable(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-1.5 rounded-md border border-[hsl(var(--input))] bg-[hsl(var(--card))] text-xs font-bold text-[hsl(var(--foreground))] focus:outline-none disabled:opacity-60"
                />
              </div>
              <p className="text-[10px] text-[hsl(var(--muted-fg))]">Utang ke supplier terdahulu</p>
            </div>
          </div>
        </div>

        {/* SECTION 2: FEE DEFAULT MARKETPLACE */}
        <div className="p-6 rounded-xl bg-[hsl(var(--card))] border border-[hsl(var(--card-border))] shadow-sm space-y-6">
          <div className="flex items-center gap-2.5 border-b border-[hsl(var(--border))] pb-4">
            <div className="p-2 rounded-lg bg-orange-50 dark:bg-orange-950/50 text-orange-600 dark:text-orange-400">
              <Percent className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[hsl(var(--foreground))]">Fee Default Kanal Penjualan Marketplace</h3>
              <p className="text-xs text-[hsl(var(--muted-fg))] mt-0.5">
                Persentase potongan admin platform untuk simulasi dan perhitungan laba bersih otomatis
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-[hsl(var(--muted))] border border-[hsl(var(--border))] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-orange-600 dark:text-orange-400">
                  🟠 Potongan Admin Shopee
                </span>
                <span className="text-[11px] text-[hsl(var(--muted-fg))]">Standar: 7.5%</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="50"
                  value={shopeeFeePct}
                  onChange={(e) => setShopeeFeePct(parseFloat(e.target.value) || 0)}
                  className="w-28 px-3 py-2 rounded-lg border border-[hsl(var(--input))] bg-[hsl(var(--card))] text-[hsl(var(--foreground))] text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500/30"
                />
                <span className="text-xs font-semibold text-[hsl(var(--muted-fg))]">% per transaksi pesanan</span>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-[hsl(var(--muted))] border border-[hsl(var(--border))] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  🟢 Potongan Admin Tokopedia
                </span>
                <span className="text-[11px] text-[hsl(var(--muted-fg))]">Standar: 3.5%</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="50"
                  value={tokopediaFeePct}
                  onChange={(e) => setTokopediaFeePct(parseFloat(e.target.value) || 0)}
                  className="w-28 px-3 py-2 rounded-lg border border-[hsl(var(--input))] bg-[hsl(var(--card))] text-[hsl(var(--foreground))] text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                />
                <span className="text-xs font-semibold text-[hsl(var(--muted-fg))]">% per transaksi pesanan</span>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 3 & 4: KATEGORI BIAYA & BATAS PENGELUARAN */}
        <div className="p-6 rounded-xl bg-[hsl(var(--card))] border border-[hsl(var(--card-border))] shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[hsl(var(--border))] pb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400">
                <Tag className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[hsl(var(--foreground))]">Kategori Biaya & Batas Anggaran (Budgeting)</h3>
                <p className="text-xs text-[hsl(var(--muted-fg))] mt-0.5">
                  Atur status aktif kategori dan plafon anggaran bulanan untuk peringatan dini
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsAddCatModalOpen(true)}
              className="px-3.5 py-2 rounded-lg bg-[hsl(var(--muted))] hover:bg-[hsl(var(--border))] text-[hsl(var(--foreground))] text-xs font-semibold flex items-center gap-1.5 transition-colors self-start sm:self-auto border border-[hsl(var(--border))]"
            >
              <Plus className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" /> Tambah Kategori
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[hsl(var(--muted))] text-[hsl(var(--muted-fg))] uppercase font-semibold border-b border-[hsl(var(--border))]">
                <tr>
                  <th className="px-4 py-3">Nama Kategori</th>
                  <th className="px-4 py-3">Kelompok L/R</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-right">Realisasi 30 Hari</th>
                  <th className="px-4 py-3 text-right">Batas Anggaran Bulanan</th>
                  <th className="px-4 py-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[hsl(var(--border))]">
                {expenseCategories.map((cat) => {
                  const spent = currentMonthExpenses
                    .filter((e) => e.categoryId === cat.id)
                    .reduce((s, e) => s + e.amount, 0);
                  const currentLimit = budgetInputs[cat.id] ?? budgets[cat.id] ?? 0;
                  const isOver = currentLimit > 0 && spent > currentLimit;

                  return (
                    <tr key={cat.id} className="hover:bg-[hsl(var(--muted))]/40 transition-colors">
                      <td className="px-4 py-3 font-semibold text-[hsl(var(--foreground))]">
                        {cat.name}
                        {cat.isStockRelated && (
                          <span className="text-[10px] ml-1.5 px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 font-normal">
                            Stok
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-[hsl(var(--muted-fg))] uppercase text-[10px] font-bold">
                        {cat.group === "cogs"
                          ? "HPP / Modal"
                          : cat.group === "selling"
                          ? "Beban Penjualan"
                          : cat.group === "operating"
                          ? "Operasional"
                          : cat.group === "non_expense"
                          ? "Prive (Non-L/R)"
                          : "Lainnya"}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          type="button"
                          onClick={() => toggleExpenseCategoryActive(cat.id)}
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition-colors ${
                            cat.active
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800"
                              : "bg-[hsl(var(--muted))] text-[hsl(var(--muted-fg))]"
                          }`}
                        >
                          {cat.active ? "Aktif" : "Nonaktif"}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className={isOver ? "text-red-600 dark:text-red-400 font-bold" : "text-[hsl(var(--foreground))]"}>
                          {formatRp(spent)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <span className="text-[hsl(var(--muted-fg))]">Rp</span>
                          <input
                            type="number"
                            min="0"
                            step="50000"
                            value={budgetInputs[cat.id] ?? 0}
                            onChange={(e) =>
                              setBudgetInputs((prev) => ({
                                ...prev,
                                [cat.id]: parseFloat(e.target.value) || 0,
                              }))
                            }
                            placeholder="0"
                            className="w-32 px-2.5 py-1 rounded-md border border-[hsl(var(--input))] bg-[hsl(var(--card))] text-right text-xs font-semibold text-[hsl(var(--foreground))] focus:outline-none focus:ring-1 focus:ring-purple-500/50"
                          />
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleSaveBudget(cat.id)}
                          className="px-2.5 py-1 rounded-md bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/40 dark:hover:bg-purple-900/50 text-purple-700 dark:text-purple-300 text-xs font-semibold transition-colors border border-purple-200 dark:border-purple-800"
                        >
                          Simpan
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* SECTION 5: BIAYA TETAP BERULANG */}
        <div className="p-6 rounded-xl bg-[hsl(var(--card))] border border-[hsl(var(--card-border))] shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[hsl(var(--border))] pb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[hsl(var(--foreground))]">Komponen Biaya Tetap Bulanan (Fixed Costs)</h3>
                <p className="text-xs text-[hsl(var(--muted-fg))] mt-0.5">
                  Dipakai untuk kalkulasi batas kewajiban 30 hari pada kartu <strong>Uang Aman Ditarik</strong>
                </p>
              </div>
            </div>
            <div className="text-left sm:text-right">
              <span className="text-xs text-[hsl(var(--muted-fg))] block">Total Biaya Wajib / Bulan</span>
              <span className="text-base font-bold text-emerald-600 dark:text-emerald-400">
                {formatRp(totalFixedCost)}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            {fixedCosts.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-lg bg-[hsl(var(--muted))] border border-[hsl(var(--border))] flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-sm font-medium text-[hsl(var(--foreground))]">{item.name}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-bold text-[hsl(var(--foreground))]">{formatRp(item.amount)} / bln</span>
                  <button
                    onClick={() => handleDeleteFixedCost(item.id)}
                    className="p-1 text-[hsl(var(--muted-fg))] hover:text-red-600 transition-colors"
                    title="Hapus"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Add New Fixed Cost Form */}
          <form
            onSubmit={handleAddFixedCost}
            className="p-4 rounded-lg bg-[hsl(var(--card))] border border-[hsl(var(--border))] flex flex-col sm:flex-row items-center gap-3"
          >
            <input
              type="text"
              placeholder="Nama biaya tetap (misal: Langganan Software / POS)"
              value={newFixedCostName}
              onChange={(e) => setNewFixedCostName(e.target.value)}
              className="flex-1 px-3.5 py-2 rounded-lg border border-[hsl(var(--input))] bg-[hsl(var(--card))] text-[hsl(var(--foreground))] text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/30 w-full sm:w-auto"
            />
            <input
              type="number"
              placeholder="Nominal per bulan (Rp)"
              value={newFixedCostAmount}
              onChange={(e) => setNewFixedCostAmount(e.target.value)}
              className="w-full sm:w-48 px-3.5 py-2 rounded-lg border border-[hsl(var(--input))] bg-[hsl(var(--card))] text-[hsl(var(--foreground))] text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            />
            <button
              type="submit"
              className="w-full sm:w-auto px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors shrink-0 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" /> Tambah
            </button>
          </form>
        </div>

        {/* MODAL: TAMBAH KATEGORI BIAYA */}
        {isAddCatModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="w-full max-w-md p-6 rounded-2xl bg-[hsl(var(--card))] border border-[hsl(var(--border))] shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-[hsl(var(--border))] pb-3">
                <h3 className="text-base font-bold text-[hsl(var(--foreground))]">Tambah Kategori Biaya Kustom</h3>
                <button
                  onClick={() => setIsAddCatModalOpen(false)}
                  className="p-1 rounded-lg text-[hsl(var(--muted-fg))] hover:text-[hsl(var(--foreground))]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddCategory} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[hsl(var(--foreground))]">Nama Kategori</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Biaya Promosi TikTok & Influencer"
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-[hsl(var(--input))] bg-[hsl(var(--card))] text-[hsl(var(--foreground))] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[hsl(var(--foreground))]">Kelompok di Laporan Laba/Rugi</label>
                  <select
                    value={newCatGroup}
                    onChange={(e) => setNewCatGroup(e.target.value as ExpenseCategoryGroup)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-[hsl(var(--input))] bg-[hsl(var(--card))] text-[hsl(var(--foreground))] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  >
                    <option value="cogs">Harga Pokok Penjualan (HPP / Bahan Baku)</option>
                    <option value="selling">Beban Penjualan (Marketing / Fee / Ekspedisi)</option>
                    <option value="operating">Beban Operasional (Gaji, Sewa, Utilitas)</option>
                    <option value="other">Beban Lain-lain</option>
                    <option value="non_expense">Non-Beban (Penarikan Prive Pemilik)</option>
                  </select>
                </div>

                <div className="p-3.5 rounded-lg bg-[hsl(var(--muted))] border border-[hsl(var(--border))] flex items-center justify-between">
                  <div>
                    <div className="text-xs font-semibold text-[hsl(var(--foreground))]">Terkait Stok Barang?</div>
                    <div className="text-[10px] text-[hsl(var(--muted-fg))] mt-0.5">
                      Memungkinkan input rincian kuantitas SKU produk saat pengeluaran
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setNewCatStockRelated(!newCatStockRelated)}
                    className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${
                      newCatStockRelated
                        ? "bg-blue-600 text-white"
                        : "bg-[hsl(var(--card))] border border-[hsl(var(--border))] text-[hsl(var(--muted-fg))]"
                    }`}
                  >
                    {newCatStockRelated ? "Ya" : "Tidak"}
                  </button>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-[hsl(var(--border))]">
                  <button
                    type="button"
                    onClick={() => setIsAddCatModalOpen(false)}
                    className="px-4 py-2 rounded-lg text-xs font-semibold text-[hsl(var(--muted-fg))] hover:text-[hsl(var(--foreground))]"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-sm transition-colors"
                  >
                    Simpan Kategori
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
