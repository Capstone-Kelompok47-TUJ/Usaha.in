"use client";

import { useStore } from "@/lib/store";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useRouter } from "next/navigation";
import { ChevronDown, Circle, LogOut, Shield, User, ArrowRightLeft } from "lucide-react";
import { useState, useRef, useEffect } from "react";

export function AccountSwitcher() {
  const users = useStore((s) => s.users);
  const setCurrentUser = useStore((s) => s.setCurrentUser);
  const getActiveTenant = useStore((s) => s.getActiveTenant);
  const logout = useStore((s) => s.logout);
  const currentUser = useCurrentUser();
  const activeTenant = getActiveTenant();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [showSwitchSubmenu, setShowSwitchSubmenu] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Tutup dropdown saat klik di luar
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setShowSwitchSubmenu(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Filter hanya pengguna pada tenant aktif
  const currentTenantId = currentUser?.tenantId || activeTenant?.id;
  const activeUsers = users.filter(
    (u) => u.active && (!u.tenantId || u.tenantId === currentTenantId)
  );

  function handleLogout() {
    setOpen(false);
    logout();
    router.push("/login");
  }

  function handleSwitchUser(userId: string) {
    setCurrentUser(userId);
    setOpen(false);
    setShowSwitchSubmenu(false);
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] hover:bg-[hsl(var(--muted))] transition-colors text-sm font-medium shadow-xs cursor-pointer"
        id="account-switcher-btn"
      >
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-xs">
          {currentUser?.name?.charAt(0) ?? "?"}
        </div>
        <div className="text-left hidden sm:block">
          <div className="text-xs font-semibold leading-tight max-w-[120px] truncate">
            {currentUser?.name ?? "—"}
          </div>
          <div className="text-[10px] text-[hsl(var(--muted-fg))] leading-tight">
            {currentUser?.isOwner ? "Pemilik" : currentUser?.template}
          </div>
        </div>
        <ChevronDown
          className={`w-3.5 h-3.5 text-[hsl(var(--muted-fg))] transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-72 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-2xl z-50 py-2 animate-fade-in divide-y divide-[hsl(var(--border))]">
          {/* User profile header */}
          <div className="px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold shrink-0 shadow-sm">
                {currentUser?.name?.charAt(0) ?? "U"}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-sm truncate">{currentUser?.name}</p>
                <p className="text-xs font-mono text-[hsl(var(--muted-fg))] truncate">{currentUser?.loginEmail || (currentUser as any)?.email}</p>
                <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                    <Shield className="w-2.5 h-2.5" />
                    {currentUser?.isOwner ? "Pemilik (Akses Penuh)" : currentUser?.template}
                  </span>
                  {activeTenant && (
                    <span className="text-[10px] text-[hsl(var(--muted-fg))] font-medium">
                      • {activeTenant.name}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Account Switcher Section (Hanya karyawan dalam UMKM aktif) */}
          <div className="py-2 px-2">
            <button
              onClick={() => setShowSwitchSubmenu((v) => !v)}
              className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))] rounded-lg transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <ArrowRightLeft className="w-3.5 h-3.5 text-blue-500" />
                Ganti Akun ({activeTenant?.name || "UMKM"})
              </span>
              <ChevronDown className={`w-3 h-3 text-[hsl(var(--muted-fg))] transition-transform ${showSwitchSubmenu ? "rotate-180" : ""}`} />
            </button>

            {showSwitchSubmenu && (
              <div className="mt-1 space-y-1 pl-2">
                {activeUsers.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => handleSwitchUser(u.id)}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 text-xs rounded-md text-left transition-colors cursor-pointer ${
                      currentUser?.id === u.id
                        ? "bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 font-semibold"
                        : "hover:bg-[hsl(var(--muted))] text-[hsl(var(--muted-fg))] hover:text-[hsl(var(--foreground))]"
                    }`}
                  >
                    <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[10px] font-bold shrink-0">
                      {u.name.charAt(0)}
                    </span>
                    <div className="truncate flex-1">
                      <div className="truncate">{u.name}</div>
                      <div className="text-[9px] font-mono text-[hsl(var(--muted-fg))] truncate">{u.loginEmail}</div>
                    </div>
                    <span className="text-[10px] opacity-70">
                      {u.isOwner ? "Owner" : u.template?.split(" ")[1] ?? u.template}
                    </span>
                    {currentUser?.id === u.id && (
                      <Circle className="w-1.5 h-1.5 fill-blue-500 text-blue-500 shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Logout Action */}
          <div className="p-1.5">
            <button
              onClick={handleLogout}
              id="header-logout-btn"
              className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              Keluar (Logout)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
