"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import {
  ShoppingCart, Package, Warehouse, CreditCard, Truck, Users,
  BarChart3, Bot, ArrowRight, CheckCircle2, Sparkles, Shield,
  Layers, Zap, Clock, TrendingUp, ChevronRight, Moon, Sun,
  Smartphone, Store, HelpCircle, ArrowDown, Database, Cpu, Globe,
  UserCheck, Lock, RefreshCw, Check, Info
} from "lucide-react";

export default function LandingPage() {
  const router = useRouter();
  const isAuthenticated = useStore((s) => s.isAuthenticated);

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
                  Internal UMKM
                </span>
              </div>
              <div className="text-[10px] text-[hsl(var(--muted-fg))] leading-none">
                Sistem Operasional
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
            <a href="#pemilik-tim" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              Pemilik & Tim
            </a>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-3">
            {/* Dark Mode Toggle */}
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
                  href="/login"
                  className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-xs sm:text-sm shadow-md shadow-blue-500/20 hover:shadow-lg transition-all"
                >
                  <span>Coba Sekarang</span>
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

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
          {/* Kalimat Peringatan Demo (Desain Banner Kartu dengan Aksen Kiri & Badge Brand Blue/Indigo) */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3 sm:px-4 sm:py-2.5 rounded-xl border border-blue-200/90 dark:border-blue-900/60 border-l-[5px] border-l-blue-600 dark:border-l-blue-500 bg-gradient-to-r from-blue-50/80 via-blue-50/40 to-slate-50/20 dark:from-blue-950/40 dark:via-blue-950/20 dark:to-transparent shadow-xs mb-5 animate-fade-in max-w-3xl text-left w-full">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10.5px] font-bold tracking-wider uppercase bg-blue-100/90 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-700 shrink-0">
              <Info className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>VERSI DEMO</span>
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
              Usaha.in masih dalam tahap demo. Data yang ditampilkan adalah data contoh dan integrasi marketplace belum aktif.
            </p>
          </div>

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900 shadow-xs mb-6 animate-fade-in">
            <Sparkles className="w-3.5 h-3.5 text-blue-500" />
            <span>Sistem Operasional Internal UMKM Terpadu</span>
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
            Kelola pesanan dari marketplace, chat, dan toko offline dalam satu sistem internal. Stok, keuangan, dan laporan terpusat, dilengkapi AI Copilot.
          </p>

          {/* Dual CTA */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <Link
              href="/login"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm shadow-xl shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
            >
              <span>Jelajahi Sistem</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="#fitur"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] hover:bg-[hsl(var(--muted))] font-semibold text-sm transition-all flex items-center justify-center gap-2"
            >
              <Layers className="w-4 h-4 text-blue-500" />
              <span>Lihat Fitur & Alur Kerja</span>
            </a>
          </div>

          {/* Core structural points */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-xs text-[hsl(var(--muted-fg))]">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              4 kanal penjualan terpusat
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              Penugasan akses fleksibel per karyawan
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              Stok, keuangan, dan laporan dalam satu sistem
            </span>
          </div>

          {/* 3. INTERACTIVE HERO APP PREVIEW & FLOW DIAGRAM */}
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
                  className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                    activeTab === "omnichannel"
                      ? "bg-blue-600 text-white font-semibold shadow-xs"
                      : "text-[hsl(var(--muted-fg))] hover:text-[hsl(var(--foreground))]"
                  }`}
                >
                  Alur 4 Kanal
                </button>
                <button
                  onClick={() => setActiveTab("copilot")}
                  className={`px-3 py-1 rounded-md transition-all flex items-center gap-1 cursor-pointer ${
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
                  className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                    activeTab === "kanban"
                      ? "bg-emerald-600 text-white font-semibold shadow-xs"
                      : "text-[hsl(var(--muted-fg))] hover:text-[hsl(var(--foreground))]"
                  }`}
                >
                  Kanban Kirim
                </button>
                <button
                  onClick={() => setActiveTab("finance")}
                  className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
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
                <div className="space-y-6 animate-fade-in">
                  <div>
                    <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white">
                      Diagram Alur Penjualan Multi-Kanal
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Pesanan dari berbagai kanal masuk dan dinormalkan dalam satu sistem internal terpadu.
                    </p>
                  </div>

                  {/* DIAGRAM ALUR */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                    {/* 4 Kanal Input */}
                    <div className="space-y-2.5">
                      <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                        1. Kanal Penjualan
                      </div>
                      <div className="p-3 rounded-xl border border-orange-200 dark:border-orange-800/80 bg-white dark:bg-slate-900 flex items-center justify-between">
                        <span className="text-xs font-bold text-orange-600 dark:text-orange-400">Marketplace A</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300 font-semibold">Online</span>
                      </div>
                      <div className="p-3 rounded-xl border border-emerald-200 dark:border-emerald-800/80 bg-white dark:bg-slate-900 flex items-center justify-between">
                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Marketplace B</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-semibold">Online</span>
                      </div>
                      <div className="p-3 rounded-xl border border-green-200 dark:border-green-800/80 bg-white dark:bg-slate-900 flex items-center justify-between">
                        <span className="text-xs font-bold text-green-600 dark:text-green-400">Chat</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300 font-semibold">Pesan Langsung</span>
                      </div>
                      <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Toko Offline</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold">Fisik</span>
                      </div>
                    </div>

                    {/* Arrow & Center Engine */}
                    <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 text-center space-y-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow-md">
                        <RefreshCw className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-blue-900 dark:text-blue-200">Sistem Pusat Usaha.in</h4>
                        <p className="text-[11px] text-blue-700/70 dark:text-blue-300/70 mt-0.5">
                          Normalisasi data pesanan, nomor resi, & verifikasi pembayaran
                        </p>
                      </div>
                      <div className="flex gap-1 text-[10px] font-semibold text-blue-600 dark:text-blue-400">
                        <span>Input Terpusat</span> • <span>Satu Pintu</span>
                      </div>
                    </div>

                    {/* Output Modules */}
                    <div className="space-y-2.5">
                      <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                        2. Modul Terintegrasi
                      </div>
                      <div className="p-3 rounded-xl border border-indigo-200 dark:border-indigo-800/80 bg-white dark:bg-slate-900 flex items-center gap-3">
                        <Warehouse className="w-4 h-4 text-indigo-500 shrink-0" />
                        <div>
                          <div className="text-xs font-bold text-slate-900 dark:text-white">Buku Besar Stok</div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400">Pemotongan kuantitas produk</div>
                        </div>
                      </div>
                      <div className="p-3 rounded-xl border border-purple-200 dark:border-purple-800/80 bg-white dark:bg-slate-900 flex items-center gap-3">
                        <Truck className="w-4 h-4 text-purple-500 shrink-0" />
                        <div>
                          <div className="text-xs font-bold text-slate-900 dark:text-white">Kanban Pengiriman</div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400">Alur proses kemas & kurir</div>
                        </div>
                      </div>
                      <div className="p-3 rounded-xl border border-emerald-200 dark:border-emerald-800/80 bg-white dark:bg-slate-900 flex items-center gap-3">
                        <BarChart3 className="w-4 h-4 text-emerald-500 shrink-0" />
                        <div>
                          <div className="text-xs font-bold text-slate-900 dark:text-white">Laba Rugi & Keuangan</div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400">Kalkulasi HPP & margin kanal</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "copilot" && (
                <div className="space-y-4 animate-fade-in" id="copilot">
                  <div className="flex items-center gap-3.5 p-4 rounded-xl bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-800 shadow-sm">
                    <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800 flex items-center justify-center shrink-0">
                      <Bot className="w-5 h-5" />
                    </div>
                    <div className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed">
                      <span className="font-bold text-purple-700 dark:text-purple-400">AI Usaha.in Copilot: </span>
                      &ldquo;Peringatan Sistem: Stok <strong>Kopi Arabika 250g</strong> sisa 8 unit (di bawah batas minimum 15 unit). Pembelian terakhir menunjukkan harga modal naik. Segera buat catatan Pembelian ke Supplier Nusantara Kopi.&rdquo;
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs text-slate-500 dark:text-slate-400">Pertanyaan Bisnis:</span>
                    <span className="text-xs px-3 py-1.5 rounded-lg bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 font-medium">
                      Kenapa laba turun minggu ini?
                    </span>
                    <span className="text-xs px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 font-medium">
                      Kanal mana yang marginnya terbaik?
                    </span>
                  </div>
                </div>
              )}

              {activeTab === "kanban" && (
                <div className="space-y-3 animate-fade-in">
                  <div className="text-xs text-slate-500 dark:text-slate-400">Alur Status Pengiriman Terpadu (5 Tahap)</div>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-xs">
                    <div className="p-3 rounded-xl border border-blue-200 dark:border-blue-900 bg-white dark:bg-slate-900 shadow-sm">
                      <div className="font-bold text-blue-600 dark:text-blue-400">Baru</div>
                      <div className="mt-2 text-[11px] p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 font-medium">ORD-001 (Marketplace A)</div>
                    </div>
                    <div className="p-3 rounded-xl border border-amber-200 dark:border-amber-900 bg-white dark:bg-slate-900 shadow-sm">
                      <div className="font-bold text-amber-600 dark:text-amber-400">Diproses</div>
                      <div className="mt-2 text-[11px] p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 font-medium">ORD-002 (Marketplace B)</div>
                    </div>
                    <div className="p-3 rounded-xl border border-purple-200 dark:border-purple-900 bg-white dark:bg-slate-900 shadow-sm">
                      <div className="font-bold text-purple-600 dark:text-purple-400">Dikemas</div>
                      <div className="mt-2 text-[11px] p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 font-medium">ORD-003 (Chat)</div>
                    </div>
                    <div className="p-3 rounded-xl border border-indigo-200 dark:border-indigo-900 bg-white dark:bg-slate-900 shadow-sm">
                      <div className="font-bold text-indigo-600 dark:text-indigo-400">Dikirim</div>
                      <div className="mt-2 text-[11px] p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 font-medium">Resi ekspedisi kurir</div>
                    </div>
                    <div className="p-3 rounded-xl border border-emerald-200 dark:border-emerald-900 bg-white dark:bg-slate-900 shadow-sm">
                      <div className="font-bold text-emerald-600 dark:text-emerald-400">Selesai</div>
                      <div className="mt-2 text-[11px] p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 font-medium">Diterima pembeli</div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "finance" && (
                <div className="space-y-4 animate-fade-in">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                    <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-900 shadow-sm">
                      <div className="text-xs text-blue-600 dark:text-blue-400 font-bold">Total Pendapatan</div>
                      <div className="text-sm font-semibold mt-1 text-slate-700 dark:text-slate-300">Akumulasi seluruh transaksi kanal</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Marketplace A, B, Chat & Offline</div>
                    </div>
                    <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-900 shadow-sm">
                      <div className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">Laba Bersih</div>
                      <div className="text-sm font-semibold mt-1 text-emerald-600 dark:text-emerald-400">Pendapatan − HPP − Admin − Ongkir</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Transparansi margin per produk</div>
                    </div>
                    <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-900 shadow-sm">
                      <div className="text-xs text-purple-600 dark:text-purple-400 font-bold">Biaya & Admin Fee</div>
                      <div className="text-sm font-semibold mt-1 text-slate-700 dark:text-slate-300">HPP Pembelian & Admin Marketplace</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Biaya perantara tercatat rapi</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 4. STATS FACTUAL ROW (Fakta struktural) */}
      <section className="border-y border-[hsl(var(--border))] bg-[hsl(var(--card))]/50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl sm:text-4xl font-black text-blue-600 dark:text-blue-400">4 Kanal</div>
              <div className="text-xs sm:text-sm font-semibold text-[hsl(var(--foreground))] mt-1">Penjualan Terintegrasi</div>
              <div className="text-xs text-[hsl(var(--muted-fg))] mt-0.5">Marketplace A, B, Chat & Offline</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-black text-indigo-600 dark:text-indigo-400">11 Modul</div>
              <div className="text-xs sm:text-sm font-semibold text-[hsl(var(--foreground))] mt-1">Sistem Internal Lengkap</div>
              <div className="text-xs text-[hsl(var(--muted-fg))] mt-0.5">Penjualan, Stok, Keuangan, dll</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-black text-purple-600 dark:text-purple-400">2 Stakeholder</div>
              <div className="text-xs sm:text-sm font-semibold text-[hsl(var(--foreground))] mt-1">Fleksibilitas Hak Akses</div>
              <div className="text-xs text-[hsl(var(--muted-fg))] mt-0.5">Pemilik Usaha & Karyawan (RBAC)</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-black text-emerald-600 dark:text-emerald-400">1 Dashboard</div>
              <div className="text-xs sm:text-sm font-semibold text-[hsl(var(--foreground))] mt-1">Pusat Kendali Bisnis</div>
              <div className="text-xs text-[hsl(var(--muted-fg))] mt-0.5">Ringkasan transaksi & stok terpadu</div>
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
            Tinggalkan pencatatan manual yang terpisah dan rawan selisih
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
                <h4 className="text-lg font-bold text-rose-600 dark:text-rose-400">Sebelum Memakai Usaha.in</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">Cara kerja konvensional & manual</p>
              </div>
            </div>
            <ul className="space-y-4 text-sm text-slate-600 dark:text-slate-300">
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0 mt-2"></span>
                <span>Pesanan dari marketplace, chat, dan offline dicatat manual di buku atau spreadsheet terpisah.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0 mt-2"></span>
                <span>Stok sering habis tiba-tiba karena tidak ada pemantauan batas minimum barang.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0 mt-2"></span>
                <span>Seluruh karyawan bisa melihat data keuangan sensitif karena tidak ada pembatasan hak akses modul.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0 mt-2"></span>
                <span>Perhitungan laba rugi terlambat karena harus merekap banyak nota fisik di akhir bulan.</span>
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
                <p className="text-xs text-slate-500 dark:text-slate-400">Sistem internal terpadu & terorganisir</p>
              </div>
            </div>
            <ul className="space-y-4 text-sm text-slate-800 dark:text-slate-100">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <span><strong>Semua pesanan terpusat:</strong> Stok berkurang secara konsisten pada buku besar persediaan.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <span><strong>AI Usaha.in Copilot:</strong> Memberikan sinyal stok kritis dan rekomendasi pembelian bahan ke supplier.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <span><strong>Hak Akses Bertingkat (RBAC):</strong> Karyawan hanya dapat membuka modul yang ditugaskan pemilik.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <span><strong>Laba Bersih Terhitung:</strong> HPP dan potongan admin per kanal dihitung terstruktur dalam sistem.</span>
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
              Dirancang khusus untuk alur kerja internal bisnis yang fleksibel dan transparan.
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
                Filter transaksi berdasarkan Marketplace A, Marketplace B, Chat, dan Toko Offline. Lengkap dengan pencarian nomor pesanan dan pelacakan status pembayaran lunas.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-sm hover:shadow-md transition-shadow">
              <div className="w-11 h-11 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-4">
                <Warehouse className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold mb-2">Buku Besar Stok Terpusat</h4>
              <p className="text-xs text-[hsl(var(--muted-fg))] leading-relaxed">
                Pantau setiap pergerakan barang masuk dari pembelian supplier dan barang keluar dari penjualan pelanggan. Pencatatan mutasi tertib dan detail.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-sm hover:shadow-md transition-shadow">
              <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
                <Truck className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold mb-2">Papan Kanban Pengiriman</h4>
              <p className="text-xs text-[hsl(var(--muted-fg))] leading-relaxed">
                Klik cepat untuk memindahkan status pengiriman dari Baru, Diproses, Dikemas, Dikirim, hingga Selesai dengan pelacakan nomor pesanan.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-sm hover:shadow-md transition-shadow">
              <div className="w-11 h-11 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4">
                <Shield className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold mb-2">Manajemen Akses Fleksibel (RBAC)</h4>
              <p className="text-xs text-[hsl(var(--muted-fg))] leading-relaxed">
                Pemilik dapat membuat akun karyawan dan menugaskan modul secara fleksibel (Lihat atau Kelola). Seluruh aksi tercatat di log aktivitas.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-6 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-sm hover:shadow-md transition-shadow">
              <div className="w-11 h-11 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold mb-2">Laporan Keuangan & Margin Profit</h4>
              <p className="text-xs text-[hsl(var(--muted-fg))] leading-relaxed">
                Lihat ringkasan laba rugi periodik, total pendapatan, HPP pembelian produk, dan perbandingan profitabilitas per kanal penjualan.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-6 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-sm hover:shadow-md transition-shadow">
              <div className="w-11 h-11 rounded-xl bg-pink-50 dark:bg-pink-950 text-pink-600 dark:text-pink-400 flex items-center justify-center mb-4">
                <Bot className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold mb-2">AI Copilot untuk Analisis Bisnis</h4>
              <p className="text-xs text-[hsl(var(--muted-fg))] leading-relaxed">
                Tanyakan pertanyaan operasional seperti barang yang perlu di-restock, evaluasi penyebab laba turun, dan kanal dengan margin tertinggi.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. PEMILIK & TIM SECTION (Peran Tidak Baku: 2 Stakeholder) */}
      <section id="pemilik-tim" className="py-20 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-900 mb-3">
            <Shield className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Manajemen Akses Fleksibel (RBAC)</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Pemilik Mengatur, Tim Bekerja Sesuai Penugasan
          </h2>
          <p className="mt-3 text-sm text-[hsl(var(--muted-fg))] leading-relaxed">
            Membagi wewenang strategis pemilik usaha dan efisiensi kerja operasional tim secara fleksibel, aman, dan transparan.
          </p>
        </div>

        {/* Dua Kartu Stakeholder Utama */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* 1. Pemilik Usaha */}
          <div className="p-8 rounded-2xl border-2 border-amber-300 dark:border-amber-800 bg-white dark:bg-slate-900 shadow-md space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-3xl">👑</span>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Pemilik Usaha</h3>
                  <p className="text-xs text-amber-600 dark:text-amber-400 font-semibold">Kendali Strategis & Akun Utama</p>
                </div>
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
                Akses Penuh
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Memegang wewenang penuh untuk mengelola struktur tim, memantau kesehatan finansial dan stok produk, serta memanfaatkan asisten pintar AI Copilot.
            </p>
            <div className="space-y-2.5 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
                <Check className="w-4 h-4 text-amber-500 shrink-0" />
                <span>Membuat dan mengelola akun staf secara mandiri</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
                <Check className="w-4 h-4 text-amber-500 shrink-0" />
                <span>Menentukan wewenang per modul dengan opsi izin <strong>Lihat</strong> atau <strong>Kelola</strong></span>
              </div>
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
                <Check className="w-4 h-4 text-amber-500 shrink-0" />
                <span>Menganalisis laporan keuangan, HPP, & laba rugi komprehensif</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
                <Check className="w-4 h-4 text-amber-500 shrink-0" />
                <span>Mendapatkan evaluasi bisnis instan bersama AI Copilot</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
                <Check className="w-4 h-4 text-amber-500 shrink-0" />
                <span>Memantau log aktivitas audit untuk transparansi seluruh operasional</span>
              </div>
            </div>
          </div>

          {/* 2. Karyawan */}
          <div className="p-8 rounded-2xl border-2 border-blue-300 dark:border-blue-800 bg-white dark:bg-slate-900 shadow-md space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-3xl">👥</span>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Karyawan & Tim Kerja</h3>
                  <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold">Akses Operasional Terarah</p>
                </div>
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                Akses Terarah
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Fokus mengeksekusi aktivitas harian pada modul yang ditugaskan pemilik usaha, dengan tampilan bersih tanpa kerumitan akses di luar wewenang.
            </p>
            <div className="space-y-2.5 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
                <Check className="w-4 h-4 text-blue-500 shrink-0" />
                <span>Hanya melihat dan mengakses modul sesuai mandat penugasan</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
                <Check className="w-4 h-4 text-blue-500 shrink-0" />
                <span>Tingkat wewenang presisi: mode <strong>Lihat</strong> data atau <strong>Kelola</strong> operasional</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
                <Check className="w-4 h-4 text-blue-500 shrink-0" />
                <span>Data rahasia (laporan laba rugi, log audit, izin akun) terlindungi otomatis</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
                <Check className="w-4 h-4 text-blue-500 shrink-0" />
                <span>Setiap pembaruan data transaksi tercatat akurat ke riwayat sistem</span>
              </div>
            </div>
          </div>
        </div>

        {/* Alur 3 Langkah Penugasan */}
        <div className="p-8 rounded-2xl bg-[hsl(var(--card))] border border-[hsl(var(--border))] space-y-6">
          <h4 className="text-sm font-bold text-center text-[hsl(var(--foreground))]">
            Alur Penugasan Hak Akses (3 Langkah):
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="p-4 rounded-xl bg-[hsl(var(--muted))] space-y-2">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center mx-auto">
                1
              </div>
              <h5 className="text-xs font-bold">Pemilik Membuat Akun</h5>
              <p className="text-[11px] text-[hsl(var(--muted-fg))] leading-relaxed">
                Pemilik menginput nama, email, dan kata sandi karyawan di modul Manajemen Tim.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[hsl(var(--muted))] space-y-2">
              <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center mx-auto">
                2
              </div>
              <h5 className="text-xs font-bold">Memilih Penugasan Modul</h5>
              <p className="text-[11px] text-[hsl(var(--muted-fg))] leading-relaxed">
                Pemilik menentukan modul apa saja yang boleh diakses dan tingkat izinnya (Lihat / Kelola).
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[hsl(var(--muted))] space-y-2">
              <div className="w-8 h-8 rounded-full bg-purple-600 text-white font-bold text-xs flex items-center justify-center mx-auto">
                3
              </div>
              <h5 className="text-xs font-bold">Karyawan Masuk & Bekerja</h5>
              <p className="text-[11px] text-[hsl(var(--muted-fg))] leading-relaxed">
                Karyawan login dan hanya melihat menu yang relevan dengan tugas harian mereka.
              </p>
            </div>
          </div>

          {/* Chip Contoh Template Penugasan */}
          <div className="pt-4 border-t border-[hsl(var(--border))] flex flex-wrap items-center justify-center gap-2 text-xs">
            <span className="text-[hsl(var(--muted-fg))] font-medium">Contoh template penugasan:</span>
            <span className="px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900 text-blue-700 dark:text-blue-300 font-semibold">
              Penjualan
            </span>
            <span className="px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300 font-semibold">
              Gudang
            </span>
            <span className="px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900 text-amber-700 dark:text-amber-300 font-semibold">
              Pembelian
            </span>
            <span className="px-2.5 py-1 rounded-full bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-900 text-purple-700 dark:text-purple-300 font-semibold">
              Keuangan
            </span>
            <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold">
              Kustom
            </span>
          </div>
        </div>

        {/* CTA Callout */}
        <div className="mt-12 p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-blue-950/40 dark:to-slate-900 border border-blue-200/80 dark:border-blue-900/60 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          <div>
            <h4 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              Coba langsung alur kerja pemilik dan karyawan
            </h4>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
              Gunakan akun contoh untuk mencoba alur kerja pemilik dan karyawan.
            </p>
          </div>
          <Link
            href="/login"
            className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm shadow-md shadow-blue-500/20 transition-all flex items-center gap-2 shrink-0 cursor-pointer"
          >
            <span>Buka Halaman Masuk</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* 8. TAHAP PENGEMBANGAN BERIKUTNYA (Roadmap) */}
      <section className="py-20 sm:py-24 bg-[hsl(var(--muted))]/20 border-t border-[hsl(var(--border))]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-2">
              Rencana Pengembangan
            </h2>
            <h3 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Tahap Pengembangan Berikutnya
            </h3>
            <p className="mt-3 text-sm text-[hsl(var(--muted-fg))]">
              Fokus pengayaan fitur Usaha.in untuk melengkapi kebutuhan integrasi dan skalabilitas UMKM.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-sm flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4">
                  <Globe className="w-5 h-5" />
                </div>
                <h4 className="text-base font-bold mb-2">Integrasi API Marketplace & Chat</h4>
                <p className="text-xs text-[hsl(var(--muted-fg))] leading-relaxed">
                  Penyambungan koneksi langsung API platform e-commerce dan webhook pesan instan untuk pertukaran data dua arah secara terpusat.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[hsl(var(--border))] text-[11px] font-semibold text-blue-600 dark:text-blue-400">
                Tahap 1 • Konektivitas Kanal
              </div>
            </div>

            <div className="p-6 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-sm flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-4">
                  <Cpu className="w-5 h-5" />
                </div>
                <h4 className="text-base font-bold mb-2">Forecasting Penjualan & Stok</h4>
                <p className="text-xs text-[hsl(var(--muted-fg))] leading-relaxed">
                  Penerapan model prediksi kebutuhan restock dan analisis pola musiman penjualan untuk mencegah kekurangan pasokan barang.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[hsl(var(--border))] text-[11px] font-semibold text-purple-600 dark:text-purple-400">
                Tahap 2 • AI Predictive Analytics
              </div>
            </div>

            <div className="p-6 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-sm flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
                  <Database className="w-5 h-5" />
                </div>
                <h4 className="text-base font-bold mb-2">Database Terpusat & Multi-Tenant</h4>
                <p className="text-xs text-[hsl(var(--muted-fg))] leading-relaxed">
                  Arsitektur basis data cloud terpusat dengan isolasi data tingkat UMKM, enkripsi data sensitif, dan backup berkala.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[hsl(var(--border))] text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                Tahap 3 • Infrastruktur Cloud
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 9. FAQ ACCORDION (Tanpa kata demo/simulasi) */}
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
              q: "Bagaimana alur pesanan masuk ke sistem?",
              a: "Pesanan dari tiap kanal penjualan dinormalkan ke satu format data terpusat, lalu secara langsung mempengaruhi pergerakan stok pada buku besar, antrean kanban pengiriman, dan laporan keuangan."
            },
            {
              q: "Apakah karyawan bisa melihat laporan keuangan pemilik?",
              a: "Tidak. Karyawan hanya bisa mengakses modul yang secara eksplisit ditugaskan oleh Pemilik Usaha. Jika modul Keuangan tidak ditugaskan, menu dan data keuangan tidak akan ditampilkan."
            },
            {
              q: "Apakah data saya tersimpan jika browser ditutup?",
              a: "Data contoh disimpan pada penyimpanan lokal peramban Anda dan akan kembali ke kondisi awal setelah halaman dimuat ulang atau tombol reset ditekan."
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

      {/* 10. BIG CALL TO ACTION BANNER */}
      <section className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white p-8 sm:p-14 overflow-hidden shadow-2xl text-center">
          {/* Ambient Glows */}
          <div className="absolute -top-24 -left-24 w-80 h-80 bg-white/10 rounded-full blur-2xl" />
          <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-white/10 rounded-full blur-2xl" />

          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <h3 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
              Kelola Semua Kanal dari Satu Tempat
            </h3>
            <p className="text-sm sm:text-base text-white/80 leading-relaxed">
              Sistem internal terpadu untuk pemilik dan karyawan UMKM dalam memantau penjualan, stok, dan keuangan.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/login"
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-white text-blue-700 font-bold text-sm hover:bg-slate-100 shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Masuk ke Usaha.in</span>
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
