// ============================================================
// USAHA.IN — AI Copilot Scenarios (Canned Responses)
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
  arabikaBuyPriceOld: number;
  arabikaBuyPriceNew: number;
  marketplaceAAdminFeeOld: number;
  marketplaceAAdminFeeNew: number;
}

export const COPILOT_SCENARIOS: CopilotScenario[] = [
  {
    triggers: ["laba turun", "kenapa laba", "profit turun", "kenapa profit"],
    response: (ctx) => `📉 **Analisis Penurunan Laba Minggu Ini**

Laba bersih minggu ini sebesar **${formatRp(ctx.weeklyProfit)}**, turun sekitar **12%** dibanding minggu lalu.

Dua penyebab utama:

1. **Harga beli Kopi Arabika naik**
   - Minggu lalu: ${formatRp(ctx.arabikaBuyPriceOld)}/unit
   - Sekarang: ${formatRp(ctx.arabikaBuyPriceNew)}/unit
   - Kenaikan HPP: **+${formatRp(ctx.arabikaBuyPriceNew - ctx.arabikaBuyPriceOld)}/unit** (~${Math.round(((ctx.arabikaBuyPriceNew - ctx.arabikaBuyPriceOld) / ctx.arabikaBuyPriceOld) * 100)}%)

2. **Potongan admin Shopee naik**
   - Minggu lalu: ${ctx.marketplaceAAdminFeeOld}%
   - Sekarang: ${ctx.marketplaceAAdminFeeNew}%
   - Shopee menyumbang ~40% dari total pesanan, sehingga dampaknya signifikan.

💡 **Rekomendasi:** Pertimbangkan menaikkan harga jual Kopi Arabika sebesar Rp 5.000–10.000, atau alokasikan lebih banyak stok ke Tokopedia yang biaya adminnya lebih rendah (${ctx.marketplaceBMargin}% margin vs Shopee ${ctx.marketplaceAMargin}% margin).`,
  },
  {
    triggers: ["marketplace paling untung", "kanal paling untung", "paling menguntungkan", "margin terbaik", "margin tertinggi", "shopee atau tokopedia"],
    response: (ctx) => `📊 **Perbandingan Profitabilitas per Kanal (Bulan Ini)**

| Kanal | Omzet | Margin |
|---|---|---|
| 🟠 Shopee | ${formatRp(ctx.marketplaceARevenue)} | ${ctx.marketplaceAMargin}% |
| 🟢 Tokopedia | ${formatRp(ctx.marketplaceBRevenue)} | ${ctx.marketplaceBMargin}% |
| 💬 WhatsApp | — | ${ctx.chatMargin}% |
| 🏪 Toko Offline | — | ${ctx.offlineMargin}% |

**Kesimpulan:**
- **Tokopedia** = margin tertinggi (${ctx.marketplaceBMargin}%) karena biaya admin hanya 3–4%.
- **Shopee** = omzet tertinggi (${formatRp(ctx.marketplaceARevenue)}) tetapi margin lebih tipis (${ctx.marketplaceAMargin}%) karena admin fee 5–8%.
- **WhatsApp & Toko Offline** = margin ${ctx.chatMargin}%–${ctx.offlineMargin}% karena tidak ada potongan perantara platform, namun volume transaksi bertahap.

💡 **Rekomendasi:** Fokus peningkatan penjualan di Tokopedia untuk meningkatkan profitabilitas keseluruhan.`,
  },
  {
    triggers: ["restock", "stok menipis", "produk habis", "perlu restock"],
    response: (ctx) => `📦 **Produk yang Perlu Di-Restock Segera**

${ctx.lowStockProducts.map((p, i) => `${i + 1}. ⚠️ **${p}** — stok di bawah minimum`).join("\n")}

**Saran tindakan:**
- Hubungi supplier untuk produk-produk di atas.
- Prioritaskan Kopi Arabika karena merupakan produk dengan perputaran tinggi dan harga beli sedang naik.
- Pastikan pencatatan pembelian masuk ke sistem agar stok terintegrasi otomatis.`,
  },
  {
    triggers: ["kurang laku", "produk lambat", "slow moving", "tidak laku"],
    response: (ctx) => `📉 **Produk dengan Penjualan Terendah (Bulan Ini)**

${ctx.slowProducts.map((p, i) => `${i + 1}. 🔴 **${p}**`).join("\n")}

**Analisis:**
- Produk-produk ini memiliki perputaran stok paling lambat dalam 30 hari terakhir.
- Kemungkinan penyebab: harga kurang kompetitif, penataan katalog, atau promosi perlu ditingkatkan.

💡 **Rekomendasi:**
- Buat paket bundling dengan produk terlaris.
- Aktifkan ketersediaan di seluruh 4 kanal penjualan (Shopee, Tokopedia, WhatsApp, Offline).
- Pertimbangkan program diskon khusus.`,
  },
  {
    triggers: ["ringkas bulan", "performa bulan", "summary bulan", "laporan bulan"],
    response: (ctx) => `📋 **Ringkasan Performa Bulan Ini**

**💰 Keuangan:**
- Total Omzet: **${formatRp(ctx.monthlyRevenue)}**
- Laba Bersih: **${formatRp(ctx.monthlyProfit)}**
- Margin rata-rata: **${Math.round((ctx.monthlyProfit / ctx.monthlyRevenue) * 100)}%**

**🏆 Produk Terlaris:**
${ctx.topProducts.map((p, i) => `${i + 1}. ${p}`).join("\n")}

**⚠️ Perhatian:**
- ${ctx.lowStockProducts.length} produk stok menipis perlu di-restock.
- Laba minggu terakhir turun ~12% (detail: tanya "Kenapa laba turun minggu ini?").
- Tokopedia adalah kanal paling menguntungkan bulan ini (margin ${ctx.marketplaceBMargin}%).

**📈 Tren:**
- Shopee menyumbang volume omzet terbesar (~40% dari total).
- WhatsApp menunjukkan transaksi stabil dari pelanggan tetap.`,
  },
];

export const FALLBACK_RESPONSE =
  "Pertanyaan ini dapat diajukan sesuai modul data penjualan, stok, dan keuangan internal yang tersedia di Usaha.in.";

/**
 * Cari respons yang cocok berdasarkan input user.
 */
export function findCopilotResponse(
  input: string,
  ctx: CopilotContext
): string {
  const lower = input.toLowerCase();
  for (const scenario of COPILOT_SCENARIOS) {
    if (scenario.triggers.some((t) => lower.includes(t))) {
      return scenario.response(ctx);
    }
  }
  return FALLBACK_RESPONSE;
}

export const QUICK_QUESTIONS = [
  "Kenapa laba turun minggu ini?",
  "Marketplace mana yang paling untung?",
  "Produk apa yang harus di-restock?",
  "Produk mana yang kurang laku?",
  "Ringkas performa bulan ini",
];
