# RENCANA PERBAIKAN UI/UX USAHA.IN (SETELAH LOGIN)

> **Dokumen Panduan & Pelacakan Tugas UI/UX Internal Usaha.in**  
> Sistem Internal Khusus Satu UMKM (Pemilik Warung/Toko & Karyawan).  
> **Prinsip Utama:** Bahasa Indonesia sederhana, ramah pengguna non-akuntan, minim istilah teknis membingungkan, navigasi terstruktur, dan aksi kerja yang jelas.

---

## 📌 BATASAN & PRINSIP PEKERJAAN

1. **Ruang Lingkup Eksklusif:**
   - HANYA menyentuh bagian di dalam aplikasi **setelah login**.
   - **JANGAN menyentuh:** Landing page (`/`), Halaman Login (`/login`), Halaman Registrasi (`/daftar`), dan alur onboarding sebelum login.
2. **Integritas Bisnis:**
   - **JANGAN mengubah logika bisnis, rumus, model data, atau aturan izin.**
   - Angka yang tampil tetap berasal dari fungsi domain yang sudah ada (`lib/finance.ts`, `lib/store.ts`, dll.); jangan menghitung ulang secara sembarangan di komponen UI.
3. **Peran Standar:**
   - Hanya menggunakan 2 sebutan peran utama: **"Pemilik Usaha"** dan **"Karyawan"** (tidak menggunakan istilah teknis seperti "Owner" atau "Admin").
4. **Alur Pengerjaan:**
   - Dikerjakan bertahap per bagian (Bagian A sampai G).

---

## 📋 DAFTAR BAGIAN & STATUS PENGERJAAN

- [x] **Bagian A — Bersihkan Sisa Fitur Lama di Dalam Aplikasi** `[SELESAI ✅]`
- [x] **Bagian B — Istilah Sederhana & Kamus Istilah (Glossary)** `[SELESAI ✅]`
- [x] **Bagian C — Navigasi Desktop & Sidebar** `[SELESAI ✅]`
- [ ] **Bagian D — Standar Setiap Halaman (Intro, Bantuan, Empty State, Aksi Utama)** `[BERIKUTNYA ⏳]`
- [ ] **Bagian E — Dashboard Pemilik Usaha & Karyawan** `[BELUM]`
- [ ] **Bagian F — Form, Input & Interaksi Ramah Pengguna** `[BELUM]`
- [ ] **Bagian G — Panduan Pemula, Konsistensi & Aksesibilitas** `[BELUM]`

---

## 🔍 RINCIAN SETIAP BAGIAN

---

### BAGIAN A. BERSIHKAN SISA FITUR LAMA DI DALAM APLIKASI
*Tujuan: Menghilangkan istilah usang, label multi-tenant, dan merapikan pengaturan awal toko.*

- [x] **A.1 Label Peran Standar:** Ganti semua kata "Owner" → **"Pemilik Usaha"** dan "Admin" (sebagai peran) → **"Karyawan"** di sidebar, badge peran, log aktivitas, tooltip, dan data contoh.
- [x] **A.2 Hilangkan Jejak Multi-Tenant:** Hapus semua tampilan yang menyebut *workspace, slug/kode UMKM, NIB*, atau istilah multi-tenant di header, profil, pengaturan, dan log.
- [x] **A.3 Pengaturan Usaha & Saldo Awal:**
  - "Jenis Usaha (F&B, dll.)" menjadi keterangan opsional.
  - "Tipe Usaha" (Dagang / Produksi / Jasa) wajib, dengan penjelasan 1 kalimat per pilihan.
  - Isian Saldo Awal (kas awal, stok awal bila usaha memakai stok, piutang/utang awal opsional) diletakkan di Pengaturan dan dikunci setelah ada transaksi (perubahan selanjutnya lewat penyesuaian).
- [x] **A.4 Template Jabatan Manajemen Tim:**
  - Hapus "Staf Pembelian".
  - Template resmi: *Staf Penjualan, Staf Gudang, Staf Keuangan, Kasir, Kustom*.
  - Akses default "Kasir": Penjualan = Kelola, Pelanggan = Lihat, Produk = Lihat, Pembayaran = Kelola, Dashboard = Lihat.
- [x] **A.5 Form Pengeluaran Bersih:**
  - Hapus kategori "Fee Marketplace" dari form (karena fee marketplace otomatis dihitung dari penjualan agar tidak ganda).
  - Kategori belanja persediaan diberi label: *"Belanja stok (masuk persediaan, bukan beban)"* dan memunculkan baris item stok.
- [x] **A.6 Status Pembayaran Baku:** Menggunakan 4 status standar: **Lunas**, **Sebagian**, **Belum Lunas**, dan **Gagal** (menggantikan "Lunas Lanjutan").
- [x] **A.7 Perbaikan Typo & Tampilan Neraca:**
  - "Naraca" → **"Posisi Keuangan (Neraca)"**
  - "Perediaan" → **"Persediaan"**
  - Hapus kata "Estimasi" dari judul neraca dan tampilkan badge **"Seimbang"** bila selisih = 0.
- [x] **A.8 Impor Penjualan:** Mendukung format `.xlsx` dan `.csv` dengan label tombol *"Impor Laporan Penjualan"*.
- [x] **A.9 Pemisahan Prive & Uang Aman:**
  - Kartu *"Uang yang boleh kamu ambil"* (hasil perhitungan aman).
  - Tombol *"Catat pengambilan uang pribadi"* yang mencatat ke Prive.
- [x] **A.10 Kontrol Demo Mode:** Tombol *"Tambah Pesanan Contoh"* dan *"Reset Data Demo"* hanya muncul bila `DEMO_MODE` aktif dan khusus Pemilik Usaha.
- [x] **A.11 Bersihkan Sisa Fitur Lama:** Hapus sisa teks integrasi API langsung / sinkronisasi otomatis Shopee/Tokopedia/WA, Staf Pembelian, dan teks "mode demo" pada Copilot.
- [x] **A.12 Kelengkapan UI:** Memastikan adanya batas pengeluaran (indikator hijau/kuning/merah + alasan wajib), tab Utang Usaha, pembayaran sebagian, tombol Batalkan & Retur, serta proteksi akses modul sesuai peran.

---

### BAGIAN B. ISTILAH SEDERHANA & KAMUS ISTILAH (GLOSSARY)
*Tujuan: Mengganti istilah teknis/akuntansi menjadi bahasa sehari-hari yang langsung dimengerti pelaku UMKM, dengan penjelasan teknis tersimpan di tooltip "?".*

- [x] **B.1 Padanan Istilah Awam:**
  | Istilah Teknis Asli | Teks Utama di UI (Bahasa Awam) | Penjelasan Tooltip (`?`) |
  |---|---|---|
  | **Analisis PVM** | *Kenapa laba berubah?* | Mengurai apakah perubahan laba disebabkan oleh harga jual, modal pokok, atau volume penjualan. |
  | **DIO / Perputaran Persediaan** | *Stok bertahan berapa hari* | Rata-rata waktu barang habis terjual dari gudang penyimpanan. |
  | **Kas Runway** | *Kas cukup untuk berapa hari* | Perkiraan berapa hari usaha bisa berjalan dengan saldo kas saat ini tanpa pemasukan baru. |
  | **HPP / Moving Average** | *Modal per barang* | Rata-rata modal pokok untuk setiap unit produk yang dibeli/dibuat. |
  | **Prive** | *Uang pribadi yang diambil pemilik* | Penarikan dana usaha untuk keperluan pribadi pemilik, tidak mengurangi laba usaha. |
  | **Piutang** | *Tagihan belum dibayar* | Uang pembeli yang belum disetorkan atau dibayar ke tokomu. |
  | **Utang Usaha** | *Utang yang harus dibayar* | Kewajiban pembayaran belanja/operasional ke pihak luar yang belum dilunasi. |
  | **Fee Marketplace** | *Potongan marketplace* | Biaya admin/komisi yang dipotong platform saat jualan di Shopee/Tokopedia. |
  | **Safety / Min Stock** | *Batas stok minimum* | Jumlah stok pengingat agar kamu segera belanja ulang sebelum kehabisan. |
  | **Burn Rate** | *Rata-rata terjual per hari* | Kecepatan barang keluar atau terjual dalam periode harian. |
  | **Segmentasi RFM** | *Kelompok pelanggan* | Pengelompokan pembeli: Juara, Setia, Baru, Berisiko, dan Hilang berdasarkan waktu & nilai belanja. |
  | **Arus Kas** | *Uang masuk dan keluar* | Catatan perpindahan uang tunai nyata masuk dan keluar dari kas usahamu. |
  | **Laba Kotor / Bersih** | *Laba Kotor / Laba Bersih* | Dilengkapi tooltip penjelasan satu kalimat yang ramah UMKM. |
- [x] **B.2 Komponen Reusable:**
  - Membuat kamus istilah `lib/glossary.ts`.
  - Membuat komponen `<Hint term="..." />` untuk tooltip konsisten di seluruh aplikasi.

---

### BAGIAN C. NAVIGASI DESKTOP & SIDEBAR
*Tujuan: Memberikan pengalaman navigasi desktop yang rapi, cepat, fleksibel (collapsible), dan mendukung pencarian global & pintasan keyboard.*

- [x] **C.1 Sidebar Kiri Tetap & Collapsible (240px ↔ Ikon Saja):**
  - Lebar standar 240px (`w-60`), bisa diciutkan menjadi mode ikon saja (`w-[68px]`).
  - Status tersimpan otomatis di `localStorage`.
  - Tooltip informatif saat mouse dihover pada mode ikon.
- [x] **C.2 Pengelompokan 5 Menu:**
  1. 🏠 **Beranda**: *Beranda* (`/dashboard`)
  2. 💼 **Kerja Harian**: *Penjualan* (`/penjualan`), *Pengiriman* (`/pengiriman` jika tipe pengiriman aktif), *Pelanggan* (`/pelanggan`), *Produk dan Stok* (`/produk` jika tipe stok aktif)
  3. 💰 **Uang**: *Pengeluaran* (`/pengeluaran`), *Tagihan dan Utang* (`/pembayaran`), *Laporan Keuangan* (`/keuangan`)
  4. 💡 **Bantuan Cerdas** *(Pemilik Usaha saja)*: *Saran dan Analisis* (`/analitik`), *Tanya AI* (`/copilot`)
  5. ⚙️ **Pengaturan** *(Pemilik Usaha saja)*: *Tim* (`/tim`), *Log Aktivitas* (`/tim/log`), *Pengaturan Usaha* (`/pengaturan`)
- [x] **C.3 Header Atas Terintegrasi:**
  - Menampilkan Nama Toko/Usaha + Badge Tipe Usaha.
  - Kolom **Pencarian Global** (<kbd>Ctrl</kbd> + <kbd>K</kbd>).
  - Tombol Bantuan Pintasan (<kbd>?</kbd>).
  - Mode Gelap / Terang & Reset Demo.
  - Menu Pengguna (Avatar, Nama, Peran, Ganti Akun Tim Simulasi, Keluar).
- [x] **C.4 Pencarian Global / Command Palette (`Ctrl+K`):**
  - Mencari Pesanan, Produk Katalog, Data Pelanggan, Catatan Pengeluaran, dan Pindah Halaman/Menu Navigasi dengan navigasi keyboard.
- [x] **C.5 Breadcrumb Sederhana:**
  - Jalur navigasi otomatis di atas halaman: `Beranda > [Grup] > [Halaman]`.
- [x] **C.6 Pintasan Keyboard Universal:**
  - <kbd>N</kbd>: Tambah baru di halaman aktif.
  - <kbd>Ctrl</kbd> + <kbd>K</kbd>: Buka pencarian global.
  - <kbd>Esc</kbd>: Tutup modal / popup / panel.
  - <kbd>Ctrl</kbd> + <kbd>Enter</kbd>: Simpan formulir yang sedang aktif.
  - <kbd>?</kbd> atau <kbd>/</kbd>: Buka jendela panduan pintasan keyboard.

---

### BAGIAN D. STANDAR SETIAP HALAMAN [SELESAI ✅]
*Tujuan: Memastikan setiap halaman memiliki tujuan yang jelas, mudah dipahami dalam 3 detik, dan tidak membingungkan pengguna.*

- [x] **D.1 Penjelasan Fungsi Halaman (`<PageIntro>`):** Di bawah judul halaman, terdapat 1 kalimat penjelasan ringkas fungsi halaman tersebut di seluruh halaman (`/penjualan`, `/pengeluaran`, `/produk`, `/pelanggan`, `/keuangan`, `/pengiriman`, `/pembayaran`, `/analitik`, `/tim`, `/pengaturan`, `/stok`, `/tim/log`, `/copilot`, `/laporan`, `/integrasi`).
- [x] **D.2 Tombol Bantuan Halaman (`?`):** Tombol kecil "Panduan" di judul/header yang membuka modal panduan ringkas cara kerja halaman tersebut (maksimal 5 poin penting).
- [x] **D.3 Empty State yang Bermanfaat (`<EmptyState>`):** Saat data kosong, menampilkan ikon/ilustrasi bersih, kalimat penjelas, dan 1 tombol aksi utama (misal: *"Tambah Penjualan Pertama"*, *"Tambah Produk Baru"*, dll).
- [x] **D.4 Hierarki Satu Aksi Utama (Single Primary Action):** 1 halaman memiliki 1 tombol primer yang menonjol dan terhubung dengan shortcut keyboard `<kbd>N</kbd>` / `<kbd>Ctrl+Enter</kbd>`; aksi sekunder dibuat tenang atau modal tersendiri.

---

### BAGIAN E. DASHBOARD PEMILIK USAHA & KARYAWAN
*Tujuan: Menyajikan ringkasan bisnis berlapis yang menenangkan dan langsung memberi arahan tindakan.*

- [ ] **E.1 Kalimat Ringkasan Dinamis (Bahasa Manusia):** Contoh: *"Bulan ini usahamu untung Rp4,2 juta, naik 8% dari bulan lalu."* (bila rugi, gunakan nada tenang, solutif, dan konstruktif).
- [ ] **E.2 Kartu "Yang Perlu Kamu Perhatikan":** Maksimal 3 butir peringatan paling mendesak (mis. stok hampir habis, tagihan lewat tempo) lengkap dengan tombol tindakan langsung (*"Lihat Stok"*, *"Tagih Sekarang"*).
- [ ] **E.3 Empat Kartu Angka Kunci:** Omzet, Laba Bersih, Pengeluaran, Jumlah Pesanan (dengan indikator tren dibanding bulan lalu).
- [ ] **E.4 Dua Kartu Keuangan Cerdas:**
  - *"Uang yang boleh kamu ambil"* (kartu Uang Aman Ditarik).
  - *"Kesehatan usaha"* (Skor Sehat / Waspada / Perlu Perhatian + 1 kalimat saran & rincian saat diklik).
- [ ] **E.5 Grafik Terorganisir (Collapsible):** Tren 30 hari, omzet per kanal, dan produk terlaris dalam panel yang rapi.
- [ ] **E.6 Dashboard Khusus Karyawan:** Menampilkan *"Tugas Hari Ini"* sesuai peran/penugasan (misal pesanan perlu diproses/dikemas), tanpa membebani karyawan dengan laporan keuangan pemilik.

---

### BAGIAN F. FORM, INPUT & INTERAKSI RAMAH PENGGUNA
*Tujuan: Mempercepat proses entri harian dan mencegah salah input tanpa birokrasi rumit.*

- [ ] **F.1 Input Penjualan 2 Langkah:**
  - Langkah 1: Siapa pembeli & apa barang yang dibeli (autocomplete produk & pelanggan).
  - Langkah 2: Pembayaran (Bayar Sekarang atau Tempo).
  - Default cerdas: Tanggal hari ini, kanal terakhir dipakai, opsi diskon/ongkir di bagian lanjutan yang bisa dilipat.
  - Tombol *"Simpan dan Tambah Lagi"*.
- [ ] **F.2 Form Pengeluaran Adaptif:**
  - Pilih kategori dahulu, lalu isian form menyesuaikan (belanja stok menampilkan tabel item produk; biaya operasional hanya nominal dan catatan).
  - Tampilkan sisa batas anggaran kategori secara langsung.
  - Dialog alasan pengeluaran hanya muncul jika melebihi batas yang ditentukan.
- [ ] **F.3 Placeholder & Panduan Nyata:** Placeholder memberi contoh konkret (misal: *"Contoh: Beli 20 kg tepung terigu"*).
- [ ] **F.4 Stepper Impor Penjualan (4 Langkah):**
  - `Unggah File` → `Cocokkan Kolom` → `Periksa Data` → `Selesai`.
  - Memberikan visual progres dan laporan hasil impor yang jelas.
- [ ] **F.5 Konfirmasi Aksi Berisiko:** Konfirmasi dialog hanya untuk aksi krusial (batalkan pesanan, hapus/nonaktifkan akun, reset data demo) dengan kalimat dampak yang jelas.
- [ ] **F.6 Pesan Galat yang Memberi Solusi:** Pesan error ramah pengguna dan langsung menunjukkan cara memperbaikinya.

---

### BAGIAN G. PANDUAN PEMULA, KONSISTENSI & AKSESIBILITAS
*Tujuan: Memastikan pengguna baru bisa langsung mahir tanpa perlu membaca buku manual tebal.*

- [ ] **G.1 Checklist "Mulai di Sini" (Onboarding Beranda):**
  - Isi Saldo Awal → Tambah Produk Pertama → Catat Penjualan Pertama → Isi Biaya Tetap Bulanan → Tambah Anggota Tim (opsional).
  - Otomatis selesai/dapat ditutup saat pengguna sudah mengerti.
- [ ] **G.2 Tur Singkat 4 Langkah:** Panduan kilat saat pertama kali membuka Beranda (bisa dilewati dan diulang dari tombol `?`).
- [ ] **G.3 Sistem Warna & Status Terpadu:**
  - Hijau = Aman / Lunas / Positif.
  - Kuning = Waspada / Menunggu / Mendekati Batas.
  - Merah = Bermasalah / Rugi / Lewat Tempo.
  - Abu-abu = Netral / Draf.
  - *Selalu menyertakan teks atau ikon pendamping, bukan hanya warna.*
- [ ] **G.4 Format Angka Konsisten:**
  - Format Rupiah baku: `Rp1.250.000` (titik pemisah ribuan).
  - Format singkat pada kartu ringkasan: `Rp4,2 jt`, `Rp850 rb`.
- [ ] **G.5 Aksesibilitas & Kenyamanan Sentuh:**
  - Kontras teks tinggi.
  - Ukuran font isi mudah dibaca.
  - Target klik/sentuh tombol minimal 44px.
  - Indikator fokus keyboard yang jelas.
- [ ] **G.6 Skeleton Loading & Toast Informatif:**
  - Menggunakan skeleton placeholder saat memuat data.
  - Notifikasi Toast menyebutkan hasil aksi secara detail (misal: *"Penjualan tersimpan. Stok Kopi Arabika sekarang sisa 12 pcs."*).

---

## 🎯 KRITERIA SELESAI (ACCEPTANCE CRITERIA)

1. **Pembersihan Teks Tuntas:** Pencarian di seluruh modul dalam aplikasi tidak lagi menemukan kata *"Owner"*, *"Admin"* (sebagai peran), *"workspace"*, *"slug"*, *"NIB"*, *"Naraca"*, *"Perediaan"*, *"Lunas Lanjutan"*, *"Staf Pembelian"*, atau *"Fee Marketplace"* di form pengeluaran.
2. **Kamus Istilah Aktif:** Tidak ada istilah asing/akuntansi membingungkan di Bagian B yang tampil tanpa padanan awam atau tooltip penjelas.
3. **Standar Halaman Terpenuhi:** Setiap halaman memiliki intro 1 kalimat, tombol bantuan `?`, dan empty state yang informatif dengan 1 tombol aksi utama.
4. **Kecepatan Transaksi:** Pengguna baru dapat mencatat penjualan pertama dalam waktu kurang dari 2 menit tanpa bantuan teknis.
5. **Kestabilan Sistem:** Semua fungsi perhitungan keuangan, logika store Zustand, dan aturan izin modul tetap 100% valid dan bebas error TypeScript (`npx tsc --noEmit` = 0 error).

---
*Dokumen ini diperbarui secara berkala seiring berjalannya implementasi per bagian.*
