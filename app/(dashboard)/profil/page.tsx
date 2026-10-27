"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageIntro } from "@/components/ui/PageIntro";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useStore } from "@/lib/store";
import { createClient } from "@/lib/supabase/client";
import {
  User as UserIcon,
  KeyRound,
  Shield,
  Building2,
  Mail,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Save,
  Lock,
  BadgeCheck,
} from "lucide-react";

export default function ProfilPage() {
  const currentUser = useCurrentUser();
  const getActiveTenant = useStore((s) => s.getActiveTenant);
  const activeTenant = getActiveTenant();
  const addToast = useStore((s) => s.addToast);
  const updateUserProfile = useStore((s) => s.updateUserProfile);

  // Form State: Info Profil
  const [name, setName] = useState(currentUser?.name ?? "");
  const [username, setUsername] = useState(currentUser?.username ?? "");
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Form State: Kata Sandi
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Sinkronisasi data awal saat currentUser tersedia dan pastikan email sesuai username
  useEffect(() => {
    if (currentUser) {
      if (!name) setName(currentUser.name || "");
      if (!username) setUsername(currentUser.username || "");

      // Jika loginEmail belum sinkron dengan username, sesuaikan di store
      if (
        currentUser.username &&
        currentUser.loginEmail &&
        currentUser.loginEmail.includes("@")
      ) {
        const domain = currentUser.loginEmail.split("@")[1];
        const expectedEmail = `${currentUser.username}@${domain}`;
        if (currentUser.loginEmail !== expectedEmail) {
          updateUserProfile(currentUser.id, {
            username: currentUser.username,
            loginEmail: expectedEmail,
          });
        }
      }
    }
  }, [currentUser]);

  // Handle Update Profile (Nama & Username)
  async function handleUpdateProfile(e: React.FormEvent) {
    e.preventDefault();
    setProfileMessage(null);

    const trimmedName = name.trim();
    const cleanUsername = username.trim().toLowerCase().replace(/[^a-z0-9._@]/g, "");

    if (!trimmedName) {
      setProfileMessage({ type: "error", text: "Nama lengkap tidak boleh kosong." });
      return;
    }

    if (!cleanUsername) {
      setProfileMessage({ type: "error", text: "Username tidak boleh kosong." });
      return;
    }

    // Email otomatis mengikuti username baru
    let newEmail = currentUser?.loginEmail;
    if (currentUser?.loginEmail && currentUser.loginEmail.includes("@")) {
      const domain = currentUser.loginEmail.split("@")[1];
      newEmail = `${cleanUsername}@${domain}`;
    }

    setIsSavingProfile(true);

    try {
      // 1. Update ke Supabase Auth & public.users via API endpoint
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": currentUser?.id || "",
          "x-user-email": currentUser?.loginEmail || "",
        },
        body: JSON.stringify({
          name: trimmedName,
          username: cleanUsername,
          userId: currentUser?.id,
          currentEmail: currentUser?.loginEmail,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Gagal memperbarui profil.");
      }

      const finalEmail = data.user?.loginEmail || data.user?.email || newEmail;

      // 2. Update via Supabase Client langsung jika ada sesi aktif
      try {
        const supabase = createClient();
        await supabase.auth.updateUser({
          email: finalEmail,
          data: {
            name: trimmedName,
            username: cleanUsername,
            email: finalEmail,
          },
        });
      } catch (clientErr) {
        console.warn("Client auth update note:", clientErr);
      }

      // 3. Update Zustand Store lokal
      if (currentUser?.id) {
        updateUserProfile(currentUser.id, {
          name: trimmedName,
          username: cleanUsername,
          loginEmail: finalEmail,
        });
      }

      setProfileMessage({ type: "success", text: "Profil berhasil diperbarui! Email login otomatis disesuaikan." });
      addToast("Profil dan email login Anda berhasil diperbarui.", "success");
    } catch (err: any) {
      setProfileMessage({ type: "error", text: err?.message || "Terjadi kesalahan saat menyimpan profil." });
      addToast(err?.message || "Gagal memperbarui profil.", "error");
    } finally {
      setIsSavingProfile(false);
    }
  }

  // Handle Update Password
  async function handleUpdatePassword(e: React.FormEvent) {
    e.preventDefault();
    setPasswordMessage(null);

    if (newPassword.length < 6) {
      setPasswordMessage({ type: "error", text: "Kata sandi baru minimal harus 6 karakter." });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: "error", text: "Konfirmasi kata sandi tidak cocok." });
      return;
    }

    setIsSavingPassword(true);

    try {
      // 1. Update ke Supabase Auth melalui server API endpoint
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal mengubah kata sandi.");
      }

      // 2. Sinkronkan juga pada client session aktif
      try {
        const supabase = createClient();
        await supabase.auth.updateUser({ password: newPassword });
      } catch (cErr) {
        console.warn("Client auth password sync notice:", cErr);
      }

      setNewPassword("");
      setConfirmPassword("");
      setPasswordMessage({ type: "success", text: "Kata sandi berhasil diubah! Gunakan kata sandi baru untuk login berikutnya." });
      addToast("Kata sandi berhasil diperbarui.", "success");
    } catch (err: any) {
      setPasswordMessage({ type: "error", text: err?.message || "Gagal mengubah kata sandi." });
      addToast(err?.message || "Gagal mengubah kata sandi.", "error");
    } finally {
      setIsSavingPassword(false);
    }
  }

  let userEmail = currentUser?.loginEmail || (currentUser as any)?.email || "—";
  if (currentUser?.username && userEmail.includes("@")) {
    const domain = userEmail.split("@")[1];
    userEmail = `${currentUser.username}@${domain}`;
  }
  const userRole = currentUser?.isOwner ? "Pemilik Usaha" : (currentUser?.template || "Karyawan");

  return (
    <DashboardLayout
      title="Profil Saya"
      subtitle="Kelola informasi akun, nama pengguna, dan keamanan kata sandi"
    >
      <div className="space-y-6 max-w-4xl pb-16 animate-fade-in">
        <PageIntro
          title="Profil Pengguna"
          description="Atur nama tampilan, username login, serta perbarui kata sandi akun Anda untuk menjaga keamanan akses."
          guideTitle="Panduan Profil"
          guideSteps={[
            "Perbarui Nama Lengkap agar dikenali oleh rekan tim di transaksi dan log aktivitas.",
            "Ubah Username jika Anda ingin menggunakan ID login yang lebih singkat dan mudah diingat.",
            "Ganti kata sandi secara berkala dengan minimal 6 karakter demi keamanan akun usaha Anda.",
          ]}
        />

        {/* Ringkasan Akun Card */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white shadow-lg relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 relative z-10">
            <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white text-3xl font-extrabold border border-white/30 shadow-inner shrink-0">
              {currentUser?.name?.charAt(0) ?? "U"}
            </div>
            <div className="min-w-0 flex-1 space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight">{currentUser?.name ?? "—"}</h2>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/20 backdrop-blur-sm border border-white/30 text-white">
                  <Shield className="w-3 h-3" />
                  {userRole}
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-400/20 backdrop-blur-sm border border-emerald-300/40 text-emerald-200">
                  <BadgeCheck className="w-3 h-3" />
                  Aktif
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-blue-100">
                <span className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 opacity-80" />
                  {userEmail}
                </span>
                {activeTenant && (
                  <span className="flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 opacity-80" />
                    {activeTenant.name}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* FORM 1: INFORMASI PROFIL & USERNAME */}
          <div className="p-6 rounded-2xl bg-[hsl(var(--card))] border border-[hsl(var(--border))] shadow-xs space-y-5">
            <div className="flex items-center gap-3 border-b border-[hsl(var(--border))] pb-4">
              <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
                <UserIcon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[hsl(var(--foreground))]">Data Diri & Username</h3>
                <p className="text-xs text-[hsl(var(--muted-fg))] mt-0.5">
                  Informasi nama lengkap dan username akun
                </p>
              </div>
            </div>

            {profileMessage && (
              <div
                className={`p-3.5 rounded-xl text-xs flex items-center gap-2.5 ${
                  profileMessage.type === "success"
                    ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                    : "bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800"
                }`}
              >
                {profileMessage.type === "success" ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0" />
                )}
                <span>{profileMessage.text}</span>
              </div>
            )}

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              {/* Nama Lengkap */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[hsl(var(--foreground))]">
                  Nama Lengkap <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nama Lengkap Anda"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[hsl(var(--input))] bg-[hsl(var(--card))] text-[hsl(var(--foreground))] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
                />
              </div>

              {/* Username */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[hsl(var(--foreground))]">
                  Username (ID Pengguna) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="username"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[hsl(var(--input))] bg-[hsl(var(--card))] text-[hsl(var(--foreground))] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all font-mono"
                />
                <p className="text-[11px] text-[hsl(var(--muted-fg))]">
                  Gunakan huruf kecil, angka, titik, atau garis bawah tanpa spasi.
                </p>
              </div>

              {/* Email Akun (Read-only) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-[hsl(var(--foreground))]">Email Login</label>
                  <span className="text-[10px] text-[hsl(var(--muted-fg))] flex items-center gap-1">
                    <Lock className="w-3 h-3" /> Akun Terikat
                  </span>
                </div>
                <input
                  type="text"
                  disabled
                  value={userEmail}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))] text-[hsl(var(--muted-fg))] text-sm cursor-not-allowed"
                />
              </div>

              {/* Jabatan / Peran */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[hsl(var(--foreground))]">Peran / Hak Akses</label>
                <div className="p-3 rounded-xl bg-[hsl(var(--muted))] border border-[hsl(var(--border))] flex items-center justify-between">
                  <div className="text-xs font-medium text-[hsl(var(--foreground))]">{userRole}</div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-semibold">
                    {currentUser?.isOwner ? "Akses Penuh" : "Akses Terbatas"}
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="w-full px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-colors shadow-sm cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  {isSavingProfile ? "Menyimpan..." : "Simpan Perubahan Data"}
                </button>
              </div>
            </form>
          </div>

          {/* FORM 2: GANTI KATA SANDI (PASSWORD) */}
          <div className="p-6 rounded-2xl bg-[hsl(var(--card))] border border-[hsl(var(--border))] shadow-xs space-y-5">
            <div className="flex items-center gap-3 border-b border-[hsl(var(--border))] pb-4">
              <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[hsl(var(--foreground))]">Ganti Kata Sandi</h3>
                <p className="text-xs text-[hsl(var(--muted-fg))] mt-0.5">
                  Perbarui kata sandi untuk mengamankan akun Anda
                </p>
              </div>
            </div>

            {passwordMessage && (
              <div
                className={`p-3.5 rounded-xl text-xs flex items-center gap-2.5 ${
                  passwordMessage.type === "success"
                    ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                    : "bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800"
                }`}
              >
                {passwordMessage.type === "success" ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0" />
                )}
                <span>{passwordMessage.text}</span>
              </div>
            )}

            <form onSubmit={handleUpdatePassword} className="space-y-4">
              {/* Kata Sandi Baru */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[hsl(var(--foreground))]">
                  Kata Sandi Baru <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimal 6 karakter"
                    className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-[hsl(var(--input))] bg-[hsl(var(--card))] text-[hsl(var(--foreground))] text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-fg))] hover:text-[hsl(var(--foreground))] p-1"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Konfirmasi Kata Sandi */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[hsl(var(--foreground))]">
                  Ulangi Kata Sandi Baru <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Ketik ulang kata sandi baru"
                    className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-[hsl(var(--input))] bg-[hsl(var(--card))] text-[hsl(var(--foreground))] text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-fg))] hover:text-[hsl(var(--foreground))] p-1"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Match Indicator */}
              {newPassword && confirmPassword && (
                <div className="text-xs">
                  {newPassword === confirmPassword ? (
                    <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Kata sandi cocok
                    </span>
                  ) : (
                    <span className="text-red-500 font-medium flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5" /> Kata sandi tidak cocok
                    </span>
                  )}
                </div>
              )}

              {/* Info Keamanan */}
              <div className="p-3.5 rounded-xl bg-[hsl(var(--muted))] border border-[hsl(var(--border))] text-[11px] text-[hsl(var(--muted-fg))] space-y-1 leading-relaxed">
                <div className="font-semibold text-[hsl(var(--foreground))]">Tips Keamanan:</div>
                <p>• Gunakan minimal 6 karakter kombinasi huruf dan angka.</p>
                <p>• Jangan gunakan kata sandi yang mudah ditebak seperti tanggal lahir atau 123456.</p>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSavingPassword || !newPassword || newPassword !== confirmPassword}
                  className="w-full px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-colors shadow-sm cursor-pointer"
                >
                  <KeyRound className="w-4 h-4" />
                  {isSavingPassword ? "Memperbarui..." : "Perbarui Kata Sandi"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
