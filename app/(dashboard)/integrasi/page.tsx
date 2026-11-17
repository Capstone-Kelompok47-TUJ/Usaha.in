"use client";

import { useEffect } from "react";
import { redirect } from "next/navigation";
import { Plug } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useCurrentUser } from "@/hooks/useCurrentUser";

const LEGACY_INTEGRATION_KEY = "usaha-in-demo-channel-integrations";
const TENANT_INTEGRATION_PREFIX = "usaha-in-channel-integrations-";

export default function IntegrasiPage() {
  const user = useCurrentUser();

  useEffect(() => {
    const storage = window.localStorage;
    for (let index = storage.length - 1; index >= 0; index -= 1) {
      const key = storage.key(index);
      if (
        key === LEGACY_INTEGRATION_KEY ||
        (key !== null && key.startsWith(TENANT_INTEGRATION_PREFIX))
      ) {
        storage.removeItem(key);
      }
    }
  }, []);

  if (user && !user.isOwner) redirect("/tidak-ada-akses");

  return (
    <DashboardLayout
      title="Integrasi"
      subtitle="Integrasi kanal eksternal belum tersedia"
    >
      <section className="mx-auto max-w-3xl rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 shadow-sm sm:p-8">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[hsl(var(--muted))] text-[hsl(var(--muted-fg))]">
          <Plug className="h-6 w-6" aria-hidden="true" />
        </div>
        <h1 className="mt-5 text-lg font-bold text-[hsl(var(--foreground))]">
          Integrasi kanal belum tersedia
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-[hsl(var(--muted-fg))]">
          Untuk saat ini, catat pesanan dan aktivitas usaha secara manual melalui menu Penjualan.
        </p>
      </section>
    </DashboardLayout>
  );
}