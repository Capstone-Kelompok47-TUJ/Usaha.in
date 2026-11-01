# LAPORAN AUDIT & EVALUASI KESIAPAN APLIKASI USAHA.IN
## Transisi dari Prototipe/Demo Menuju Sistem Informasi Manajemen UMKM Produksi
### Berdasarkan Spesifikasi dan Proposal Capstone S1 Sistem Informasi

**Tanggal Audit:** 1 November 2026  
**Objek Pemeriksaan:** Repositori Aplikasi `Usaha.in` (Frontend Next.js, State Layer, Backend API, Skema Supabase)  
**Tujuan Evaluasi:** Mengukur kesesuaian implementasi aktual terhadap proposal Capstone F-01 sampai F-22, menginventarisasi ketergantungan data demo, dan menyusun roadmap transisi menuju aplikasi fungsional seutuhnya.

---

## 1. PEMERIKSAAN KONDISI KESELURUHAN PROYEK

### 1.1 Teknologi dan Arsitektur Aplikasi
Aplikasi Usaha.in saat ini beroperasi dengan **arsitektur terbelah (Split-Brain Architecture)**:
- **Kerangka Utama:** Next.js 16 (App Router) dengan TypeScript dan React 19, ditata menggunakan Tailwind CSS dan komponen berbasis Radix/Lucide UI.
- **Kondisi Arsitektur Aktual:**
  - **90% Logika Bisnis:** Berjalan sebagai Single Page Application (SPA) murni di sisi browser pengguna (*client-side*). Seluruh data transaksi, mutasi stok, laporan keuangan, dan analitik dikelola oleh pustaka state management **Zustand** dengan middleware `persist` yang menyimpan seluruh state ke dalam `localStorage` peramban web (key: `usaha-in-store`).
  - **10% Logika Bisnis:** Menggunakan arsitektur hybrid modern yang terhubung ke backend **Supabase** (PostgreSQL + GoTrue Auth) melalui Next.js Route Handlers (`app/api/team` dan `app/api/profile`).
- **Kelemahan Arsitektur:** Transaksi penjualan, produk, dan pengeluaran tidak pernah dikirimkan ke server atau database. Jika pengguna membuka aplikasi di peramban lain, membersihkan riwayat penjelajahan (*clear cache/storage*), atau berganti perangkat, seluruh rekaman operasional bisnis akan lenyap atau kembali ke data *mock seed*.

### 1.2 Struktur Frontend dan Backend
- **Frontend (`app/`, `components/`, `hooks/`):**
  - Menggunakan folder routing grup `app/(dashboard)/*` untuk 13 tampilan modul utama.
  - Mayoritas komponen halaman menggunakan direktif `"use client"` dan memanggil *store selector* Zustand `useStore((s) => s.xyz)`.
  - Hook otorisasi [hooks/useCurrentUser.ts](file:///c:/CAPSTONE/Usaha.in/hooks/useCurrentUser.ts) dan [hooks/usePermission.ts](file:///c:/CAPSTONE/Usaha.in/hooks/usePermission.ts) membaca pengguna aktif dari Zustand, bukan dari sesi autentikasi Supabase.
- **Backend (`app/api/*`, `lib/supabase/*`):**
  - Tersedia 2 Route Handler:
    1. [app/api/team/route.ts](file:///c:/CAPSTONE/Usaha.in/app/api/team/route.ts): Menangani `GET` (daftar anggota tim), `POST` (buat akun karyawan), `PATCH` (ubah hak akses/status), dan `DELETE` (hapus akun karyawan).
    2. [app/api/profile/route.ts](file:///c:/CAPSTONE/Usaha.in/app/api/profile/route.ts): Menangani `GET` (ambil profil) dan `PATCH` (ubah nama, username, sinkronisasi email, ganti kata sandi).
  - Terdapat pustaka pembantu klien Supabase:
    - [lib/supabase/client.ts](file:///c:/CAPSTONE/Usaha.in/lib/supabase/client.ts): Klien browser SSR (`createBrowserClient`).
    - [lib/supabase/server.ts](file:///c:/CAPSTONE/Usaha.in/lib/supabase/server.ts): Klien server SSR dengan pengelolaan *cookies* Next.js.
    - [lib/supabase/admin.ts](file:///c:/CAPSTONE/Usaha.in/lib/supabase/admin.ts): Klien server menggunakan Service Role Key untuk operasi hak istimewa tinggi (*admin bypass*).
  - **Masalah Kritis Middleware:** Terdapat file [proxy.ts](file:///c:/CAPSTONE/Usaha.in/proxy.ts) di root yang mengekspor fungsi `proxy`. Dalam konvensi Next.js, file middleware wajib bernama `middleware.ts`. Akibatnya, logika penyegaran sesi Supabase pada [lib/supabase/middleware.ts](file:///c:/CAPSTONE/Usaha.in/lib/supabase/middleware.ts) **sama sekali tidak pernah dieksekusi oleh Next.js**.

### 1.3 Teknologi Database yang Digunakan
- Database relasional berbasis cloud: **PostgreSQL (Supabase)**.
- Skema terpusat didefinisikan dalam [supabase/schema.sql](file:///c:/CAPSTONE/Usaha.in/supabase/schema.sql) (738 baris kode SQL) dengan ekstensi `uuid-ossp` dan `pgcrypto`.
- Struktur mencakup 15 tabel, fungsi otomatis (*triggers*), dan fungsi transaksi atomik (*Stored Procedures / RPC*).

### 1.4 Status Koneksi Aplikasi dengan Supabase
- **Terkoneksi:** Klien Supabase dapat berkomunikasi dengan proyek Supabase Cloud melalui kredensial URL dan API Key.
- **Taraf Pemanfaatan:** Baru dimanfaatkan sebatas otentikasi login, registrasi akun pemilik, pendaftaran/penghapusan karyawan di tabel `users` dan `auth.users`. 13 tabel operasional bisnis lainnya masih pasif (*dormant*).

### 1.5 Mekanisme Autentikasi dan Manajemen Pengguna
- **Supabase GoTrue Auth:** Digunakan untuk pendaftaran pemilik usaha ([app/daftar/page.tsx](file:///c:/CAPSTONE/Usaha.in/app/daftar/page.tsx)) dan pembuatan karyawan melalui Admin API ([app/api/team/route.ts](file:///c:/CAPSTONE/Usaha.in/app/api/team/route.ts)).
- **Celah Keamanan Dual-Auth:**
  - Pada halaman login ([app/login/page.tsx](file:///c:/CAPSTONE/Usaha.in/app/login/page.tsx)), sistem mencoba masuk via `supabase.auth.signInWithPassword`. Jika gagal, sistem memiliki fallback otomatis memverifikasi password secara *plaintext* ke state lokal Zustand (`mock-data.ts`).
  - Masih tersedia tombol pintas bypass **"Akun Demo Contoh (Toko Sejahtera) — 1-Klik Masuk"** untuk Pak Ahmad (`owner-1`) yang langsung mengarahkan ke dashboard tanpa autentikasi Supabase.
- **Role-Based Access Control (RBAC):**
  - Level hak akses: `none`, `view`, `manage` untuk setiap modul.
  - Template jabatan: Pemilik Usaha (Owner), Staf Penjualan, Kasir, Staf Gudang, Staf Keuangan, Kustom.
  - Proteksi rute saat ini hanya berjalan di sisi *client component* (`redirect("/tidak-ada-akses")`). Karena `middleware.ts` belum aktif, proteksi rute di tingkat HTTP server belum terlaksana.

### 1.6 Pembagian Modul: Supabase vs Zustand / LocalStorage / Mock Data

| Lapisan / Modul | Sumber Data Aktual | Menggunakan Supabase? | Menggunakan Zustand / LocalStorage? |
|---|---|:---:|:---:|
| **Pendaftaran & Registrasi UMKM** | Supabase Auth + Trigger SQL | **Ya** | Ya (Sinkronisasi awal) |
| **Login Pengguna** | Supabase Auth (dengan fallback Zustand) | **Sebagian** | Ya (Fallback jika server gagal) |
| **Manajemen Tim & Karyawan** | Supabase Auth + API `/api/team` | **Ya** | Ya (Optimistic UI state) |
| **Profil Saya & Ganti Password** | Supabase Auth + API `/api/profile` | **Ya** | Ya (Update store nama/email) |
| **Pengaturan Usaha (F-01)** | `lib/store.ts` | **Tidak** | **100% LocalStorage** |
| **Produk & Katalog (F-02)** | `lib/mock-data.ts` (10 produk awal) | **Tidak** | **100% LocalStorage** |
| **Penjualan & Impor Transaksi (F-03, F-04)** | `lib/mock-data.ts` (54 pesanan awal) | **Tidak** | **100% LocalStorage** |
| **Stok & Ledger Mutasi (F-05)** | `lib/mock-data.ts` + Zustand | **Tidak** | **100% LocalStorage** |
| **Pengeluaran & Utang (F-06)** | `lib/mock-data.ts` (4 biaya awal) | **Tidak** | **100% LocalStorage** |
| **Pembayaran & Piutang (F-07)** | Dihitung dari `orders` Zustand | **Tidak** | **100% LocalStorage** |
| **Pengiriman (F-08)** | Status pada `orders` Zustand | **Tidak** | **100% LocalStorage** |
| **Data Pelanggan (F-09)** | `lib/mock-data.ts` (18 pelanggan awal) | **Tidak** | **100% LocalStorage** |
| **Laporan Keuangan & Periodik (F-10, F-11)** | Komputasi lokal `lib/finance.ts` | **Tidak** | **100% LocalStorage** |
| **Batas Pengeluaran & Prive (F-12, F-13)** | State `budgets` Zustand | **Tidak** | **100% LocalStorage** |
| **Payroll Karyawan (F-14)** | Tabel `payrolls` SQL ada, UI **TIDAK ADA** | **Tabel Pasif** | **Tidak Ada** |
| **Dashboard Owner (F-15)** | Agregasi dinamis dari orders/expenses | **Tidak** | **100% LocalStorage** |
| **Analitik PVM, Health, Tindakan (F-16–F-19)** | Algoritma JS di komponen `analitik` | **Tidak** | **100% LocalStorage** |
| **Forecasting (F-20)** | Tidak ada kode / UI | **Tidak** | **Tidak Ada** |
| **AI Business Copilot (F-21)** | Skenario statis `copilot-scenarios.ts` | **Tidak** | **100% LocalStorage** |

### 1.7 Struktur API dan Mekanisme Komunikasi
- **Endpoint yang Ada:**
  - `GET /api/team`, `POST /api/team`, `PATCH /api/team`, `DELETE /api/team`
  - `GET /api/profile`, `PATCH /api/profile`
- **Mekanisme Komunikasi:** Menggunakan `fetch()` standar dengan format pertukaran JSON.
- **Kelemahan Otorisasi Header:** Endpoint API menerima header kustom `x-owner-email` dan `x-user-id` yang diteruskan dari browser. Mekanisme ini rentan terhadap pemalsuan (*header spoofing*) karena server tidak memvalidasi JWT cookie secara tegas apabila sesi cookie gagal terbaca.

### 1.8 Konfigurasi Environment yang Diperlukan
Aplikasi membutuhkan variabel lingkungan berikut di dalam `.env.local` (nama variabel saja):
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `OPENAI_API_KEY` atau `GEMINI_API_KEY` (untuk pemenuhan F-21 AI Copilot berbasis LLM)

---

## 2. EVALUASI SELURUH FITUR BERDASARKAN PROPOSAL (F-01 SAMPAI F-22)

### F-01: Pengaturan Usaha
- **Kebutuhan Proposal:** Profil identitas usaha (nama, alamat, kontak, NIB), pilihan tipe usaha (dagang, produksi, jasa) yang secara dinamis mengatur modul aktif, toggle fitur (stok, produksi, piutang tempo, pengiriman), saldo kas awal (`initialCash`), piutang awal, utang awal, dan konfigurasi fee default per kanal.
- **Kondisi Implementasi:** UI tersedia di [app/(dashboard)/pengaturan/page.tsx](file:///c:/CAPSTONE/Usaha.in/app/(dashboard)/pengaturan/page.tsx). Form profil, saldo awal, dan pengaturan fee kanal dapat diedit. Namun, perubahan hanya disimpan ke state Zustand `updateTenantSettings()`. Data tidak pernah disimpan ke kolom `tenants.business_settings` di Supabase. Toggle `useCredit` dan `useProduction` ada di interface TypeScript tetapi belum memiliki kontrol sakelar di antarmuka. Saldo kas awal yang dimasukkan tidak diintegrasikan ke perhitungan kas Neraca.
- **Penilaian Pemenuhan:** **Memenuhi Sebagian**.

### F-02: Manajemen Produk
- **Kebutuhan Proposal:** Katalog produk multi-tipe (barang jadi, bahan baku, jasa), SKU unik, nama produk, harga jual, harga beli/HPP standar, stok fisik, batas stok minimum, pemetaan nama produk per kanal penjualan, serta dukungan sistem resep (BOM) untuk tipe usaha produksi.
- **Kondisi Implementasi:** UI tersedia di [app/(dashboard)/produk/page.tsx](file:///c:/CAPSTONE/Usaha.in/app/(dashboard)/produk/page.tsx). Fitur tambah, ubah, hapus produk, pencarian SKU, dan pengaturan stok minimum berjalan lancar di browser. Namun, seluruhnya beroperasi pada state Zustand `products` yang diinisialisasi dari `mock-data.ts`. Tabel `products` di Supabase belum pernah dibaca atau ditulis. Fitur bahan baku, resep/BOM, dan tipe produk jasa belum diimplementasikan di antarmuka.
- **Penilaian Pemenuhan:** **Memenuhi Sebagian**.

### F-03: Input dan Impor Penjualan
- **Kebutuhan Proposal:** Pencatatan penjualan multi-kanal via dua jalur: (1) Form input manual untuk pesanan offline dan WhatsApp, (2) Wizard impor file Excel/CSV untuk Shopee dan Tokopedia dengan fitur auto-mapping kolom, pratinjau 5 baris, validasi duplikasi ID pesanan eksternal, pemotongan stok otomatis, dan ringkasan hasil impor (berhasil, dilewati, gagal).
- **Kondisi Implementasi:** UI tersedia di [app/(dashboard)/penjualan/page.tsx](file:///c:/CAPSTONE/Usaha.in/app/(dashboard)/penjualan/page.tsx). Modal 2 langkah manual dan modal 4 langkah impor file XLSX/CSV berfungsi sangat baik di sisi visual. Deduplikasi pesanan berjalan pada memori browser. Namun, transaksi hasil impor meng-hardcode `customerId: "cust-import"` (tidak terhubung ke pelanggan riil), ongkos kirim diset 0, dan seluruh transaksi hanya tersimpan di memori `orders` Zustand. Belum ada pemanggilan ke tabel `orders` Supabase maupun fungsi RPC `fn_create_order_with_stock`.
- **Penilaian Pemenuhan:** **Memenuhi Sebagian**.

### F-04: Transaksi Penjualan
- **Kebutuhan Proposal:** Daftar riwayat transaksi lintas kanal, penyaringan multi-parameter (kanal, status bayar, status kirim, rentang tanggal), pencarian teks bebas, panel drawer rincian pesanan (subtotal, diskon, fee kanal, ongkir, pendapatan bersih diterima), serta fitur pembatalan pesanan (*void*) yang mengembalikan stok secara atomik.
- **Kondisi Implementasi:** UI tersedia di [app/(dashboard)/penjualan/page.tsx](file:///c:/CAPSTONE/Usaha.in/app/(dashboard)/penjualan/page.tsx). Filter kanal, pencarian, drawer detail, dan tombol pembatalan transaksi berfungsi di sisi visual. Pembatalan pesanan mengembalikan stok di state Zustand. Namun, fungsi RPC database `fn_void_order` yang telah dibuat di Supabase tidak pernah dihubungkan ke tombol tersebut.
- **Penilaian Pemenuhan:** **Memenuhi Sebagian**.

### F-05: Stok dan Mutasi Persediaan
- **Kebutuhan Proposal:** Kartu stok (*stock ledger*) yang mencatat setiap mutasi kuantitas masuk/keluar beserta pemicunya (penjualan, pembelian, produksi, penyesuaian manual), peringatan otomatis jika stok di bawah batas minimum, serta kalkulasi estimasi Days Inventory Outstanding (DIO).
- **Kondisi Implementasi:** UI tersedia di [app/(dashboard)/stok/page.tsx](file:///c:/CAPSTONE/Usaha.in/app/(dashboard)/stok/page.tsx). Ledger mutasi, filter jenis mutasi, dan estimasi DIO berjalan interaktif pada state Zustand `stockMovements`. Penyesuaian stok manual mencatat riwayat penyesuaian. Tabel `stock_movements` di database Supabase masih kosong melompong. Mutasi bahan baku untuk produksi belum tersedia.
- **Penilaian Pemenuhan:** **Memenuhi Sebagian**.

### F-06: Pengeluaran dan HPP
- **Kebutuhan Proposal:** Pencatatan seluruh beban usaha terbagi ke dalam 5 kelompok akuntansi baku (`cogs`, `selling`, `operating`, `other`, `non_expense`), perlakuan khusus pembelian persediaan yang menambah stok barang/bahan bukan langsung membebani laba, pemisahan mutasi Prive agar tidak mengurangi laba, serta validasi batas anggaran pengeluaran.
- **Kondisi Implementasi:** UI tersedia di [app/(dashboard)/pengeluaran/page.tsx](file:///c:/CAPSTONE/Usaha.in/app/(dashboard)/pengeluaran/page.tsx). Terdapat tab Pengeluaran, Utang Usaha, dan Prive. Kategori belanja stok menambah kuantitas barang di state produk. Beban prive dieksklusikan dari L/R. Fitur melewati batas anggaran mewajibkan pengisian alasan. Seluruh data masih disimpan di `expenses` Zustand, belum masuk ke tabel `expenses` dan `expense_items` Supabase. Halaman `/pembelian` dialihkan (*redirect*) ke `/pengeluaran`.
- **Penilaian Pemenuhan:** **Memenuhi Sebagian**.

### F-07: Pembayaran, Piutang, dan Utang
- **Kebutuhan Proposal:** Pengelolaan status pembayaran transaksi (`lunas`, `sebagian`, `belum`, `gagal`), pencatatan cicilan/pelunasan bertahap, laporan piutang usaha lengkap dengan tanggal jatuh tempo dan klasifikasi umur piutang (*aging schedule*: lancar, 1–7 hari, 8–30 hari, >30 hari), serta rekapitulasi utang usaha atas pembelian tempo.
- **Kondisi Implementasi:** UI tersedia di [app/(dashboard)/pembayaran/page.tsx](file:///c:/CAPSTONE/Usaha.in/app/(dashboard)/pembayaran/page.tsx). Matriks aging bucket piutang, modal pencatatan cicilan `recordPayment()`, dan tab utang operasional berfungsi interaktif di browser. Data piutang dihitung dari `orders` Zustand dan utang dari `expenses` Zustand. Tabel Supabase `sale_payments` belum digunakan.
- **Penilaian Pemenuhan:** **Memenuhi Sebagian**.

### F-08: Pengiriman Barang
- **Kebutuhan Proposal:** Papan Kanban status logistik 5 kolom (Pesanan Baru, Diproses, Dikemas, Dikirim, Selesai), pembaruan status hanya oleh pengguna dengan wewenang Kelola, pencatatan log riwayat pengiriman, dan kepatuhan terhadap toggle `useShipping`.
- **Kondisi Implementasi:** UI tersedia di [app/(dashboard)/pengiriman/page.tsx](file:///c:/CAPSTONE/Usaha.in/app/(dashboard)/pengiriman/page.tsx). Perubahan status memperbarui state order lokal dan mencatat entri ke `activityLogs`. Ukuran file komponen sangat ringkas (6 KB). Belum ada interaksi drag-and-drop antar kolom, dan status pengiriman belum tersinkronisasi ke kolom `orders.shipment_status` di Supabase.
- **Penilaian Pemenuhan:** **Memenuhi Sebagian**.

### F-09: Data Pelanggan
- **Kebutuhan Proposal:** Direktori data pelanggan (nama, nomor telepon, email, kanal utama), rekapitulasi riwayat transaksi pesanan per pelanggan, akumulasi total belanja (*lifetime value*), tanggal interaksi terakhir, serta integrasi ke analisis repeat order.
- **Kondisi Implementasi:** UI tersedia di [app/(dashboard)/pelanggan/page.tsx](file:///c:/CAPSTONE/Usaha.in/app/(dashboard)/pelanggan/page.tsx). Daftar pelanggan, rincian pesanan historis, dan kalkulasi total belanja berjalan di sisi klien menggunakan `INITIAL_CUSTOMERS` dari `mock-data.ts`. Transaksi dari impor marketplace tidak membuat profil pelanggan baru karena selalu memakai ID `cust-import`. Tabel `customers` di Supabase belum digunakan.
- **Penilaian Pemenuhan:** **Memenuhi Sebagian**.

### F-10: Laporan Keuangan
- **Kebutuhan Proposal:** Tiga laporan keuangan standar SAK EMKM terpadu: (1) Laporan Laba Rugi bertahap (Pendapatan Kotor, Diskon, Pendapatan Bersih, HPP, Laba Kotor, Beban Penjualan, Beban Operasional, Beban Lain-Lain, Laba Bersih), (2) Neraca Sederhana (Aset Kas + Piutang + Persediaan = Liabilitas Utang Usaha + Ekuitas Modal), (3) Laporan Arus Kas langsung (Kas Masuk, Kas Keluar, Prive, Saldo Kas).
- **Kondisi Implementasi:** UI tersedia di [app/(dashboard)/keuangan/page.tsx](file:///c:/CAPSTONE/Usaha.in/app/(dashboard)/keuangan/page.tsx). Tiga tab laporan tersedia dengan perhitungan dinamis dari data Zustand. Namun terdapat **kelemahan akuntansi serius**:
  1. Neraca mengestimasi kas dengan rumus `allPaidRevenue - allExpensesPaid` tanpa menambahkan saldo modal kas awal (`initialCash`). Jika usaha memiliki kas awal Rp 15 juta dan belum ada transaksi, kas di neraca tampil Rp 0.
  2. Pengakuan pendapatan di L/R hanya menghitung transaksi berstatus `lunas` (basis kas), bertentangan dengan asas akrual sederhana yang dijanjikan proposal.
  3. Laporan Arus Kas tidak menampilkan saldo kas awal periode dan saldo kas akhir periode.
- **Penilaian Pemenuhan:** **Memenuhi Sebagian**.

### F-11: Laporan Periodik
- **Kebutuhan Proposal:** Ringkasan rekapitulasi performa bisnis yang dapat difilter berdasarkan horizon waktu (Harian, Mingguan, Bulanan), menyajikan metrik tren omzet, laba kotor, total pengeluaran, perbandingan antar-kanal, dan daftar produk terlaris (*top-selling products*).
- **Kondisi Implementasi:** UI tersedia di [app/(dashboard)/laporan/page.tsx](file:///c:/CAPSTONE/Usaha.in/app/(dashboard)/laporan/page.tsx). Visualisasi grafik Recharts dan ringkasan metrik berjalan dengan baik dari state lokal. Ditemukan **inkonsistensi formula**: fungsi [lib/finance.ts](file:///c:/CAPSTONE/Usaha.in/lib/finance.ts#L54-L58) menghitung HPP menggunakan harga beli pembelian terakhir (*last purchase price*), sedangkan halaman Keuangan menggunakan rata-rata tertimbang (*moving average / avgCost*). Hal ini menyebabkan perbedaan angka laba antara F-10 dan F-11.
- **Penilaian Pemenuhan:** **Memenuhi Sebagian**.

### F-12: Batas Pengeluaran
- **Kebutuhan Proposal:** Penetapan plafon anggaran biaya per kategori (nominal tetap atau persentase dari target omzet), indikator visual realisasi anggaran (Hijau <80%, Kuning 80–100%, Merah >100%), dan aturan bisnis bahwa batas bersifat peringatan (*warning/alert*) yang mewajibkan input alasan tanpa memblokir penyimpanan transaksi.
- **Kondisi Implementasi:** UI tersedia di [app/(dashboard)/pengaturan/page.tsx](file:///c:/CAPSTONE/Usaha.in/app/(dashboard)/pengaturan/page.tsx) dan terintegrasi di form pengeluaran [app/(dashboard)/pengeluaran/page.tsx](file:///c:/CAPSTONE/Usaha.in/app/(dashboard)/pengeluaran/page.tsx). Indikator warna progress bar dan validasi wajib mengisi `budgetExceedReason` sudah berfungsi di browser via Zustand. Kekurangannya: plafon berbasis persentase omzet dinamis belum tersedia (baru nominal absolut).
- **Penilaian Pemenuhan:** **Memenuhi Sebagian**.

### F-13: Uang Aman Ditarik (Prive)
- **Kebutuhan Proposal:** Formula kalkulasi finansial untuk membantu pemilik UMKM mengetahui berapa dana pribadi yang aman ditarik tanpa mengganggu operasional: `Uang Aman = Kas Riil - Biaya Wajib 30 Hari (Operasional Tetap + Utang Jatuh Tempo) - Dana Cadangan (10% Omzet 30 Hari)`. Dilengkapi target impas harian.
- **Kondisi Implementasi:** Formula tersedia di [app/(dashboard)/dashboard/page.tsx](file:///c:/CAPSTONE/Usaha.in/app/(dashboard)/dashboard/page.tsx) dan di skenario Copilot [lib/copilot-scenarios.ts](file:///c:/CAPSTONE/Usaha.in/lib/copilot-scenarios.ts). Ditemukan **hardcoding data**: di Copilot, komponen `mandatoryExpenses30` diisi angka statis `2_500_000` dan saldo kas dasar di-hardcode `15_000_000`. Perhitungan tidak membaca riwayat beban tetap nyata dari database. Target impas harian belum dihitung secara eksplisit.
- **Penilaian Pemenuhan:** **Memenuhi Sebagian**.

### F-14: Payroll Karyawan
- **Kebutuhan Proposal:** Modul penggajian internal UMKM: pencatatan periode gaji, pemilihan staf, komponen perhitungan (gaji pokok, tunjangan, potongan/kasbon, total gaji bersih), status draft/dibayar, riwayat slip penggajian, dan otomatisasi pembuatan entri pengeluaran kas kelompok `operating` (kategori "Gaji & Upah") saat penggajian disetujui.
- **Kondisi Implementasi:** Tabel `payrolls` telah didefinisikan dengan baik di skema Supabase ([supabase/schema.sql](file:///c:/CAPSTONE/Usaha.in/supabase/schema.sql#L219-L231)). Namun, di sisi frontend **TIDAK ADA SATUPUN file antarmuka, halaman `/payroll`, hook, atau form penggajian**. Fitur ini sama sekali belum dapat diakses atau diuji oleh pengguna.
- **Penilaian Pemenuhan:** **Belum Memenuhi**.

### F-15: Dashboard Pemilik Usaha
- **Kebutuhan Proposal:** Pusat kendali eksekutif untuk Pemilik Usaha: kartu KPI utama (Omzet, Laba Bersih, Pengeluaran, Kas Aktual, Uang Aman Ditarik), skor kesehatan usaha terintegrasi, grafik tren 30 hari, margin keuntungan bersih per kanal, matriks top & bottom produk, serta panel peringatan dini (piutang macet, stok kritis, anggaran terlampaui).
- **Kondisi Implementasi:** UI tersedia di [app/(dashboard)/dashboard/page.tsx](file:///c:/CAPSTONE/Usaha.in/app/(dashboard)/dashboard/page.tsx). Desain visual sangat komprehensif, responsif, dan seluruh widget terisi visualisasi interaktif. Namun, seluruh kartu metrik diagregasikan secara lokal dari data dummy `mock-data.ts`. Dashboard belum membaca data transaksi dari tabel `orders`, `products`, dan `expenses` di Supabase.
- **Penilaian Pemenuhan:** **Memenuhi Sebagian**.

### F-16: Diagnosis Laba Turun (PVM)
- **Kebutuhan Proposal:** Mesin analisis diagnostik varians laba yang membandingkan performa dua periode waktu (misal bulan ini vs bulan lalu) menggunakan dekomposisi Price-Volume-Mix (PVM) ke dalam 5 efek: Efek Harga Jual, Efek Volume Penjualan, Efek Bauran Produk (*Product Mix*), Efek HPP, dan Efek Beban Operasional, dilengkapi interpretasi naratif penyebab penurunan laba.
- **Kondisi Implementasi:** UI tersedia di [app/(dashboard)/analitik/page.tsx](file:///c:/CAPSTONE/Usaha.in/app/(dashboard)/analitik/page.tsx) pada Tab PVM. Formula matematika dekomposisi 5 varians telah dikodekan dengan baik dan menghasilkan grafik batang kontribusi varians. Namun, pengujian runtime belum memvalidasi apakah formula *mix effect* menghasilkan nilai yang matematis tepat pada kondisi data nyata multi-periode, dan sumber data masih murni Zustand lokal.
- **Penilaian Pemenuhan:** **Memenuhi Sebagian**.

### F-17: Health Score dan Early Warning
- **Kebutuhan Proposal:** Indikator kesehatan finansial UMKM dengan rentang skor 0–100 yang dikalkulasikan secara obyektif dari 4 dimensi tertimbang: Margin Keuntungan (30%), Perputaran Persediaan/DIO (25%), Umur Piutang Usaha (25%), dan Rasio Kecukupan Kas terhadap Pengeluaran (20%), disertai status (Sangat Sehat, Waspada, Kritis) dan peringatan anomali.
- **Kondisi Implementasi:** Algoritma kalkulasi ada di [app/(dashboard)/dashboard/page.tsx](file:///c:/CAPSTONE/Usaha.in/app/(dashboard)/dashboard/page.tsx) dan [app/(dashboard)/analitik/page.tsx](file:///c:/CAPSTONE/Usaha.in/app/(dashboard)/analitik/page.tsx). Terdapat **duplikasi dan inkonsistensi implementasi**: bobot dan formula di halaman Dashboard dan Analitik sedikit berbeda. Lebih parah lagi, di antarmuka Copilot, skor kesehatan di-hardcode dengan angka statis `82` alih-alih mengambil hasil kalkulasi riil.
- **Penilaian Pemenuhan:** **Memenuhi Sebagian**.

### F-18: Pengingat Repeat Order
- **Kebutuhan Proposal:** Segmentasi pelanggan berbasis Recency, Frequency, Monetary (RFM) ke dalam kelompok pelanggan (Champions, Loyal, Potensial, Butuh Perhatian, Berisiko Hilang) serta pemicu notifikasi otomatis untuk menghubungi kembali pelanggan yang telah melewati siklus rata-rata pembelian mereka.
- **Kondisi Implementasi:** Kode di [app/(dashboard)/analitik/page.tsx](file:///c:/CAPSTONE/Usaha.in/app/(dashboard)/analitik/page.tsx) L455–508 mengimplementasikan `repeatOrderAlerts`. Fitur ini menghitung interval rata-rata belanja dan memicu alert jika `hariSejakOrderTerakhir > rataRataInterval * 1.25`. Ini merupakan **deteksi keterlambatan pemesanan**, bukan segmentasi RFM penuh sebagaimana tertulis di proposal. Skoring RFM (matriks R, F, M 1–5) belum diimplementasikan.
- **Penilaian Pemenuhan:** **Memenuhi Sebagian**.

### F-19: Daftar Tindakan Mingguan
- **Kebutuhan Proposal:** Halaman agenda kerja taktis mingguan yang secara dinamis menghasilkan daftar rekomendasi tindakan prioritas berdasarkan temuan mesin analitik (menagih piutang yang menua, memesan ulang stok kritis, meninjau kategori biaya yang over-budget, menyapa pelanggan yang telat order).
- **Kondisi Implementasi:** UI tersedia di [app/(dashboard)/analitik/page.tsx](file:///c:/CAPSTONE/Usaha.in/app/(dashboard)/analitik/page.tsx) L513–611 (`weeklyActions`). Rekomendasi di-generate secara dinamis dari kondisi data transaksi di browser, bukan teks statis. Daftar tindakan ini telah memenuhi alur logika bisnis proposal di tingkat prototipe, namun belum tersimpan sebagai objek persistent di database.
- **Penilaian Pemenuhan:** **Memenuhi Sebagian**.

### F-20: Forecasting Penjualan dan Persediaan
- **Kebutuhan Proposal:** Modul peramalan kebutuhan stok dan estimasi penjualan periode berikutnya (mingguan/bulanan) berbasis data historis menggunakan metode kuantitatif sederhana (seperti Moving Average atau Exponential Smoothing), guna mencegah kehabisan barang (*stockout*) atau penumpukan modal (*dead stock*).
- **Kondisi Implementasi:** **Sama sekali tidak ada kode implementasi forecasting di seluruh repositori**. Halaman `/integrasi` yang ada di menu sidebar hanya berupa form konfigurasi channel dummy, bukan modul forecasting. Tidak ada algoritma moving average untuk prediksi penjualan per SKU.
- **Penilaian Pemenuhan:** **Belum Memenuhi**.

### F-21: AI Business Copilot
- **Kebutuhan Proposal:** Asisten kecerdasan buatan interaktif berbasis Large Language Model (LLM) khusus Pemilik Usaha yang mampu menjawab pertanyaan bisnis bahasa alami. LLM wajib memanggil fungsi analitik internal (*function/tool calling*) untuk mengambil angka aktual, tidak boleh mengarang data (*zero hallucination*), dan tidak mengubah database secara sepihak.
- **Kondisi Implementasi:** UI antarmuka percakapan tersedia di [app/(dashboard)/copilot/page.tsx](file:///c:/CAPSTONE/Usaha.in/app/(dashboard)/copilot/page.tsx). Terdapat pembatasan hak akses khusus Owner. **Namun, ini BUKAN AI / LLM aktual:** sistem menggunakan pencocokan kata kunci/regex (*pattern matching*) sederhana pada [lib/copilot-scenarios.ts](file:///c:/CAPSTONE/Usaha.in/lib/copilot-scenarios.ts) ke dalam 7 skenario respons yang sudah disiapkan (*canned responses*). Pertanyaan di luar 7 skenario tersebut hanya menghasilkan pesan fallback generik. Tidak ada pemanggilan API LLM (OpenAI/Anthropic/Gemini) maupun arsitektur *tool calling*.
- **Penilaian Pemenuhan:** **Belum Memenuhi (Masih Rule-Based Mock)**.

### F-22: Manajemen Pengguna dan Hak Akses
- **Kebutuhan Proposal:** Sistem otentikasi login berbasis email/username dan kata sandi terenkripsi (hash), pendaftaran akun karyawan baru oleh Pemilik Usaha, kontrol hak akses berbasis peran (RBAC) granular per modul (Tidak Ada / Lihat / Kelola), penonaktifan akun, dan pencatatan audit log aktivitas.
- **Kondisi Implementasi:** UI tersedia di [app/(dashboard)/tim/page.tsx](file:///c:/CAPSTONE/Usaha.in/app/(dashboard)/tim/page.tsx) dan didukung endpoint backend [app/api/team/route.ts](file:///c:/CAPSTONE/Usaha.in/app/api/team/route.ts). Fitur ini telah terintegrasi dengan Supabase Auth dan tabel `public.users`. Matriks hak akses per modul berfungsi membatasi menu sidebar. Ditemukan **kelemahan keamanan**:
  1. Helper `getAuthenticatedOwner` di `/api/team` dapat dibypass melalui header `x-owner-email` atau fallback akun default.
  2. UI melakukan penghapusan akun karyawan di lokal store meskipun pemanggilan `DELETE /api/team` ke Supabase gagal (*optimistic error bypass*).
  3. Log aktivitas dicatat ke localStorage browser, bukan ke tabel `activity_logs` Supabase.
- **Penilaian Pemenuhan:** **Memenuhi Sebagian**.

---

## 3. TABEL EVALUASI FITUR F-01 SAMPAI F-22

Berikut adalah matriks evaluasi perbandingan antara kebutuhan proposal Capstone dengan kondisi aktual di repositori:

| Kode | Nama Fitur | Kebutuhan Proposal | Implementasi Saat Ini | Sumber Data | Integrasi Supabase | Kesesuaian Proposal | Kekurangan yang Ditemukan |
|:---:|---|---|---|---|:---:|:---:|---|
| **F-01** | Pengaturan Usaha | Profil UMKM, tipe usaha, toggle fitur, saldo awal, fee kanal. | Form profil & saldo awal di [pengaturan/page.tsx](file:///c:/CAPSTONE/Usaha.in/app/(dashboard)/pengaturan/page.tsx). | Zustand `businessSettings` | Belum | **Memenuhi Sebagian** | Belum tersimpan ke `tenants.business_settings`. Saldo kas awal tidak masuk kas Neraca. |
| **F-02** | Manajemen Produk | SKU, nama, harga jual/beli, stok min, resep produksi, pemetaan kanal. | CRUD produk di [produk/page.tsx](file:///c:/CAPSTONE/Usaha.in/app/(dashboard)/produk/page.tsx). | `mock-data.ts` + Zustand | Belum | **Memenuhi Sebagian** | Tabel `products` Supabase belum dikonsumsi. Fitur resep bahan baku produksi belum dibuat. |
| **F-03** | Input & Impor Penjualan | Form manual + impor CSV/XLSX, auto-mapping, dedup, potong stok otomatis. | Form manual & wizard impor 4-step di [penjualan/page.tsx](file:///c:/CAPSTONE/Usaha.in/app/(dashboard)/penjualan/page.tsx). | Zustand `orders` | Belum | **Memenuhi Sebagian** | Impor hardcode `customerId: "cust-import"` & ongkir 0. Belum panggil RPC `fn_create_order_with_stock`. |
| **F-04** | Transaksi Penjualan | Daftar lintas kanal, filter, detail fee, pembatalan pesanan (*void*). | List & drawer pesanan di [penjualan/page.tsx](file:///c:/CAPSTONE/Usaha.in/app/(dashboard)/penjualan/page.tsx). | Zustand `orders` | Belum | **Memenuhi Sebagian** | Tabel `orders` & `order_items` belum dipakai. Tombol pembatalan belum memanggil `fn_void_order`. |
| **F-05** | Stok & Ledger Mutasi | Ledger mutasi keluar/masuk, alert stok kritis, estimasi DIO. | Ledger stok & penyesuaian di [stok/page.tsx](file:///c:/CAPSTONE/Usaha.in/app/(dashboard)/stok/page.tsx). | Zustand `stockMovements` | Belum | **Memenuhi Sebagian** | Tabel `stock_movements` Supabase kosong. Mutasi bahan baku produksi belum didukung. |
| **F-06** | Pengeluaran & HPP | Pengeluaran 5 kelompok, belanja stok masuk persediaan, Prive dipisahkan. | Tab Pengeluaran, Utang, Prive di [pengeluaran/page.tsx](file:///c:/CAPSTONE/Usaha.in/app/(dashboard)/pengeluaran/page.tsx). | `mock-data.ts` + Zustand | Belum | **Memenuhi Sebagian** | Tabel `expenses` & `expense_items` belum terhubung. Halaman `/pembelian` hanya redirect. |
| **F-07** | Pembayaran, Piutang, Utang | Status bayar, bayar sebagian, aging piutang, pelacakan utang usaha. | Matriks aging piutang di [pembayaran/page.tsx](file:///c:/CAPSTONE/Usaha.in/app/(dashboard)/pembayaran/page.tsx). | Zustand `orders` & `expenses` | Belum | **Memenuhi Sebagian** | Belum membaca/menulis ke tabel Supabase `sale_payments`. |
| **F-08** | Kanban Pengiriman | Kanban 5 status, otorisasi kelola, log mutasi status kirim. | Papan kanban di [pengiriman/page.tsx](file:///c:/CAPSTONE/Usaha.in/app/(dashboard)/pengiriman/page.tsx). | Zustand `orders` | Belum | **Memenuhi Sebagian** | Drag-drop belum ada. Status kirim belum tersambung ke `orders.shipment_status` Supabase. |
| **F-09** | Data Pelanggan | Master pelanggan, total belanja, tanggal order terakhir, riwayat beli. | Daftar pelanggan di [pelanggan/page.tsx](file:///c:/CAPSTONE/Usaha.in/app/(dashboard)/pelanggan/page.tsx). | `mock-data.ts` + Zustand | Belum | **Memenuhi Sebagian** | Tabel `customers` Supabase belum digunakan. Transaksi impor tidak membuat profil pelanggan. |
| **F-10** | Laporan Keuangan | L/R bertahap, Neraca sederhana, Arus Kas langsung standar SAK EMKM. | 3 Tab laporan di [keuangan/page.tsx](file:///c:/CAPSTONE/Usaha.in/app/(dashboard)/keuangan/page.tsx). | Komputasi lokal Zustand | Belum | **Memenuhi Sebagian** | Neraca abaikan `initialCash`. Pendapatan basis kas bukan akrual. Arus kas tanpa saldo awal. |
| **F-11** | Laporan Periodik | Ringkasan harian/mingguan/bulanan, KPI, tren penjualan, top produk. | Grafik tren & kartu KPI di [laporan/page.tsx](file:///c:/CAPSTONE/Usaha.in/app/(dashboard)/laporan/page.tsx). | Komputasi `finance.ts` | Belum | **Memenuhi Sebagian** | Formula HPP di `finance.ts` memakai harga beli terakhir, bertabrakan dengan `avgCost` di F-10. |
| **F-12** | Batas Pengeluaran | Plafon nominal/persentase omzet, indikator warna, warning alasan lewati batas. | Plafon kategori di [pengaturan/page.tsx](file:///c:/CAPSTONE/Usaha.in/app/(dashboard)/pengaturan/page.tsx) & form pengeluaran. | Zustand `budgets` | Belum | **Memenuhi Sebagian** | Hanya mendukung nominal tetap. Plafon persentase omzet dinamis belum ada. |
| **F-13** | Uang Aman Ditarik | Formula kas aman ditarik pemilik, beban wajib 30 hari, cadangan darurat. | Indikator di [dashboard/page.tsx](file:///c:/CAPSTONE/Usaha.in/app/(dashboard)/dashboard/page.tsx) & Copilot. | Hardcoded + Zustand | Belum | **Memenuhi Sebagian** | Copilot hardcode beban wajib Rp 2,5 jt & kas Rp 15 jt. Target impas harian belum ada. |
| **F-14** | Payroll Karyawan | Gaji pokok, tunjangan, potongan, slip gaji, otomatis masuk beban operasional. | **TIDAK ADA UI / HALAMAN**. Hanya ada tabel SQL di Supabase. | Tidak Ada | **Hanya Tabel** | **Belum Memenuhi** | Belum ada halaman `/payroll`, belum ada komponen UI, belum terhubung ke pengeluaran. |
| **F-15** | Dashboard Owner | KPI terpadu, grafik 30 hari, margin kanal, skor kesehatan, panel alert. | Dashboard eksekutif lengkap di [dashboard/page.tsx](file:///c:/CAPSTONE/Usaha.in/app/(dashboard)/dashboard/page.tsx). | Agregasi `mock-data.ts` | Belum | **Memenuhi Sebagian** | Seluruh widget membaca dari data mock browser, belum tersambung ke transaksi Supabase. |
| **F-16** | Diagnosis Laba Turun | Dekomposisi PVM 5 efek (Price, Volume, Mix, COGS, Expense), narasi solusi. | Tab PVM di [analitik/page.tsx](file:///c:/CAPSTONE/Usaha.in/app/(dashboard)/analitik/page.tsx). | Komputasi lokal Zustand | Belum | **Memenuhi Sebagian** | Logika matematika ada, namun belum diuji validitas runtime dengan dataset riil multi-bulan. |
| **F-17** | Health Score | Skor 0–100 dari 4 pilar finansial, status risiko, indikator peringatan dini. | Dihitung di [dashboard/page.tsx](file:///c:/CAPSTONE/Usaha.in/app/(dashboard)/dashboard/page.tsx) & [analitik/page.tsx](file:///c:/CAPSTONE/Usaha.in/app/(dashboard)/analitik/page.tsx). | Duplikasi kalkulasi | Belum | **Memenuhi Sebagian** | Duplikasi formula antar halaman. Copilot meng-hardcode skor statis 82. |
| **F-18** | Repeat Order Reminder | Segmentasi RFM (Recency, Frequency, Monetary), pengingat siklus order. | Deteksi jeda order di [analitik/page.tsx](file:///c:/CAPSTONE/Usaha.in/app/(dashboard)/analitik/page.tsx) L455. | Komputasi lokal Zustand | Belum | **Memenuhi Sebagian** | Hanya deteksi keterlambatan pemesanan interval, bukan segmentasi matriks RFM penuh. |
| **F-19** | Tindakan Mingguan | Rekomendasi prioritas berbasis kondisi data (piutang, stok, budget, order). | Modul rekomendasi di [analitik/page.tsx](file:///c:/CAPSTONE/Usaha.in/app/(dashboard)/analitik/page.tsx) L513. | Komputasi dinamis JS | Belum | **Memenuhi Sebagian** | Berjalan di memori browser, belum tersimpan sebagai agenda persistent di database. |
| **F-20** | Forecasting | Peramalan kuantitatif penjualan & persediaan periode mendatang (Moving Avg). | **TIDAK ADA IMPLEMENTASI**. Halaman `/integrasi` hanya form channel. | Tidak Ada | Belum | **Belum Memenuhi** | Belum ada fungsi, algoritma, maupun komponen antarmuka peramalan penjualan. |
| **F-21** | AI Business Copilot | Chatbot LLM, tool calling ke fungsi analitik, anti-halusinasi, khusus Owner. | Chat UI di [copilot/page.tsx](file:///c:/CAPSTONE/Usaha.in/app/(dashboard)/copilot/page.tsx), 7 skenario respons teks. | Skenario regex statis | Belum | **Belum Memenuhi** | Bukan LLM asli; pencocokan pola regex ke teks statis. Tidak ada integrasi API LLM. |
| **F-22** | User Management | Auth enkripsi, penugasan RBAC per modul (Lihat/Kelola), audit trail. | Tim page di [tim/page.tsx](file:///c:/CAPSTONE/Usaha.in/app/(dashboard)/tim/page.tsx) & API `/api/team`. | Supabase Auth + Users | **Sudah** | **Memenuhi Sebagian** | Celah otorisasi header `x-owner-email`. Optimistic delete abaikan error server. Audit log di lokal. |

---

## 4. PEMERIKSAAN DATA DEMO DAN SIMULASI (14 AREA)

Berdasarkan penelusuran menyeluruh pada [lib/mock-data.ts](file:///c:/CAPSTONE/Usaha.in/lib/mock-data.ts) dan komponen UI, berikut rincian ketergantungan data demo di seluruh area:

1. **Dashboard dan Grafik:**
   - *Asal Data:* Dihitung dari 54 pesanan demo dan 4 pengeluaran demo di memori Zustand.
   - *Jenis Data:* **Mock Data** yang di-seed saat aplikasi pertama kali dibuka.
   - *Status:* Data simulasi untuk demonstrasi visual.
   - *Tindakan Transisi:* Ganti pemanggilan `useStore((s) => s.orders)` dengan query agregasi data riil ke tabel Supabase `orders` dan `expenses`.
2. **Produk dan Stok:**
   - *Asal Data:* Array `INITIAL_PRODUCTS` (10 produk tetap: Kopi Susu Gula Aren, Americano, Croissant, dll.).
   - *Jenis Data:* **Mock Data Statis** di [lib/mock-data.ts](file:///c:/CAPSTONE/Usaha.in/lib/mock-data.ts#L33-L121).
   - *Status:* Data demo prototipe.
   - *Tindakan Transisi:* Migrasikan schema produk ke tabel Supabase `products`, buat service fetch data produk dari Supabase, dan hapus array statis.
3. **Penjualan dan Transaksi:**
   - *Asal Data:* Array `INITIAL_ORDERS` (54 transaksi pesanan demo dari berbagai kanal).
   - *Jenis Data:* **Mock Data** di [lib/mock-data.ts](file:///c:/CAPSTONE/Usaha.in/lib/mock-data.ts#L173-L520).
   - *Status:* Data demo prototipe.
   - *Tindakan Transisi:* Hubungkan form input manual dan wizard parser impor ke pemanggilan RPC Supabase `fn_create_order_with_stock`.
4. **Pengeluaran dan HPP:**
   - *Asal Data:* Array `INITIAL_EXPENSES` (4 catatan biaya: sewa tempat, listrik, iklan FB, kemasan).
   - *Jenis Data:* **Mock Data** di [lib/mock-data.ts](file:///c:/CAPSTONE/Usaha.in/lib/mock-data.ts#L525-L558).
   - *Status:* Data demo prototipe.
   - *Tindakan Transisi:* Hubungkan form pengeluaran dan pelunasan utang ke tabel Supabase `expenses` dan `expense_items`.
5. **Pembayaran, Piutang, dan Utang:**
   - *Asal Data:* Dihitung secara dinamis dari order yang berstatus `paymentStatus: "belum"` atau `"sebagian"` pada data mock pesanan.
   - *Jenis Data:* **Simulasi In-Memory**.
   - *Status:* Data demo prototipe.
   - *Tindakan Transisi:* Baca data piutang langsung dari `orders` yang belum lunas di Supabase, dan catat pelunasan ke tabel `sale_payments`.
6. **Data Pelanggan:**
   - *Asal Data:* Array `INITIAL_CUSTOMERS` (18 nama pelanggan: Budi Santoso, Siti Rahma, dll.).
   - *Jenis Data:* **Mock Data** di [lib/mock-data.ts](file:///c:/CAPSTONE/Usaha.in/lib/mock-data.ts#L125-L168).
   - *Status:* Data demo prototipe.
   - *Tindakan Transisi:* Simpan pelanggan baru ke tabel Supabase `customers` saat ada transaksi baru atau saat impor data.
7. **Laporan Keuangan dan Laporan Periodik:**
   - *Asal Data:* Fungsi kalkulator lokal pada [lib/finance.ts](file:///c:/CAPSTONE/Usaha.in/lib/finance.ts) yang mengolah array mock pesanan dan mock pengeluaran.
   - *Jenis Data:* **Hasil Komputasi Memori Browser**.
   - *Status:* Simulasi angka demo.
   - *Tindakan Transisi:* Buat query view / API endpoint yang menghitung agregasi finansial langsung dari database PostgreSQL Supabase dengan filter tanggal riil.
8. **Batas Pengeluaran dan Uang Aman Ditarik:**
   - *Asal Data:* Rekaman batas tersimpan di localStorage `budgets`. Di Copilot, angka biaya wajib di-hardcode `2_500_000` dan kas dasar `15_000_000`.
   - *Jenis Data:* **Hardcoded Value & LocalStorage**.
   - *Status:* Simulasi statis.
   - *Tindakan Transisi:* Simpan batas anggaran ke tabel Supabase `tenants.business_settings` dan hitung biaya wajib dari rata-rata beban operasional aktual 30 hari terakhir.
9. **Payroll Karyawan:**
   - *Asal Data:* Tidak ada data, tidak ada antarmuka.
   - *Jenis Data:* **Nihil**.
   - *Status:* Belum dibuat.
   - *Tindakan Transisi:* Bangun antarmuka penggajian `/payroll` yang menarik daftar staf dari tabel `users` dan menyimpan payroll ke tabel `payrolls`.
10. **Analitik dan Health Score:**
    - *Asal Data:* Dihitung oleh rumus javascript di komponen React dari data pesanan demo. Di Copilot angka skor di-hardcode `82`.
    - *Jenis Data:* **Hardcoded & Komputasi Lokal**.
    - *Status:* Simulasi prototipe.
    - *Tindakan Transisi:* Satukan logika skor kesehatan ke dalam satu modul domain murni yang membaca data transaksi Supabase.
11. **Repeat Order Reminder dan Weekly Action List:**
    - *Asal Data:* Dihasilkan secara langsung (*on the fly*) oleh fungsi `useMemo` di [app/(dashboard)/analitik/page.tsx](file:///c:/CAPSTONE/Usaha.in/app/(dashboard)/analitik/page.tsx).
    - *Jenis Data:* **Kalkulasi Sementara (Ephemeral)**.
    - *Status:* Simulasi prototipe.
    - *Tindakan Transisi:* Buat endpoint analitik yang memproses query SQL berkala untuk mendeteksi pelanggan terlambat dan piutang jatuh tempo.
12. **Forecasting Penjualan dan Persediaan:**
    - *Asal Data:* Tidak ada data maupun algoritma.
    - *Jenis Data:* **Nihil**.
    - *Status:* Belum dibuat.
    - *Tindakan Transisi:* Buat fungsi moving average 3–4 periode mingguan berdasarkan riwayat kuantitas penjualan per SKU di tabel `order_items`.
13. **AI Business Copilot:**
    - *Asal Data:* Skenario statis pada [lib/copilot-scenarios.ts](file:///c:/CAPSTONE/Usaha.in/lib/copilot-scenarios.ts).
    - *Jenis Data:* **Teks Statis (Canned Script)**.
    - *Status:* Mock respons demo.
    - *Tindakan Transisi:* Hubungkan antarmuka chat ke API LLM sungguhan (OpenAI / Gemini API) dengan skema *Function Calling / Tool Calling* yang memanggil fungsi agregasi database.
14. **User Management:**
    - *Asal Data:* Sudah menggunakan data riil dari Supabase Auth dan tabel `public.users`. Namun daftar pengguna awal masih memiliki cadangan data dummy di [lib/mock-data.ts](file:///c:/CAPSTONE/Usaha.in/lib/mock-data.ts#L1-L28).
    - *Jenis Data:* **Campuran (Supabase Aktif + Mock Fallback)**.
    - *Status:* Sudah sebagian aktual.
    - *Tindakan Transisi:* Hapus akun demo statis Pak Ahmad (`owner123`) dari kode sumber dan wajibkan otentikasi Supabase murni.

---

## 5. PEMERIKSAAN DATABASE DAN BACKEND SUPABASE

### 5.1 Status Pemanfaatan Tabel Skema Supabase

| Nama Tabel | Sudah Ada di SQL? | Sudah Terintegrasi ke Frontend? | Catatan Kesiapan Backend |
|---|:---:|:---:|---|
| `tenants` | Ya | Sebagian | Terisi saat registrasi, namun `business_settings` belum terupdate dari form Pengaturan. |
| `users` | Ya | **Sudah** | Terintegrasi penuh via API `/api/team` dan `/api/profile`. |
| `products` | Ya | **Belum** | Tabel siap, memiliki trigger `updated_at`, belum pernah di-query frontend. |
| `stock_movements` | Ya | **Belum** | Tabel siap dengan constraint tipe `sale`, `purchase`, `adjustment`. Belum pernah diisi. |
| `customers` | Ya | **Belum** | Tabel siap dengan FK ke tenant. Belum terhubung ke frontend. |
| `suppliers` | Ya | **Belum** | Tabel siap untuk master pemasok. Belum terhubung ke form pengeluaran. |
| `orders` | Ya | **Belum** | Tabel siap menampung transaksi multi-kanal beserta fee dan status logistik. |
| `order_items` | Ya | **Belum** | Tabel detail siap dengan snapshot `cogs_unit`. |
| `sale_payments` | Ya | **Belum** | Tabel siap menampung cicilan dan pelunasan piutang. |
| `purchases` | Ya | **Belum** | Tabel siap mencatat pembelian stok barang fisik. |
| `expense_categories` | Ya | Sebagian | Di-seed secara otomatis saat pendaftaran tenant baru. |
| `expenses` | Ya | **Belum** | Tabel siap menampung pengeluaran 5 kelompok, utang, dan prive. |
| `expense_items` | Ya | **Belum** | Tabel siap menampung rincian belanja modal stok persediaan. |
| `payrolls` | Ya | **Belum** | Tabel siap menampung penggajian, belum ada endpoint API maupun UI frontend. |
| `activity_logs` | Ya | **Belum** | Tabel siap menampung audit trail, namun frontend masih menulis ke localStorage. |

### 5.2 Relasi Antartabel, Primary Key, dan Foreign Key
- Seluruh tabel menggunakan **UUID** sebagai Primary Key dengan default `gen_random_uuid()`.
- Integritas data antar-tabel dijamin kuat oleh Foreign Key:
  - `tenant_id` terikat ke `tenants(id) ON DELETE CASCADE` pada seluruh tabel.
  - `user_id` di `users` terikat langsung ke `auth.users(id) ON DELETE CASCADE`.
  - Item detail terikat ke header: `order_items -> orders`, `expense_items -> expenses` dengan `ON DELETE CASCADE`.
  - Hubungan transaksi ke produk menggunakan `ON DELETE RESTRICT` pada `order_items` dan `purchases`, sehingga mencegah produk terhapus jika sudah pernah memiliki riwayat transaksi.

### 5.3 Kebijakan Row Level Security (RLS) dan Hak Akses
- RLS telah diaktifkan pada ke-15 tabel menggunakan fungsi pembantu:
  - `public.get_auth_tenant_id()`: Mengambil ID tenant berdasarkan `auth.uid()`.
  - `public.is_auth_owner()`: Memeriksa apakah pengguna berstatus Owner.
- **Temuan Konfigurasi Hak Akses SQL yang Perlu Diperbaiki:**
  Di baris 730–737 pada `supabase/schema.sql`:
  ```sql
  GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
  GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
  ```
  Pemberian hak `ALL` ke role `anon` (pengguna publik tanpa login) sangat berbahaya. Hak `anon` wajib dicabut dari tabel-tabel sensitif (`orders`, `expenses`, `users`, `payrolls`).

### 5.4 Backend Function / Stored Procedure (RPC) yang Sudah Ada Namun Belum Dipakai
Di dalam `supabase/schema.sql` telah disiapkan fungsi transaksi atomik ACID:
1. `public.fn_create_order_with_stock(...)`: Memasukkan data pesanan, rincian item, mengurangi kuantitas stok produk, dan mencatat log mutasi stok dalam satu transaksi utuh.
2. `public.fn_void_order(...)`: Membatalkan transaksi pesanan dan otomatis mengembalikan stok barang (*restore stock*).
3. `public.fn_record_purchase(...)`: Mencatat pembelian barang, menambah stok fisik, dan memperbarui HPP rata-rata bergerak (*moving average*) secara otomatis.
4. `public.fn_delete_employee(...)`: Menghapus karyawan dari `public.users` dan `auth.users` secara bersamaan.

---

## 6. PEMERIKSAAN ATURAN BISNIS DAN AKUNTANSI

Berikut adalah perbandingan implementasi kode terhadap 14 aturan bisnis dan prinsip akuntansi proposal:

| # | Aturan Bisnis Proposal | Status Implementasi | Bukti Kode Sumber | Keterangan & Deviasi |
|---|---|:---:|---|---|
| 1 | **Pembelian stok masuk persediaan (aset), bukan beban langsung** | **Sesuai** | [app/(dashboard)/pengeluaran/page.tsx](file:///c:/CAPSTONE/Usaha.in/app/(dashboard)/pengeluaran/page.tsx) & [lib/store.ts](file:///c:/CAPSTONE/Usaha.in/lib/store.ts#L666) | Kategori biaya belanja stok ditandai `isStockRelated: true` dan menambah saldo barang, tidak memotong laba operasional. |
| 2 | **HPP diakui saat barang terjual** | **Sesuai Sebagian** | [keuangan/page.tsx](file:///c:/CAPSTONE/Usaha.in/app/(dashboard)/keuangan/page.tsx#L129) vs [lib/finance.ts](file:///c:/CAPSTONE/Usaha.in/lib/finance.ts#L54) | Diakui saat penjualan, namun terjadi inkonsistensi: `keuangan` memakai `avgCost`, sedangkan `finance.ts` memakai harga beli terakhir. |
| 3 | **Prive tidak dihitung sebagai beban operasional** | **Sesuai** | [types/index.ts](file:///c:/CAPSTONE/Usaha.in/types/index.ts#L198) & [keuangan/page.tsx](file:///c:/CAPSTONE/Usaha.in/app/(dashboard)/keuangan/page.tsx#L137) | Prive diklasifikasikan ke grup `non_expense`, dikeluarkan dari perhitungan L/R, dan disajikan terpisah di Arus Kas. |
| 4 | **Penjualan tempo/kredit membentuk piutang usaha** | **Sesuai** | [app/(dashboard)/pembayaran/page.tsx](file:///c:/CAPSTONE/Usaha.in/app/(dashboard)/pembayaran/page.tsx#L34-L100) | Pesanan dengan `paymentStatus: "belum"` atau `"sebagian"` otomatis masuk ke daftar piutang dan tabel aging schedule. |
| 5 | **Pembelian belum lunas membentuk utang usaha** | **Sesuai** | [app/(dashboard)/pengeluaran/page.tsx](file:///c:/CAPSTONE/Usaha.in/app/(dashboard)/pengeluaran/page.tsx) | Pengeluaran dengan `paid: false` otomatis masuk tab Utang Usaha dengan tanggal jatuh tempo dan peringatan keterlambatan. |
| 6 | **Perhitungan Laba/Rugi bertahap** | **Sesuai Sebagian** | [app/(dashboard)/keuangan/page.tsx](file:///c:/CAPSTONE/Usaha.in/app/(dashboard)/keuangan/page.tsx#L124-L150) | Struktur bertahap sudah benar. Masalah: pendapatan hanya dihitung dari pesanan `lunas` (basis kas), bukan akrual. |
| 7 | **Neraca Sederhana (Aset = Kewajiban + Ekuitas)** | **Belum Sesuai** | [app/(dashboard)/keuangan/page.tsx](file:///c:/CAPSTONE/Usaha.in/app/(dashboard)/keuangan/page.tsx#L157) | **Bug Akuntansi**: Kas di neraca dihitung dari `allPaidRevenue - allExpensesPaid` tanpa menambahkan saldo modal awal (`initialCash`). |
| 8 | **Laporan Arus Kas langsung** | **Sesuai Sebagian** | [app/(dashboard)/keuangan/page.tsx](file:///c:/CAPSTONE/Usaha.in/app/(dashboard)/keuangan/page.tsx#L174-L178) | Menampilkan arus kas masuk bersih, pengeluaran kas, dan prive. Belum menyajikan baris Kas Awal dan Kas Akhir Periode. |
| 9 | **Batas pengeluaran memperingatkan, tidak memblokir** | **Sesuai** | [app/(dashboard)/pengeluaran/page.tsx](file:///c:/CAPSTONE/Usaha.in/app/(dashboard)/pengeluaran/page.tsx) L75-L81 | Form tetap dapat disimpan setelah pengguna mengisi alasan lewati batas (`budgetExceedReason`). |
| 10 | **Perhitungan Uang Aman Ditarik** | **Sesuai Sebagian** | [lib/copilot-scenarios.ts](file:///c:/CAPSTONE/Usaha.in/lib/copilot-scenarios.ts#L43-L48) | Rumus dasar benar, namun biaya wajib di-hardcode Rp 2.500.000 dan saldo kas dasar di-hardcode Rp 15.000.000. |
| 11 | **Health Score dan indikator peringatan** | **Sesuai Sebagian** | [dashboard/page.tsx](file:///c:/CAPSTONE/Usaha.in/app/(dashboard)/dashboard/page.tsx) & [analitik/page.tsx](file:///c:/CAPSTONE/Usaha.in/app/(dashboard)/analitik/page.tsx) | Ada duplikasi dan perbedaan formula di dua halaman; Copilot meng-hardcode skor statis 82. |
| 12 | **Diagnosis Laba Turun (PVM 5 Efek)** | **Sesuai** | [app/(dashboard)/analitik/page.tsx](file:///c:/CAPSTONE/Usaha.in/app/(dashboard)/analitik/page.tsx) L44-L234 | Memisahkan varians Price, Volume, Mix, COGS, dan Beban Operasional. Perlu validasi data multi-periode. |
| 13 | **Forecasting Penjualan & Persediaan** | **Belum Memenuhi** | — | Sama sekali belum ada rumus atau algoritma peramalan yang diimplementasikan. |
| 14 | **Copilot memanggil fungsi analitik tanpa mengarang** | **Belum Memenuhi** | [lib/copilot-scenarios.ts](file:///c:/CAPSTONE/Usaha.in/lib/copilot-scenarios.ts) | Bukan integrasi LLM; menggunakan skenario regex statis yang mengabaikan fungsi kecerdasan buatan. |

---

## 7. REKOMENDASI PENGEMBANGAN: DARI DEMO MENUJU APLIKASI SEBENARNYA

Agar Usaha.in bertransformasi dari prototipe klikabel menjadi aplikasi produksi yang kokoh sesuai proposal Capstone, berikut adalah rekomendasi dan roadmap pengerjaan berurutan berdasarkan F-01 sampai F-22:

### 7.1 Fitur yang Sudah Baik dan Dipertahankan
1. **Desain Antarmuka & UX (UI Design System):** Desain visual, tata letak dasbor, skema warna HSL, mode gelap/terang, dan drawer rincian pesanan sudah sangat matang dan profesional.
2. **Skema Basis Data Supabase ([supabase/schema.sql](file:///c:/CAPSTONE/Usaha.in/supabase/schema.sql)):** Desain tabel 3NF, integritas Foreign Key, dan Stored Procedure/RPC transaksi atomik sudah sangat komprehensif.
3. **Logika Form Pengeluaran & Prive (F-06):** Kategorisasi 5 kelompok akuntansi dan pemisahan Prive sudah sesuai dengan standar akuntansi UMKM.
4. **Matriks Otorisasi Modul (F-22):** Struktur izin Lihat/Kelola dan template jabatan di [lib/permissions.ts](file:///c:/CAPSTONE/Usaha.in/lib/permissions.ts) sudah rapi.

### 7.2 Fitur yang Perlu Diperbaiki (*Fixing*)
1. **Keamanan Autentikasi & API (P0):**
   - Hapus parameter `x-owner-email` di [app/api/team/route.ts](file:///c:/CAPSTONE/Usaha.in/app/api/team/route.ts) dan `userId` di [app/api/profile/route.ts](file:///c:/CAPSTONE/Usaha.in/app/api/profile/route.ts). Wajibkan verifikasi token cookie murni.
   - Aktifkan middleware dengan mengubah nama [proxy.ts](file:///c:/CAPSTONE/Usaha.in/proxy.ts) menjadi `middleware.ts`.
   - Hapus tombol 1-klik akun demo di halaman login ([app/login/page.tsx](file:///c:/CAPSTONE/Usaha.in/app/login/page.tsx)).
2. **Koreksi Perhitungan Keuangan (P1):**
   - Perbaiki Neraca [app/(dashboard)/keuangan/page.tsx](file:///c:/CAPSTONE/Usaha.in/app/(dashboard)/keuangan/page.tsx): masukkan saldo awal `initialCash` ke estimasi kas.
   - Harmonisasi HPP di [lib/finance.ts](file:///c:/CAPSTONE/Usaha.in/lib/finance.ts): gunakan `avgCost` secara seragam di seluruh laporan L/R dan periodik.
   - Satukan formula Health Score ke dalam satu fungsi terpusat yang digunakan bersama oleh Dashboard, Analitik, dan Copilot.

### 7.3 Fitur yang Harus Diimplementasikan Baru (*Missing Features*)
1. **F-14 Payroll Karyawan:** Bangun halaman `/payroll`, form komponen gaji, dan integrasi otomatis ke pencatatan beban operasional "Gaji & Upah".
2. **F-20 Forecasting Penjualan & Persediaan:** Implementasikan algoritma Moving Average sederhana (3–4 periode) per SKU untuk memproyeksikan estimasi kebutuhan stok periode berikutnya.
3. **F-21 AI Business Copilot Sebenarnya:** Ganti skenario regex statis dengan integrasi API LLM (OpenAI atau Gemini) yang menggunakan *Function Calling* ke fungsi analitik internal.

### 7.4 Roadmap Transisi Bertahap (F-01 s/d F-22)

```
[FASE 1: Fondasi Keamanan & Middleware]
  ├── Ubah proxy.ts -> middleware.ts (Aktifkan proteksi server)
  ├── Bersihkan celah IDOR di /api/profile dan bypass di /api/team
  └── Hapus tombol 1-klik demo login & bersihkan hardcoded Service Role Key
            │
            ▼
[FASE 2: Integrasi Data Operasional ke Supabase (Data Layer Transition)]
  ├── F-01: Simpan konfigurasi tenant & saldo awal ke tabel 'tenants'
  ├── F-02: Hubungkan CRUD produk ke tabel 'products'
  ├── F-03 & F-04: Hubungkan form penjualan & impor CSV ke RPC 'fn_create_order_with_stock'
  ├── F-05: Hubungkan mutasi persediaan ke tabel 'stock_movements'
  ├── F-06: Hubungkan pencatatan beban ke tabel 'expenses' & 'expense_items'
  ├── F-07: Hubungkan pencatatan piutang ke tabel 'sale_payments'
  ├── F-08: Sinkronkan status kanban kirim ke 'orders.shipment_status'
  └── F-09: Hubungkan master data pembeli ke tabel 'customers'
            │
            ▼
[FASE 3: Harmonisasi Akuntansi & Pelaporan]
  ├── F-10: Koreksi Neraca (initialCash) & Arus Kas (saldo awal/akhir)
  ├── F-11: Samakan formula HPP moving average (avgCost) di laporan periodik
  ├── F-12: Lengkapi batas anggaran nominal dan persentase omzet
  └── F-13: Hitung uang aman ditarik dari rata-rata beban operasional aktual
            │
            ▼
[FASE 4: Pembangunan Fitur yang Belum Ada]
  ├── F-14: Buat modul UI & endpoint API Payroll terintegrasi beban kas
  └── F-20: Buat modul Forecasting moving average penjualan & stok
            │
            ▼
[FASE 5: Pematangan Analitik & AI Copilot Asli]
  ├── F-15: Hubungkan kartu KPI dashboard ke database Supabase
  ├── F-16 & F-17: Validasi analisis PVM multi-periode & unifikasi Health Score
  ├── F-18 & F-19: Sempurnakan segmentasi RFM dan daftar tindakan dinamis
  └── F-21: Integrasikan AI Copilot ke LLM API dengan Function Calling
```

---

## 8. KESIMPULAN AKHIR

### 1. Seberapa Jauh Implementasi Saat Ini Memenuhi Proposal?
- **Status Fungsional Antarmuka (UI/UX):** Telah mencapai **80%**. Visual antarmuka, navigasi, form input, indikator warna, dan tata letak dasbor telah sesuai dengan kebutuhan operasional UMKM dalam proposal Capstone.
- **Status Arsitektur & Keandalan Sistem:** Baru mencapai **25%**. Mayoritas fitur operasional masih berupa prototipe di memori peramban (*client-side Zustand + localStorage*). 13 tabel bisnis di database PostgreSQL Supabase belum aktif dikonsumsi oleh antarmuka transaksi.
- **Kepatuhan Fitur Proposal (22 Fitur):**
  - **Memenuhi Sebagian:** 19 Fitur (F-01 s/d F-13, F-15 s/d F-19, F-22).
  - **Belum Memenuhi:** 3 Fitur (F-14 Payroll belum ada UI, F-20 Forecasting belum ada kode, F-21 Copilot belum memakai LLM asli).

### 2. Pekerjaan Utama Menuju Aplikasi Sebenarnya (*Production-Ready*)
1. Menutup celah keamanan otorisasi di Route Handler dan mengaktifkan `middleware.ts`.
2. Mengalihkan penyimpanan data dari Zustand `mock-data.ts` ke 13 tabel PostgreSQL Supabase melalui fungsi RPC yang sudah tersedia.
3. Memperbaiki perhitungan akuntansi Neraca Sederhana dan menyatukan formula HPP rata-rata bergerak (*moving average*).
4. Membangun modul antarmuka F-14 Payroll Karyawan.
5. Membangun modul analitik F-20 Forecasting dan mengintegrasikan F-21 AI Copilot dengan API LLM sungguhan.

---
*Laporan Audit dan Evaluasi ini disusun secara obyektif berdasarkan inspeksi menyeluruh repositori Usaha.in per 1 November 2026 sebagai cetak biru resmi transisi proyek Capstone.*
