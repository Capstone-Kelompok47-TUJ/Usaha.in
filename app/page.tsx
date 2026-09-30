"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import {
  ShoppingCart, Package, Warehouse, CreditCard, Truck, Users,
  BarChart3, Bot, ArrowRight, CheckCircle2, Sparkles, Shield,
  Layers, Zap, Clock, TrendingUp, ChevronRight, Moon, Sun,
  Smartphone, Store, HelpCircle, Star, MessageSquare
} from "lucide-react";

export default function LandingPage() {
  const router = useRouter();
  const isAuthenticated = useStore((s) => s.isAuthenticated);
  const currentUser = useStore((s) => s.getCurrentUser());

  const [dark, setDark] = useState(false);
  const [activeTab, setActiveTab] = useState<"omnichannel" | "copilot" | "kanban" | "finance">("omnichannel");
  const [faqOpen, setFaqOpen] = useState<number | null>(null);

  // Sync dark mode
  useEffect(() => {
    const stored = localStorage.getItem("theme");
    if (stored === "dark") {
      document.documentElement.classList.add("dark");
      setDark(true);
    }
  }, []);

  function toggleDark() {
    const next = !dark;
    setDark(next);
    if (next) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))] transition-colors selection:bg-blue-600 selection:text-white">
      {/* 1. STICKY NAVBAR */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-[hsl(var(--background))]/80 border-b border-[hsl(var(--border))]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white font-black text-lg shadow-md shadow-blue-500/25 group-hover:scale-105 transition-transform">
              U
            </div>
            <div>
              <div className="font-extrabold text-base tracking-tight leading-tight flex items-center gap-1.5">
                Usaha.in
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300">
                  UMKM
                </span>
              </div>
              <div className="text-[10px] text-[hsl(var(--muted-fg))] leading-none">
                Manajemen Terpadu
              </div>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[hsl(var(--muted-fg))]">
            <a href="#fitur" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              Fitur Unggulan
            </a>
            <a href="#solusi" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              Solusi UMKM
            </a>
            <a href="#copilot" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-1">
              <Bot className="w-3.5 h-3.5 text-purple-500" />
              AI Copilot
            </a>
            <a href="#peran-tim" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              Peran Tim
            </a>
            <a href="#testimoni" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              Testimoni
            </a>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-3">
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDark}
              className="p-2 rounded-lg text-[hsl(var(--muted-fg))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))] transition-colors"
              title={dark ? "Mode Terang" : "Mode Gelap"}
            >
              {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {isAuthenticated ? (
              <Link
                href="/dashboard"
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-xs sm:text-sm shadow-md shadow-blue-500/20 transition-all flex items-center gap-1.5"
              >
                <span>Buka Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-3.5 py-1.5 rounded-lg border border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))] text-xs sm:text-sm font-semibold transition-colors"
                >
                  Masuk
                </Link>
                <Link
                  href="/login"
                  className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-xs sm:text-sm shadow-md shadow-blue-500/20 hover:shadow-lg transition-all"
                >
                  <span>Coba Demo</span>
                  <Sparkles className="w-3.5 h-3.5" />
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28">
        {/* Ambient Gradient Glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-blue-500/15 via-purple-500/10 to-transparent blur-3xl pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900 shadow-xs mb-6 animate-fade-in">
            <Sparkles className="w-3.5 h-3.5 text-blue-500" />
            <span>Platform Manajemen UMKM Terintegrasi & Asisten AI</span>
          </div>

          {/* Main Title */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight max-w-4xl mx-auto leading-tight sm:leading-tight">
            Kelola Semua Kanal Penjualan dalam{" "}
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Satu Ekosistem Pintar
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-base sm:text-lg text-[hsl(var(--muted-fg))] max-w-2xl mx-auto leading-relaxed">
            Sinkronisasi otomatis pesanan dari <strong>Shopee, Tokopedia, WhatsApp,</strong> hingga <strong>Kasir Toko</strong> secara real-time. Dilengkapi analisis Laba Rugi instan dan asisten AI Copilot untuk mencegah stok habis.
          </p>

          {/* Dual CTA */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <Link
              href="/login"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm shadow-xl shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
            >
              <span>Mulai Jelajahi Demo</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="#fitur"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] hover:bg-[hsl(var(--muted))] font-semibold text-sm transition-all flex items-center justify-center gap-2"
            >
              <Layers className="w-4 h-4 text-blue-500" />
              <span>Lihat Fitur & Simulasi</span>
            </a>
          </div>

          {/* Trust badges */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-xs text-[hsl(var(--muted-fg))]">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              Data Mock 54 Transaksi & 10 Produk
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              Simulasi Pesanan Real-time 1-Klik
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              4 Hak Akses (Owner, Kasir, Gudang, Keuangan)
            </span>
          </div>

          {/* 3. INTERACTIVE HERO APP PREVIEW */}
          <div className="mt-14 max-w-5xl mx-auto rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-2xl overflow-hidden text-left">
            {/* Browser top chrome */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-[hsl(var(--border))] bg-[hsl(var(--muted))]/50">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-amber-400" />
                <div className="w-3 h-3 rounded-full bg-emerald-400" />
                <span className="text-[11px] font-mono text-[hsl(var(--muted-fg))] ml-2 hidden sm:inline">
                  https://usaha.in/dashboard
                </span>
              </div>
              {/* Tab Pills */}
              <div className="flex items-center gap-1 bg-[hsl(var(--card))] p-0.5 rounded-lg border border-[hsl(var(--border))] text-xs font-medium">
                <button
                  onClick={() => setActiveTab("omnichannel")}
                  className={`px-3 py-1 rounded-md transition-all ${
                    activeTab === "omnichannel"
                      ? "bg-blue-600 text-white font-semibold shadow-xs"
                      : "text-[hsl(var(--muted-fg))] hover:text-[hsl(var(--foreground))]"
                  }`}
                >
                  Multi-Kanal
                </button>
                <button
                  onClick={() => setActiveTab("copilot")}
                  className={`px-3 py-1 rounded-md transition-all flex items-center gap-1 ${
                    activeTab === "copilot"
                      ? "bg-purple-600 text-white font-semibold shadow-xs"
                      : "text-[hsl(var(--muted-fg))] hover:text-[hsl(var(--foreground))]"
                  }`}
                >
                  <Bot className="w-3 h-3" />
                  AI Copilot
                </button>
                <button
                  onClick={() => setActiveTab("kanban")}
                  className={`px-3 py-1 rounded-md transition-all ${
                    activeTab === "kanban"
                      ? "bg-emerald-600 text-white font-semibold shadow-xs"
                      : "text-[hsl(var(--muted-fg))] hover:text-[hsl(var(--foreground))]"
                  }`}
                >
                  Kanban Kirim
                </button>
                <button
                  onClick={() => setActiveTab("finance")}
                  className={`px-3 py-1 rounded-md transition-all ${
                    activeTab === "finance"
                      ? "bg-amber-600 text-white font-semibold shadow-xs"
                      : "text-[hsl(var(--muted-fg))] hover:text-[hsl(var(--foreground))]"
                  }`}
                >
                  Laba Rugi
                </button>
              </div>
            </div>

            {/* Tab Preview Content */}
            <div className="p-6 sm:p-8 bg-gradient-to-b from-transparent to-[hsl(var(--muted))]/20">
              {activeTab === "omnichannel" && (
                <div className="space-y-4 animate-fade-in">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white">Sinkronisasi Penjualan Multi-Kanal Otomatis</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Pesanan dari Shopee, Tokopedia, WA & Toko langsung memotong stok pusat.</p>
                    </div>
                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 shadow-xs w-fit">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                      </span>
                      Status: Terhubung Real-Time
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 pt-2">
                    {/* Shopee */}
                    <div className="p-4 rounded-xl border border-orange-200 dark:border-orange-800/80 bg-white dark:bg-slate-900 shadow-sm hover:shadow transition-shadow">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-orange-600 dark:text-orange-400">Shopee</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300 font-bold">22 Pesanan</span>
                      </div>
                      <div className="text-lg font-black mt-2 text-slate-900 dark:text-white">Rp 51.450.000</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Omzet terbesar bulan ini</div>
                    </div>

                    {/* Tokopedia */}
                    <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-800/80 bg-white dark:bg-slate-900 shadow-sm hover:shadow transition-shadow">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Tokopedia</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold">14 Pesanan</span>
                      </div>
                      <div className="text-lg font-black mt-2 text-slate-900 dark:text-white">Rp 34.200.000</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Konversi transaksi 4.8%</div>
                    </div>

                    {/* WhatsApp */}
                    <div className="p-4 rounded-xl border border-green-200 dark:border-green-800/80 bg-white dark:bg-slate-900 shadow-sm hover:shadow transition-shadow">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-green-600 dark:text-green-400">WhatsApp</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300 font-bold">11 Pesanan</span>
                      </div>
                      <div className="text-lg font-black mt-2 text-slate-900 dark:text-white">Rp 26.800.000</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Langganan repeat order</div>
                    </div>

                    {/* Toko Offline */}
                    <div className="p-4 rounded-xl border border-blue-200 dark:border-blue-800/80 bg-white dark:bg-slate-900 shadow-sm hover:shadow transition-shadow">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-blue-600 dark:text-blue-400">Toko Offline</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold">7 Pesanan</span>
                      </div>
                      <div className="text-lg font-black mt-2 text-slate-900 dark:text-white">Rp 16.050.000</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Kasir POS langsung</div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "copilot" && (
                <div className="space-y-4 animate-fade-in">
                  <div className="flex items-center gap-3.5 p-4 rounded-xl bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-800 shadow-sm">
                    <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800 flex items-center justify-center shrink-0">
                      <Bot className="w-5 h-5" />
                    </div>
                    <div className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed">
                      <span className="font-bold text-purple-700 dark:text-purple-400">AI Usaha.in Copilot: </span>
                      &ldquo;Peringatan Sistem: Stok <strong>Keripik Tempe Renyah</strong> sisa 24 pcs (di bawah batas minimum 30 pcs). Diprediksi habis dalam 2 hari berdasarkan laju pesanan Shopee. Segera buat PO ke Supplier Bahan Baku.&rdquo;
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500 dark:text-slate-400">Aksi Copilot Otomatis:</span>
                    <button className="text-xs px-3.5 py-1.5 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors shadow-xs">
                      Buat Pesanan Pembelian (PO) Sekarang
                    </button>
                    <button className="text-xs px-3.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 transition-colors shadow-xs">
                      Lihat Histori Penjualan
                    </button>
                  </div>
                </div>
              )}

              {activeTab === "kanban" && (
                <div className="space-y-3 animate-fade-in">
                  <div className="text-xs text-slate-500 dark:text-slate-400">Alur Pengiriman 5 Tahap: Baru → Diproses → Dikemas → Dikirim → Selesai</div>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5 text-xs">
                    <div className="p-3 rounded-xl border border-blue-200 dark:border-blue-900 bg-white dark:bg-slate-900 shadow-sm">
                      <div className="font-bold text-blue-600 dark:text-blue-400 flex items-center justify-between">
                        <span>Baru</span>
                        <span className="text-[10px] bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold px-2 py-0.5 rounded-full">3</span>
                      </div>
                      <div className="mt-2 text-[11px] p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 font-medium">ORD-202609-054 (Shopee)</div>
                    </div>
                    <div className="p-3 rounded-xl border border-amber-200 dark:border-amber-900 bg-white dark:bg-slate-900 shadow-sm">
                      <div className="font-bold text-amber-600 dark:text-amber-400 flex items-center justify-between">
                        <span>Diproses</span>
                        <span className="text-[10px] bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-bold px-2 py-0.5 rounded-full">2</span>
                      </div>
                      <div className="mt-2 text-[11px] p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 font-medium">ORD-202609-052 (Tokopedia)</div>
                    </div>
                    <div className="p-3 rounded-xl border border-purple-200 dark:border-purple-900 bg-white dark:bg-slate-900 shadow-sm">
                      <div className="font-bold text-purple-600 dark:text-purple-400 flex items-center justify-between">
                        <span>Dikemas</span>
                        <span className="text-[10px] bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-bold px-2 py-0.5 rounded-full">4</span>
                      </div>
                      <div className="mt-2 text-[11px] p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 font-medium">ORD-202609-050 (WA)</div>
                    </div>
                    <div className="p-3 rounded-xl border border-indigo-200 dark:border-indigo-900 bg-white dark:bg-slate-900 shadow-sm hidden sm:block">
                      <div className="font-bold text-indigo-600 dark:text-indigo-400 flex items-center justify-between">
                        <span>Dikirim</span>
                        <span className="text-[10px] bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold px-2 py-0.5 rounded-full">5</span>
                      </div>
                      <div className="mt-2 text-[11px] p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 font-medium">Resi JNE / SiCepat aktif</div>
                    </div>
                    <div className="p-3 rounded-xl border border-emerald-200 dark:border-emerald-900 bg-white dark:bg-slate-900 shadow-sm hidden sm:block">
                      <div className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center justify-between">
                        <span>Selesai</span>
                        <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold px-2 py-0.5 rounded-full">40</span>
                      </div>
                      <div className="mt-2 text-[11px] p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 font-medium">Diterima pelanggan</div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "finance" && (
                <div className="space-y-4 animate-fade-in">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                    <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-900 shadow-sm">
                      <div className="text-xs text-blue-600 dark:text-blue-400 font-bold">Total Omzet (Bulan Ini)</div>
                      <div className="text-xl font-black mt-1 text-slate-900 dark:text-white">Rp 128.500.000</div>
                      <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">↑ +14.2% vs bulan lalu</div>
                    </div>
                    <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-900 shadow-sm">
                      <div className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">Estimasi Laba Bersih</div>
                      <div className="text-xl font-black mt-1 text-emerald-600 dark:text-emerald-400">Rp 42.350.000</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Margin bersih 32.9%</div>
                    </div>
                    <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-900 shadow-sm">
                      <div className="text-xs text-purple-600 dark:text-purple-400 font-bold">Total Pengeluaran & HPP</div>
                      <div className="text-xl font-black mt-1 text-slate-900 dark:text-white">Rp 86.150.000</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Pembelian bahan & operasional</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 4. STATS METRICS ROW */}
      <section className="border-y border-[hsl(var(--border))] bg-[hsl(var(--card))]/50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl sm:text-4xl font-black text-blue-600 dark:text-blue-400">4 Kanal</div>
              <div className="text-xs sm:text-sm font-semibold text-[hsl(var(--foreground))] mt-1">Terintegrasi Sentral</div>
              <div className="text-xs text-[hsl(var(--muted-fg))] mt-0.5">Shopee, Tokopedia, WA & POS</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-black text-indigo-600 dark:text-indigo-400">99.8%</div>
              <div className="text-xs sm:text-sm font-semibold text-[hsl(var(--foreground))] mt-1">Akurasi Stok</div>
              <div className="text-xs text-[hsl(var(--muted-fg))] mt-0.5">Bebas overselling & salah stok</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-black text-purple-600 dark:text-purple-400">15+ Jam</div>
              <div className="text-xs sm:text-sm font-semibold text-[hsl(var(--foreground))] mt-1">Waktu Dihemat Tiap Minggu</div>
              <div className="text-xs text-[hsl(var(--muted-fg))] mt-0.5">Otomasi rekapitulasi data</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-black text-emerald-600 dark:text-emerald-400">100%</div>
              <div className="text-xs sm:text-sm font-semibold text-[hsl(var(--foreground))] mt-1">Transparansi Laba Rugi</div>
              <div className="text-xs text-[hsl(var(--muted-fg))] mt-0.5">HPP dan margin otomatis</div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. PROBLEM VS SOLUTION */}
      <section id="solusi" className="py-20 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-2">
            Mengapa UMKM Butuh Usaha.in?
          </h2>
          <h3 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Tinggalkan cara manual yang bikin pusing dan rawan rugi
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Sisi Masalah */}
          <div className="p-8 rounded-2xl border-2 border-rose-200 dark:border-rose-900/60 bg-white dark:bg-slate-900 shadow-sm space-y-6">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900 flex items-center justify-center font-black text-xl shadow-xs">
                ✕
              </div>
              <div>
                <h4 className="text-lg font-bold text-rose-600 dark:text-rose-400">Sebelum Pakai Usaha.in</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">Cara kerja konvensional & manual</p>
              </div>
            </div>
            <ul className="space-y-4 text-sm text-slate-600 dark:text-slate-300">
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0 mt-2"></span>
                <span>Pesanan dari Shopee, Tokopedia, dan chat WA dicatat manual di buku atau Excel terpisah.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0 mt-2"></span>
                <span>Stok sering habis tiba-tiba karena tidak ada peringatan reorder otomatis ke supplier.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0 mt-2"></span>
                <span>Karyawan kasir atau gudang bisa melihat data keuangan sensitif karena tidak ada batasan hak akses.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0 mt-2"></span>
                <span>Baru tahu untung atau rugi di akhir bulan setelah pusing menghitung tumpukan nota fisik.</span>
              </li>
            </ul>
          </div>

          {/* Sisi Solusi Usaha.in */}
          <div className="p-8 rounded-2xl border-2 border-emerald-400 dark:border-emerald-600 bg-white dark:bg-slate-900 shadow-lg shadow-emerald-500/10 space-y-6 ring-2 ring-emerald-400/20">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800 flex items-center justify-center font-black text-xl shadow-xs">
                ✓
              </div>
              <div>
                <h4 className="text-lg font-bold text-emerald-600 dark:text-emerald-400">Bersama Usaha.in</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">Solusi terintegrasi serba otomatis</p>
              </div>
            </div>
            <ul className="space-y-4 text-sm text-slate-800 dark:text-slate-100">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <span><strong>Semua pesanan masuk 1 pintu:</strong> Stok terpotong otomatis di seluruh kanal penjualan.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <span><strong>AI Usaha.in Copilot:</strong> Memberikan sinyal stok kritis dan rekomendasi pembelian ke supplier.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <span><strong>Hak Akses Bertingkat (RBAC):</strong> Staf gudang & kasir hanya melihat modul yang relevan.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <span><strong>Laba Bersih Real-Time:</strong> Margin dan HPP terhitung otomatis di setiap detik transaksi.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* 6. CORE FEATURES BENTO GRID */}
      <section id="fitur" className="py-20 sm:py-24 bg-[hsl(var(--muted))]/30 border-t border-[hsl(var(--border))]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-2">
              Fitur Lengkap Terintegrasi
            </h2>
            <h3 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Segala kebutuhan operasional UMKM dalam satu layar
            </h3>
            <p className="mt-3 text-sm text-[hsl(var(--muted-fg))]">
              Dirancang khusus untuk alur kerja bisnis Indonesia yang gesit dan fleksibel.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="p-6 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-sm hover:shadow-md transition-shadow">
              <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4">
                <ShoppingCart className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold mb-2">Manajemen Penjualan 4 Kanal</h4>
              <p className="text-xs text-[hsl(var(--muted-fg))] leading-relaxed">
                Filter transaksi berdasarkan Shopee, Tokopedia, WhatsApp, dan Kasir Offline. Lengkap dengan pencarian nomor pesanan dan pelacakan status pembayaran lunas.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-sm hover:shadow-md transition-shadow">
              <div className="w-11 h-11 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-4">
                <Warehouse className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold mb-2">Kartu Stok & Buku Besar Real-Time</h4>
              <p className="text-xs text-[hsl(var(--muted-fg))] leading-relaxed">
                Pantau setiap pergerakan barang masuk dari supplier dan barang keluar karena pesanan pelanggan. Akurasi 100% dengan pencatatan mutasi otomatis.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-sm hover:shadow-md transition-shadow">
              <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
                <Truck className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold mb-2">Papan Kanban Pengiriman</h4>
              <p className="text-xs text-[hsl(var(--muted-fg))] leading-relaxed">
                Drag-and-drop atau klik cepat untuk memindahkan status pengiriman dari Baru, Diproses, Dikemas, Dikirim, hingga Selesai dengan nomor resi kurir.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-sm hover:shadow-md transition-shadow">
              <div className="w-11 h-11 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4">
                <Shield className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold mb-2">Hak Akses Tim & Audit Trail</h4>
              <p className="text-xs text-[hsl(var(--muted-fg))] leading-relaxed">
                Beri peran khusus untuk Staf Penjualan, Gudang, atau Keuangan. Seluruh tindakan karyawan tercatat rapi di log aktivitas tanpa bisa dimanipulasi.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-6 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-sm hover:shadow-md transition-shadow">
              <div className="w-11 h-11 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold mb-2">Laporan Keuangan & Margin Profit</h4>
              <p className="text-xs text-[hsl(var(--muted-fg))] leading-relaxed">
                Lihat ringkasan laba rugi bulanan, total omzet, HPP pembelian, dan grafik saluran penjualan paling menguntungkan secara otomatis.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-6 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-sm hover:shadow-md transition-shadow">
              <div className="w-11 h-11 rounded-xl bg-pink-50 dark:bg-pink-950 text-pink-600 dark:text-pink-400 flex items-center justify-center mb-4">
                <Bot className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold mb-2">AI Copilot dengan Skenario Nyata</h4>
              <p className="text-xs text-[hsl(var(--muted-fg))] leading-relaxed">
                Tanyakan pertanyaan bisnis seperti rekomendasi produk terlaris, barang yang perlu di-reorder, atau analisis performa kurir kepada asisten AI.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. PERAN TIM & HAK AKSES */}
      <section id="peran-tim" className="py-20 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-900 mb-3">
            <Shield className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Manajemen Hak Akses Granular (RBAC)</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Dirancang Khusus untuk Setiap Peran di Bisnis Anda
          </h2>
          <p className="mt-3 text-sm text-[hsl(var(--muted-fg))]">
            Setiap anggota tim mendapatkan antarmuka yang disesuaikan dengan tanggung jawabnya. Operasional berjalan cepat, data keuangan tetap aman terlindungi.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Pemilik Usaha */}
          <div className="p-6 rounded-2xl border-2 border-amber-200 dark:border-amber-900/50 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-2xl">👑</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
                  Akses Penuh
                </span>
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">Pemilik Usaha</h4>
              <p className="text-xs text-amber-600 dark:text-amber-400 font-semibold mb-2">Owner / Founder</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
                Memegang kendali penuh atas arah bisnis, laporan laba rugi, dan transparansi kinerja tim tanpa perlu hadir fisik setiap hari.
              </p>
              
              <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span>Ringkasan Laba Bersih & HPP</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span>Matriks Izin Karyawan (RBAC)</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span>Rekomendasi Cerdas AI Copilot</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span>Log Aktivitas Tim Terpusat</span>
                </div>
              </div>
            </div>
            
            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
              <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 flex items-center justify-between">
                <span>Fokus: Keputusan Strategis</span>
                <span>★ Prioritas #1</span>
              </span>
            </div>
          </div>

          {/* Staf Penjualan */}
          <div className="p-6 rounded-2xl border-2 border-blue-200 dark:border-blue-900/50 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-2xl">🛍️</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                  Kasir & Order
                </span>
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">Staf Penjualan</h4>
              <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold mb-2">Kasir & Customer Service</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
                Proses pencatatan pesanan kilat dari toko offline maupun chat WhatsApp tanpa risiko salah hitung atau stok ganda.
              </p>
              
              <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                  <span>Input Pesanan Cepat & POS</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                  <span>Direktori Data Pelanggan</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                  <span>Cek Ketersediaan Stok Real-Time</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                  <span>Terkunci dari Data Keuangan</span>
                </div>
              </div>
            </div>
            
            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
              <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 flex items-center justify-between">
                <span>Fokus: Pelayanan Kilat</span>
                <span>★ Bebas Selisih</span>
              </span>
            </div>
          </div>

          {/* Staf Gudang */}
          <div className="p-6 rounded-2xl border-2 border-emerald-200 dark:border-emerald-900/50 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-2xl">📦</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                  Gudang & Kirim
                </span>
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">Staf Gudang</h4>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mb-2">Fulfillment & Inventory</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
                Alur packing paket teratur dengan papan kanban dan penerimaan pasokan barang dari supplier yang tercatat rapi.
              </p>
              
              <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Papan Kanban Alur Pengiriman</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Input Resi & Status Ekspedisi</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Buku Besar Mutasi Stok Masuk/Keluar</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Penerimaan Pembelian Supplier</span>
                </div>
              </div>
            </div>
            
            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
              <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center justify-between">
                <span>Fokus: Ketepatan Stok</span>
                <span>★ Zero Lost Item</span>
              </span>
            </div>
          </div>

          {/* Staf Keuangan */}
          <div className="p-6 rounded-2xl border-2 border-purple-200 dark:border-purple-900/50 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-2xl">💳</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                  Laba & Pembayaran
                </span>
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">Staf Keuangan</h4>
              <p className="text-xs text-purple-600 dark:text-purple-400 font-semibold mb-2">Finance & Billing</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
                Verifikasi pembayaran lunas dari pelanggan, pengelolaan tagihan supplier, dan pemantauan arus kas harian.
              </p>
              
              <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                  <span>Tandai Status Pembayaran Lunas</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                  <span>Rekapitulasi Omzet Per Kanal</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                  <span>Monitoring Tagihan Belum Lunas</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                  <span>Rekonsiliasi Arus Kas Otomatis</span>
                </div>
              </div>
            </div>
            
            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
              <span className="text-[11px] font-semibold text-purple-600 dark:text-purple-400 flex items-center justify-between">
                <span>Fokus: Arus Kas Tertib</span>
                <span>★ 100% Akurat</span>
              </span>
            </div>
          </div>
        </div>

        {/* CTA Callout */}
        <div className="mt-12 p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-blue-950/40 dark:to-slate-900 border border-blue-200/80 dark:border-blue-900/60 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          <div>
            <h4 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              Ingin mencoba langsung alur kerja dari masing-masing peran?
            </h4>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
              Akun demo siap pakai untuk Pemilik, Kasir, Gudang, dan Keuangan tersedia di halaman Masuk.
            </p>
          </div>
          <Link
            href="/login"
            className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm shadow-md shadow-blue-500/20 transition-all flex items-center gap-2 shrink-0 cursor-pointer"
          >
            <span>Buka Halaman Masuk Demo</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* 8. TESTIMONIALS */}
      <section id="testimoni" className="py-20 sm:py-24 bg-[hsl(var(--muted))]/20 border-t border-[hsl(var(--border))]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-2">
              Kisah Sukses UMKM
            </h2>
            <h3 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Dipercaya oleh ratusan pelaku usaha modern
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1 text-amber-500 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-500" />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-[hsl(var(--muted-fg))] leading-relaxed italic">
                  &ldquo;Dulu pas promo tanggal kembar di Shopee dan Tokped, stok sering bentrok dan cancel pesanan. Sejak pakai Usaha.in, stok otomatis kepotong di semua platform!&rdquo;
                </p>
              </div>
              <div className="flex items-center gap-3 mt-6 pt-4 border-t border-[hsl(var(--border))]">
                <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xs">
                  HS
                </div>
                <div>
                  <div className="text-xs font-bold">Hendra Saputra</div>
                  <div className="text-[10px] text-[hsl(var(--muted-fg))]">Owner Keripik Tempe Barokah</div>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1 text-amber-500 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-500" />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-[hsl(var(--muted-fg))] leading-relaxed italic">
                  &ldquo;AI Copilotnya bener-bener ngebantu pas mau kulakan bahan. Dia ngingetin sebelum stok Sambal Roa kami kehabisan cabai rawit. Gak perlu hitung kalkulator lagi.&rdquo;
                </p>
              </div>
              <div className="flex items-center gap-3 mt-6 pt-4 border-t border-[hsl(var(--border))]">
                <div className="w-9 h-9 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold text-xs">
                  DR
                </div>
                <div>
                  <div className="text-xs font-bold">Dewi Ratnasari</div>
                  <div className="text-[10px] text-[hsl(var(--muted-fg))]">Founder Sambal Nusantara</div>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1 text-amber-500 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-500" />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-[hsl(var(--muted-fg))] leading-relaxed italic">
                  &ldquo;Fitur hak aksesnya juara! Staf kasir gak bisa intip laporan laba bersih dan biaya pembelian owner. Bisnis jadi jauh lebih profesional dan aman.&rdquo;
                </p>
              </div>
              <div className="flex items-center gap-3 mt-6 pt-4 border-t border-[hsl(var(--border))]">
                <div className="w-9 h-9 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold text-xs">
                  AW
                </div>
                <div>
                  <div className="text-xs font-bold">Agung Wicaksono</div>
                  <div className="text-[10px] text-[hsl(var(--muted-fg))]">CEO Kopi Senja Roastery</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 9. FAQ ACCORDION */}
      <section className="py-20 sm:py-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-2">
            Tanya Jawab
          </h2>
          <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Pertanyaan yang Sering Diajukan
          </h3>
        </div>

        <div className="space-y-3">
          {[
            {
              q: "Apakah Usaha.in bisa menyinkronkan stok pesanan Shopee & Tokopedia secara bersamaan?",
              a: "Ya! Usaha.in memiliki sistem buku besar stok terpusat. Begitu ada pesanan masuk dari kanal mana pun (baik Shopee, Tokopedia, WhatsApp, atau kasir toko), stok produk akan langsung berkurang secara serentak."
            },
            {
              q: "Bagaimana cara kerja fitur simulasi pesanan pada versi demo ini?",
              a: "Di dalam dashboard Usaha.in, terdapat tombol 'Simulasikan Pesanan Baru (+1)'. Ketika diklik, sistem akan membuat transaksi baru acak dari salah satu dari 4 kanal penjualan, memotong stok barang terkait, dan mencatat pergerakan mutasi di log aktivitas."
            },
            {
              q: "Apakah staf gudang dan kasir bisa melihat data laporan keuangan pemilik?",
              a: "Tidak bisa. Usaha.in menerapkan Role-Based Access Control (RBAC) granular. Staf penjualan hanya dapat mengakses modul penjualan & pelanggan, sedangkan staf gudang hanya dapat mengakses modul stok, pengiriman, dan penerimaan barang."
            },
            {
              q: "Apakah data demo saya akan tersimpan jika browser ditutup?",
              a: "Ya! Data transaksi, produk, dan pengaturan tim disimpan di local storage peramban Anda. Anda juga dapat menekan tombol 'Reset Demo' di bagian atas kapan saja untuk mengembalikan data ke kondisi awal."
            }
          ].map((item, idx) => {
            const isOpen = faqOpen === idx;
            return (
              <div
                key={idx}
                className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] overflow-hidden transition-all"
              >
                <button
                  onClick={() => setFaqOpen(isOpen ? null : idx)}
                  className="w-full p-4 sm:p-5 text-left font-semibold text-xs sm:text-sm flex items-center justify-between gap-4"
                >
                  <span>{item.q}</span>
                  <ChevronRight
                    className={`w-4 h-4 text-[hsl(var(--muted-fg))] shrink-0 transition-transform ${
                      isOpen ? "rotate-90 text-blue-600" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 sm:px-5 sm:pb-5 text-xs sm:text-sm text-[hsl(var(--muted-fg))] leading-relaxed border-t border-[hsl(var(--border))] pt-3 animate-fade-in">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 10. BIG CALL TO ACTION BANNER */}
      <section className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white p-8 sm:p-14 overflow-hidden shadow-2xl text-center">
          {/* Ambient Glows */}
          <div className="absolute -top-24 -left-24 w-80 h-80 bg-white/10 rounded-full blur-2xl" />
          <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-white/10 rounded-full blur-2xl" />

          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <h3 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
              Siap Mengembangkan Bisnis UMKM Anda ke Level Selanjutnya?
            </h3>
            <p className="text-sm sm:text-base text-white/80 leading-relaxed">
              Jelajahi seluruh fitur Usaha.in dengan akun demo interaktif sekarang. Tanpa registrasi rumit, langsung masuk dan uji simulasi transaksinya!
            </p>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/login"
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-white text-blue-700 font-bold text-sm hover:bg-slate-100 shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Masuk ke Demo Usaha.in</span>
                <ArrowRight className="w-4 h-4 text-blue-700" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 11. FOOTER */}
      <footer className="border-t border-[hsl(var(--border))] bg-[hsl(var(--card))] py-12 text-xs text-[hsl(var(--muted-fg))]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-sm">
              U
            </div>
            <span className="font-bold text-sm text-[hsl(var(--foreground))]">Usaha.in</span>
            <span>— Platform Manajemen UMKM Terpadu Multi-Kanal</span>
          </div>
          <div>
            Capstone Project &copy; 2026 Usaha.in. Semua hak dilindungi undang-undang.
          </div>
        </div>
      </footer>
    </div>
  );
}
