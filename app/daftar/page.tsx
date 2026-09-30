"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useStore } from "@/lib/store";
import {
  Building2, User, CheckCircle2, ArrowRight, ArrowLeft,
  Sparkles, Shield, AlertCircle, Eye, EyeOff, Store,
  Check, Phone, Mail, MapPin, Layers, Lock, Sun, Moon, Info
} from "lucide-react";
import type { BusinessChannel } from "@/types";

export default function DaftarPage() {
  const router = useRouter();
  const registerTenant = useStore((s) => s.registerTenant);
  const checkSlugAvailability = useStore((s) => s.checkSlugAvailability);
  const isAuthenticated = useStore((s) => s.isAuthenticated);

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [dark, setDark] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

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

  // If already authenticated, allow viewing or redirecting
  useEffect(() => {
    if (isAuthenticated) {
      // Optional: keep or redirect if desired
    }
  }, [isAuthenticated]);

  // --- FORM STATE ---
  // Step 1: Data Usaha
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [isSlugEditedManually, setIsSlugEditedManually] = useState(false);
  const [slugStatus, setSlugStatus] = useState<{ available: boolean; message: string } | null>(null);
  const [businessType, setBusinessType] = useState("Kuliner & F&B");
  const [cityProvince, setCityProvince] = useState("");
  const [address, setAddress] = useState("");
  const [businessPhone, setBusinessPhone] = useState("");
  const [channels, setChannels] = useState<BusinessChannel[]>(["marketplace", "chat", "offline"]);
  const [nib, setNib] = useState("");
  const [step1Errors, setStep1Errors] = useState<Record<string, string>>({});

  // Step 2: Akun Pemilik
  const [ownerName, setOwnerName] = useState("");
  const [username, setUsername] = useState("");
  const [isUsernameEditedManually, setIsUsernameEditedManually] = useState(false);
  const [contactEmail, setContactEmail] = useState("");
  const [ownerPhone, setOwnerPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [step2Errors, setStep2Errors] = useState<Record<string, string>>({});

  // Auto slug generator from name
  function slugify(text: string) {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .slice(0, 30);
  }

  // Username formatter from owner name
  function usernameify(text: string) {
    return text
      .toLowerCase()
      .trim()
      .replace(/\s+/g, ".")
      .replace(/[^a-z0-9._]/g, "")
      .slice(0, 30);
  }

  function handleNameChange(val: string) {
    setName(val);
    if (!isSlugEditedManually) {
      const generated = slugify(val);
      setSlug(generated);
      if (generated.length >= 3) {
        const res = checkSlugAvailability(generated);
        setSlugStatus({
          available: res.available,
          message: res.available ? "Kode UMKM tersedia!" : (res.reason ?? "Tidak valid"),
        });
      } else {
        setSlugStatus(null);
      }
    }
  }

  function handleSlugChange(val: string) {
    setIsSlugEditedManually(true);
    const clean = val.toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, 30);
    setSlug(clean);
    if (clean.length >= 3) {
      const res = checkSlugAvailability(clean);
      setSlugStatus({
        available: res.available,
        message: res.available ? "Kode UMKM tersedia!" : (res.reason ?? "Tidak valid"),
      });
    } else {
      setSlugStatus({
        available: false,
        message: "Minimal 3 karakter.",
      });
    }
  }

  function handleOwnerNameChange(val: string) {
    setOwnerName(val);
    if (!isUsernameEditedManually) {
      const generated = usernameify(val);
      setUsername(generated);
    }
  }

  function handleUsernameChange(val: string) {
    setIsUsernameEditedManually(true);
    const clean = val.toLowerCase().replace(/[^a-z0-9._]/g, "").slice(0, 30);
    setUsername(clean);
  }

  function toggleChannel(c: BusinessChannel) {
    if (channels.includes(c)) {
      if (channels.length > 1) {
        setChannels(channels.filter((item) => item !== c));
      }
    } else {
      setChannels([...channels, c]);
    }
  }

  // Password strength helper
  function getPasswordStrength(pwd: string) {
    if (!pwd) return { score: 0, text: "Belum diisi", color: "bg-slate-200" };
    if (pwd.length < 8) return { score: 1, text: "Terlalu Pendek (min. 8)", color: "bg-red-500" };
    const hasLetters = /[a-zA-Z]/.test(pwd);
    const hasNumbers = /[0-9]/.test(pwd);
    const hasSpecial = /[^a-zA-Z0-9]/.test(pwd);

    if (hasLetters && hasNumbers && hasSpecial && pwd.length >= 10) {
      return { score: 3, text: "Sangat Kuat", color: "bg-emerald-500" };
    }
    if ((hasLetters && hasNumbers) || (hasLetters && hasSpecial)) {
      return { score: 2, text: "Sedang", color: "bg-amber-500" };
    }
    return { score: 1, text: "Lemah", color: "bg-orange-500" };
  }

  const pwdStrength = getPasswordStrength(password);

  // Validate Step 1
  function validateStep1(): boolean {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = "Nama UMKM wajib diisi.";
    if (!slug.trim()) {
      errs.slug = "Kode UMKM wajib diisi.";
    } else {
      const check = checkSlugAvailability(slug);
      if (!check.available) {
        errs.slug = check.reason ?? "Kode UMKM tidak valid.";
      }
    }
    if (!cityProvince.trim()) errs.cityProvince = "Kota / Provinsi wajib diisi.";
    if (!businessPhone.trim()) errs.businessPhone = "WhatsApp / Telepon usaha wajib diisi.";
    if (channels.length === 0) errs.channels = "Pilih minimal 1 kanal penjualan.";

    setStep1Errors(errs);
    return Object.keys(errs).length === 0;
  }

  // Validate Step 2
  function validateStep2(): boolean {
    const errs: Record<string, string> = {};
    if (!ownerName.trim()) errs.ownerName = "Nama lengkap pemilik wajib diisi.";
    
    const cleanUser = username.trim().toLowerCase();
    if (!cleanUser) {
      errs.username = "Nama pengguna / awalan email wajib diisi.";
    } else if (!/^[a-z0-9._]{3,30}$/.test(cleanUser)) {
      errs.username = "Hanya huruf kecil, angka, titik, atau garis bawah (3-30 karakter).";
    }

    if (!contactEmail.trim()) {
      errs.contactEmail = "Email kontak asli wajib diisi.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail.trim())) {
      errs.contactEmail = "Format email kontak tidak valid.";
    }

    if (!ownerPhone.trim()) errs.ownerPhone = "Nomor HP pemilik wajib diisi.";
    
    if (!password) {
      errs.password = "Kata sandi wajib diisi.";
    } else if (password.length < 8) {
      errs.password = "Kata sandi minimal 8 karakter.";
    }

    if (password !== confirmPassword) {
      errs.confirmPassword = "Konfirmasi kata sandi tidak cocok.";
    }

    if (!agreeTerms) {
      errs.agreeTerms = "Anda harus menyetujui Syarat & Ketentuan.";
    }

    setStep2Errors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleNextToStep2(e: React.FormEvent) {
    e.preventDefault();
    if (validateStep1()) {
      setStep(2);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function handleNextToStep3(e: React.FormEvent) {
    e.preventDefault();
    if (validateStep2()) {
      setStep(3);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function handleFinalSubmit() {
    setErrorBanner(null);
    setLoading(true);

    const parts = cityProvince.split(",").map((s) => s.trim());
    const city = parts[0] || cityProvince;
    const province = parts[1] || "";

    setTimeout(() => {
      const res = registerTenant(
        {
          name: name.trim(),
          slug: slug.trim().toLowerCase(),
          businessType,
          city,
          province,
          address: address.trim() || undefined,
          phone: businessPhone.trim(),
          channels,
          nib: nib.trim() || undefined,
        },
        {
          name: ownerName.trim(),
          username: username.trim().toLowerCase(),
          contactEmail: contactEmail.trim().toLowerCase(),
          phone: ownerPhone.trim(),
          password,
        }
      );

      if (res.success) {
        router.push("/dashboard");
      } else {
        setErrorBanner(res.message ?? "Pendaftaran gagal. Silakan periksa kembali data Anda.");
        setLoading(false);
      }
    }, 600);
  }

  const generatedLoginEmail = `${username || "nama"}@${slug || "kodeumkm"}.usaha.in`;

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))] selection:bg-blue-600 selection:text-white flex flex-col justify-between">
      {/* Top Header */}
      <header className="border-b border-[hsl(var(--border))] bg-[hsl(var(--card))]/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold shadow-md shadow-blue-500/20">
              U
            </div>
            <div>
              <span className="font-bold text-sm tracking-tight group-hover:text-blue-600 transition-colors">Usaha.in</span>
              <span className="text-[10px] block text-[hsl(var(--muted-fg))] leading-none">Registrasi UMKM</span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleDark}
              className="p-2 rounded-lg text-[hsl(var(--muted-fg))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))] transition-colors"
              title={dark ? "Mode Terang" : "Mode Gelap"}
            >
              {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <span className="text-xs text-[hsl(var(--muted-fg))] hidden sm:inline">Sudah punya akun?</span>
            <Link
              href="/login"
              className="px-3 py-1.5 rounded-lg border border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))] text-xs font-semibold transition-colors"
            >
              Masuk
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12 w-full flex-1">
        {/* Step Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between max-w-md mx-auto relative">
            {/* Background Line */}
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-[hsl(var(--border))] -translate-y-1/2 -z-0" />
            
            {/* Step 1 */}
            <div className="flex flex-col items-center relative z-10">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  step >= 1
                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/30"
                    : "bg-[hsl(var(--muted))] text-[hsl(var(--muted-fg))] border border-[hsl(var(--border))]"
                }`}
              >
                {step > 1 ? <Check className="w-4 h-4" /> : "1"}
              </div>
              <span className="text-[11px] font-semibold mt-1.5 text-slate-700 dark:text-slate-300">
                Data Usaha
              </span>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center relative z-10">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  step >= 2
                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/30"
                    : "bg-[hsl(var(--muted))] text-[hsl(var(--muted-fg))] border border-[hsl(var(--border))]"
                }`}
              >
                {step > 2 ? <Check className="w-4 h-4" /> : "2"}
              </div>
              <span className="text-[11px] font-semibold mt-1.5 text-slate-700 dark:text-slate-300">
                Akun Pemilik
              </span>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center relative z-10">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  step === 3
                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/30"
                    : "bg-[hsl(var(--muted))] text-[hsl(var(--muted-fg))] border border-[hsl(var(--border))]"
                }`}
              >
                3
              </div>
              <span className="text-[11px] font-semibold mt-1.5 text-slate-700 dark:text-slate-300">
                Ringkasan
              </span>
            </div>
          </div>
        </div>

        {/* Global Error Banner */}
        {errorBanner && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 flex items-start gap-3 text-red-700 dark:text-red-300 text-sm animate-fade-in">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-500" />
            <div>
              <p className="font-semibold">Pendaftaran belum dapat diproses</p>
              <p className="text-xs mt-0.5">{errorBanner}</p>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* STEP 1: DATA USAHA */}
        {/* ============================================================ */}
        {step === 1 && (
          <div className="bg-[hsl(var(--card))] rounded-2xl border border-[hsl(var(--border))] shadow-xl p-6 sm:p-8 animate-fade-in">
            <div className="mb-6 pb-4 border-b border-[hsl(var(--border))]">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight">Profil & Identitas Usaha</h1>
              <p className="text-xs sm:text-sm text-[hsl(var(--muted-fg))] mt-1">
                Lengkapi identitas unit UMKM Anda untuk ruang kerja internal yang terisolasi.
              </p>
            </div>

            <form onSubmit={handleNextToStep2} className="space-y-5">
              {/* Nama UMKM */}
              <div>
                <label className="block text-xs font-semibold mb-1.5 text-[hsl(var(--foreground))]">
                  Nama UMKM <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Contoh: Kopi Nusantara Mandiri"
                  className={`w-full px-3.5 py-2.5 rounded-xl border bg-[hsl(var(--background))] text-sm focus:outline-none focus:ring-2 transition-all ${
                    step1Errors.name
                      ? "border-red-500 focus:ring-red-500/30"
                      : "border-[hsl(var(--border))] focus:ring-blue-500/30"
                  }`}
                />
                {step1Errors.name && (
                  <p className="text-xs text-red-500 mt-1">{step1Errors.name}</p>
                )}
              </div>

              {/* Kode UMKM (Slug) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-[hsl(var(--foreground))]">
                    Kode UMKM (Workspace Slug) <span className="text-red-500">*</span>
                  </label>
                  <span className="text-[11px] text-[hsl(var(--muted-fg))]">Digunakan untuk format email & domain</span>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => handleSlugChange(e.target.value)}
                    placeholder="kopinusantara"
                    className={`w-full px-3.5 py-2.5 rounded-xl border bg-[hsl(var(--background))] text-sm font-mono focus:outline-none focus:ring-2 transition-all ${
                      step1Errors.slug || (slugStatus && !slugStatus.available)
                        ? "border-red-500 focus:ring-red-500/30"
                        : slugStatus?.available
                          ? "border-emerald-500 focus:ring-emerald-500/30"
                          : "border-[hsl(var(--border))] focus:ring-blue-500/30"
                    }`}
                  />
                  {slugStatus && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs flex items-center gap-1 font-sans">
                      {slugStatus.available ? (
                        <span className="text-emerald-600 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Tersedia
                        </span>
                      ) : (
                        <span className="text-red-500 font-medium">
                          {slugStatus.message}
                        </span>
                      )}
                    </div>
                  )}
                </div>
                {step1Errors.slug && (
                  <p className="text-xs text-red-500 mt-1">{step1Errors.slug}</p>
                )}
                <p className="text-[11px] text-[hsl(var(--muted-fg))] mt-1">
                  Aturan: 3-30 karakter, huruf kecil, angka, dan tanda hubung (-). Contoh pratinjau: <span className="font-mono text-blue-600">nama@{slug || "kodeumkm"}.usaha.in</span>
                </p>
              </div>

              {/* Jenis Usaha & Kota/Provinsi */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1.5 text-[hsl(var(--foreground))]">
                    Jenis Usaha <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={businessType}
                    onChange={(e) => setBusinessType(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 cursor-pointer"
                  >
                    <option value="Kuliner & F&B">Kuliner & F&B</option>
                    <option value="Fashion & Busana">Fashion & Busana</option>
                    <option value="Elektronik & Gadget">Elektronik & Gadget</option>
                    <option value="Kerajinan & Kriya">Kerajinan & Kriya</option>
                    <option value="Kesehatan & Kecantikan">Kesehatan & Kecantikan</option>
                    <option value="Retail & Toko Kelontong">Retail & Toko Kelontong</option>
                    <option value="Jasa & Servis">Jasa & Servis</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1.5 text-[hsl(var(--foreground))]">
                    Kota / Provinsi <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={cityProvince}
                    onChange={(e) => setCityProvince(e.target.value)}
                    placeholder="Contoh: Bandung, Jawa Barat"
                    className={`w-full px-3.5 py-2.5 rounded-xl border bg-[hsl(var(--background))] text-sm focus:outline-none focus:ring-2 transition-all ${
                      step1Errors.cityProvince
                        ? "border-red-500 focus:ring-red-500/30"
                        : "border-[hsl(var(--border))] focus:ring-blue-500/30"
                    }`}
                  />
                  {step1Errors.cityProvince && (
                    <p className="text-xs text-red-500 mt-1">{step1Errors.cityProvince}</p>
                  )}
                </div>
              </div>

              {/* Alamat Usaha (Opsional) */}
              <div>
                <label className="block text-xs font-semibold mb-1.5 text-[hsl(var(--foreground))]">
                  Alamat Usaha <span className="text-[hsl(var(--muted-fg))] font-normal">(Opsional)</span>
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Contoh: Jl. Riau No. 45 Blok C"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                />
              </div>

              {/* WhatsApp/Telepon Usaha & NIB */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1.5 text-[hsl(var(--foreground))]">
                    WhatsApp / Telepon Usaha <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={businessPhone}
                    onChange={(e) => setBusinessPhone(e.target.value)}
                    placeholder="081234567890"
                    className={`w-full px-3.5 py-2.5 rounded-xl border bg-[hsl(var(--background))] text-sm focus:outline-none focus:ring-2 transition-all ${
                      step1Errors.businessPhone
                        ? "border-red-500 focus:ring-red-500/30"
                        : "border-[hsl(var(--border))] focus:ring-blue-500/30"
                    }`}
                  />
                  {step1Errors.businessPhone && (
                    <p className="text-xs text-red-500 mt-1">{step1Errors.businessPhone}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1.5 text-[hsl(var(--foreground))]">
                    NIB <span className="text-[hsl(var(--muted-fg))] font-normal">(Nomor Induk Berusaha - Opsional)</span>
                  </label>
                  <input
                    type="text"
                    value={nib}
                    onChange={(e) => setNib(e.target.value)}
                    placeholder="13 digit nomor NIB"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  />
                </div>
              </div>

              {/* Kanal Penjualan */}
              <div>
                <label className="block text-xs font-semibold mb-1.5 text-[hsl(var(--foreground))]">
                  Kanal Penjualan Aktif <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { id: "marketplace" as BusinessChannel, label: "Marketplace Online", desc: "Toko e-commerce" },
                    { id: "chat" as BusinessChannel, label: "Pemesanan via Chat", desc: "Pesan instan" },
                    { id: "offline" as BusinessChannel, label: "Toko Offline", desc: "Gerai fisik / Kasir" },
                  ].map((ch) => {
                    const checked = channels.includes(ch.id);
                    return (
                      <label
                        key={ch.id}
                        onClick={() => toggleChannel(ch.id)}
                        className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-2.5 ${
                          checked
                            ? "border-blue-500 bg-blue-50/50 dark:bg-blue-950/30"
                            : "border-[hsl(var(--border))] bg-[hsl(var(--background))]"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => {}}
                          className="mt-0.5 rounded text-blue-600 focus:ring-blue-500"
                        />
                        <div>
                          <div className="text-xs font-bold">{ch.label}</div>
                          <div className="text-[10px] text-[hsl(var(--muted-fg))]">{ch.desc}</div>
                        </div>
                      </label>
                    );
                  })}
                </div>
                {step1Errors.channels && (
                  <p className="text-xs text-red-500 mt-1">{step1Errors.channels}</p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-[hsl(var(--border))] flex items-center justify-end">
                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm shadow-md shadow-blue-500/20 flex items-center gap-2 cursor-pointer"
                >
                  <span>Lanjut ke Akun Pemilik</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ============================================================ */}
        {/* STEP 2: AKUN PEMILIK */}
        {/* ============================================================ */}
        {step === 2 && (
          <div className="bg-[hsl(var(--card))] rounded-2xl border border-[hsl(var(--border))] shadow-xl p-6 sm:p-8 animate-fade-in">
            <div className="mb-6 pb-4 border-b border-[hsl(var(--border))]">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight">Akun Pemilik Utama</h1>
              <p className="text-xs sm:text-sm text-[hsl(var(--muted-fg))] mt-1">
                Akun ini memiliki hak kontrol mutlak untuk mengelola struktur tim dan akses sistem.
              </p>
            </div>

            <form onSubmit={handleNextToStep3} className="space-y-5">
              {/* Nama Lengkap & Username */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1.5 text-[hsl(var(--foreground))]">
                    Nama Lengkap Pemilik <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={ownerName}
                    onChange={(e) => handleOwnerNameChange(e.target.value)}
                    placeholder="Contoh: Lisnuy / Budi Prasetyo"
                    className={`w-full px-3.5 py-2.5 rounded-xl border bg-[hsl(var(--background))] text-sm focus:outline-none focus:ring-2 transition-all ${
                      step2Errors.ownerName
                        ? "border-red-500 focus:ring-red-500/30"
                        : "border-[hsl(var(--border))] focus:ring-blue-500/30"
                    }`}
                  />
                  {step2Errors.ownerName && (
                    <p className="text-xs text-red-500 mt-1">{step2Errors.ownerName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1.5 text-[hsl(var(--foreground))]">
                    Nama Pengguna / Awalan Email Login <span className="text-red-500">*</span>
                  </label>
                  <div className={`flex rounded-xl border overflow-hidden bg-[hsl(var(--background))] focus-within:ring-2 transition-all ${
                    step2Errors.username
                      ? "border-red-500 focus-within:ring-red-500/30"
                      : "border-[hsl(var(--border))] focus-within:ring-blue-500/30"
                  }`}>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => handleUsernameChange(e.target.value)}
                      placeholder="lisnuy"
                      className="w-full px-3.5 py-2.5 text-sm font-mono bg-transparent focus:outline-none"
                    />
                    <span className="inline-flex items-center px-3 py-2 bg-[hsl(var(--muted))]/60 border-l border-[hsl(var(--border))] text-xs font-mono font-semibold text-blue-600 dark:text-blue-400 select-none shrink-0">
                      @{slug || "kodeumkm"}.usaha.in
                    </span>
                  </div>
                  {step2Errors.username ? (
                    <p className="text-xs text-red-500 mt-1">{step2Errors.username}</p>
                  ) : (
                    <p className="text-[11px] text-[hsl(var(--muted-fg))] mt-1">
                      Otomatis dari nama atau sesuaikan nama pengguna yang Anda inginkan.
                    </p>
                  )}
                </div>
              </div>

              {/* Live Email Login Preview Pill */}
              <div className="p-3.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs">
                  <Mail className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                  <span className="text-[hsl(var(--muted-fg))]">Format Email Login Sistem:</span>
                </div>
                <div className="font-mono text-xs font-bold text-blue-700 dark:text-blue-300 bg-white dark:bg-slate-900 px-3 py-1 rounded-lg border border-blue-200 dark:border-blue-800">
                  {generatedLoginEmail}
                </div>
              </div>

              {/* Email Kontak Asli & Nomor HP */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1.5 text-[hsl(var(--foreground))]">
                    Email Kontak Pribadi <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="budi.prasetyo@gmail.com"
                    className={`w-full px-3.5 py-2.5 rounded-xl border bg-[hsl(var(--background))] text-sm focus:outline-none focus:ring-2 transition-all ${
                      step2Errors.contactEmail
                        ? "border-red-500 focus:ring-red-500/30"
                        : "border-[hsl(var(--border))] focus:ring-blue-500/30"
                    }`}
                  />
                  {step2Errors.contactEmail ? (
                    <p className="text-xs text-red-500 mt-1">{step2Errors.contactEmail}</p>
                  ) : (
                    <p className="text-[11px] text-[hsl(var(--muted-fg))] mt-1">
                      Untuk verifikasi penting dan pemulihan akun.
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1.5 text-[hsl(var(--foreground))]">
                    Nomor WhatsApp / HP Pribadi <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={ownerPhone}
                    onChange={(e) => setOwnerPhone(e.target.value)}
                    placeholder="08123456789"
                    className={`w-full px-3.5 py-2.5 rounded-xl border bg-[hsl(var(--background))] text-sm focus:outline-none focus:ring-2 transition-all ${
                      step2Errors.ownerPhone
                        ? "border-red-500 focus:ring-red-500/30"
                        : "border-[hsl(var(--border))] focus:ring-blue-500/30"
                    }`}
                  />
                  {step2Errors.ownerPhone && (
                    <p className="text-xs text-red-500 mt-1">{step2Errors.ownerPhone}</p>
                  )}
                </div>
              </div>

              {/* Password & Konfirmasi */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1.5 text-[hsl(var(--foreground))]">
                    Kata Sandi <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Minimal 8 karakter"
                      className={`w-full px-3.5 py-2.5 pr-10 rounded-xl border bg-[hsl(var(--background))] text-sm focus:outline-none focus:ring-2 transition-all ${
                        step2Errors.password
                          ? "border-red-500 focus:ring-red-500/30"
                          : "border-[hsl(var(--border))] focus:ring-blue-500/30"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-fg))] hover:text-[hsl(var(--foreground))]"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Password Strength Meter */}
                  {password && (
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-[hsl(var(--muted-fg))]">Kekuatan Sandi:</span>
                        <span className="font-semibold">{pwdStrength.text}</span>
                      </div>
                      <div className="h-1.5 w-full bg-[hsl(var(--muted))] rounded-full overflow-hidden">
                        <div
                          className={`h-full ${pwdStrength.color} transition-all duration-300`}
                          style={{ width: `${(pwdStrength.score / 3) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {step2Errors.password && (
                    <p className="text-xs text-red-500 mt-1">{step2Errors.password}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1.5 text-[hsl(var(--foreground))]">
                    Konfirmasi Kata Sandi <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Ketik ulang kata sandi"
                      className={`w-full px-3.5 py-2.5 pr-10 rounded-xl border bg-[hsl(var(--background))] text-sm focus:outline-none focus:ring-2 transition-all ${
                        step2Errors.confirmPassword
                          ? "border-red-500 focus:ring-red-500/30"
                          : "border-[hsl(var(--border))] focus:ring-blue-500/30"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-fg))] hover:text-[hsl(var(--foreground))]"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {step2Errors.confirmPassword && (
                    <p className="text-xs text-red-500 mt-1">{step2Errors.confirmPassword}</p>
                  )}
                </div>
              </div>

              {/* Syarat & Ketentuan Checkbox */}
              <div className="pt-2">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="mt-1 rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-xs text-[hsl(var(--muted-fg))] leading-relaxed">
                    Saya menyetujui <span className="text-blue-600 font-semibold">Syarat & Ketentuan</span> serta Kebijakan Privasi sistem internal Usaha.in.
                  </span>
                </label>
                {step2Errors.agreeTerms && (
                  <p className="text-xs text-red-500 mt-1">{step2Errors.agreeTerms}</p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-[hsl(var(--border))] flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-5 py-2.5 rounded-xl border border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Kembali</span>
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm shadow-md shadow-blue-500/20 flex items-center gap-2 cursor-pointer"
                >
                  <span>Tinjau Ringkasan</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ============================================================ */}
        {/* STEP 3: RINGKASAN & KONFIRMASI */}
        {/* ============================================================ */}
        {step === 3 && (
          <div className="bg-[hsl(var(--card))] rounded-2xl border border-[hsl(var(--border))] shadow-xl p-6 sm:p-8 animate-fade-in space-y-6">
            <div className="pb-4 border-b border-[hsl(var(--border))]">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight">Ringkasan Pendaftaran UMKM</h1>
              <p className="text-xs sm:text-sm text-[hsl(var(--muted-fg))] mt-1">
                Periksa kembali data usaha dan akun pemilik sebelum menyelesaikan pendaftaran.
              </p>
            </div>

            {/* Login Email Highlight Banner */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20 space-y-2">
              <div className="text-xs text-blue-100 font-semibold uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Identitas Masuk Akun Pemilik</span>
              </div>
              <div className="text-lg sm:text-xl font-mono font-black break-all">
                {generatedLoginEmail}
              </div>
              <p className="text-xs text-blue-100/90 leading-relaxed pt-1">
                Gunakan alamat email di atas beserta kata sandi yang Anda buat untuk masuk ke dasbor Usaha.in kapan saja.
              </p>
            </div>

            {/* Detail Tables */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Box 1: Data Usaha */}
              <div className="p-5 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))]/30 space-y-3">
                <div className="flex items-center justify-between border-b border-[hsl(var(--border))] pb-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[hsl(var(--muted-fg))] flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-blue-500" />
                    <span>Unit Usaha</span>
                  </h3>
                  <button
                    onClick={() => setStep(1)}
                    className="text-[11px] text-blue-600 font-semibold hover:underline"
                  >
                    Ubah
                  </button>
                </div>
                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-[hsl(var(--muted-fg))]">Nama UMKM:</span>
                    <p className="font-semibold text-sm">{name}</p>
                  </div>
                  <div>
                    <span className="text-[hsl(var(--muted-fg))]">Kode UMKM:</span>
                    <p className="font-mono font-semibold text-blue-600">{slug}</p>
                  </div>
                  <div>
                    <span className="text-[hsl(var(--muted-fg))]">Jenis Usaha:</span>
                    <p className="font-medium">{businessType}</p>
                  </div>
                  <div>
                    <span className="text-[hsl(var(--muted-fg))]">Lokasi:</span>
                    <p className="font-medium">{cityProvince} {address ? `(${address})` : ""}</p>
                  </div>
                  <div>
                    <span className="text-[hsl(var(--muted-fg))]">Telepon Usaha:</span>
                    <p className="font-medium">{businessPhone}</p>
                  </div>
                  {nib && (
                    <div>
                      <span className="text-[hsl(var(--muted-fg))]">NIB:</span>
                      <p className="font-mono font-medium">{nib}</p>
                    </div>
                  )}
                  <div>
                    <span className="text-[hsl(var(--muted-fg))]">Kanal Penjualan:</span>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {channels.map((c) => (
                        <span key={c} className="px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-semibold text-[10px] uppercase">
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Box 2: Akun Pemilik */}
              <div className="p-5 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))]/30 space-y-3">
                <div className="flex items-center justify-between border-b border-[hsl(var(--border))] pb-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[hsl(var(--muted-fg))] flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Pemilik Utama</span>
                  </h3>
                  <button
                    onClick={() => setStep(2)}
                    className="text-[11px] text-blue-600 font-semibold hover:underline"
                  >
                    Ubah
                  </button>
                </div>
                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-[hsl(var(--muted-fg))]">Nama Pemilik:</span>
                    <p className="font-semibold text-sm">{ownerName}</p>
                  </div>
                  <div>
                    <span className="text-[hsl(var(--muted-fg))]">Nama Pengguna:</span>
                    <p className="font-mono font-semibold">{username}</p>
                  </div>
                  <div>
                    <span className="text-[hsl(var(--muted-fg))]">Email Kontak Asli:</span>
                    <p className="font-medium">{contactEmail}</p>
                  </div>
                  <div>
                    <span className="text-[hsl(var(--muted-fg))]">Nomor HP Pemilik:</span>
                    <p className="font-medium">{ownerPhone}</p>
                  </div>
                  <div>
                    <span className="text-[hsl(var(--muted-fg))]">Hak Akses:</span>
                    <p className="font-semibold text-amber-600 dark:text-amber-400">👑 Pemilik Usaha (Akses Penuh)</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Small Footer Notice */}
            <div className="p-3.5 rounded-xl bg-[hsl(var(--muted))]/60 border border-[hsl(var(--border))] flex items-start gap-2.5 text-xs text-[hsl(var(--muted-fg))]">
              <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                <strong className="text-[hsl(var(--foreground))]">Catatan Penting:</strong> Email login hanya identitas masuk. Notifikasi penting, tagihan, dan reset kata sandi akan dikirim ke email kontak Anda ({contactEmail}).
              </p>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t border-[hsl(var(--border))] flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(2)}
                disabled={loading}
                className="px-5 py-2.5 rounded-xl border border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Kembali</span>
              </button>
              <button
                type="button"
                onClick={handleFinalSubmit}
                disabled={loading}
                className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm shadow-xl shadow-blue-500/25 flex items-center gap-2 cursor-pointer transition-all hover:-translate-y-0.5 disabled:opacity-50"
              >
                {loading ? (
                  <span>Menyiapkan Ruang Kerja...</span>
                ) : (
                  <>
                    <span>Buat Akun UMKM</span>
                    <Sparkles className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[hsl(var(--border))] bg-[hsl(var(--card))] py-6 text-xs text-[hsl(var(--muted-fg))] text-center">
        <p>© 2026 Usaha.in — Sistem Operasional Internal UMKM Terpadu.</p>
      </footer>
    </div>
  );
}
