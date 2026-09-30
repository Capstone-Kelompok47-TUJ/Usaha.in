# Spesifikasi Demo: Usaha.in

Dokumen ini adalah brief untuk membangun **demo klikabel** (prototype) Usaha.in yang dipakai untuk presentasi proposal. Berikan file ini ke AI coding tool (Claude Code, Cursor, v0, Lovable, dll) sebagai instruksi.

---

## 1. Tujuan Demo

Membuktikan konsep utama proposal dalam waktu presentasi 5–10 menit:

1. Semua kanal penjualan (Shopee, Tokopedia, WhatsApp, Offline) masuk ke **satu sistem**.
2. Stok, keuangan, dan dashboard **ter-update otomatis** dari satu transaksi.
3. **Pemilik** dapat membuat akun karyawan dan **menentukan penugasan** (hak akses) masing-masing.
4. Pemilik bisa **bertanya ke AI Business Copilot** dan mendapat jawaban berbasis data.

Demo **bukan** sistem produksi. Tidak ada backend, database, atau API sungguhan.

## 2. Batasan (Scope)

**Termasuk:**
- Frontend saja, data dummy, state disimpan di memori (refresh = reset).
- Dua stakeholder: **Pemilik** dan **Karyawan** (tanpa login sungguhan; ganti akun lewat pemilih akun di header).
- Manajemen Tim: buat akun karyawan dan atur penugasan; menu dan akses langsung berubah.
- Tombol "Simulasikan Pesanan Masuk" untuk menunjukkan alur data.
- AI Copilot dengan jawaban skenario (canned), bukan LLM sungguhan.

**Tidak termasuk:**
- Integrasi API Shopee/Tokopedia/WhatsApp asli.
- Autentikasi asli, database, backend. (Catatan: pada sistem sungguhan, pengecekan hak akses **wajib divalidasi di backend**, bukan hanya di tampilan.)
- Forecasting (cukup disebut di slide sebagai tahap lanjut).

## 3. Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS + shadcn/ui
- Recharts (grafik)
- Lucide React (ikon)
- State: React Context atau Zustand (in-memory)
- Kontrol versi: GitHub (repo organisasi, lihat bagian 13)
- Deploy: Vercel, otomatis dari GitHub (lihat bagian 13)

## 4. Stakeholder & Penugasan

### 4.1 Stakeholder

| Stakeholder | Peran |
|---|---|
| **Pemilik Usaha** (akun utama) | Kontrol penuh. Satu-satunya yang dapat membuat/mengubah akun karyawan dan penugasannya. Akses default ke Keuangan, Laporan, dan AI Copilot. |
| **Karyawan** | Dibuat oleh Pemilik. Hanya melihat dan mengakses modul yang ditugaskan kepadanya. |

### 4.2 Modul yang dapat ditugaskan

Setiap modul punya dua tingkat akses: **Lihat** (read-only) dan **Kelola** (tambah/ubah/hapus). "Kelola" otomatis mencakup "Lihat".

| Kunci modul | Nama | Contoh cakupan |
|---|---|---|
| `dashboard` | Dashboard | Ringkasan sesuai akses modul lain |
| `penjualan` | Penjualan | Pesanan semua kanal, input pesanan offline/WhatsApp |
| `produk` | Produk | Data produk, harga, pemetaan ke Shopee/Tokopedia |
| `stok` | Stok | Ledger stok, penyesuaian stok, peringatan |
| `pembelian` | Pembelian | Pembelian ke supplier |
| `pembayaran` | Pembayaran | Status lunas/belum/gagal, verifikasi |
| `pengiriman` | Pengiriman | Kanban status pengiriman |
| `pelanggan` | Pelanggan | Data pelanggan |
| `keuangan` | Keuangan | Laba/rugi, pendapatan, pengeluaran |
| `laporan` | Laporan | Laporan harian/mingguan/bulanan |
| `copilot` | AI Copilot | Tanya-jawab berbasis data |

`manajemen_tim` **khusus Pemilik** dan tidak dapat ditugaskan.

### 4.3 Template jabatan (preset penugasan)

| Template | Penugasan |
|---|---|
| Staf Penjualan | penjualan (kelola), pelanggan (kelola), produk (lihat), pembayaran (lihat) |
| Staf Gudang | stok (kelola), produk (lihat), pengiriman (kelola), penjualan (lihat) |
| Staf Pembelian | pembelian (kelola), stok (lihat), produk (lihat) |
| Staf Keuangan | pembayaran (kelola), keuangan (lihat), laporan (lihat), penjualan (lihat) |
| Kustom | Pemilik mencentang sendiri modul dan tingkat aksesnya |

Template hanya mengisi centangan awal; Pemilik tetap bisa mengubahnya sebelum menyimpan.

### 4.4 Aturan akses

- Menu sidebar hanya menampilkan modul yang ditugaskan.
- Membuka URL modul yang tidak ditugaskan menampilkan halaman **"Anda tidak memiliki akses"**.
- Tombol aksi (tambah/ubah/hapus) disembunyikan atau dinonaktifkan jika akses hanya "Lihat".
- Dashboard karyawan hanya menampilkan widget dari modul yang bisa ia lihat.
- Data dan angka keuangan tidak boleh muncul bagi akun tanpa akses `keuangan`.

## 5. Halaman & Fitur

### 5.1 Pemilih Akun (header)
Dropdown "Masuk sebagai": **Pemilik**, lalu daftar karyawan (dummy: Sari, Budi, Rina, lalu karyawan baru yang dibuat saat demo). Berganti akun langsung mengubah menu dan akses.

### 5.2 Dashboard Pemilik
- 4 kartu KPI: Omzet, Laba Bersih, Pengeluaran, Jumlah Pesanan (dengan persentase perubahan vs periode sebelumnya).
- Grafik garis: penjualan 30 hari terakhir.
- Grafik batang/donat: omzet per kanal.
- Produk terlaris dan kurang laku (top 5 / bottom 5).
- Panel **Peringatan Otomatis**: stok menipis, biaya naik, penjualan turun.

### 5.3 Dashboard Karyawan
Widget dinamis sesuai penugasan, mis.:
- Punya `penjualan`: pesanan baru hari ini.
- Punya `stok`: daftar stok menipis.
- Punya `pengiriman`: jumlah pesanan perlu dikemas/dikirim.
- Punya `pembayaran`: pembayaran belum lunas.
- Selalu ada kartu **"Penugasan Saya"** yang menampilkan modul dan tingkat aksesnya.

### 5.4 Penjualan (tampilan terpadu)
- Tabel semua pesanan dari semua kanal: ID, tanggal, kanal (badge berwarna), pelanggan, produk, total, status bayar, status pengiriman.
- Filter: kanal, status bayar, status pengiriman, rentang tanggal. Pencarian ID/pelanggan.
- Klik baris membuka detail pesanan (item, riwayat status).
- Tombol **"Simulasikan Pesanan Masuk"** (bagian 6), hanya untuk yang punya `penjualan` (kelola).

### 5.5 Produk & Stok
- Tabel produk: SKU, nama, harga jual, harga beli, stok, stok minimum.
- Kolom **Pemetaan Kanal**: centang jika produk terhubung ke listing Shopee dan/atau Tokopedia.
- Baris stok di bawah minimum di-highlight dengan badge "Menipis".
- Detail produk: riwayat pergerakan stok (penjualan, pembelian, penyesuaian) sebagai ledger.

### 5.6 Pembelian
- Tabel pembelian ke supplier: supplier, produk, jumlah, harga beli, status bayar.
- Form tambah pembelian. Saat disimpan: stok bertambah dan pengeluaran tercatat di keuangan.

### 5.7 Pembayaran
- Tabel status pembayaran tiap pesanan: lunas / belum / gagal.
- Tombol "Tandai Lunas" (jika akses kelola).

### 5.8 Pengiriman
- Papan kanban: **Baru Masuk → Diproses → Dikemas → Dikirim → Selesai**.
- Kartu bisa dipindah antar kolom (drag & drop atau tombol) jika akses kelola.

### 5.9 Pelanggan
- Tabel pelanggan: nama, kanal asal, jumlah pesanan, total belanja.

### 5.10 Keuangan & Laporan
- Ringkasan laba/rugi: pendapatan, potongan admin marketplace, ongkir, HPP, pengeluaran, laba bersih.
- Toggle periode harian / mingguan / bulanan.
- Tabel profitabilitas per kanal.

### 5.11 AI Business Copilot
- Antarmuka chat dengan tombol pertanyaan cepat:
  - "Kenapa laba turun minggu ini?"
  - "Marketplace mana yang paling untung?"
  - "Produk apa yang harus di-restock?"
  - "Produk mana yang kurang laku?"
  - "Ringkas performa bulan ini"
- Jawaban berupa teks + angka/mini tabel yang **konsisten dengan data dummy**.
- Efek mengetik agar terasa seperti AI sungguhan.
- Input bebas yang tidak cocok skenario dibalas: "Pertanyaan ini akan didukung pada versi lengkap."
- Keterangan kecil: *"Jawaban dihasilkan dari data internal (mode demo)."*

### 5.12 Manajemen Tim (khusus Pemilik)
- **Daftar karyawan:** nama, email, jabatan/template, ringkasan penugasan, status (aktif/nonaktif), aksi (ubah penugasan, nonaktifkan).
- **Tombol "Tambah Karyawan"** membuka form:
  1. Data akun: nama, email, password awal.
  2. Pilih **template jabatan** (bagian 4.3) atau "Kustom".
  3. **Matriks penugasan:** baris = modul, kolom = `Tidak ada | Lihat | Kelola`. Memilih template mengisi matriks otomatis; Pemilik bisa mengubahnya.
  4. Tombol **Simpan** → akun muncul di daftar dan di pemilih akun (5.1).
- **Ubah penugasan:** membuka matriks yang sama untuk karyawan yang ada; perubahan langsung berlaku.
- **Nonaktifkan akun:** karyawan nonaktif tidak bisa dipilih di pemilih akun.
- **Log Aktivitas:** tabel "siapa melakukan apa dan kapan" (contoh: "Sari menambah pesanan #A-1042", "Pemilik mengubah penugasan Budi"). Aksi di demo (simulasi pesanan, ubah penugasan, pindah status pengiriman) otomatis tercatat.

## 6. Alur Simulasi (inti demo)

Tombol **"Simulasikan Pesanan Masuk"** melakukan, dalam satu klik:

1. Membuat pesanan baru dari kanal acak (Shopee/Tokopedia/WhatsApp/Offline) dengan produk dan jumlah acak.
2. Pesanan muncul paling atas di tabel Penjualan dengan animasi highlight.
3. Stok produk terkait berkurang dan ledger stok tercatat.
4. Jika stok jatuh di bawah minimum, muncul toast/peringatan "Stok menipis".
5. KPI omzet, laba, dan grafik di Dashboard Pemilik ter-update.
6. Pesanan otomatis masuk kolom "Baru Masuk" di Pengiriman.
7. Aksi tercatat di Log Aktivitas atas nama akun yang sedang aktif.

## 7. Data Dummy

Buat `lib/mock-data.ts`. Kisah bisnis: UMKM makanan/minuman kemasan.

- **Produk (8–10):** mis. Kopi Arabika 250g, Kopi Robusta 500g, Teh Melati Premium, Gula Aren Cair 500ml, Cookies Coklat Box. Sertakan harga jual, harga beli, stok, stok minimum. Buat 2 produk di bawah stok minimum.
- **Pesanan (40–60):** tersebar 30 hari di 4 kanal (Shopee ±40%, Tokopedia ±30%, WhatsApp ±17%, Offline ±13%).
- **Supplier (3)** dan **pembelian (8–10)**; **pelanggan (15–20)**.
- **Pemetaan produk:** sebagian terhubung ke Shopee saja, Tokopedia saja, atau keduanya.
- **Akun awal:** Pemilik + 3 karyawan: **Sari** (Staf Penjualan), **Budi** (Staf Gudang), **Rina** (Staf Keuangan).
- **Skenario "laba turun":** minggu ini laba turun ±12% karena harga beli Kopi Arabika naik dan potongan admin Shopee naik. Jawaban Copilot menjelaskan sebab ini dengan angka yang cocok dengan data.
- **Skenario "kanal paling untung":** Tokopedia margin tertinggi; Shopee omzet tertinggi tetapi margin lebih tipis karena biaya admin.

Rumus:
- Laba bersih = pendapatan − HPP − potongan marketplace − ongkir − pengeluaran operasional.
- Stok = jumlah seluruh `stock_movements` per produk.

## 8. Model Data Hak Akses (untuk `lib/permissions.ts`)

```ts
type Level = "none" | "view" | "manage";
type ModuleKey = "dashboard" | "penjualan" | "produk" | "stok" | "pembelian"
  | "pembayaran" | "pengiriman" | "pelanggan" | "keuangan" | "laporan" | "copilot";

interface User {
  id: string;
  name: string;
  email: string;
  isOwner: boolean;
  active: boolean;
  template: string;                       // "Staf Gudang" | "Kustom" | ...
  permissions: Record<ModuleKey, Level>;  // penugasan per modul
}

// helper: can(user, "stok", "view" | "manage") -> boolean  (Pemilik selalu true)
```

Gunakan satu fungsi `can()` untuk menyaring menu, menjaga halaman (route guard), dan menampilkan/menyembunyikan tombol aksi.

## 9. Desain

- Bersih dan profesional untuk dashboard bisnis; dukung light dan dark mode.
- Warna badge kanal: Shopee (oranye), Tokopedia (hijau), WhatsApp (hijau muda), Offline (abu-abu).
- Bahasa antarmuka Indonesia; format `Rp 1.250.000`, tanggal `30 Sep 2026`.
- Responsif (desktop utama, tablet/mobile layak dipakai).
- Sidebar kiri (dinamis sesuai penugasan), header dengan pemilih akun dan judul halaman.

## 10. Struktur Folder yang Disarankan

```
app/
  (dashboard)/
    page.tsx                 # dashboard sesuai akun
    penjualan/page.tsx
    produk/page.tsx
    pembelian/page.tsx
    pembayaran/page.tsx
    pengiriman/page.tsx
    pelanggan/page.tsx
    keuangan/page.tsx
    copilot/page.tsx
    tim/page.tsx             # Manajemen Tim (Pemilik)
    tim/log/page.tsx         # Log aktivitas
    tidak-ada-akses/page.tsx
components/
  layout/ (Sidebar, Header, AccountSwitcher)
  team/ (TeamTable, EmployeeForm, PermissionMatrix)
  charts/ (SalesLine, ChannelBar)
  ui/ (shadcn)
lib/
  mock-data.ts
  permissions.ts             # tipe, template jabatan, can()
  store.ts                   # state in-memory + aksi simulasi + log
  finance.ts
  copilot-scenarios.ts
```

## 11. Kriteria Selesai

- [ ] Pemilik dapat menambah karyawan baru dan mengatur matriks penugasan (template atau kustom).
- [ ] Akun karyawan baru muncul di pemilih akun; berganti akun mengubah menu, dashboard, dan tombol aksi sesuai penugasan.
- [ ] Membuka modul yang tidak ditugaskan menampilkan halaman "tidak memiliki akses".
- [ ] Mengubah penugasan atau menonaktifkan akun langsung berlaku.
- [ ] Tabel Penjualan menampilkan pesanan dari 4 kanal dengan filter berfungsi.
- [ ] Tombol simulasi memperbarui pesanan, stok, KPI, grafik, kanban pengiriman, dan log aktivitas.
- [ ] Peringatan stok menipis muncul di dashboard dan halaman stok.
- [ ] Copilot menjawab semua pertanyaan cepat dengan angka konsisten dengan dashboard.
- [ ] Tidak ada error di console; berjalan dengan `npm run dev`.

## 12. Alur Presentasi Demo (saran 6–8 menit)

1. Masuk sebagai **Pemilik** → buka **Manajemen Tim** → **Tambah Karyawan** (mis. "Dewi"), pilih template *Staf Gudang*, ubah satu penugasan, simpan.
2. Ganti akun ke **Dewi** → tunjukkan menu hanya berisi modul yang ditugaskan; coba buka Keuangan → ditolak.
3. Sebagai Dewi/Sari, buka **Penjualan** → tunjukkan tabel terpadu dari 4 kanal (masalah "cek satu-satu" terselesaikan).
4. Klik **Simulasikan Pesanan Masuk** → stok berkurang, peringatan muncul, pesanan masuk kanban Pengiriman.
5. Kembali ke **Pemilik** → tunjukkan Dashboard, Keuangan, dan **Log Aktivitas** yang sudah ter-update.
6. Buka **AI Copilot** → tanya "Kenapa laba turun minggu ini?".
7. Tutup dengan tahap berikutnya: integrasi API asli, lalu forecasting.

## 13. Repositori & Deployment (GitHub + Vercel)

**Repositori:** https://github.com/Capstone-Kelompok47-TUJ/Usaha.in.git

### 13.1 Setup awal proyek

```bash
git clone https://github.com/Capstone-Kelompok47-TUJ/Usaha.in.git
cd Usaha.in
npx create-next-app@latest . --typescript --tailwind --eslint --app
npx shadcn@latest init
npm install recharts lucide-react zustand
npm run dev        # cek di http://localhost:3000
```

Jika `create-next-app` menolak karena folder tidak kosong (mis. sudah ada README), buat proyek di folder sementara lalu salin isinya ke dalam repo.

Lalu push pertama kali:

```bash
git add .
git commit -m "chore: inisialisasi proyek Next.js"
git push origin main
```

### 13.2 Alur kerja tim (GitHub)

- Branch `main` = versi yang selalu bisa didemokan (otomatis menjadi production di Vercel).
- Setiap fitur dikerjakan di branch sendiri: `feat/manajemen-tim`, `feat/penjualan`, `feat/copilot`, dst.
- Gabungkan lewat **Pull Request**; jangan push langsung ke `main` (aktifkan branch protection di Settings → Branches).
- Format commit singkat: `feat: ...`, `fix: ...`, `docs: ...`, `chore: ...`.
- Pastikan `.gitignore` bawaan Next.js menyertakan `node_modules`, `.next`, dan `.env*`. **Jangan pernah commit** file `.env` atau API key.
- Tambahkan `README.md` berisi: deskripsi Usaha.in, cara menjalankan lokal, anggota tim, dan link demo Vercel.

### 13.3 Deploy ke Vercel

1. Login ke vercel.com dengan akun GitHub → **Add New → Project**.
2. Pilih repo **Usaha.in** → Framework otomatis terdeteksi **Next.js** → **Deploy**.
3. Setelah itu, setiap push ke `main` = deploy production; setiap Pull Request = **Preview URL** sendiri.
4. Karena demo hanya frontend dengan data dummy, **tidak perlu environment variable**. Jika nanti ada (mis. API key AI), isi di Vercel → Settings → Environment Variables, bukan di repo.

### 13.4 ⚠️ Batasan penting: repo organisasi + Vercel Hobby (gratis)

Repo ini berada di **organisasi GitHub** (`Capstone-Kelompok47-TUJ`). Vercel Hobby tidak dapat men-deploy dari repo **privat** milik organisasi; repo **publik** organisasi masih bisa. Pilih salah satu:

| Opsi | Keterangan |
|---|---|
| **A. Jadikan repo publik** (paling mudah) | Cocok untuk demo karena tidak ada data rahasia. Pastikan tidak ada secret di kode/riwayat commit. |
| **B. Repo privat di akun pribadi** | Salin/fork repo ke akun GitHub pribadi salah satu anggota, deploy dari sana. Perlu menjaga sinkronisasi dengan repo organisasi. |
| **C. Upgrade Vercel Pro** | Berbayar; mengizinkan repo privat organisasi dan kolaborasi tim. |

Rekomendasi untuk capstone: **opsi A** selama fase demo/proposal.

### 13.5 Kriteria tambahan

- [ ] Repo berisi proyek Next.js yang berjalan dengan `npm run dev` dan `npm run build` tanpa error.
- [ ] `README.md` dan `.gitignore` sudah benar; tidak ada file `.env` di repo.
- [ ] Vercel terhubung ke repo dan menghasilkan URL demo yang bisa dibuka tanpa login.
- [ ] Setiap Pull Request menghasilkan Preview URL.

## 14. Rencana Penyimpanan Data

### 14.1 Fase demo (sekarang)

- **Tidak ada database.** Semua data berasal dari `lib/mock-data.ts` dan disimpan di **memori browser** lewat state Zustand.
- Refresh halaman mengembalikan data ke kondisi awal (reset).
- Data tidak dibagikan antar pengguna atau perangkat; akun karyawan yang dibuat di satu browser tidak muncul di browser lain.
- **Opsional:** aktifkan middleware `persist` pada Zustand agar data bertahan setelah refresh (disimpan di localStorage, tetap per browser). Sediakan tombol **"Reset Data Demo"** di header untuk mengembalikan ke data awal sebelum presentasi.
- Karena hanya frontend, **tidak perlu environment variable** dan tidak ada data sensitif di repo.

### 14.2 Fase sistem sungguhan (setelah proposal disetujui)

| Kebutuhan | Pilihan |
|---|---|
| Database utama | **PostgreSQL** terkelola: Supabase atau Neon (ada tier gratis; cek batasannya saat mendaftar) |
| Akses dari aplikasi | Next.js Route Handlers/Server Actions + Prisma atau Drizzle; gunakan **connection pooling** karena Vercel bersifat serverless |
| Antrian job (polling Shopee/Tokopedia, sinkron stok, laporan terjadwal) | Redis (mis. Upstash) + worker |
| Worker | Layanan terpisah seperti Railway atau Render. **Tidak dijalankan di Vercel**, karena Vercel hanya menjalankan fungsi singkat |
| File (foto produk, dokumen) | Supabase Storage |
| Autentikasi | Auth.js / Better Auth atau Supabase Auth; hak akses (`can()`) **divalidasi di server** |

### 14.3 Tabel inti (gambaran awal)

`users`, `permissions` (penugasan per akun), `products`, `product_channel_mappings`, `orders`, `order_items`, `stock_movements` (ledger), `purchases`, `payments`, `shipments`, `customers`, `finance_entries`, `activity_logs`.

Prinsip penting:
- Stok = jumlah `stock_movements`, bukan satu angka yang di-update.
- Pesanan dari marketplace diberi unique key `(channel, order_id_channel)` agar tidak terhitung ganda.
- Perubahan stok dilakukan dalam transaksi database dengan row locking agar tidak minus saat pesanan masuk bersamaan.

### 14.4 Jalur migrasi dari demo

1. Pertahankan bentuk data (tipe TypeScript) yang sama dengan `mock-data.ts` sebagai skema tabel.
2. Ganti pembacaan dari `store.ts` ke pemanggilan API yang membaca database; **tampilan tidak perlu diubah**.
3. Ganti pemilih akun demo dengan login asli, lalu pindahkan pengecekan `can()` ke sisi server.
4. Tambahkan worker dan adapter kanal (mulai dari import CSV, lalu API Shopee/Tokopedia).
5. Terakhir, hubungkan AI Copilot ke query terparameter atas data nyata.
