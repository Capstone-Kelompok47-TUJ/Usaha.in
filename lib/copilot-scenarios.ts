// ============================================================
// USAHA.IN — AI Copilot Scenarios (Dynamic Analytics-Driven)
// ============================================================

import { formatRp } from "@/lib/finance";

export interface CopilotScenario {
  triggers: string[];
  response: (ctx: CopilotContext) => string;
}

export interface CopilotContext {
  weeklyRevenue: number;
  weeklyProfit: number;
  monthlyRevenue: number;
  monthlyProfit: number;
  marketplaceAMargin: number;
  marketplaceBMargin: number;
  chatMargin: number;
  offlineMargin: number;
  marketplaceARevenue: number;
  marketplaceBRevenue: number;
  lowStockProducts: string[];
  slowProducts: string[];
  topProducts: string[];
  safeWithdrawAmount: number;
  currentCash: number;
  mandatoryExpenses30: number;
  cashReserve: number;
  overdueReceivables: Array<{ customerName: string; amount: number; days: number }>;
  topExpenseCategories: Array<{ name: string; amount: number; limit?: number; pctOfLimit?: number }>;
  healthScore: number;
  healthStatus: string;
}

export const COPILOT_SCENARIOS: CopilotScenario[] = [
  {
    triggers: ["uang yang aman", "uang aman", "ambil uang", "prive", "tarik uang", "tarik laba", "tarik modal"],
    response: (ctx) => `💵 **Estimasi Uang Aman Ditarik (Prive)**

Berdasarkan kalkulasi posisi kas dan kewajiban 30 hari ke depan:

- **Estimasi Saldo Kas Saat Ini:** ${formatRp(ctx.currentCash)}
- **Biaya Wajib 30 Hari (Operasional + Utang):** -${formatRp(ctx.mandatoryExpenses30)}
- **Cadangan Dana Darurat (10% Omzet 30 Hari):** -${formatRp(ctx.cashReserve)}

👉 **Uang yang AMAN Anda Tarik Sekarang:**
# **${formatRp(ctx.safeWithdrawAmount)}**

${
  ctx.safeWithdrawAmount > 0
    ? "✅ Mengambil nominal ini tidak akan mengganggu kelancaran gaji, sewa, restock barang pokok, maupun pembayaran utang jatuh tempo."
    : "⚠️ Posisi kas saat ini berada di bawah batas aman kewajiban operasional. Sangat disarankan menunda penarikan dana pribadi (prive) hingga piutang tertagih atau omzet bertambah."
}`,
  },
  {
    triggers: ["paling boros", "biaya mana", "kategori biaya", "boros", "pengeluaran terbesar"],
    response: (ctx) => `📊 **Analisis Pengeluaran & Kategori Biaya Terbesar (30 Hari Terakhir)**

${ctx.topExpenseCategories.length > 0
  ? ctx.topExpenseCategories
      .map((cat, i) => {
        const isExceeded = (cat.pctOfLimit ?? 0) > 100;
        return `${i + 1}. **${cat.name}**: ${formatRp(cat.amount)}${
          cat.limit
            ? ` (Batas: ${formatRp(cat.limit)} → ${cat.pctOfLimit}% ${isExceeded ? "🔴 *MELEBIHI BATAS*" : "🟢 *Aman*"})`
            : ""
        }`;
      })
      .join("\n")
  : "Belum ada pengeluaran yang tercatat dalam 30 hari terakhir."}

💡 **Rekomendasi Tindakan:**
- Kategori dengan tanda 🔴 perlu segera diaudit kwitansi dan ditinjau ulang kontrak dengan vendor/supplier.
- Atur batas pengeluaran bulanan di menu **Pengaturan → Batas Pengeluaran** agar mendapat notifikasi real-time jika mendekati batas.`,
  },
  {
    triggers: ["piutang", "jatuh tempo", "belum lunas", "menunggak", "tagihan", "penagihan"],
    response: (ctx) => `⏰ **Daftar Piutang & Tagihan yang Lewat Jatuh Tempo**

${ctx.overdueReceivables.length > 0
  ? `Ditemukan **${ctx.overdueReceivables.length} tagihan** yang perlu segera ditagih:

${ctx.overdueReceivables
  .map((rec, i) => `${i + 1}. 🔴 **${rec.customerName}** — ${formatRp(rec.amount)} (Terlambat ${rec.days} hari)`)
  .join("\n")}

**Total Piutang Tertunggak:** **${formatRp(
      ctx.overdueReceivables.reduce((s, r) => s + r.amount, 0)
    )}**`
  : "✅ **Semua piutang pelanggan tercatat lancar!** Tidak ada tagihan yang melewati batas tanggal jatuh tempo."}

💡 **Saran Penagihan:**
Buka menu **Pembayaran & Piutang** atau klik **Hubungi Pelanggan** untuk mengirimkan ringkasan tagihan ramah melalui WhatsApp.`,
  },
  {
    triggers: ["laba turun", "kenapa laba", "profit turun", "kenapa profit", "penurunan laba"],
    response: (ctx) => `📉 **Diagnosis Profitabilitas Bisnis**

- **Omzet 30 Hari Terakhir:** ${formatRp(ctx.monthlyRevenue)}
- **Laba Bersih 30 Hari:** ${formatRp(ctx.monthlyProfit)}
- **Margin Bersih Aktual:** ${ctx.monthlyRevenue > 0 ? Math.round((ctx.monthlyProfit / ctx.monthlyRevenue) * 100) : 0}%

**Penyebab Utama Penekanan Margin:**
1. Potongan biaya admin marketplace (terutama Shopee ~7.5%).
2. Fluktuasi harga beli bahan/stok dari supplier.
3. Kenaikan biaya operasional di kategori beban penjualan.

💡 **Rekomendasi:** Cek menu **Analitik → Diagnosis Laba (PVM)** untuk melihat dekomposisi efek harga, volume, dan bauran produk per SKU secara presisi.`,
  },
  {
    triggers: ["marketplace paling untung", "kanal paling untung", "paling menguntungkan", "margin terbaik", "margin tertinggi", "shopee atau tokopedia"],
    response: (ctx) => `📊 **Perbandingan Profitabilitas per Kanal Penjualan**

| Kanal | Omzet | Margin Bersih |
|---|---|---|
| 🟠 Shopee | ${formatRp(ctx.marketplaceARevenue)} | ${ctx.marketplaceAMargin}% |
| 🟢 Tokopedia | ${formatRp(ctx.marketplaceBRevenue)} | ${ctx.marketplaceBMargin}% |
| 💬 WhatsApp / Chat | — | ${ctx.chatMargin}% |
| 🏪 Toko Offline | — | ${ctx.offlineMargin}% |

**Kesimpulan:**
- **Tokopedia** memberikan persentase margin tertinggi karena biaya admin lebih rendah.
- **Shopee** menyumbang volume perputaran terbesar, namun margin terpotong biaya layanan & fee promo.
- **WhatsApp & Offline** adalah kanal dengan margin terbersih tanpa potongan pihak ketiga.`,
  },
  {
    triggers: ["restock", "stok menipis", "produk habis", "perlu restock", "kritis"],
    response: (ctx) => `📦 **Produk yang Perlu Di-Restock Segera**

${ctx.lowStockProducts.length > 0
  ? ctx.lowStockProducts.map((p, i) => `${i + 1}. ⚠️ **${p}** — stok berada di bawah batas minimum`).join("\n")
  : "✅ Semua stok produk saat ini berada di atas batas minimum aman."}

**Saran tindakan:**
- Buat Purchase Order (PO) ke supplier utama untuk produk-produk di atas.
- Catat pembelian di menu **Pembelian** agar HPP rata-rata (Moving Average) terbarui otomatis.`,
  },
  {
    triggers: ["skor kesehatan", "kondisi bisnis", "kesehatan usaha", "sehat"],
    response: (ctx) => `🩺 **Skor Kesehatan Usaha Anda: ${ctx.healthScore}/100 (${ctx.healthStatus})**

Skor ini dinilai dari:
1. **Margin Bersih:** ${ctx.monthlyRevenue > 0 ? ((ctx.monthlyProfit / ctx.monthlyRevenue) * 100).toFixed(1) : 0}%
2. **Ketersediaan Kas:** ${formatRp(ctx.currentCash)}
3. **Kelancaran Piutang:** ${ctx.overdueReceivables.length === 0 ? "Sangat Baik" : `${ctx.overdueReceivables.length} invoice tertunda`}
4. **Perputaran Stok:** ${ctx.lowStockProducts.length === 0 ? "Terkendali" : `${ctx.lowStockProducts.length} SKU kritis`}

Kunjungi menu **Analitik → Skor Kesehatan** untuk membaca grafik rincian per pilar!`,
  },
];

export const FALLBACK_RESPONSE =
  "Saya memahami pertanyaan Anda. Berdasarkan data internal Usaha.in, Anda dapat melihat rincian performa di menu Dashboard, Laporan Keuangan, dan Analitik. Ada hal spesifik tentang kas, laba, stok, atau piutang yang ingin Anda ketahui?";

export function findCopilotResponse(input: string, ctx: CopilotContext): string {
  const lower = input.toLowerCase();
  for (const scenario of COPILOT_SCENARIOS) {
    if (scenario.triggers.some((t) => lower.includes(t))) {
      return scenario.response(ctx);
    }
  }
  return FALLBACK_RESPONSE;
}

export const QUICK_QUESTIONS = [
  "Berapa uang yang aman saya ambil?",
  "Kategori biaya mana paling boros?",
  "Piutang mana yang jatuh tempo?",
  "Marketplace mana yang paling untung?",
  "Produk apa yang harus di-restock?",
];
