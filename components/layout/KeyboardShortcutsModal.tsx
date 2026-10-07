"use client";

import { X, Keyboard, Command, CornerDownLeft, Sparkles, Plus, Search, ShieldCheck } from "lucide-react";

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function KeyboardShortcutsModal({ isOpen, onClose }: KeyboardShortcutsModalProps) {
  if (!isOpen) return null;

  const shortcuts = [
    {
      keys: ["Ctrl", "K"],
      altKeys: ["⌘", "K"],
      label: "Pencarian Global",
      description: "Cari cepat pesanan, produk, pelanggan, atau pindah menu",
      icon: <Search className="w-4 h-4 text-blue-500" />,
    },
    {
      keys: ["N"],
      label: "Tambah / Input Baru",
      description: "Buka form input transaksi / data baru pada halaman yang aktif",
      icon: <Plus className="w-4 h-4 text-emerald-500" />,
    },
    {
      keys: ["Ctrl", "↵"],
      altKeys: ["⌘", "↵"],
      label: "Simpan Form",
      description: "Simpan formulir atau data yang sedang diedit",
      icon: <CornerDownLeft className="w-4 h-4 text-purple-500" />,
    },
    {
      keys: ["Esc"],
      label: "Tutup Panel / Modal",
      description: "Menutup popup, drawer, dialog, atau membatalkan pencarian",
      icon: <X className="w-4 h-4 text-rose-500" />,
    },
    {
      keys: ["?"],
      altKeys: ["/"],
      label: "Bantuan & Pintasan",
      description: "Menampilkan jendela panduan tombol pintas keyboard ini",
      icon: <Keyboard className="w-4 h-4 text-amber-500" />,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div
        className="relative w-full max-w-lg rounded-2xl bg-[hsl(var(--card))] border border-[hsl(var(--border))] shadow-2xl overflow-hidden animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[hsl(var(--border))] bg-[hsl(var(--muted))]/40">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              <Keyboard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[hsl(var(--foreground))]">
                Pintasan Keyboard & Bantuan
              </h3>
              <p className="text-xs text-[hsl(var(--muted-fg))]">
                Gunakan tombol keyboard untuk kerja lebih cepat dan efisien
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[hsl(var(--muted-fg))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))] transition-colors"
            aria-label="Tutup"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* List of Shortcuts */}
        <div className="p-6 space-y-3 max-h-[60vh] overflow-y-auto">
          {shortcuts.map((sc, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] hover:bg-[hsl(var(--muted))]/50 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0 pr-2">
                <div className="p-2 rounded-lg bg-[hsl(var(--muted))] shrink-0">
                  {sc.icon}
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-[hsl(var(--foreground))] truncate">
                    {sc.label}
                  </div>
                  <div className="text-xs text-[hsl(var(--muted-fg))] truncate">
                    {sc.description}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                {sc.keys.map((k, idx) => (
                  <kbd
                    key={idx}
                    className="px-2.5 py-1 text-xs font-mono font-semibold rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--muted))] text-[hsl(var(--foreground))] shadow-xs"
                  >
                    {k}
                  </kbd>
                ))}
              </div>
            </div>
          ))}

          {/* Quick Tip Box */}
          <div className="mt-4 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-700 dark:text-blue-300 flex items-start gap-3">
            <Sparkles className="w-5 h-5 shrink-0 text-blue-500 mt-0.5" />
            <div>
              <p className="font-semibold mb-0.5">Tips Usaha.in</p>
              <p className="text-blue-600/90 dark:text-blue-300/90 leading-relaxed">
                Anda dapat menekan <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-blue-200 dark:bg-blue-900/50 rounded border border-blue-300 dark:border-blue-700 font-semibold">Ctrl</kbd> + <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-blue-200 dark:bg-blue-900/50 rounded border border-blue-300 dark:border-blue-700 font-semibold">K</kbd> kapan saja untuk mencari transaksi penjualan, nama pelanggan, katalog barang, atau beralih antar menu.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-[hsl(var(--border))] bg-[hsl(var(--muted))]/30 flex items-center justify-between text-xs text-[hsl(var(--muted-fg))]">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Sistem Operasional UMKM Usaha.in</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
