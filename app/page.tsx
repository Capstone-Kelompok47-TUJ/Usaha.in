"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import {
  ShoppingCart, Package, Warehouse, CreditCard, Truck, Users,
  BarChart3, Bot, ArrowRight, CheckCircle2, Sparkles, Shield,
  Layers, Zap, Clock, TrendingUp, ChevronRight, Moon, Sun,
  Smartphone, Store, HelpCircle, Database, Globe,
  UserCheck, Lock, RefreshCw, Check, Info, FileSpreadsheet,
  PieChart, Activity, AlertTriangle, DollarSign, Tag, Scale, Settings
} from "lucide-react";
import { LogoIcon } from "@/components/ui/Logo";

export default function LandingPage() {
  const router = useRouter();
  const isAuthenticated = useStore((s) => s.isAuthenticated);

  const [dark, setDark] = useState(false);
  const [activeTab, setActiveTab] = useState<"pencatatan" | "analitik" | "copilot" | "keuangan">("pencatatan");
  const [faqOpen, setFaqOpen] = useState<number | null>(null);

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
      <header className="sticky top-0 z-50 backdrop-blur-md bg-[hsl(var(--background))]/85 border-b border-[hsl(var(--border))]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <LogoIcon className="w-9 h-9 group-hover:scale-105 transition-transform" size={36} />
            <div>
              <div className="font-extrabold text-base tracking-tight leading-tight flex items-center gap-1.5">
                Usaha.in
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300">
                  UMKM
                </span>
              </div>
              <div className="text-[10px] text-[hsl(var(--muted-fg))] leading-none">
                Sistem Operasional & Keuangan
              </div>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-[hsl(var(--muted-fg))]">
            <a href="#fitur" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              Fitur Utama
            </a>
            <a href="#analitik" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-1">
              <PieChart className="w-3.5 h-3.5 text-blue-500" />
              Analitik & PVM
            </a>
            <a href="#copilot" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-1">
              <Bot className="w-3.5 h-3.5 text-purple-500" />
              AI Copilot
            </a>
            <a href="#keuangan" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              Laporan Keuangan
            </a>
            <a href="#faq" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              Tanya Jawab
            </a>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={toggleDark}
              className="p-2 rounded-lg text-[hsl(var(--muted-fg))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))] transition-colors cursor-pointer"
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
                  href="/daftar"
                  className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-xs sm:text-sm shadow-md shadow-blue-500/20 hover:shadow-lg transition-all"
                >
                  <span>Daftar Usaha</span>
                  <Sparkles className="w-3.5 h-3.5" />
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28">
        {/* Glow background */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-blue-500/15 via-purple-500/10 to-transparent blur-3xl pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
          {/* Factual non-integration notice */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3.5 sm:px-4 sm:py-2.5 rounded-xl border border-blue-200/90 dark:border-blue-900/60 border-l-[5px] border-l-blue-600 dark:border-l-blue-500 bg-gradient-to-r from-blue-50/80 via-blue-50/40 to-transparent dark:from-blue-950/40 dark:via-blue-950/20 dark:to-transparent shadow-xs mb-6 max-w-3xl text-left w-full">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10.5px] font-bold tracking-wider uppercase bg-blue-100/90 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 shrink-0">
              <Info className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>PENCATATAN INTERNAL</span>
            </div>
            <p className="text-xs text-[hsl(var(--foreground))] leading-relaxed font-normal">
              Usaha.in menggunakan sistem <strong>pencatatan manual, import CSV, dan simulasi internal</strong> untuk kanal Shopee, Tokopedia, WhatsApp, dan Toko Fisik — <strong>tanpa memerlukan integrasi API langsung</strong>.
            </p>
          </div>

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900 shadow-xs mb-6">
            <Sparkles className="w-3.5 h-3.5 text-blue-500" />
            <span>Sistem Operasional, Keuangan, & Analitik Terpadu untuk UMKM</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight max-w-4xl mx-auto leading-tight sm:leading-tight">
            Pencatatan Multi-Kanal & Analisis Laba{" "}
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Tanpa Ribet Integrasi API
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-base sm:text-lg text-[hsl(var(--muted-fg))] max-w-2xl mx-auto leading-relaxed">
            Kelola penjualan Shopee, Tokopedia, WhatsApp, dan Offline dalam satu aplikasi. Otomatis hitung HPP Moving Average, pantau stok, deteksi anomali, serta estimasi <strong>Uang Aman Ditarik</strong> bersama AI Copilot.
          </p>

          {/* Action Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <Link
              href="/daftar"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm shadow-xl shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
            >
              <span>Mulai Sekarang (Gratis)</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] hover:bg-[hsl(var(--muted))] font-semibold text-sm transition-all flex items-center justify-center gap-2"
            >
              <span>Masuk Akun Demo</span>
            </Link>
          </div>

          {/* Core Highlights */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-xs text-[hsl(var(--muted-fg))]">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              Mendukung Toko Dagang, Produksi, & Jasa
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              Input Manual + Import CSV Praktis
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              Dekomposisi Laba PVM & Skor Kesehatan
            </span>
          </div>

          {/* 3. INTERACTIVE FEATURE TAB PREVIEW */}
          <div className="mt-14 max-w-5xl mx-auto rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-xl overflow-hidden text-left w-full">
            {/* Window header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between px-4 py-3 border-b border-[hsl(var(--border))] bg-[hsl(var(--muted))]/50 gap-3">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-amber-400" />
                <div className="w-3 h-3 rounded-full bg-emerald-400" />
                <span className="text-[11px] font-mono text-[hsl(var(--muted-fg))] ml-2 hidden sm:inline">
                  https://usaha.in/app
                </span>
              </div>

              {/* Tabs */}
              <div className="flex items-center gap-1 bg-[hsl(var(--card))] p-1 rounded-lg border border-[hsl(var(--border))] text-xs font-medium overflow-x-auto">
                <button
                  onClick={() => setActiveTab("pencatatan")}
                  className={`px-3 py-1 rounded-md transition-all shrink-0 cursor-pointer ${
                    activeTab === "pencatatan"
                      ? "bg-blue-600 text-white font-semibold shadow-xs"
                      : "text-[hsl(var(--muted-fg))] hover:text-[hsl(var(--foreground))]"
                  }`}
                >
                  Pencatatan Kanal
                </button>
                <button
                  onClick={() => setActiveTab("analitik")}
                  className={`px-3 py-1 rounded-md transition-all shrink-0 cursor-pointer ${
                    activeTab === "analitik"
                      ? "bg-indigo-600 text-white font-semibold shadow-xs"
                      : "text-[hsl(var(--muted-fg))] hover:text-[hsl(var(--foreground))]"
                  }`}
                >
                  Analitik PVM
                </button>
                <button
                  onClick={() => setActiveTab("copilot")}
                  className={`px-3 py-1 rounded-md transition-all shrink-0 flex items-center gap-1 cursor-pointer ${
                    activeTab === "copilot"
                      ? "bg-purple-600 text-white font-semibold shadow-xs"
                      : "text-[hsl(var(--muted-fg))] hover:text-[hsl(var(--foreground))]"
                  }`}
                >
                  <Bot className="w-3.5 h-3.5" /> AI Copilot
                </button>
                <button
                  onClick={() => setActiveTab("keuangan")}
                  className={`px-3 py-1 rounded-md transition-all shrink-0 cursor-pointer ${
                    activeTab === "keuangan"
                      ? "bg-emerald-600 text-white font-semibold shadow-xs"
                      : "text-[hsl(var(--muted-fg))] hover:text-[hsl(var(--foreground))]"
                  }`}
                >
                  Uang Aman & L/R
                </button>
              </div>
            </div>

            {/* Tab Body */}
            <div className="p-6 sm:p-8">
              {/* TAB 1: PENCATATAN KANAL */}
              {activeTab === "pencatatan" && (
                <div className="space-y-6 animate-fade-in">
                  <div>
                    <h3 className="font-bold text-base sm:text-lg text-[hsl(var(--foreground))]">
                      Pencatatan Penjualan Multi-Kanal Terpusat
                    </h3>
                    <p className="text-xs text-[hsl(var(--muted-fg))] mt-0.5">
                      Catat transaksi dari berbagai platform tanpa memerlukan koneksi API yang rumit dan rentan error.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                    <div className="p-4 rounded-xl border border-orange-200 dark:border-orange-900/50 bg-orange-50/40 dark:bg-orange-950/20">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-orange-700 dark:text-orange-400">Shopee</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-100 dark:bg-orange-900/50 text-orange-800 dark:text-orange-300 font-semibold">
                          Fee 7.5%
                        </span>
                      </div>
                      <p className="text-[11px] text-[hsl(var(--muted-fg))]">Input manual nota pesanan atau import ringkasan CSV penjualan bulanan.</p>
                    </div>

                    <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/40 dark:bg-emerald-950/20">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">Tokopedia</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 font-semibold">
                          Fee 3.5%
                        </span>
                      </div>
                      <p className="text-[11px] text-[hsl(var(--muted-fg))]">Potongan fee dihitung otomatis untuk mengetahui margin bersih per transaksi.</p>
                    </div>

                    <div className="p-4 rounded-xl border border-teal-200 dark:border-teal-900/50 bg-teal-50/40 dark:bg-teal-950/20">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-teal-700 dark:text-teal-400">WhatsApp / Chat</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-900/50 text-teal-800 dark:text-teal-300 font-semibold">
                          Fee Rp0
                        </span>
                      </div>
                      <p className="text-[11px] text-[hsl(var(--muted-fg))]">Catat pesanan langsung, pembayaran DP/cicilan, dan kirim pengingat tagihan via WA.</p>
                    </div>

                    <div className="p-4 rounded-xl border border-blue-200 dark:border-blue-900/50 bg-blue-50/40 dark:bg-blue-950/20">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-blue-700 dark:text-blue-400">Toko Fisik / Kasir</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 font-semibold">
                          Langsung
                        </span>
                      </div>
                      <p className="text-[11px] text-[hsl(var(--muted-fg))]">Pencatatan kasir offline dengan pengurangan stok instan pada buku besar gudang.</p>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: ANALITIK PVM */}
              {activeTab === "analitik" && (
                <div className="space-y-4 animate-fade-in" id="analitik">
                  <div>
                    <h3 className="font-bold text-base sm:text-lg text-[hsl(var(--foreground))]">
                      Dekomposisi Laba PVM & Audit Kesehatan Usaha
                    </h3>
                    <p className="text-xs text-[hsl(var(--muted-fg))] mt-0.5">
                      Ketahui secara presisi faktor pemicu naik-turunnya laba bersih bisnis Anda.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                    <div className="p-4 rounded-xl bg-[hsl(var(--muted))] border border-[hsl(var(--border))]">
                      <div className="text-xs font-bold text-blue-600 dark:text-blue-400">Dekomposisi PVM</div>
                      <p className="text-[11px] text-[hsl(var(--muted-fg))] mt-1">
                        Memecah perubahan laba menjadi 5 faktor: Efek Volume, Efek Harga, Efek Bauran Produk (Mix), Efek HPP, dan Beban Biaya.
                      </p>
                    </div>
                    <div className="p-4 rounded-xl bg-[hsl(var(--muted))] border border-[hsl(var(--border))]">
                      <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Skor Kesehatan Usaha</div>
                      <p className="text-[11px] text-[hsl(var(--muted-fg))] mt-1">
                        Gauge 0-100 dari 4 pilar objektif: Net Margin (30%), Perputaran Stok DIO (20%), Kelancaran Piutang (20%), dan Kas Runway (30%).
                      </p>
                    </div>
                    <div className="p-4 rounded-xl bg-[hsl(var(--muted))] border border-[hsl(var(--border))]">
                      <div className="text-xs font-bold text-purple-600 dark:text-purple-400">Deteksi Anomali & Aksi</div>
                      <p className="text-[11px] text-[hsl(var(--muted-fg))] mt-1">
                        Peringatan otomatis margin negatif, anggaran jebol, potensi deadstock, dan daftar tindakan mingguan terprioritas.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: AI COPILOT */}
              {activeTab === "copilot" && (
                <div className="space-y-4 animate-fade-in" id="copilot">
                  <div className="p-4 rounded-xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900/40 flex items-start gap-3.5">
                    <div className="p-2 rounded-lg bg-purple-600 text-white shrink-0 mt-0.5">
                      <Bot className="w-5 h-5" />
                    </div>
                    <div className="text-xs text-[hsl(var(--foreground))] leading-relaxed">
                      <p className="font-bold text-purple-700 dark:text-purple-300 mb-1">AI Business Copilot Usaha.in:</p>
                      &ldquo;Berdasarkan saldo kas saat ini (Rp 18.450.000), estimasi biaya operasional 30 hari ke depan (Rp 2.500.000), dan cadangan darurat omzet 10% (Rp 1.480.000), maka <strong>Uang Aman yang dapat ditarik untuk Prive adalah Rp 14.470.000</strong>.&rdquo;
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className="text-[hsl(var(--muted-fg))] self-center font-medium">Contoh Pertanyaan:</span>
                    <span className="px-3 py-1.5 rounded-lg bg-[hsl(var(--muted))] border border-[hsl(var(--border))] text-[hsl(var(--foreground))]">
                      Berapa uang yang aman saya ambil?
                    </span>
                    <span className="px-3 py-1.5 rounded-lg bg-[hsl(var(--muted))] border border-[hsl(var(--border))] text-[hsl(var(--foreground))]">
                      Kategori biaya mana paling boros?
                    </span>
                    <span className="px-3 py-1.5 rounded-lg bg-[hsl(var(--muted))] border border-[hsl(var(--border))] text-[hsl(var(--foreground))]">
                      Piutang mana yang jatuh tempo?
                    </span>
                  </div>
                </div>
              )}

              {/* TAB 4: KEUANGAN & LABA RUGI */}
              {activeTab === "keuangan" && (
                <div className="space-y-4 animate-fade-in" id="keuangan">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                    <div className="p-4 rounded-xl bg-[hsl(var(--card))] border border-[hsl(var(--border))] shadow-xs">
                      <div className="text-xs font-bold text-blue-600 dark:text-blue-400">1. Laba Rugi 3 Tingkat</div>
                      <p className="text-[11px] text-[hsl(var(--muted-fg))] mt-1">
                        Kaskade lengkap: Pendapatan Bruto → Laba Kotor (setelah HPP) → Laba Operasional → Laba Bersih Final per kanal.
                      </p>
                    </div>
                    <div className="p-4 rounded-xl bg-[hsl(var(--card))] border border-[hsl(var(--border))] shadow-xs">
                      <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400">2. Neraca Seimbang</div>
                      <p className="text-[11px] text-[hsl(var(--muted-fg))] mt-1">
                        Pemisahan tegas: Total Aset = Total Liabilitas (Utang Belum Lunas) + Total Ekuitas Pemilik.
                      </p>
                    </div>
                    <div className="p-4 rounded-xl bg-[hsl(var(--card))] border border-[hsl(var(--border))] shadow-xs">
                      <div className="text-xs font-bold text-purple-600 dark:text-purple-400">3. Arus Kas Riil & Prive</div>
                      <p className="text-[11px] text-[hsl(var(--muted-fg))] mt-1">
                        Kas masuk (hanya invoice lunas), kas keluar beban lunas, dan pemisahan penarikan dana prive pribadi.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 4. FITUR UNGGULAN BENTO GRID */}
      <section id="fitur" className="py-20 sm:py-24 bg-[hsl(var(--muted))]/30 border-t border-[hsl(var(--border))]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-2">
              Fitur Lengkap Terpadu
            </h2>
            <h3 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Semua Modul Penting UMKM dalam Satu Aplikasi
            </h3>
            <p className="mt-3 text-sm text-[hsl(var(--muted-fg))]">
              Didesain khusus untuk alur bisnis nyata: tanpa asumsi rumit, mudah digunakan oleh pemilik maupun karyawan.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="p-6 rounded-2xl border border-[hsl(var(--card-border))] bg-[hsl(var(--card))] shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <ShoppingCart className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold">Penjualan & Import CSV</h4>
              <p className="text-xs text-[hsl(var(--muted-fg))] leading-relaxed">
                Input penjualan manual multi-item, import file CSV pesanan, filter per kanal, dan pembatalan (void) pesanan dengan pengembalian stok otomatis.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-2xl border border-[hsl(var(--card-border))] bg-[hsl(var(--card))] shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <Warehouse className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold">Stok & Moving Average HPP</h4>
              <p className="text-xs text-[hsl(var(--muted-fg))] leading-relaxed">
                Perhitungan modal HPP bergerak secara otomatis setiap pembelian barang masuk, pelacakan stok menipis, dan penyesuaian opname dengan catatan wajib.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-2xl border border-[hsl(var(--card-border))] bg-[hsl(var(--card))] shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <DollarSign className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold">Pengeluaran & Batas Anggaran</h4>
              <p className="text-xs text-[hsl(var(--muted-fg))] leading-relaxed">
                Pencatatan beban operasional, pembelian bahan terkait stok, tempo utang jatuh tempo, tab penarikan prive, dan peringatan budget bulanan melebihi batas.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 rounded-2xl border border-[hsl(var(--card-border))] bg-[hsl(var(--card))] shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-50 dark:bg-cyan-950 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold">Pelanggan, RFM & Repeat Order</h4>
              <p className="text-xs text-[hsl(var(--muted-fg))] leading-relaxed">
                Segmentasi loyalitas otomatis (Juara, Setia, Berisiko, dll.), riwayat transaksi per pelanggan, serta deteksi keterlambatan repeat order dengan template WA.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-6 rounded-2xl border border-[hsl(var(--card-border))] bg-[hsl(var(--card))] shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <CreditCard className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold">Pembayaran & Manajemen Piutang</h4>
              <p className="text-xs text-[hsl(var(--muted-fg))] leading-relaxed">
                Pencatatan cicilan/pembayaran parsial, status Lunas/Sebagian/Belum, tanggal jatuh tempo faktur, dan tombol tagih cepat langsung ke WhatsApp pembeli.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-6 rounded-2xl border border-[hsl(var(--card-border))] bg-[hsl(var(--card))] shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Shield className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold">Role-Based Access Control (RBAC)</h4>
              <p className="text-xs text-[hsl(var(--muted-fg))] leading-relaxed">
                Pemilik usaha memegang hak penuh, sedangkan akun karyawan hanya dapat melihat atau mengelola modul sesuai mandat tugas harian dengan audit log lengkap.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. FAQ SECTION */}
      <section id="faq" className="py-20 sm:py-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-2">
            Tanya Jawab
          </h2>
          <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Pertanyaan Seputar Usaha.in
          </h3>
        </div>

        <div className="space-y-3">
          {[
            {
              q: "Apakah Usaha.in memerlukan koneksi API langsung ke Shopee/Tokopedia?",
              a: "Tidak. Usaha.in dirancang sebagai sistem pencatatan operasional internal mandiri. Anda dapat menginput transaksi secara manual, mengunggah rekap CSV penjualan dari marketplace, atau memanfaatkan modul simulasi pesanan."
            },
            {
              q: "Apa itu fitur 'Uang Aman Ditarik'?",
              a: "Fitur ini menghitung saldo kas yang aman ditarik untuk keperluan pribadi (prive) pemilik usaha tanpa mengganggu kelancaran gaji karyawan, sewa, utang jatuh tempo 30 hari ke depan, serta cadangan darurat 10% omzet."
            },
            {
              q: "Tipe usaha apa saja yang didukung oleh Usaha.in?",
              a: "Usaha.in mendukung 3 model bisnis utama: Toko Dagang (ritel/grosir beli-jual), Manufaktur/Produksi (dengan HPP bahan baku dan perakitan), serta Usaha Jasa (layanan tanpa kewajiban stok fisik)."
            },
            {
              q: "Bagaimana cara kerja AI Business Copilot?",
              a: "AI Copilot menganalisis data riil penjualan, pengeluaran, perputaran stok, dan piutang Anda untuk menjawab pertanyaan strategis seperti penyebab penurunan laba, analisis kanal terlaris, dan barang kritis yang harus segera di-restock."
            }
          ].map((item, idx) => {
            const isOpen = faqOpen === idx;
            return (
              <div
                key={idx}
                className="rounded-xl border border-[hsl(var(--card-border))] bg-[hsl(var(--card))] overflow-hidden transition-all"
              >
                <button
                  onClick={() => setFaqOpen(isOpen ? null : idx)}
                  className="w-full p-4 sm:p-5 text-left font-semibold text-xs sm:text-sm flex items-center justify-between gap-4 cursor-pointer"
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

      {/* 6. BIG CALL TO ACTION BANNER */}
      <section className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white p-8 sm:p-14 overflow-hidden shadow-2xl text-center">
          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <h3 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
              Bawa Manajemen UMKM Anda ke Level Berikutnya
            </h3>
            <p className="text-sm sm:text-base text-white/80 leading-relaxed">
              Satu aplikasi untuk kendali operasional harian tim dan analisis finansial strategis pemilik usaha.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/daftar"
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-white text-blue-700 font-bold text-sm hover:bg-slate-100 shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Daftar Usaha Baru</span>
                <ArrowRight className="w-4 h-4 text-blue-700" />
              </Link>
              <Link
                href="/login"
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl border border-white/30 bg-white/10 hover:bg-white/20 text-white font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Masuk ke Dashboard</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 7. FOOTER */}
      <footer className="border-t border-[hsl(var(--border))] bg-[hsl(var(--card))] py-12 text-xs text-[hsl(var(--muted-fg))]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <LogoIcon className="w-7 h-7" />
            <span className="font-bold text-sm text-[hsl(var(--foreground))]">Usaha.in</span>
            <span>— Sistem Operasional & Analitik UMKM Multi-Kanal</span>
          </div>
          <div>
            Capstone Project Kelompok 47 &copy; 2026 Usaha.in. Semua hak dilindungi undang-undang.
          </div>
        </div>
      </footer>
    </div>
  );
}
