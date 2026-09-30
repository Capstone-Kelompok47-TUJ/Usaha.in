"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useStore } from "@/lib/store";
import {
  Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck,
  CheckCircle2, Sparkles, AlertCircle, ArrowLeft,
  Building2, Users, Bot, TrendingUp
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const login = useStore((s) => s.login);
  const isAuthenticated = useStore((s) => s.isAuthenticated);
  const users = useStore((s) => s.users);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    setHasHydrated(true);
  }, []);

  useEffect(() => {
    if (hasHydrated && isAuthenticated) {
      router.push("/dashboard");
    }
  }, [hasHydrated, isAuthenticated, router]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    setTimeout(() => {
      const res = login(email, password);
      if (res.success) {
        router.push("/dashboard");
      } else {
        setError(res.message ?? "Terjadi kesalahan saat masuk.");
        setLoading(false);
      }
    }, 400);
  }

  function handleRoleLogin(userId: string) {
    const targetUser = users.find((u) => u.id === userId);
    if (!targetUser) return;
    setError(null);
    setLoading(true);
    setTimeout(() => {
      const res = login(targetUser.email, targetUser.password);
      if (res.success) {
        router.push("/dashboard");
      } else {
        setError(res.message ?? "Gagal masuk.");
        setLoading(false);
      }
    }, 250);
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[hsl(var(--background))] text-[hsl(var(--foreground))] selection:bg-blue-500 selection:text-white">
      {/* Left Column: Login Form */}
      <div className="flex-1 flex flex-col justify-between p-6 sm:p-10 lg:p-14 max-w-2xl mx-auto w-full">
        {/* Top Header */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-[hsl(var(--muted-fg))] hover:text-blue-600 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            Kembali ke Beranda
          </Link>
          <div className="flex items-center gap-1.5 text-xs text-blue-600 font-semibold px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Versi Demo</span>
          </div>
        </div>

        {/* Center: Main Form Card */}
        <div className="my-auto py-8">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-500/25">
                U
              </div>
              <span className="text-xl font-bold tracking-tight">Usaha.in</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Selamat datang kembali
            </h1>
            <p className="text-sm text-[hsl(var(--muted-fg))] mt-1.5">
              Masuk untuk mengelola seluruh kanal penjualan, stok barang, dan keuangan UMKM Anda.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 flex items-start gap-3 text-red-700 dark:text-red-300 text-sm animate-fade-in">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-500" />
              <div>
                <p className="font-semibold">Gagal masuk</p>
                <p className="text-xs mt-0.5 text-red-600 dark:text-red-400">{error}</p>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[hsl(var(--foreground))] mb-1.5">
                Alamat Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[hsl(var(--muted-fg))] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@usaha.in"
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  id="login-email-input"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-[hsl(var(--foreground))]">
                  Kata Sandi
                </label>
                <button
                  type="button"
                  onClick={() => alert("Untuk mode demo, gunakan kata sandi yang tertera pada kartu akun di bawah.")}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Lupa sandi?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-[hsl(var(--muted-fg))] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-11 py-2.5 text-sm rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  id="login-password-input"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-fg))] hover:text-[hsl(var(--foreground))] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 cursor-pointer select-none text-[hsl(var(--muted-fg))]">
                <input
                  type="checkbox"
                  defaultChecked
                  className="rounded border-[hsl(var(--border))] text-blue-600 focus:ring-blue-500"
                />
                Ingat sesi saya di browser ini
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              id="login-submit-btn"
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-sm shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30 transition-all flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Memverifikasi...</span>
                </>
              ) : (
                <>
                  <span>Masuk ke Dashboard</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>
          </form>

          {/* Demo Instant Role Access — NO credentials or passwords exposed */}
          <div className="mt-8 pt-6 border-t border-[hsl(var(--border))]">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-[hsl(var(--foreground))] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                Uji Coba Peran Demo (1-Klik Masuk):
              </span>
              <span className="text-[11px] text-[hsl(var(--muted-fg))]">
                Pilih peran untuk langsung mencoba
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => handleRoleLogin("owner-1")}
                className="p-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] hover:border-amber-400 hover:bg-amber-50/50 dark:hover:bg-amber-950/20 text-left transition-all group cursor-pointer shadow-xs"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-lg">👑</span>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-[hsl(var(--foreground))] group-hover:text-amber-600 transition-colors truncate">
                      Pemilik Usaha
                    </div>
                    <div className="text-[10px] text-[hsl(var(--muted-fg))] truncate">
                      Akses Penuh & Finansial
                    </div>
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleRoleLogin("emp-sari")}
                className="p-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] hover:border-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-950/20 text-left transition-all group cursor-pointer shadow-xs"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-lg">🛍️</span>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-[hsl(var(--foreground))] group-hover:text-blue-600 transition-colors truncate">
                      Staf Penjualan
                    </div>
                    <div className="text-[10px] text-[hsl(var(--muted-fg))] truncate">
                      Kasir, Order & Pelanggan
                    </div>
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleRoleLogin("emp-budi")}
                className="p-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] hover:border-emerald-400 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 text-left transition-all group cursor-pointer shadow-xs"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-lg">📦</span>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-[hsl(var(--foreground))] group-hover:text-emerald-600 transition-colors truncate">
                      Staf Gudang
                    </div>
                    <div className="text-[10px] text-[hsl(var(--muted-fg))] truncate">
                      Stok, Kirim & Supplier
                    </div>
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleRoleLogin("emp-rina")}
                className="p-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] hover:border-purple-400 hover:bg-purple-50/50 dark:hover:bg-purple-950/20 text-left transition-all group cursor-pointer shadow-xs"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-lg">💳</span>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-[hsl(var(--foreground))] group-hover:text-purple-600 transition-colors truncate">
                      Staf Keuangan
                    </div>
                    <div className="text-[10px] text-[hsl(var(--muted-fg))] truncate">
                      Pembayaran & Laba Rugi
                    </div>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-xs text-[hsl(var(--muted-fg))] text-center pt-4">
          Usaha.in &copy; 2026. Capstone Project Manajemen UMKM Terpadu.
        </div>
      </div>

      {/* Right Column: Visual Branding & Value Proposition */}
      <div className="hidden lg:flex flex-1 relative bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 text-white p-12 overflow-hidden flex-col justify-between border-l border-white/10">
        {/* Ambient Glow Orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Top Feature Pill */}
        <div className="relative z-10 flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 w-fit">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Solusi Manajemen UMKM Terintegrasi</span>
        </div>

        {/* Center Content & Glass Card */}
        <div className="relative z-10 my-auto max-w-lg space-y-8">
          <div>
            <h2 className="text-3xl font-extrabold leading-tight tracking-tight">
              Semua kanal jualan tersinkronisasi rapi tanpa pusing stok selisih.
            </h2>
            <p className="text-white/70 text-sm mt-3 leading-relaxed">
              Mulai dari Shopee, Tokopedia, pesanan WhatsApp hingga kasir toko fisik terintegrasi otomatis dengan sistem reorder cerdas berbasis AI.
            </p>
          </div>

          {/* Interactive Feature Cards */}
          <div className="space-y-3.5">
            <div className="p-4 rounded-2xl bg-white/5 backdrop-blur-lg border border-white/10 flex items-center gap-4 hover:bg-white/10 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400 shrink-0">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold">Integrasi 4 Kanal Sekaligus</h4>
                <p className="text-xs text-white/60">Shopee, Tokopedia, WhatsApp, & Kasir Offline real-time.</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 backdrop-blur-lg border border-white/10 flex items-center gap-4 hover:bg-white/10 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center text-purple-400 shrink-0">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold">Asisten AI Usaha.in Copilot</h4>
                <p className="text-xs text-white/60">Rekomendasi stok menipis & saran reorder otomatis.</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 backdrop-blur-lg border border-white/10 flex items-center gap-4 hover:bg-white/10 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400 shrink-0">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold">Laporan Laba Rugi Otomatis</h4>
                <p className="text-xs text-white/60">Margin keuntungan bersih per produk & kanal jualan.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Social Proof Badge */}
        <div className="relative z-10 flex items-center gap-3 pt-6 border-t border-white/10 text-xs text-white/60">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <span>Platform demo aman dengan dataset 54 transaksi & 10 produk UMKM.</span>
        </div>
      </div>
    </div>
  );
}
