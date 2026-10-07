// ============================================================
// USAHA.IN — Kamus Istilah Ramah UMKM (Glossary)
// ============================================================

export interface GlossaryItem {
  key: string;
  simpleTerm: string;      // Teks istilah ramah UMKM yang tampil di UI
  technicalTerm: string;   // Istilah teknis / akuntansi asli
  tooltip: string;         // Penjelasan 1-2 kalimat sederhana
}

export const GLOSSARY: Record<string, GlossaryItem> = {
  pvm: {
    key: "pvm",
    simpleTerm: "Kenapa laba berubah?",
    technicalTerm: "Analisis PVM (Price-Volume-Mix)",
    tooltip: "Mengurai apakah perubahan laba usahamu disebabkan oleh perubahan harga jual, modal pokok barang, atau banyaknya jumlah pesanan.",
  },
  dio: {
    key: "dio",
    simpleTerm: "Stok bertahan berapa hari",
    technicalTerm: "DIO (Days Inventory Outstanding)",
    tooltip: "Perkiraan berapa hari persediaan barang di gudang akan habis terjual berdasarkan kecepatan penjualan harian.",
  },
  runway: {
    key: "runway",
    simpleTerm: "Kas cukup untuk berapa hari",
    technicalTerm: "Cash Runway",
    tooltip: "Perkiraan berapa hari usahamu dapat bertahan membiayai operasional dengan saldo kas saat ini jika tidak ada pemasukan baru.",
  },
  hpp: {
    key: "hpp",
    simpleTerm: "Modal per barang",
    technicalTerm: "HPP / Moving Average Cost",
    tooltip: "Rata-rata modal pokok (harga beli / biaya produksi) untuk setiap unit produk yang siap dijual.",
  },
  prive: {
    key: "prive",
    simpleTerm: "Uang pribadi yang diambil pemilik",
    technicalTerm: "Prive (Owner Drawing)",
    tooltip: "Penarikan uang usaha untuk keperluan pribadi pemilik. Tidak membebani laba/rugi usaha, melainkan mengurangi ekuitas.",
  },
  piutang: {
    key: "piutang",
    simpleTerm: "Tagihan belum dibayar",
    technicalTerm: "Piutang Usaha (Accounts Receivable)",
    tooltip: "Uang penjualan yang masih tertahan di pembeli atau belum cair dari pihak pihak kanal penjualan.",
  },
  utang_usaha: {
    key: "utang_usaha",
    simpleTerm: "Utang yang harus dibayar",
    technicalTerm: "Utang Usaha (Accounts Payable)",
    tooltip: "Kewajiban pembayaran belanja barang persediaan atau operasional ke supplier/vendor yang belum dilunasi.",
  },
  fee_marketplace: {
    key: "fee_marketplace",
    simpleTerm: "Potongan marketplace",
    technicalTerm: "Marketplace Commission Fee",
    tooltip: "Biaya komisi dan administrasi yang dipotong otomatis oleh platform e-commerce (misal Shopee, Tokopedia).",
  },
  safety_stock: {
    key: "safety_stock",
    simpleTerm: "Batas stok minimum",
    technicalTerm: "Safety Stock / Minimum Stock",
    tooltip: "Batas alarm persediaan produk agar kamu segera belanja ulang sebelum stok habis total.",
  },
  burn_rate: {
    key: "burn_rate",
    simpleTerm: "Rata-rata terjual per hari",
    technicalTerm: "Burn Rate / Velocity",
    tooltip: "Kecepatan rata-rata unit produk terjual setiap harinya.",
  },
  rfm: {
    key: "rfm",
    simpleTerm: "Kelompok pelanggan",
    technicalTerm: "Segmentasi RFM (Recency, Frequency, Monetary)",
    tooltip: "Pengelompokan pembeli (Juara, Setia, Baru, Berisiko, Hilang) berdasarkan kapan terakhir belanja dan berapa banyak transaksi mereka.",
  },
  arus_kas: {
    key: "arus_kas",
    simpleTerm: "Uang masuk dan keluar",
    technicalTerm: "Arus Kas (Cash Flow)",
    tooltip: "Catatan perpindahan uang tunai nyata yang masuk dan keluar dari kas tokomu.",
  },
  laba_kotor: {
    key: "laba_kotor",
    simpleTerm: "Laba Kotor",
    technicalTerm: "Gross Profit",
    tooltip: "Keuntungan langsung dari penjualan setelah dikurangi modal pokok barang (HPP).",
  },
  laba_bersih: {
    key: "laba_bersih",
    simpleTerm: "Laba Bersih",
    technicalTerm: "Net Profit",
    tooltip: "Keuntungan akhir usahamu setelah laba kotor dikurangi seluruh beban operasional, gaji, dan biaya toko lainnya.",
  },
  uang_aman: {
    key: "uang_aman",
    simpleTerm: "Uang yang boleh kamu ambil",
    technicalTerm: "Safe Withdrawal Limit",
    tooltip: "Jumlah kas yang aman ditarik untuk keperluan pribadi setelah dikurangi biaya wajib 30 hari ke depan dan cadangan kas.",
  },
};
