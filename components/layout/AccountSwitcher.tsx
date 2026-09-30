"use client";

import { useStore } from "@/lib/store";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronDown, LogOut, Shield, Users } from "lucide-react";
import { useState, useRef, useEffect } from "react";

export function AccountSwitcher() {
  const getActiveTenant = useStore((s) => s.getActiveTenant);
  const logout = useStore((s) => s.logout);
  const currentUser = useCurrentUser();
  const activeTenant = getActiveTenant();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Tutup dropdown saat klik di luar
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  function handleLogout() {
    setOpen(false);
    logout();
    router.push("/login");
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] hover:bg-[hsl(var(--muted))] transition-colors text-sm font-medium shadow-xs cursor-pointer"
        id="account-profile-btn"
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
                <p className="text-xs font-mono text-[hsl(var(--muted-fg))] truncate">
                  {currentUser?.loginEmail || (currentUser as any)?.email}
                </p>
                <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
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

          {/* User Quick Links if Owner */}
          {currentUser?.isOwner && (
            <div className="p-1.5">
              <Link
                href="/tim"
                onClick={() => setOpen(false)}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))] rounded-lg transition-colors"
              >
                <Users className="w-3.5 h-3.5 text-blue-500" />
                <span>Kelola Tim & Karyawan</span>
              </Link>
            </div>
          )}

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
