"use client";

import { useEffect, useState } from "react";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  Check,
  CircleHelp,
  Link2,
  LockKeyhole,
  Mail,
  Phone,
  ShieldCheck,
  X,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Store,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageIntro } from "@/components/ui/PageIntro";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { WhatsAppLogo, ShopeeLogo, TokopediaLogo } from "@/components/icons/BrandLogos";

type Platform = "whatsapp" | "shopee" | "tokopedia";

type PlatformField = {
  key: string;
  label: string;
  placeholder: string;
  type?: "text" | "tel" | "email" | "url";
  helper?: string;
};

type PlatformConfig = {
  name: string;
  shortName: string;
  category: "messaging" | "marketplace";
  categoryLabel: string;
  description: string;
  registerTitle: string;
  registerDescription: string;
  LogoComponent: React.ComponentType<{ className?: string; size?: number }>;
  brandColor: string;
  cardBg: string;
  cardBorder: string;
  badgeStyle: string;
  buttonStyle: string;
  features: string[];
  fields: PlatformField[];
};

const STORAGE_KEY = "usaha-in-demo-channel-integrations";

const CHANNELS: Record<Platform, PlatformConfig> = {
  whatsapp: {
    name: "WhatsApp Business",
    shortName: "WhatsApp",
    category: "messaging",
    categoryLabel: "Chat Commerce",
    description: "Hubungkan WhatsApp Business untuk menerima pesanan, pengiriman invoice otomatis, dan kelola pesan pembeli.",
    registerTitle: "Integrasi WhatsApp Business",
    registerDescription: "Masukkan nomor WhatsApp bisnis aktif yang digunakan untuk menerima dan mengelola pesanan pelanggan.",
    LogoComponent: WhatsAppLogo,
    brandColor: "#25D366",
    cardBg: "bg-gradient-to-b from-emerald-500/10 via-emerald-500/5 to-[hsl(var(--card))] dark:from-emerald-950/40 dark:via-emerald-950/15 dark:to-[hsl(var(--card))]",
    cardBorder: "border-emerald-300 dark:border-emerald-800/70 hover:border-emerald-500 dark:hover:border-emerald-600 shadow-sm shadow-emerald-500/10",
    badgeStyle: "bg-emerald-100/90 text-emerald-800 border-emerald-300 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-800",
    buttonStyle: "bg-[#25D366] hover:bg-[#1fb857] text-white shadow-emerald-500/20",
    features: ["Invoice WhatsApp Otomatis", "Notifikasi Resi Transaksi", "Manajemen Chat Terpusat"],
    fields: [
      { key: "phone", label: "Nomor WhatsApp Business", placeholder: "+62 812-3456-7890", type: "tel", helper: "Gunakan nomor aktif dengan kode negara, contoh: +6281234567890." },
      { key: "businessName", label: "Nama Bisnis di WhatsApp", placeholder: "Toko Sejahtera Utami" },
    ],
  },
  shopee: {
    name: "Shopee Marketplace",
    shortName: "Shopee",
    category: "marketplace",
    categoryLabel: "E-Commerce",
    description: "Sinkronkan toko Shopee Anda untuk pemusatan produk, stok otomatis, dan impor pesanan secara real-time.",
    registerTitle: "Integrasi Toko Shopee",
    registerDescription: "Isi identitas toko Shopee Anda. Pada versi demo ini, otorisasi Seller Centre disimulasikan secara aman.",
    LogoComponent: ShopeeLogo,
    brandColor: "#EE4D2D",
    cardBg: "bg-gradient-to-b from-orange-500/10 via-orange-500/5 to-[hsl(var(--card))] dark:from-orange-950/40 dark:via-orange-950/15 dark:to-[hsl(var(--card))]",
    cardBorder: "border-orange-300 dark:border-orange-800/70 hover:border-orange-500 dark:hover:border-orange-600 shadow-sm shadow-orange-500/10",
    badgeStyle: "bg-orange-100/90 text-orange-800 border-orange-300 dark:bg-orange-950/80 dark:text-orange-300 dark:border-orange-800",
    buttonStyle: "bg-[#EE4D2D] hover:bg-[#d83e20] text-white shadow-orange-500/20",
    features: ["Sinkronisasi Stok Realtime", "Auto-Import Pesanan Baru", "Integrasi Seller Centre"],
    fields: [
      { key: "shopName", label: "Nama Toko Shopee", placeholder: "Toko Sejahtera Official" },
      { key: "shopId", label: "Shop ID Shopee", placeholder: "Contoh: 987654321", helper: "Dapat ditemukan pada menu Profil Toko di Shopee Seller Centre." },
      { key: "sellerEmail", label: "Email Penjual Shopee", placeholder: "pemilik@tokosejahtera.com", type: "email", helper: "Jangan masukkan kata sandi akun Anda." },
    ],
  },
  tokopedia: {
    name: "Tokopedia Seller",
    shortName: "Tokopedia",
    category: "marketplace",
    categoryLabel: "E-Commerce",
    description: "Hubungkan toko Tokopedia untuk sinkronisasi pesanan terpusat, pengiriman resi otomatis, dan inventori stok.",
    registerTitle: "Integrasi Toko Tokopedia",
    registerDescription: "Lengkapi informasi toko Tokopedia Seller Anda untuk menghubungkannya ke ekosistem Usaha.in.",
    LogoComponent: TokopediaLogo,
    brandColor: "#03AC0E",
    cardBg: "bg-gradient-to-b from-green-500/10 via-green-500/5 to-[hsl(var(--card))] dark:from-green-950/40 dark:via-green-950/15 dark:to-[hsl(var(--card))]",
    cardBorder: "border-green-300 dark:border-green-800/70 hover:border-green-500 dark:hover:border-green-600 shadow-sm shadow-green-500/10",
    badgeStyle: "bg-green-100/90 text-green-800 border-green-300 dark:bg-green-950/80 dark:text-green-300 dark:border-green-800",
    buttonStyle: "bg-[#03AC0E] hover:bg-[#02920c] text-white shadow-green-500/20",
    features: ["Kelola Multi-Varian", "Sinkron Resi Otomatis", "Rekap Penjualan Terpadu"],
    fields: [
      { key: "storeName", label: "Nama Toko Tokopedia", placeholder: "Toko Sejahtera Indonesia" },
      { key: "storeUrl", label: "URL Domain Toko", placeholder: "https://www.tokopedia.com/tokosejahtera", type: "url", helper: "Salin alamat link toko dari halaman profil Tokopedia Anda." },
      { key: "accountEmail", label: "Email Penjual Tokopedia", placeholder: "pemilik@tokosejahtera.com", type: "email", helper: "Gunakan email akun toko. Sandi akun Anda tidak pernah diminta." },
    ],
  },
};

const DEFAULT_VALUES: Record<Platform, Record<string, string>> = {
  whatsapp: { phone: "", businessName: "" },
  shopee: { shopName: "", shopId: "", sellerEmail: "" },
  tokopedia: { storeName: "", storeUrl: "", accountEmail: "" },
};

const EMPTY_CONNECTIONS: Record<Platform, string | null> = {
  whatsapp: null,
  shopee: null,
  tokopedia: null,
};

interface DemoSettings {
  values: Record<Platform, Record<string, string>>;
  connectedAt: Record<Platform, string | null>;
}

export default function IntegrasiPage() {
  const user = useCurrentUser();
  const [settings, setSettings] = useState<DemoSettings>({
    values: DEFAULT_VALUES,
    connectedAt: EMPTY_CONNECTIONS,
  });
  const [hasLoadedSettings, setHasLoadedSettings] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | null>(null);
  const [error, setError] = useState("");
  const [whatsappCodeSent, setWhatsappCodeSent] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved) as Partial<DemoSettings>;
          setSettings({
            values: {
              whatsapp: { ...DEFAULT_VALUES.whatsapp, ...parsed.values?.whatsapp },
              shopee: { ...DEFAULT_VALUES.shopee, ...parsed.values?.shopee },
              tokopedia: { ...DEFAULT_VALUES.tokopedia, ...parsed.values?.tokopedia },
            },
            connectedAt: { ...EMPTY_CONNECTIONS, ...parsed.connectedAt },
          });
        }
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      } finally {
        setHasLoadedSettings(true);
      }
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (hasLoadedSettings) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    }
  }, [hasLoadedSettings, settings]);

  if (!user?.isOwner) redirect("/tidak-ada-akses");

  const connectedCount = Object.values(settings.connectedAt).filter(Boolean).length;
  const activeChannel = selectedPlatform ? CHANNELS[selectedPlatform] : null;

  function openRegistration(platform: Platform) {
    setSelectedPlatform(platform);
    setError("");
    setNotice("");
    setWhatsappCodeSent(false);
    setVerificationCode("");
  }

  function closeRegistration() {
    setSelectedPlatform(null);
    setError("");
    setNotice("");
  }

  function updateField(platform: Platform, field: string, value: string) {
    setSettings((current) => ({
      ...current,
      values: {
        ...current.values,
        [platform]: { ...current.values[platform], [field]: value },
      },
    }));
    setError("");
  }

  function submitRegistration(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedPlatform) return;

    if (selectedPlatform === "whatsapp") {
      const phone = settings.values.whatsapp.phone.trim();
      if (!/^\+?[\d\s()-]{9,18}$/.test(phone)) {
        setError("Format nomor WhatsApp belum sesuai. Sertakan kode negara (misal +62).");
        return;
      }
      if (!whatsappCodeSent) {
        setError("Silakan klik 'Kirim Kode Demo' untuk mengirim simulasi kode OTP.");
        return;
      }
      if (verificationCode !== "123456") {
        setError("Kode verifikasi salah! Untuk mode demo, gunakan kode: 123456");
        return;
      }
    }

    setSettings((current) => ({
      ...current,
      connectedAt: {
        ...current.connectedAt,
        [selectedPlatform]: new Date().toISOString(),
      },
    }));
    setNotice(`Kanal ${CHANNELS[selectedPlatform].name} berhasil terhubung.`);
    closeRegistration();
  }

  function disconnectChannel(platform: Platform) {
    setSettings((current) => ({
      ...current,
      connectedAt: { ...current.connectedAt, [platform]: null },
    }));
    setNotice(`Kanal ${CHANNELS[platform].shortName} telah diputuskan.`);
  }

  const platformKeys: Platform[] = ["whatsapp", "shopee", "tokopedia"];

  return (
    <DashboardLayout
      title="Integrasi & Kanal Penjualan"
      subtitle="Hubungkan WhatsApp, Shopee, dan Tokopedia untuk pengelolaan pesanan terpusat"
    >
      <div className="mx-auto max-w-6xl space-y-7 animate-fade-in pb-12">
        <PageIntro
          title="Integrasi Kanal Penjualan"
          description="Hubungkan nomor WhatsApp Business serta akun toko Shopee & Tokopedia untuk sentralisasi pesanan dan otomatisasi stok."
          guideTitle="Panduan Integrasi Kanal"
          guideSteps={[
            "Pilih kanal penjualan yang ingin dihubungkan (WhatsApp, Shopee, atau Tokopedia).",
            "Klik tombol 'Hubungkan' dan lengkapi data identitas toko/nomor WhatsApp bisnis Anda.",
            "Untuk WhatsApp, simulasikan pengiriman kode verifikasi OTP (gunakan kode demo 123456).",
            "Setelah terhubung, transaksi dari kanal tersebut akan terpusat di halaman Penjualan dan stok berkurang otomatis.",
          ]}
        />

        {/* Sleek Header Banner Card */}
        <section className="relative overflow-hidden rounded-2xl border border-indigo-200/80 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 text-white shadow-lg dark:border-indigo-800/60 sm:p-7">
          <div className="pointer-events-none absolute -right-12 -top-16 h-48 w-48 rounded-full bg-indigo-500/20 blur-3xl" />
          
          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="max-w-2xl space-y-2">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-indigo-400/30 bg-indigo-500/20 px-3 py-1 text-xs font-semibold text-indigo-200">
                <ShieldCheck className="h-3.5 w-3.5 text-indigo-300" />
                <span>Hak Akses Pemilik Bisnis</span>
                <span className="h-1 w-1 rounded-full bg-indigo-300" />
                <span className="text-emerald-300 font-medium">Auto Sync</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                Kelola Semua Kanal Penjualan dalam Satu Dashboard
              </h1>
              <p className="text-xs sm:text-sm text-indigo-100/80 leading-relaxed">
                Pusatkan pesanan, pembaruan stok otomatis, dan notifikasi transaksi dari WhatsApp, Shopee, dan Tokopedia secara real-time.
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-3.5 rounded-xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur-md">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-300">
                <Link2 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xl font-black leading-none text-white">
                  {connectedCount} <span className="text-xs font-normal text-indigo-200">/ 3</span>
                </p>
                <p className="mt-1 text-[11px] font-medium text-emerald-300">Kanal Terhubung</p>
              </div>
            </div>
          </div>
        </section>

        {/* Notice Notification Toast */}
        {notice && (
          <div role="status" className="flex items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50/90 px-4 py-3 text-xs text-emerald-900 shadow-sm transition dark:border-emerald-900/60 dark:bg-emerald-950/60 dark:text-emerald-200">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <span className="font-semibold">{notice}</span>
            </div>
            <button type="button" onClick={() => setNotice("")} className="rounded-lg p-1 hover:bg-emerald-100 dark:hover:bg-emerald-900/40" aria-label="Tutup pemberitahuan">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Section Heading */}
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between border-b border-[hsl(var(--border))] pb-3">
          <div>
            <h2 className="text-base font-extrabold tracking-tight">Pilihan Kanal Penjualan</h2>
            <p className="text-xs text-[hsl(var(--muted-fg))]">Daftarkan kanal satu per satu untuk mulai sinkronisasi pesanan terpusat.</p>
          </div>
          <span className="text-xs font-semibold text-[hsl(var(--muted-fg))] bg-[hsl(var(--muted))] px-3 py-1 rounded-full border border-[hsl(var(--border))] shrink-0 self-start sm:self-auto">
            3 Kanal Penjualan
          </span>
        </div>

        {/* Integration Cards Grid with Subtle Brand Background Colors & Borders */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {platformKeys.map((platformKey) => {
            const channel = CHANNELS[platformKey];
            const LogoComponent = channel.LogoComponent;
            const isConnected = Boolean(settings.connectedAt[platformKey]);
            const connectedDate = settings.connectedAt[platformKey]
              ? new Date(settings.connectedAt[platformKey]!).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })
              : null;

            return (
              <article
                key={platformKey}
                className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border ${channel.cardBg} ${channel.cardBorder} p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg`}
              >
                {/* Brand Color Top Accent Bar */}
                <div className="absolute inset-x-0 top-0 h-1.5 opacity-90" style={{ backgroundColor: channel.brandColor }} />

                <div className="space-y-4 pt-1">
                  {/* Card Header with Official Logo Banner */}
                  <div className="flex items-start justify-between gap-3 border-b border-[hsl(var(--border))]/70 pb-4">
                    <div className="flex flex-col justify-center min-h-[52px] gap-1.5">
                      <div className="flex items-center gap-2">
                        {platformKey === "whatsapp" ? (
                          <div className="flex items-center gap-2">
                            <LogoComponent className="h-8 w-auto" />
                            <span className="text-lg font-black tracking-tight text-[hsl(var(--foreground))]">WhatsApp</span>
                          </div>
                        ) : (
                          <LogoComponent className="h-8 w-auto max-w-[140px] object-contain" />
                        )}
                      </div>
                      <span className="text-[11px] font-semibold text-[hsl(var(--muted-fg))]">
                        {channel.categoryLabel}
                      </span>
                    </div>

                    {/* Status Badge */}
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold shrink-0 ${
                        isConnected
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                          : "bg-[hsl(var(--card))]/80 text-[hsl(var(--muted-fg))] border border-[hsl(var(--border))]"
                      }`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${isConnected ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`} />
                      {isConnected ? "Terhubung" : "Belum Terdaftar"}
                    </span>
                  </div>

                  {/* Channel Description */}
                  <p className="text-xs leading-relaxed text-[hsl(var(--muted-fg))] min-h-[36px]">
                    {channel.description}
                  </p>

                  {/* Connected Details Preview */}
                  {isConnected ? (
                    <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/80 p-3.5 space-y-2 text-xs dark:border-emerald-900/40 dark:bg-emerald-950/40">
                      <div className="flex items-center justify-between text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
                        <span className="flex items-center gap-1">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Terdaftar & Aktif
                        </span>
                        {connectedDate && <span className="text-[10px] text-[hsl(var(--muted-fg))] font-normal">{connectedDate}</span>}
                      </div>

                      {platformKey === "whatsapp" && (
                        <div className="space-y-1 text-xs">
                          <p className="truncate"><span className="text-[hsl(var(--muted-fg))]">Nomor:</span> <strong className="font-bold">{settings.values.whatsapp.phone || "-"}</strong></p>
                          <p className="truncate"><span className="text-[hsl(var(--muted-fg))]">Bisnis:</span> {settings.values.whatsapp.businessName || "-"}</p>
                        </div>
                      )}

                      {platformKey === "shopee" && (
                        <div className="space-y-1 text-xs">
                          <p className="truncate"><span className="text-[hsl(var(--muted-fg))]">Toko:</span> <strong className="font-bold">{settings.values.shopee.shopName || "-"}</strong></p>
                          <p className="truncate"><span className="text-[hsl(var(--muted-fg))]">Shop ID:</span> {settings.values.shopee.shopId || "-"}</p>
                        </div>
                      )}

                      {platformKey === "tokopedia" && (
                        <div className="space-y-1 text-xs">
                          <p className="truncate"><span className="text-[hsl(var(--muted-fg))]">Toko:</span> <strong className="font-bold">{settings.values.tokopedia.storeName || "-"}</strong></p>
                          <p className="truncate text-[11px] text-blue-600 dark:text-blue-400 font-medium">{settings.values.tokopedia.storeUrl || "-"}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Feature Chips */
                    <div className="space-y-2 pt-1">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-[hsl(var(--muted-fg))]">Fitur Integrasi:</p>
                      <div className="flex flex-wrap gap-1.5">
                        {channel.features.map((ft, idx) => (
                          <span key={idx} className="inline-flex items-center gap-1.5 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))]/90 px-2.5 py-1 text-[11px] font-semibold text-[hsl(var(--foreground))] shadow-2xs">
                            <Sparkles className="h-3 w-3 text-indigo-500 shrink-0" />
                            {ft}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Action Buttons */}
                <div className="pt-6 space-y-2">
                  <button
                    type="button"
                    onClick={() => openRegistration(platformKey)}
                    className={`inline-flex w-full items-center justify-center gap-2 rounded-xl py-3 px-4 text-xs font-bold shadow-md transition-all active:scale-[0.98] ${channel.buttonStyle}`}
                  >
                    {isConnected ? "Kelola & Ubah Data" : `Hubungkan ${channel.shortName}`}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>

                  {isConnected && (
                    <button
                      type="button"
                      onClick={() => disconnectChannel(platformKey)}
                      className="w-full rounded-xl py-2 text-[11px] font-semibold text-red-500 transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30"
                    >
                      Putuskan Kanal Demo
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>

        {/* Benefits Overview Cards */}
        <section className="grid grid-cols-1 gap-4 lg:grid-cols-3 pt-2">
          <div className="flex items-start gap-3.5 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 shadow-sm">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
              <LockKeyhole className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold">Keamanan Otorisasi Seller</h3>
              <p className="mt-1 text-xs text-[hsl(var(--muted-fg))] leading-relaxed">
                Usaha.in menggunakan sistem teraman tanpa meminta kata sandi akun toko Anda.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 shadow-sm">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              <RefreshCw className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold">Stok & Pesanan Terpusat</h3>
              <p className="mt-1 text-xs text-[hsl(var(--muted-fg))] leading-relaxed">
                Pesanan baru dari Shopee, Tokopedia, & WhatsApp otomatis memperbarui stok toko.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 shadow-sm">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
              <CircleHelp className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold">Catatan Mode Simulasi Demo</h3>
              <p className="mt-1 text-xs text-[hsl(var(--muted-fg))] leading-relaxed">
                Pendaftaran di halaman ini menyimpan data simulasi di browser untuk keperluan pengujian UI.
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* Modal Pendaftaran */}
      {selectedPlatform && activeChannel && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center p-4"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeRegistration();
          }}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm animate-fade-in" />

          {/* Modal Content Dialog */}
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="registration-title"
            className="relative z-10 my-auto max-h-[calc(100vh-2rem)] w-full max-w-lg overflow-hidden rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-2xl animate-fade-in"
          >
            {/* Modal Brand Header */}
            <div className="relative p-6 border-b border-[hsl(var(--border))] bg-[hsl(var(--background))]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3.5">
                  {selectedPlatform === "whatsapp" ? (
                    <div className="flex items-center gap-2">
                      <activeChannel.LogoComponent className="h-9 w-auto" />
                      <span className="text-xl font-black tracking-tight text-[hsl(var(--foreground))]">WhatsApp</span>
                    </div>
                  ) : (
                    <activeChannel.LogoComponent className="h-9 w-auto max-w-[150px] object-contain" />
                  )}
                  <div>
                    <h2 id="registration-title" className="text-base font-bold tracking-tight">
                      {activeChannel.registerTitle}
                    </h2>
                    <p className="text-[11px] text-[hsl(var(--muted-fg))]">Formulir Pendaftaran Kanal</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={closeRegistration}
                  aria-label="Tutup form"
                  className="rounded-xl p-2 text-[hsl(var(--muted-fg))] transition hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))]"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={submitRegistration} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <p className="text-xs leading-relaxed text-[hsl(var(--muted-fg))] bg-[hsl(var(--muted))]/60 p-3.5 rounded-2xl border border-[hsl(var(--border))]">
                {activeChannel.registerDescription}
              </p>

              {activeChannel.fields.map((field) => {
                const FieldIcon = field.type === "email" ? Mail : field.type === "tel" ? Phone : field.type === "url" ? ExternalLink : Store;
                return (
                  <div key={field.key} className="space-y-1.5">
                    <label htmlFor={`registration-${selectedPlatform}-${field.key}`} className="block text-xs font-bold">
                      {field.label} <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <FieldIcon className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[hsl(var(--muted-fg))]" />
                      <input
                        id={`registration-${selectedPlatform}-${field.key}`}
                        type={field.type ?? "text"}
                        value={settings.values[selectedPlatform][field.key] ?? ""}
                        onChange={(event) => updateField(selectedPlatform, field.key, event.target.value)}
                        placeholder={field.placeholder}
                        autoComplete="off"
                        required
                        className="w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] py-2.5 pl-10 pr-3.5 text-xs font-semibold transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      />
                    </div>
                    {field.helper && <p className="text-[10px] text-[hsl(var(--muted-fg))]">{field.helper}</p>}
                  </div>
                );
              })}

              {/* Special WhatsApp Verification Section */}
              {selectedPlatform === "whatsapp" && (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 space-y-3 dark:border-emerald-900/60 dark:bg-emerald-950/30">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-xs font-bold text-emerald-950 dark:text-emerald-200">Verifikasi OTP Simulasi</h3>
                      <p className="text-[10px] text-emerald-800/80 dark:text-emerald-300/80 mt-0.5">
                        {whatsappCodeSent ? "Kode simulasi OTP dikirim! Gunakan 123456 untuk melanjutkan." : "Klik tombol di kanan untuk mensimulasikan pengiriman kode."}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setWhatsappCodeSent(true);
                        setError("");
                      }}
                      className="shrink-0 rounded-xl border border-emerald-300 bg-white px-3 py-1.5 text-[11px] font-bold text-emerald-800 shadow-sm transition hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-200"
                    >
                      {whatsappCodeSent ? "Kirim Ulang Kode" : "Kirim Kode Demo"}
                    </button>
                  </div>

                  {whatsappCodeSent && (
                    <div className="pt-1 space-y-1.5">
                      <label htmlFor="whatsapp-demo-code" className="block text-xs font-bold">
                        Masukkan Kode OTP Demo (123456)
                      </label>
                      <input
                        id="whatsapp-demo-code"
                        inputMode="numeric"
                        maxLength={6}
                        value={verificationCode}
                        onChange={(event) => setVerificationCode(event.target.value.replace(/\D/g, ""))}
                        placeholder="123456"
                        className="w-full rounded-xl border border-emerald-300 bg-white px-3 py-2.5 text-center text-sm font-black tracking-[0.4em] text-emerald-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 dark:bg-slate-900 dark:text-emerald-300 dark:border-emerald-800"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Security Hint */}
              {(selectedPlatform === "shopee" || selectedPlatform === "tokopedia") && (
                <div className="flex items-start gap-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 p-3 text-[10px] text-[hsl(var(--muted-fg))] leading-relaxed">
                  <LockKeyhole className="h-4 w-4 shrink-0 text-indigo-500 mt-0.5" />
                  <p>
                    Form pendaftaran ini hanya mencatat identitas toko untuk simulasi. Kredensial kata sandi akun Anda tidak pernah diminta.
                  </p>
                </div>
              )}

              {/* Error Alert */}
              {error && (
                <div role="alert" className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300">
                  <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
                  <span>{error}</span>
                </div>
              )}

              {/* Actions Footer */}
              <div className="flex flex-col-reverse gap-2 border-t border-[hsl(var(--border))] pt-4 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeRegistration}
                  className="rounded-xl border border-[hsl(var(--border))] px-4 py-2.5 text-xs font-bold hover:bg-[hsl(var(--muted))]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-500/20 transition hover:bg-indigo-700 active:scale-[0.98]"
                >
                  <Check className="h-4 w-4" />
                  {settings.connectedAt[selectedPlatform] ? "Simpan Perubahan" : "Hubungkan Kanal Sekarang"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </DashboardLayout>
  );
}
