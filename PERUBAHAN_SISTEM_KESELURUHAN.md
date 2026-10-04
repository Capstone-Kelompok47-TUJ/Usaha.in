# PERUBAHAN SISTEM USAHA.IN — KESELURUHAN

> Dokumen ini merangkum seluruh perubahan yang disepakati untuk sistem Usaha.in,
> mencakup perubahan fitur, aturan bisnis, dan UI.
> Berdasarkan diskusi dan RENCANA_PERUBAHAN_USAHA_IN.md.

---

## KEPUTUSAN YANG SUDAH DISEPAKATI

| # | Keputusan |
|---|---|
| K1 | **Single-tenant.** Tidak ada multi-UMKM, tidak ada kode UMKM/slug. Satu sistem untuk satu usaha. |
| K2 | **Label role: "Owner" dan "Karyawan".** Bukan "Pemilik Usaha". |
| K3 | **Tipe Usaha** (Dagang / Produksi / Jasa) dipilih saat pendaftaran awal dan bisa diubah di Pengaturan. |
| K4 | **Fee per kanal** dibaca dari data CSV impor Shopee/Tokopedia. Untuk simulasi demo, pakai default (Shopee 7.5%, Tokopedia 3.5%) yang bisa diubah di Pengaturan. |
| K5 | **Tidak ada integrasi API** Shopee/Tokopedia/WhatsApp. Shopee dan Tokopedia hanya label kanal. Data masuk via impor CSV/Excel atau input manual. |
| K6 | **Modul "Pembelian"** diganti menjadi **"Pengeluaran"** dengan cakupan lebih luas. |
| K7 | **Auth/Login** dipertahankan, update seperlunya. |
| K8 | **Tech stack tetap** — Zustand + localStorage. |
| K9 | **Batas Pengeluaran** hanya memperingatkan, tidak memblokir. Jika melewati batas, wajib isi alasan. |

---

## 1. AUTENTIKASI & LOGIN

**Yang tetap:**
- Format login `nama@kodeumkm.usaha.in` **dipertahankan**
- Tombol 1-klik akun demo tetap ada
- Halaman `/daftar` tetap ada untuk setup awal

**Yang berubah:**
- Halaman `/daftar` ditambah pilihan **Tipe Usaha** (Dagang / Produksi / Jasa)

---

## 2. TERMINOLOGI & LABEL

| Lama | Baru |
|---|---|
| Pemilik / Pemilik Usaha | **Owner** |
| Modul "Pembelian" | **Pengeluaran** |
| "Integrasi Kanal" | *Dihapus dari menu* |

---

## 3. NAVIGASI & SIDEBAR

**Perubahan menu:**
- "Pembelian" → **"Pengeluaran"** (URL: `/pengeluaran`)
- Hapus **"Integrasi Kanal"** dari sidebar
- Tambah **"Analitik"** (khusus Owner)
- Tambah **"Pengaturan"** (khusus Owner)

**Urutan menu (final):**
1. Dashboard
2. Penjualan
3. Produk
4. Stok *(hanya jika useStock=true)*
5. Pengeluaran
6. Pembayaran & Piutang
7. Pengiriman *(hanya jika useShipping=true)*
8. Pelanggan
9. Laporan Keuangan
10. Laporan Periodik
11. AI Copilot *(khusus Owner)*
12. Analitik *(khusus Owner)*
13. Manajemen Tim *(khusus Owner)*
14. Log Aktivitas *(khusus Owner)*
15. Pengaturan *(khusus Owner)*

---

## 4. TIPE USAHA

Dipilih saat daftar, bisa diubah di Pengaturan. Menentukan menu, form, dan template biaya yang aktif.

| Tipe | Stok | Produksi | Piutang | Pengiriman | Kategori Biaya Default |
|---|---|---|---|---|---|
| **Dagang** | Ya | Tidak | Ya | Ya | Kemasan, Fee Marketplace, Iklan, Sewa, Gaji, Listrik/Air/Internet, Transportasi, Biaya Admin Bank, Lainnya |
| **Produksi** | Ya | Ya | Ya | Ya | Bahan Baku, Gas/Energi Produksi, Kemasan, Upah, Perawatan Alat, Sewa, Listrik/Air/Internet, Transportasi, Biaya Admin Bank, Lainnya |
| **Jasa** | Tidak | Tidak | Ya | Tidak | Bahan Habis Pakai, Transportasi, Sewa, Gaji, Listrik/Air/Internet, Iklan, Biaya Admin Bank, Lainnya |

**Dampak ke UI:**
- `useStock=false` — sembunyikan menu Stok, kolom stok, peringatan stok
- `useProduction=false` — sembunyikan Resep / Bahan / Catat Produksi
- `useShipping=false` — sembunyikan menu Pengiriman dan status kirim
- Kategori biaya yang tidak relevan tidak muncul di form Pengeluaran

---

## 5. MODUL PENGELUARAN (Ganti Pembelian)

**Form tambah pengeluaran:**
- Tanggal
- Kategori (dari daftar sesuai tipe usaha + kategori kustom)
- Nominal
- Status: Lunas / Belum (+ tanggal jatuh tempo jika belum)
- Pemasok/Vendor (opsional)
- Catatan

**Kategori khusus inventory:**
- Jika kategori = "Bahan Baku" atau "Pembelian Stok" — tampilkan baris item stok (produk/bahan, qty, harga satuan)
- Saat disimpan: stok bertambah otomatis dan moving average HPP diperbarui

**Batas Pengeluaran:**
- Setiap kategori bisa diset batas (nominal tetap atau % dari pendapatan)
- Status: Hijau <80% / Kuning 80-100% / Merah >100%
- Jika >100%: tampilkan dialog peringatan + wajib isi alasan, lalu tetap tersimpan
- Karyawan yang input pengeluaran hanya melihat sisa batas, bukan nominal total
- Tab "Prive" (penarikan uang Owner) — khusus Owner, tidak masuk laba/rugi

---

## 6. MODUL PENJUALAN

**Perubahan:**
- Tambah tombol **"Input Penjualan"** — form manual:
  - Pilih/buat pelanggan
  - Pilih kanal (Shopee / Tokopedia / WhatsApp / Offline)
  - Tambah item (produk, qty, harga — bisa diubah)
  - Diskon penjual
  - Ongkir ditanggung penjual
  - Pilih: Bayar sekarang atau Tempo (+ tanggal jatuh tempo)
- Tambah tombol **"Impor Berkas"** — alur impor CSV/Excel
- Drawer detail pesanan: subtotal, diskon, fee, ongkir, total diterima, riwayat pembayaran, tombol Batalkan / Retur
- Status pembayaran baru: **Sebagian**
- Tombol simulasi demo hanya untuk Owner

---

## 7. FEE KANAL

- Fee dibaca dari kolom di file CSV Shopee/Tokopedia saat impor
- Input manual (WhatsApp/Offline): fee = 0 otomatis
- Simulasi demo: pakai default fee dari Pengaturan (Shopee 7.5%, Tokopedia 3.5%)
- Fee disimpan sebagai snapshot per pesanan

---

## 8. MODUL PEMBAYARAN & PIUTANG

- Tabel piutang dengan kolom umur piutang (Belum jatuh tempo / 1-7 hari / 8-30 hari / >30 hari)
- Pembayaran sebagian: input nominal, sisa piutang terhitung otomatis
- Tombol "Salin Pesan Tagihan": salin teks sopan ke clipboard
- Tab baru: **Utang Usaha** (dari pengeluaran yang belum dibayar)

---

## 9. IMPOR CSV/EXCEL

**Alur:**
1. Upload file `.xlsx` / `.csv`
2. Pilih kanal (Shopee / Tokopedia)
3. Pemetaan kolom (tersimpan per kanal untuk impor berikutnya)
4. Pratinjau data
5. Konfirmasi — laporan hasil (ok / skipped / failed)

**Aturan:**
- Batas 5 MB / 5.000 baris per impor
- Deduplikasi berdasarkan `(kanalId, externalOrderId)`
- Produk tidak cocok — dialog pilih produk internal + simpan pemetaan nama
- Fee dibaca dari kolom file; jika tidak ada, hitung dari default setting
- Jika gagal — rollback seluruh batch

---

## 10. MODUL PRODUK

- Tambah field Jenis: Barang Dagangan / Produksi / Jasa
- Toggle Lacak Stok per produk
- HPP / rata-rata biaya disembunyikan untuk akun tanpa akses Laporan Keuangan
- Pemetaan nama produk per kanal

---

## 11. MODUL STOK

- Tambah kolom "Cukup Berapa Hari" (stok / rata-rata jual harian 28 hari)
- Tambah Rekomendasi Restock (qty saran = target 14 hari - stok saat ini)
- Tandai Dead Stock: stok ada tapi tidak ada penjualan >= 60 hari
- Penyesuaian stok wajib isi catatan alasan
- Stok negatif diizinkan tapi tampil peringatan merah

---

## 12. MODUL PELANGGAN

- Tambah kolom: Total Belanja, Jumlah Order, Tanggal Order Terakhir
- Tambah Segmen RFM (khusus Owner): Juara / Setia / Berisiko / Baru / Hilang
- Pengingat Repeat Order: pelanggan yang terlambat order ulang

---

## 13. LAPORAN KEUANGAN

**Tiga tab (hapus ringkasan lama berbasis konstanta Rp 2,5 juta):**

**Tab 1 — Laba/Rugi:**
- Pendapatan Penjualan
- (-) Retur & Diskon
- = Pendapatan Bersih
- (-) HPP
- = Laba Kotor
- (-) Beban Penjualan (fee + ongkir + iklan)
- (-) Beban Operasional (gaji, sewa, listrik)
- (-) Beban Lain-lain
- = **Laba Bersih**

**Tab 2 — Neraca:**
- Aset: Kas + Piutang + Persediaan
- Liabilitas: Utang Usaha
- Ekuitas: Modal Awal + Akumulasi Laba - Prive
- Badge "Seimbang" jika Aset = Liabilitas + Ekuitas

**Tab 3 — Arus Kas:**
- Kas masuk: penjualan tunai + pelunasan piutang
- Kas keluar: pembelian stok, biaya operasional, pelunasan utang, refund, prive
- Kas akhir harus sama dengan Kas di Neraca

Toggle periode: Harian / Mingguan / Bulanan

---

## 14. MODUL ANALITIK (Baru, khusus Owner)

1. **Diagnosis Laba** — dekomposisi efek harga, HPP, volume, bauran, dan beban
2. **Skor Kesehatan Usaha** (0-100): margin bersih, perputaran stok, umur piutang, kas/runway
   - Label: >=80 Sehat / 60-79 Waspada / <60 Perlu Perhatian
3. **Anomali**: penjualan anjlok, lonjakan biaya, margin tidak wajar, selisih stok besar
4. **Repeat Order**: daftar pelanggan terlambat re-order
5. **Daftar Tindakan Mingguan**: agenda otomatis (tagih piutang, restock, kategori merah, dll.)

---

## 15. DASHBOARD OWNER

**KPI tambahan:**
- Kas saat ini
- Uang Aman Ditarik
- Skor Kesehatan Usaha (klik untuk rincian)
- Status Batas Pengeluaran per kategori

**Panel peringatan:**
- Stok menipis / negatif
- Harga beli naik >10%
- Piutang lewat jatuh tempo
- Kas runway <30 hari
- Kategori biaya merah
- Anomali penjualan

---

## 16. AI COPILOT

- Hanya Owner yang bisa akses (Karyawan ditolak)
- Pertanyaan cepat diperbarui: tambah "Berapa uang yang aman saya ambil?", "Kategori biaya mana paling boros?", "Piutang mana yang jatuh tempo?"
- Hapus catatan "mode demo" — ganti ke "Dihasilkan dari data internal"

---

## 17. PENGATURAN USAHA (Baru, khusus Owner)

- Tipe Usaha + toggle fitur
- Fee default simulasi per kanal (bisa diubah)
- Kelola kategori biaya (aktif/nonaktif/tambah kustom)
- Batas Pengeluaran per kategori
- Biaya tetap berulang (untuk proyeksi Uang Aman Ditarik)

---

## 18. HAK AKSES

**Modul yang bisa didelegasikan ke Karyawan:**
`dashboard`, `penjualan`, `produk`, `stok`, `pengeluaran`, `pembayaran`, `pengiriman`, `pelanggan`, `laporan_keuangan`, `laporan_periodik`

**Eksklusif Owner:**
`pengaturan`, `manajemen_tim`, `log_aktivitas`, `analitik`, `copilot`, `uang_aman`, `batas_pengeluaran_edit`

**Template jabatan (diperbarui):**
- Staf Penjualan: penjualan (kelola), pelanggan (kelola), produk (lihat), pembayaran (lihat), dashboard (lihat)
- Staf Gudang: stok (kelola), pengiriman (kelola), produk (lihat), penjualan (lihat), dashboard (lihat)
- Staf Pembelian: pengeluaran (kelola), stok (lihat), produk (lihat), dashboard (lihat)
- Staf Keuangan: pembayaran (kelola), pengeluaran (kelola), laporan_keuangan (lihat), penjualan (lihat), dashboard (lihat)

**Aturan:**
- Angka HPP, laba, kas, margin tidak tampil ke akun tanpa akses laporan_keuangan
- Owner tidak bisa menonaktifkan atau menurunkan aksesnya sendiri
- Karyawan yang input pengeluaran hanya melihat sisa batas kategori

---

## 19. HPP — METODE MOVING AVERAGE

- HPP dihitung dengan rata-rata bergerak
- Rumus: `avgBaru = round((stokLama x avgLama + qtyBeli x hargaBeli) / (stokLama + qtyBeli))`
- Saat penjualan: cogsUnit = avgCost saat itu (snapshot permanen)
- Stok = akumulasi semua pergerakan stok, tidak ada kolom stok tunggal yang diedit langsung

---

*Dokumen ini akan diperbarui seiring diskusi berlanjut.*

