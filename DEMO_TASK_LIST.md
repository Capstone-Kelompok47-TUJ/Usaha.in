# DEMO TASK LIST — USAHA.IN

> Dokumen ini berisi task-task yang dikerjakan untuk versi **demo** Usaha.in.
> Tech stack tetap: Zustand + localStorage. Tidak ada backend.
> Centang task setelah selesai dikerjakan.

---

## STATUS KESELURUHAN

- Fase A (Fondasi & Navigasi): `[x] SELESAI ✅`
- Fase B (Modul Pengeluaran): `[x] SELESAI ✅`
- Fase C (Penjualan & Input Manual): `[x] SELESAI ✅`
- Fase D (Pembayaran & Piutang): `[x] SELESAI ✅`
- Fase E (Produk & Stok): `[x] SELESAI ✅`
- Fase F (Pelanggan): `[x] SELESAI ✅`
- Fase G (Laporan Keuangan): `[x] SELESAI ✅`
- Fase H (Dashboard): `[x] SELESAI ✅`
- Fase I (Analitik): `[x] SELESAI ✅`
- Fase J (Copilot & Pengaturan): `[x] SELESAI ✅`

---

## FASE A — FONDASI & NAVIGASI
> Tujuan: Bersihkan sisa multi-tenant, perbarui label, dan rapikan navigasi.

### A1 — Pendaftaran & Login
- [x] Tambah pilihan **Tipe Usaha** (Dagang / Produksi / Jasa) di form pendaftaran dengan penjelasan singkat tiap tipe
- [x] Simpan `businessType` ke state/store saat register

> Format login `nama@kodeumkm.usaha.in` **dipertahankan** (tidak diubah).

### A2 — Label & Terminologi
- [x] Ganti semua teks "Pemilik Usaha" / "Pemilik" → **Owner** di seluruh file UI (AccountSwitcher, login, daftar, sidebar)
- [x] Di sidebar bagian bawah profil: ubah `👑 Pemilik` → `👑 Owner`
- [x] Di halaman Daftar: badge role → Owner

### A3 — Sidebar & Navigasi
- [x] Ganti menu "Pembelian" → **"Pengeluaran"** (label + href `/pengeluaran`)
- [x] Hapus menu **"Integrasi Kanal"** dari sidebar
- [x] Tambah menu **"Analitik"** (khusus Owner, href `/analitik`)
- [x] Tambah menu **"Pengaturan"** (khusus Owner, href `/pengaturan`)
- [x] Terapkan kondisi `useStock` — sembunyikan menu Stok jika false
- [x] Terapkan kondisi `useShipping` — sembunyikan menu Pengiriman jika false

### A4 — Store & Types
- [x] Tambah type `BusinessType: 'dagang' | 'produksi' | 'jasa'` dan `BusinessSettings`
- [x] Tambah field `businessSettings` ke `Tenant`
- [x] Set nilai default berdasarkan `businessType` saat registrasi (via store `registerTenant`)
- [x] Tambah `ModuleKey` baru: `pengeluaran`, `laporan_keuangan`, `laporan_periodik`, `analitik`
- [x] Hapus `ModuleKey` lama: `pembelian` (→ `pengeluaran`), `keuangan` (→ `laporan_keuangan`), `laporan` (→ `laporan_periodik`)
- [x] Update permissions/templates jabatan sesuai modul baru
- [x] Tambah `PaymentStatus: 'sebagian'`

---

## FASE B — MODUL PENGELUARAN
> Tujuan: Ganti halaman Pembelian dengan Pengeluaran yang lebih lengkap.

### B1 — Halaman & Route
- [x] Buat halaman `/pengeluaran/page.tsx`
- [x] Redirect `/pembelian` → `/pengeluaran`

### B2 — Kategori Pengeluaran
- [x] Buat data kategori default di mock-data: Bahan Baku, Kemasan, Fee Marketplace, Iklan, Sewa, Gaji, Listrik/Air/Internet, Transportasi, Biaya Admin Bank, Lainnya, Prive
- [x] Tambah `expenseCategories` ke store + `INITIAL_EXPENSE_CATEGORIES`
- [x] Setiap kategori punya: `id`, `name`, `group`, `active`, `isStockRelated`

### B3 — Form Tambah Pengeluaran
- [x] Form field: Tanggal, Kategori, Nominal, Status (Lunas/Belum Lunas), Tanggal Jatuh Tempo, Vendor, Catatan
- [x] Jika kategori `isStockRelated`: tampilkan baris item stok (pilih produk, qty, harga satuan), total auto-hitung
- [x] Saat simpan dengan item stok: update stok produk + buyPrice (moving average sederhana)
- [x] Validasi: nominal > 0, tanggal tidak kosong, kategori tidak kosong, dueDate wajib jika belum lunas

### B4 — Batas Pengeluaran
- [x] Tambah `budgets: Record<categoryId, number>` ke store
- [x] Di form: tampilkan indikator sisa batas (BudgetIndicator dengan progress bar)
- [x] Jika melebihi batas: tampilkan warning banner + input alasan wajib
- [x] Tetap tersimpan setelah alasan diisi (field `budgetExceedReason`)
- [x] Indikator: Hijau (<80%), Kuning (80-100%), Merah (>100%)

### B5 — Tab Utang Usaha
- [x] Tambah tab "Utang Usaha" di halaman Pengeluaran
- [x] Tampilkan: tanggal jatuh tempo, umur utang (hari), highlight merah jika overdue, tombol "Tandai Lunas"

### B6 — Tab Prive (khusus Owner)
- [x] Tambah tab "Prive" di halaman Pengeluaran (hanya Owner yang melihat)
- [x] Form prive: tanggal, nominal, catatan
- [x] Prive disimpan sebagai `isPrive: true`, group `non_expense` — tidak masuk laba/rugi

---

## FASE C — PENJUALAN & INPUT MANUAL
> Tujuan: Tambah form input manual dan perbaiki drawer detail.

### C1 — Form Input Penjualan Manual
- [x] Tambah tombol "Input Penjualan" di halaman Penjualan
- [x] Modal form dengan field:
  - [x] Autocomplete nama pelanggan (suggest dari data existing)
  - [x] Pilih kanal (Shopee / Tokopedia / WhatsApp / Offline) dengan tombol toggle
  - [x] Multi-baris item: pilih produk, qty, harga (terisi otomatis, bisa diubah)
  - [x] Diskon penjual (nominal)
  - [x] Ongkir ditanggung penjual (nominal)
  - [x] Pilihan: Bayar Sekarang / Tempo + tanggal jatuh tempo jika tempo
- [x] Saat simpan: buat Order baru, kurangi stok, catat log aktivitas
- [x] Fee otomatis 0% untuk WhatsApp dan Offline

### C2 — Status Pembayaran Baru
- [x] Status `sebagian` sudah ada di `PaymentStatus` type (dari Fase A)
- [x] Badge "Sebagian" warna amber/kuning
- [x] Badge baru digunakan di tabel dan drawer penjualan

### C3 — Drawer Detail Pesanan (diperkaya)
- [x] Rincian biaya: Subtotal, Diskon, Fee Marketplace, Ongkir, **Total Diterima**
- [x] Tombol **"Batalkan Pesanan"** (Owner & canManage)
  - [x] Konfirmasi dialog
  - [x] Set `voided = true`, kembalikan stok, catat log
- [x] Pesanan dibatalkan disembunyikan dari tabel utama
- [x] Tombol simulasi ("Tambah Pesanan Contoh") hanya muncul untuk **Owner**

### C4 — Impor CSV (Alur Dasar)
- [x] Tombol "Impor CSV" di halaman Penjualan
- [x] Modal 4 langkah:
  1. [x] Upload file .csv + pilih kanal (Shopee/Tokopedia)
  2. [x] Preview 5 baris pertama + pemetaan kolom otomatis
  3. [x] Pratinjau parsing per baris (ok/skipped/error)
  4. [x] Konfirmasi → simpan batch
- [x] Deduplikasi: cek `(channel, externalOrderId)` sebelum simpan
- [x] Fee dari kolom `platformFee`; fallback hitung dari default pct
- [x] Laporan hasil: tampilkan {ok, skipped, failed}

---

## FASE D — PEMBAYARAN & PIUTANG
> Tujuan: Tambah fitur umur piutang, bayar sebagian, dan utang usaha.

### D1 — Tabel Piutang dengan Umur
- [x] Kolom "Umur Piutang" di tabel Pembayaran
- [x] Bucket: Belum jatuh tempo / 1-7 hari / 8-30 hari / >30 hari
- [x] Warna baris: normal (hijau) / kuning / oranye / merah
- [x] Summary cards per bucket (jumlah & total tagihan)

### D2 — Pembayaran Sebagian
- [x] Tombol "Catat Pembayaran" menggantikan "Tandai Lunas"
- [x] Input nominal + tombol cepat (Bayar Penuh / Setengah)
- [x] Hitung dan tampilkan sisa piutang secara real-time
- [x] Status otomatis: Lunas (>= total) / Sebagian (sebagian) / Belum (0)
- [x] Riwayat pembayaran disimpan di `order.payments[]`

### D3 — Salin Pesan Tagihan
- [x] Tombol salin (Copy icon) di tiap baris piutang
- [x] Template: "Halo [nama], pembayaran pesanan [ID] sebesar [nominal] jatuh tempo [tanggal]"
- [x] Salin ke clipboard dengan `navigator.clipboard.writeText()`
- [x] Toast konfirmasi + icon berubah ke centang setelah disalin

---

## FASE E — PRODUK & STOK
> Tujuan: Tambah jenis produk, kolom stok baru, dan perbaiki UX.

### E1 — Produk
- [x] Field **Jenis Produk**: Barang Dagangan / Produksi / Jasa — badge di tabel + pilihan di form tambah
- [x] Toggle **Lacak Stok** per produk (default true; jasa umumnya false)
- [x] Kolom HPP/avg cost disembunyikan untuk akun tanpa akses `laporan_keuangan`
- [x] Field `avgCost` ditambah ke tipe `Product` — diperbarui saat pembelian stok

### E2 — Moving Average HPP
- [x] `avgCost` diinisialisasi dari `buyPrice` saat produk dibuat
- [x] Saat pembelian stok (Fase B, addExpense isStockRelated): update `avgCost` moving average
- [x] Field `cogsUnit` tersedia di `OrderItem` untuk snapshot HPP saat penjualan

### E3 — Stok
- [x] Kolom **"Cukup Berapa Hari"** — `stok / avg jual harian 28 hari`; jika 0 → "∞"
- [x] Kolom **"Rekomendasi Restock"** — target 14 hari stok; 0 = "Cukup"
- [x] Badge **Dead Stock** jika stok > 0 dan tidak ada penjualan >= 60 hari
- [x] Penyesuaian stok: field `catatan` wajib diisi (validasi di form)
- [x] Stok negatif: teks merah "Stok negatif — periksa pencatatan" + baris merah
- [x] Form tambah produk baru dengan semua field (nama, SKU, jenis, harga, stok, kanal)

---

## FASE F — PELANGGAN
> Tujuan: Perkaya data pelanggan dengan metrik dan segmentasi.

### F1 — Kolom Tambahan
- [x] Kolom: **Total Belanja**, **Jumlah Order**, **Tanggal Order Terakhir** + hari sejak
- [x] Data dihitung dari `orders` terkait `customerId` (exclude voided)

### F2 — Segmen RFM (khusus Owner)
- [x] RFM tertile 1-3 dari recency/frequency/monetary
- [x] Label: Juara / Setia / Berisiko / Baru / Hilang / Reguler
- [x] Badge segmen di kolom "Segmen" — hanya terlihat Owner
- [x] Legend RFM card di bawah tabel

### F3 — Pengingat Repeat Order
- [x] Hitung avg interval order per pelanggan (> 1 order)
- [x] "Terlambat" jika: `hari sejak last order > 1.5 x avgInterval` DAN >= 7 hari
- [x] Panel amber di atas halaman (max 10 pelanggan), hanya Owner
- [x] Baris highlight amber + label di kolom nama

---

## FASE G — LAPORAN KEUANGAN
> Tujuan: Ganti ringkasan lama dengan 3 tab laporan akuntansi.

### G1 — Hapus Ringkasan Lama
- [x] Refactor kalkulasi — tidak lagi menggunakan `OPERATIONAL_EXPENSE_MONTHLY` hardcoded
- [x] Gunakan data `expenses` dari store untuk beban operasional

### G2 — Tab Laba/Rugi
- [x] 3 tab: Laba/Rugi, Neraca, Arus Kas
- [x] Pendapatan → Diskon → Pendapatan Bersih → HPP → Laba Kotor → Beban Penjualan → Beban Operasional → Laba Bersih
- [x] Laba Bersih bold hijau/merah + margin %

### G3 — Tab Neraca
- [x] Aset: Kas (omzet - pengeluaran), Piutang (orders belum lunas), Persediaan (stok * avgCost)
- [x] Liabilitas: Utang Usaha (expenses belum lunas)
- [x] Ekuitas: Total Aset - Liabilitas
- [x] Badge "Seimbang" / peringatan jika tidak balance

### G4 — Tab Arus Kas
- [x] Kas Masuk: sum subtotal orders lunas
- [x] Kas Keluar: sum expenses lunas + prive
- [x] Tampilkan Saldo Bersih

### G5 — Toggle Periode
- [x] Tombol Hari Ini / Minggu Ini / Bulan Ini
- [x] Semua tab laporan menyesuaikan periode yang dipilih
- [x] Pertahankan panel profitabilitas per kanal

---

## FASE H — DASHBOARD
> Tujuan: Perbarui dashboard Owner dengan KPI dan panel baru.

### H1 — KPI Baru
- [x] Tambah kartu **"Kas Saat Ini"** (dari kalkulasi Neraca)
- [x] Tambah kartu **"Uang Aman Ditarik"**:
  - `biayaWajib30 = biaya tetap bulanan + sisa utang jatuh tempo 30 hari`
  - `cadangan = 10% dari pendapatan bersih 30 hari terakhir`
  - `uangAman = max(0, kas - biayaWajib30 - cadangan)`
  - Tampilkan pesan peringatan jika negatif

### H2 — Skor Kesehatan Usaha
- [x] Hitung skor 0-100 berdasarkan 4 komponen:
  - Margin Bersih (30%): `clamp(labaBersih/pendapatanBersih / 0.20, 0, 1) * 100`
  - Perputaran Stok (20%): DIO = nilai persediaan / (HPP30/30); 100 jika <=30 hari, linear ke 0 pada >=120 hari
  - Umur Piutang (20%): `clamp(1 - piutangLewatTempo/pendapatan30 / 0.20, 0, 1) * 100`
  - Kas Runway (30%): `clamp(runwayHari / 60, 0, 1) * 100`
- [x] Tampilkan sebagai gauge/angka besar + label: Sehat (>=80) / Waspada (60-79) / Perlu Perhatian (<60)
- [x] Klik kartu → buka rincian skor per komponen

### H3 — Panel Peringatan Diperkaya
- [x] Tambah peringatan: Harga beli naik >10% (bandingkan avgCost dengan 60 hari lalu)
- [x] Tambah peringatan: Piutang lewat jatuh tempo
- [x] Tambah peringatan: Kas runway <30 hari
- [x] Tambah peringatan: Kategori biaya Merah (>100% batas)
- [x] Setiap peringatan punya link ke halaman terkait

---

## FASE I — ANALITIK (Khusus Owner)
> Tujuan: Buat halaman baru /analitik dengan 5 tab.

### I1 — Tab Diagnosis Laba
- [x] Implementasi dekomposisi PVM:
  - Efek Harga: `sum(q1 * (p1 - p0))`
  - Efek Biaya HPP: `-sum(q1 * (c1 - c0))`
  - Efek Volume: `(Q1 - Q0) * sum(s0 * m0)`
  - Efek Bauran: `Q1 * sum((s1 - s0) * m0)`
  - Efek Beban: `-(beban1 - beban0)`
- [x] Tampilkan sebagai tabel efek bernilai rupiah + persen kontribusi
- [x] Urutkan dari efek terbesar ke terkecil (absolut)
- [x] Pilih periode pembanding: Minggu ini vs minggu lalu / Bulan ini vs bulan lalu

### I2 — Tab Skor Kesehatan
- [x] Tampilkan rincian tiap komponen skor (dari H2)
- [x] Grafik atau progress bar per komponen

### I3 — Tab Anomali
- [x] Deteksi penjualan anjlok: z-score < -2 dari rata-rata 28 hari (butuh min 14 hari data)
- [x] Deteksi lonjakan biaya: bandingkan minggu ini vs rata-rata 8 minggu sebelumnya per kategori
- [x] Tandai margin item < 0 (margin tidak wajar)
- [x] Tampilkan daftar anomali dengan severity (merah/kuning)

### I4 — Tab Repeat Order
- [x] Daftar pelanggan yang terlambat repeat order (dari fase F3)
- [x] Tampilkan: nama, interval rata-rata, hari terakhir order, tombol "Salin Pesan"

### I5 — Tab Daftar Tindakan Mingguan
- [x] Generate otomatis saat halaman dibuka (jika minggu berganti)
- [x] Urutan prioritas:
  1. Tagih piutang >30 hari (per pelanggan, nominal terbesar dulu)
  2. Restock stok kritis (onHand <= minStock atau hariCukup < 3)
  3. Periksa kategori biaya merah
  4. Hubungi pelanggan terlambat repeat order (max 5)
  5. Kas runway <30 hari
- [x] Tombol "Selesai" dan "Abaikan" per tindakan

---

## FASE J — COPILOT & PENGATURAN
> Tujuan: Perbarui Copilot dan buat halaman Pengaturan.

### J1 — Copilot
- [x] Tambah guard: jika bukan Owner → redirect ke `/tidak-ada-akses`
- [x] Perbarui pertanyaan cepat:
  - Tambah: "Berapa uang yang aman saya ambil?"
  - Tambah: "Kategori biaya mana paling boros?"
  - Tambah: "Piutang mana yang jatuh tempo?"
- [x] Hapus teks catatan "Jawaban dihasilkan dari data internal (mode demo)" → ganti ke "Dihasilkan dari data internal"
- [x] Perbarui skenario jawaban Copilot agar menggunakan data dari fungsi analitik (bukan hardcode)

### J2 — Halaman Pengaturan
- [x] Buat halaman `/pengaturan/page.tsx` (khusus Owner)
- [x] Bagian **Informasi Usaha**: nama usaha, tipe usaha (Dagang/Produksi/Jasa), toggle fitur
- [x] Bagian **Fee Default Simulasi**: Shopee (default 7.5%), Tokopedia (default 3.5%) — bisa diubah
- [x] Bagian **Kategori Biaya**: daftar kategori + toggle aktif/nonaktif + tombol tambah kategori kustom
- [x] Bagian **Batas Pengeluaran**: per kategori aktif, input nominal batas atau % pendapatan
- [x] Bagian **Biaya Tetap Berulang**: gaji, sewa, dll. untuk proyeksi Uang Aman Ditarik

---

## CATATAN PENGERJAAN

- Kerjakan per fase, jangan loncat
- Setelah tiap fase: jalankan `npm run dev` dan cek tidak ada error di console
- Yang boleh dikerjakan paralel: fase E (Produk/Stok) dan F (Pelanggan) bisa bersamaan
- Fase G, H, I bergantung pada data dari E dan B — kerjakan setelah E dan B selesai
- Fase J bisa dikerjakan kapan saja setelah A selesai

---

*Perbarui checklist ini saat task selesai dikerjakan.*

