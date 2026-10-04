# RENCANA PERUBAHAN SISTEM USAHA.IN

Dokumen ini adalah instruksi kerja untuk AI agent. Baca seluruhnya sebelum menulis kode. Dokumen ini menggantikan seluruh asumsi lama pada demo sebelumnya.

---

## 0. CARA MEMAKAI DOKUMEN INI (ATURAN KERJA AGENT)

1. **Kerjakan per fase** (Bagian 12). Jangan loncat fase. Selesaikan, jalankan tes, lalu lapor sebelum lanjut.
2. **Jangan menulis ulang dari nol.** Pertahankan yang sudah bekerja: ledger stok, kanban pengiriman, drawer detail pesanan, filter dan pencarian tabel penjualan, toast, log aktivitas, struktur izin Lihat/Kelola. Refactor seperlunya.
3. **Semua logika bisnis berada di lapisan `domain/` sebagai fungsi murni** (tanpa akses storage, tanpa `Date.now()`, tanpa random). Tanggal "hari ini" selalu dikirim sebagai parameter `asOf`. Tujuannya: bisa diuji dan konsisten.
4. **Satu sumber hitung.** Dashboard, laporan, analitik, dan Copilot wajib memanggil fungsi `domain/` yang sama. Dilarang menghitung ulang angka di komponen UI atau menulis angka tetap (hardcode).
5. **Uang disimpan sebagai integer Rupiah.** Pembulatan hanya dengan `Math.round` di titik yang disebut di dokumen ini. Rasio dan persen boleh float, tetapi tidak disimpan sebagai uang.
6. **Izin harus dicek di sisi server/service**, bukan hanya menyembunyikan tombol di UI.
7. **Bila ada hal ambigu atau bertentangan, berhenti dan tanyakan**, jangan menebak. Catat asumsi di `docs/ASSUMPTIONS.md`.
8. **Setiap fase wajib menambah unit test** sesuai Bagian 13 dan semuanya harus lulus sebelum fase dianggap selesai.
9. **Zona waktu bisnis: Asia/Jakarta (WIB).** Tanggal bisnis disimpan `YYYY-MM-DD`, timestamp kejadian disimpan UTC. Minggu dimulai hari Senin. Bulan mengikuti kalender.
10. UI berbahasa Indonesia. Istilah baku: **Pemilik Usaha** (bukan Owner/Pemilik) dan **Karyawan** (bukan Admin).

---

## 1. KONTEKS DAN TUJUAN

Usaha.in adalah sistem informasi internal berbasis web untuk **satu UMKM** (proyek Capstone S1 Sistem Informasi). Pembeda dari POS biasa: sistem tidak hanya mencatat, tetapi **menjelaskan penyebab perubahan laba dan merekomendasikan tindakan**, serta fleksibel terhadap tipe usaha.

Alur data: `Input/impor penjualan → Database terpusat → Produk, stok, pengeluaran, piutang → Laporan keuangan → Dashboard, analitik, peringatan → AI Business Copilot`.

---

## 2. KEPUTUSAN FINAL (TIDAK UNTUK DIDISKUSIKAN ULANG)

| # | Keputusan |
|---|---|
| D1 | **Single-tenant.** Hapus multi-tenant, registrasi UMKM, kode UMKM/slug, NIB, dan format email `nama@kodeumkm.usaha.in`. |
| D2 | **Tanpa integrasi API** Shopee/Tokopedia/WhatsApp. "Shopee" dan "Tokopedia" hanya **label kanal**. Data marketplace masuk lewat **impor Excel/CSV**. WhatsApp dan offline lewat **input manual**. |
| D3 | Dua jenis pengguna: **Pemilik Usaha** (akses penuh) dan **Karyawan** (akun dibuat Pemilik, akses ditentukan Pemilik per modul: Tidak ada / Lihat / Kelola). |
| D4 | **Tipe usaha** mengubah perilaku sistem: `dagang`, `produksi`, `jasa`. |
| D5 | Pemasok **opsional** (tidak semua UMKM punya). Modul "Pembelian ke supplier" diganti **"Pengeluaran"**. |
| D6 | Akuntansi **akrual sederhana**, tanpa jurnal debit-kredit. Tiga laporan terpisah: Laba/Rugi, Neraca Sederhana, Arus Kas. |
| D7 | Pembelian stok = **persediaan (aset)**, menjadi HPP saat terjual. **Prive bukan beban.** |
| D8 | HPP memakai **rata-rata bergerak (moving average)**, di-snapshot pada setiap item penjualan. |
| D9 | **Batas Pengeluaran hanya memperingatkan, tidak memblokir.** Melewati batas wajib mengisi alasan. |
| D10 | **AI Copilot hanya untuk Pemilik Usaha**, memakai LLM sungguhan dengan *tool calling* ke fungsi `domain/`. LLM tidak boleh menghitung atau menulis angka sendiri. Skenario skrip lama dihapus dari alur produksi. |
| D11 | Forecasting, simulator "bagaimana jika", pelacak harga bahan, dan penyusutan = **opsional**, jangan dikerjakan sebelum semua fase selesai. |

### Keputusan terbuka (agent WAJIB bertanya ke pengguna di Fase 0)
**T1. Penyimpanan data.**
- Opsi A (disarankan, sesuai proposal): PostgreSQL lewat backend (mis. Supabase atau Prisma+Postgres), kata sandi di-hash di server, izin dicek di server.
- Opsi B (bila waktu mepet): tetap localStorage, tetapi **seluruh akses data wajib lewat interface repository** agar bisa diganti nanti. Proposal harus disesuaikan menjadi "prototipe" dan tidak boleh mengklaim keamanan server.

Apa pun pilihannya, `domain/` tidak boleh bergantung pada storage.

---

## 3. KONDISI SAAT INI VS TARGET (GAP)

| Area | Sekarang | Target |
|---|---|---|
| Tenant | Banyak UMKM, registrasi, slug | Satu usaha, setup wizard sekali |
| Tipe usaha | Teks bebas | Enum yang menentukan form, menu, HPP, template biaya |
| Produk | 1 harga beli, stok selalu aktif | Tipe produk, resep, HPP moving average, stok bisa dimatikan |
| Penjualan | Tombol pesanan acak, fee dikunci | Form manual + impor Excel/CSV + dedup, fee per kanal bisa diatur |
| Pembelian | Supplier wajib | Modul Pengeluaran (supplier opsional) |
| Biaya operasional | Konstanta Rp2,5 juta/bulan | Pengeluaran nyata per kategori |
| Piutang | Status dan "Tandai Lunas" | Tempo, pembayaran sebagian, umur piutang, utang usaha |
| Keuangan | Satu ringkasan laba | Laba/Rugi bertahap + Neraca + Arus Kas |
| Batas pengeluaran, Uang Aman Ditarik | Tidak ada | Baru |
| Diagnosis, skor, anomali, RFM, tindakan | Teks skrip | Mesin hitung nyata |
| Copilot | 5 jawaban skrip | LLM + tool calling |
| Izin | Template jabatan, Lihat/Kelola | Dipertahankan, ditambah daftar fitur khusus Pemilik |

---

## 4. ARSITEKTUR TARGET

```
src/
  domain/                 # FUNGSI MURNI. Tanpa I/O.
    types.ts
    money.ts              # helper integer Rupiah, pembulatan
    period.ts             # resolusi periode (WIB), minggu mulai Senin
    inventory.ts          # ledger, moving average, produksi, backflush
    sales.ts              # hitung amountDue, fee, status bayar
    receivables.ts        # umur piutang, utang
    finance.ts            # laba/rugi, neraca, arus kas
    budget.ts             # batas pengeluaran, saran otomatis
    cash.ts               # uang aman ditarik, impas harian, runway
    analytics/
      diagnosis.ts        # PVM + biaya
      health.ts           # skor kesehatan
      anomaly.ts
      rfm.ts
      actions.ts          # daftar tindakan mingguan
      alerts.ts           # peringatan dashboard
    importer.ts           # parse, mapping, validasi, dedup (murni; pembacaan file di luar)
    permissions.ts
  data/                   # repository interface + implementasi (DB atau localStorage)
  services/               # use-case: validasi izin -> panggil domain -> simpan -> catat log
  app/ (ui)               # halaman dan komponen, hanya memanggil services
  copilot/                # tool definitions, runner LLM, sanitasi
  seed/                   # generator data contoh deterministik
tests/
```

Aturan lapisan: UI → services → (domain + data). Domain tidak mengimpor apa pun dari lapisan lain.

---

## 5. MODEL DATA (TypeScript, acuan; sesuaikan ke skema DB)

```ts
type Money = number; // integer Rupiah
type DateStr = string; // 'YYYY-MM-DD' (WIB)

type BusinessType = 'dagang' | 'produksi' | 'jasa';

interface Business {
  name: string; description?: string; city?: string; phone?: string;
  type: BusinessType;
  features: { useStock: boolean; useProduction: boolean; useCredit: boolean; useShipping: boolean };
  reservePct: number;            // default 10 (% dari pendapatan bersih 30 hari)
  includeRoutineRestockInMandatory: boolean; // default true
  openingDate: DateStr;
  openingCash: Money;
  // modalAwal DIHITUNG, bukan input:
  // modalAwal = openingCash + nilai persediaan awal + piutang awal - utang awal
  openingReceivable: Money; openingPayable: Money;
}

interface User { id; name; username; passwordHash; role: 'owner'|'employee'; active: boolean;
  access: Record<ModuleKey, 'none'|'view'|'manage'>; // owner diabaikan (semua manage)
  templateKey?: string }

interface Channel { id; name; type: 'marketplace'|'offline'|'chat'; feePct: number /* default: offline/chat 0 */; active: boolean }

interface Product {
  id; sku; name; kind: 'goods'|'made'|'service';
  price: Money;                  // harga jual
  stockTracked: boolean;
  minStock: number;
  avgCost: Money;                // moving average (barang/bahan/produk jadi); untuk jasa = biaya langsung manual
  manualCost?: Money;            // dipakai bila tanpa resep dan stok tidak dilacak
  recipeId?: string;
  channelNames: Record<string /*channelId*/, string>; // pemetaan nama produk per kanal
  active: boolean;
}
interface Material { id; name; unit; stockQty: number; avgCost: Money; minStock: number }  // bahan baku
interface Recipe { id; productId; yieldQty: number; items: { materialId; qty: number }[]; extraCostPerUnit?: Money }

interface StockMove { id; date; targetType: 'product'|'material'; targetId;
  qty: number /* + masuk, - keluar */; unitCost: Money;
  reason: 'opening'|'purchase'|'production_in'|'production_out'|'sale'|'sale_void'|'return_restock'|'adjustment';
  refId?: string; note?: string }

interface Customer { id; name; phone?; channelId?; createdAt }

interface Sale {
  id; externalOrderId?: string; channelId; customerId?; date: DateStr;
  items: SaleItem[];
  subtotal: Money;          // sum(qty*unitPrice)
  discountSeller: Money;    // voucher/diskon dari penjual
  platformFee: Money;       // snapshot fee kanal
  shippingSellerCost: Money;// ongkir ditanggung penjual
  amountDue: Money;         // yang akan diterima = subtotal - discountSeller - platformFee - shippingSellerCost
  dueDate: DateStr;         // = date bila tunai
  voided: boolean;          // status 'Gagal/Dibatalkan'
  shipStatus?: 'new'|'processing'|'packed'|'shipped'|'done';
  importBatchId?: string; createdBy; note?: string;
}
interface SaleItem { productId; qty; unitPrice: Money; cogsUnit: Money /* SNAPSHOT HPP saat transaksi */ }
interface SalePayment { id; saleId; date; amount: Money; createdBy }
interface SaleReturn { id; saleId; date; items: {productId; qty; refundAmount: Money; restock: boolean}[]; note? }

interface ExpenseCategory { id; name; group: 'cogs'|'selling'|'operating'|'other'|'non_expense'; active: boolean; custom: boolean;
  nonExpenseKind?: 'inventory'|'prive'|'debt_principal'|'asset' }
interface Expense { id; date; categoryId; amount: Money; paid: boolean; dueDate?: DateStr; supplier?: string;
  note?: string; overBudgetReason?: string; stockItems?: {targetType; targetId; qty; unitCost}[]; createdBy }
interface ExpensePayment { id; expenseId; date; amount: Money }
interface RecurringExpense { id; categoryId; amount: Money; dayOfMonth: number; active: boolean }  // hanya untuk proyeksi & pengingat
interface Budget { categoryId; mode: 'fixed'|'percent_revenue'; value: number /* Rupiah atau persen */ }

interface ImportBatch { id; date; fileName; mapping: Record<string,string>; stats: {ok:number; skipped:number; failed:number}; createdBy }
interface ActionTask { id; weekStart: DateStr; type; title; detail; refId?; status: 'open'|'done'|'dismissed' }
interface ActivityLog { id; at: string /*UTC*/; userId; action; module; refId?; meta? }
```

Catatan: `Prive` dicatat sebagai `Expense` dengan kategori `non_expense/prive` (tidak masuk laba). Pembelian stok = `Expense` kategori `non_expense/inventory` dengan `stockItems`.

---

## 6. ATURAN BISNIS DAN LOGIKA (PSEUDOCODE)

### 6.1 Tipe usaha dan toggle
Nilai awal saat memilih tipe (dapat diubah Pemilik di Pengaturan):

| Tipe | useStock | useProduction | useCredit | useShipping | Template kategori biaya aktif |
|---|---|---|---|---|---|
| dagang | true | false | true | true | Kemasan, Ongkir ditanggung penjual, Fee marketplace(otomatis), Iklan, Sewa, Gaji, Listrik/air/internet, Transportasi, Biaya admin bank, Lainnya |
| produksi | true | true | true | true | Bahan baku(non_expense/inventory), Gas/energi produksi, Kemasan, Upah, Perawatan alat, Sewa, Listrik/air/internet, Transportasi, Biaya admin bank, Lainnya |
| jasa | false | false | true | false | Bahan habis pakai, Transportasi, Sewa, Gaji, Listrik/air/internet, Iklan, Biaya admin bank, Lainnya |

Dampak (wajib diterapkan di UI dan service):
- `useStock=false` → sembunyikan menu Stok, kolom stok, peringatan stok, estimasi hari stok, komponen "perputaran stok" pada skor.
- `useProduction=false` → sembunyikan Resep/Bahan/Catat Produksi.
- `useShipping=false` → sembunyikan menu Pengiriman dan status kirim.
- `useCredit=false` → sembunyikan opsi tempo; semua penjualan dianggap dibayar saat transaksi; komponen "umur piutang" pada skor diabaikan.
- Kategori nonaktif tidak muncul di form pengeluaran dan Batas Pengeluaran.
- Pemilik dapat menambah kategori kustom dan **wajib** memilih `group`. Kategori "Lainnya" tidak boleh dihapus.
- `Business.description` (kuliner, fashion, dll.) hanya keterangan.

### 6.2 Stok, moving average, dan HPP

```
onPurchase(target, qtyIn, unitCost):           // dari Expense 'inventory' dengan stockItems
  newAvg = round( (onHand*avgCost + qtyIn*unitCost) / (onHand+qtyIn) )
  // jika onHand <= 0 -> newAvg = unitCost
  stockMove(+qtyIn, unitCost, 'purchase')

onSale(item):                                  // produk stockTracked
  item.cogsUnit = product.avgCost              // SNAPSHOT
  stockMove(-qty, cogsUnit, 'sale')
```

Aturan HPP per kind produk:
1. `goods` + stockTracked: `cogsUnit = avgCost` saat jual.
2. `goods` + tidak stockTracked (dropship): `cogsUnit = manualCost`.
3. `made` + stockTracked (produksi massal): HPP produk jadi dibentuk saat **Catat Produksi** (6.3); saat jual `cogsUnit = avgCost` produk jadi.
4. `made` + tidak stockTracked (pesan-baru-buat / *backflush*): saat jual, bahan dikurangi otomatis sesuai resep: `cogsUnit = recipeUnitCost(now)`; stok bahan berkurang qty × resep.
5. `service`: `cogsUnit = manualCost` (biaya langsung, boleh 0).

Stok produk/bahan selalu = `sum(StockMove.qty)`; tidak ada kolom stok tunggal yang diedit langsung. Penyesuaian stok = `StockMove(reason:'adjustment')` wajib dengan `note`.
Stok negatif: izinkan tetapi tampilkan peringatan merah "stok negatif, periksa pencatatan"; jangan blokir penjualan.

### 6.3 Resep dan produksi

```
recipeUnitCost(recipe) = round( sum(item.qty * material.avgCost) / recipe.yieldQty ) + (extraCostPerUnit ?? 0)

recordProduction(productId, batchQty):          // produk made & stockTracked
  for each recipe item: materialQty = item.qty * batchQty / recipe.yieldQty
      stockMove(material, -materialQty, 'production_out')
  unitCost = recipeUnitCost(recipe)             // pakai avgCost bahan SAAT produksi
  // moving average produk jadi:
  newAvg = round( (onHand*avg + batchQty*unitCost) / (onHand+batchQty) )
  stockMove(product, +batchQty, unitCost, 'production_in')
```
Bahan baku dibeli lewat Expense `inventory` dengan `stockItems.targetType='material'`.

### 6.4 Penjualan, fee, dan status bayar

```
subtotal       = sum(qty * unitPrice)
platformFee    = round(subtotal * channel.feePct / 100)   // SNAPSHOT; bila impor punya kolom fee asli, pakai itu
amountDue      = subtotal - discountSeller - platformFee - shippingSellerCost
paid           = sum(SalePayment.amount)
status:  voided ? 'gagal'
         : paid >= amountDue ? 'lunas'
         : paid > 0 ? 'sebagian'
         : 'belum'
sisaPiutang    = voided ? 0 : max(0, amountDue - paid)
```
- Jika `useCredit=false` atau pilihan "bayar langsung": buat `SalePayment` penuh pada tanggal transaksi, `dueDate = date`.
- Jika tempo: `dueDate` wajib diisi, `SalePayment` kosong.
- **Pembatalan (`voided=true`)**: pesanan dikeluarkan dari pendapatan, HPP, beban, piutang; buat `StockMove(+qty,'sale_void')` untuk membalik stok; pembayaran yang sudah ada ditampilkan sebagai peringatan "ada pembayaran, perlu dikembalikan" dan dicatat sebagai pengeluaran kategori Retur secara manual oleh pengguna (jangan otomatis).
- **Retur** (`SaleReturn`): mengurangi pendapatan sebesar `refundAmount` (masuk baris "Retur dan diskon"); jika `restock=true` tambah stok (`return_restock`) dan kurangi HPP sebesar `qty*cogsUnit`; jika `restock=false` HPP tetap (kerugian barang rusak terserap). Uang refund keluar sebagai arus kas pada tanggal retur.
- Pengiriman: status awal `new` hanya bila `useShipping`. Setiap perpindahan dicatat log.

### 6.5 Piutang dan utang

```
overdueDays(s, asOf) = max(0, daysBetween(s.dueDate, asOf))   // hanya bila sisaPiutang>0
bucket: notDue (overdue=0) | 1-7 | 8-30 | >30
totalPiutang = openingReceivable_sisa + sum(sisaPiutang)
Utang usaha  = openingPayable_sisa + sum(Expense.amount - ExpensePayment) untuk Expense paid=false
```
Pengingat tagihan: tampil di Daftar Tindakan dan dashboard untuk bucket ≥ 1 hari. (Tanpa kirim WhatsApp otomatis. Sediakan tombol "Salin pesan tagihan" yang menyalin teks sopan ke clipboard.)

### 6.6 Pengeluaran dan klasifikasi

```
group 'cogs'|'selling'|'operating'|'other'  -> BEBAN (masuk Laba/Rugi pada Expense.date, akrual)
group 'non_expense':
    inventory      -> bukan beban; menambah persediaan (stockItems wajib)
    prive          -> bukan beban; kurangi kas & ekuitas
    debt_principal -> bukan beban; kurangi kas & utang
    asset          -> bukan beban (peralatan besar; opsional)
Kas keluar terjadi saat Expense dibayar (paid=true pada tanggal) atau saat ExpensePayment.
```
Beban penjualan otomatis dari penjualan: `platformFee` dan `shippingSellerCost` ikut kelompok `selling` pada Laba/Rugi (bukan diinput ganda). `discountSeller` masuk baris "Retur dan diskon".

### 6.7 Laporan keuangan (periode `[start, end]`, semua exclude `voided`)

**Laba/Rugi**
```
pendapatanPenjualan = sum(Sale.subtotal)
returDiskon         = sum(Sale.discountSeller) + sum(SaleReturn.refundAmount)
pendapatanBersih    = pendapatanPenjualan - returDiskon
HPP                 = sum(item.qty*item.cogsUnit) - sum(retur restock: qty*cogsUnit)   // + Expense group 'cogs' (mis. biaya langsung jasa)
labaKotor           = pendapatanBersih - HPP
bebanPenjualan      = sum(Sale.platformFee + Sale.shippingSellerCost) + sum(Expense group 'selling')
bebanOperasional    = sum(Expense group 'operating')
bebanLain           = sum(Expense group 'other')
labaBersih          = labaKotor - bebanPenjualan - bebanOperasional - bebanLain
```

**Neraca (per tanggal `asOf`)**
```
kas         = openingCash + sum(kas masuk) - sum(kas keluar)    // sampai asOf
              masuk : SalePayment (+ piutang awal yang dilunasi bila dicatat)
              keluar: Expense paid / ExpensePayment, refund retur, (termasuk prive & pokok utang)
piutang     = totalPiutang
persediaan  = sum(onHand*avgCost) semua produk stockTracked + semua bahan baku
ASET        = kas + piutang + persediaan
LIABILITAS  = utang usaha
EKUITAS     = modalAwal + akumulasiLabaBersih(sejak openingDate s.d. asOf) - akumulasiPrive
CEK         = ASET - (LIABILITAS + EKUITAS)  // harus 0; tampilkan badge "Seimbang", bila tidak 0 tampilkan peringatan dan catat ke log
modalAwal   = openingCash + nilaiPersediaanAwal + openingReceivable - openingPayable
```
Karena `modalAwal` dihitung dari saldo awal, neraca otomatis seimbang bila semua transaksi dicatat lewat service. Bila CEK ≠ 0 pada tes, itu **bug**, bukan data.

**Arus Kas (periode)**
```
kasAwalPeriode = kas pada (start - 1 hari)
masuk:  penjualanTunaiDanPelunasan = sum(SalePayment di periode)
keluar: belanjaStok, biayaOperasional (beban dibayar), pelunasanUtang, refundRetur, prive
kasAkhir = kasAwalPeriode + masuk - keluar     // harus sama dengan kas Neraca di end
```

Contoh uji wajib (angka diverifikasi manual):
- L/R: penjualan 10.000.000, retur+diskon 500.000, HPP 5.000.000, beban penjualan 800.000, operasional 1.500.000, lain 200.000 → pendapatan bersih 9.500.000, laba kotor 4.500.000, **laba bersih 2.000.000**.
- Neraca: modal/kas awal 10.000.000; beli stok tunai 4.000.000; jual 7.000.000 (5.000.000 tunai, 2.000.000 tempo) dengan HPP 3.000.000; gaji 1.000.000 dan beban lain 500.000 tunai → kas 9.500.000, piutang 2.000.000, persediaan 1.000.000, aset 12.500.000; laba 2.500.000; ekuitas 12.500.000; liabilitas 0 → seimbang. Tambah prive 500.000 → kas 9.000.000, ekuitas 12.000.000, aset 12.000.000 → seimbang, laba tetap 2.500.000.

### 6.8 Batas Pengeluaran

```
used(cat, month)  = sum(Expense.amount) kategori cat pada bulan berjalan   // semua group beban; kategori selling otomatis (fee/ongkir) ikut dihitung bila kategorinya 'Fee marketplace'/'Ongkir'
limit(cat):
   fixed           -> value
   percent_revenue -> value/100 * basis
       basis = max( pendapatanBersihBulanBerjalan(MTD),
                    rataRataPendapatanBersihBulanan3BulanTerakhir * (hariKe / jumlahHariBulan) )   // hindari merah palsu di awal bulan
ratio = limit>0 ? used/limit : (used>0 ? Infinity : 0)
status = ratio < 0.8 ? 'hijau' : ratio <= 1 ? 'kuning' : 'merah'
overBy = max(0, used - limit)
pesanMerah = `Biaya ${cat} melebihi batas Rp${overBy}. Jika berlanjut, laba bulan ini turun sekitar ${pct}%`
   pct = labaBersihBulanBerjalan > 0 ? round(overBy / labaBersihBulanBerjalan * 100) : null (tulis tanpa persen)
saranOtomatis(cat) = ceilTo10rb( rataRata(used per bulan, 3 bulan terakhir selesai) )   // Pemilik wajib setuju/ubah; tidak otomatis aktif
```
- Pemilik mengatur batas. Karyawan dengan akses modul Pengeluaran hanya melihat status dan **sisa batas** saat mengisi form (mis. "sisa budget Kemasan Rp80.000").
- Saat menyimpan pengeluaran yang membuat kategori > 100%: tampilkan dialog peringatan, `overBudgetReason` **wajib** (non-kosong), lalu tetap simpan. Alasan terlihat oleh Pemilik. Kirim toast ke Pemilik pada sesi aktif dan masukkan ke peringatan dashboard.
- Hanya kategori aktif yang punya batas.

### 6.9 Uang Aman Ditarik, Impas Harian, dan Runway

```
fixedMonthly      = sum(RecurringExpense.amount aktif)           // gaji, sewa, dst.
routineRestock30  = includeRoutineRestockInMandatory ? rataRata belanja inventory per 30 hari (3 bulan terakhir) : 0
dueSoon30         = sum(sisa utang usaha dengan dueDate <= asOf+30)
biayaWajib30      = fixedMonthly + routineRestock30 + dueSoon30
cadangan          = reservePct/100 * pendapatanBersih(30 hari terakhir)
uangAman          = max(0, kas - biayaWajib30 - cadangan)
bila (kas - biayaWajib30 - cadangan) < 0 -> tampilkan "Kas belum cukup menutup biaya wajib. Jangan menarik uang."
runwayHari        = kas / (biayaWajib30/30)
impasHarian       = (fixedMonthly/30) / rasioLabaKotor30     // rasioLabaKotor30 = labaKotor/pendapatanBersih (30 hari); bila rasio<=0 -> tampilkan "margin kotor tidak positif"
progresImpas      = penjualanHariIni(pendapatanBersih) / impasHarian
```
Contoh uji: kas 10.000.000, biayaWajib30 5.500.000, cadangan 1.000.000 → uangAman **3.500.000**.
Penarikan Pemilik dicatat sebagai `Expense(non_expense/prive)`; setelah dicatat, uang aman turun karena kas turun.
Akses: **hanya Pemilik Usaha**.

### 6.10 Diagnosis Laba Turun (PVM + biaya)

Bandingkan periode 0 (pembanding) dan 1 (sekarang). Default: minggu ini vs minggu lalu, atau bulan ini (prorata) vs bulan lalu; Pemilik dapat memilih.

Definisi per produk `i` (qty bersih setelah retur; harga netto setelah diskon penjual):
`m_i = p_i - c_i` (margin per unit), `Q = sum(q_i)`, `s_i = q_i / Q`.

```
Qty tidak ada di salah satu periode:
   produk baru (q0=0):    pakai p0=p1, c0=c1   -> efeknya jatuh ke volume/bauran
   produk berhenti (q1=0): efeknya jatuh ke bauran lewat s1=0

efekHarga  =  sum( q1_i * (p1_i - p0_i) )
efekBiayaUnit (HPP) = - sum( q1_i * (c1_i - c0_i) )
efekVolume =  (Q1 - Q0) * sum( s0_i * m0_i )
efekBauran =  Q1 * sum( (s1_i - s0_i) * m0_i )
efekBebanPenjualan  = -(bebanPenjualan1 - bebanPenjualan0)
efekBebanOperasional= -(bebanOperasional1 - bebanOperasional0)
efekBebanLain       = -(bebanLain1 - bebanLain0)
Σ semua efek == labaBersih1 - labaBersih0     // identitas WAJIB (toleransi 1 rupiah karena pembulatan)
```
Keluaran: daftar efek bernilai rupiah dan persen kontribusi `efek / selisihLaba`, diurutkan menurut |efek|, plus **rincian pendorong**: produk dengan |efekBiayaUnit| terbesar (mis. "Kopi Arabika: harga beli Rp52.000 → Rp62.000"), kategori beban dengan kenaikan terbesar, kanal dengan fee berubah. Jika data periode kurang dari 7 hari, kembalikan `insufficientData: true` (jangan menebak).

Contoh uji (verifikasi manual): Periode 0: A q=100 p=50.000 c=30.000; B q=100 p=30.000 c=20.000. Periode 1: A q=80 p=50.000 c=36.000; B q=120 p=30.000 c=20.000; beban tetap. Hasil: efekHarga 0, efekBiaya **-480.000**, efekVolume 0, efekBauran **-200.000**, total **-680.000** = selisih laba kotor (3.000.000 → 2.320.000).

### 6.11 Skor Kesehatan Usaha (0–100)

Dihitung atas 30 hari terakhir. Setiap komponen 0–100:

| Komponen | Bobot | Rumus |
|---|---|---|
| Margin bersih | 30 | `clamp(labaBersih/pendapatanBersih / 0.20, 0, 1) * 100` (≥20% = penuh; negatif = 0) |
| Perputaran stok | 20 | `DIO = nilaiPersediaan / (HPP30/30)`; 100 bila DIO ≤ 30; turun linear ke 0 pada DIO ≥ 120 |
| Umur piutang | 20 | `r = piutangLewatJatuhTempo / pendapatanBersih30`; `clamp(1 - r/0.20, 0, 1)*100` |
| Kas (runway) | 30 | `clamp(runwayHari / 60, 0, 1) * 100` |

Komponen yang tidak berlaku (`useStock=false`, `useCredit=false`) dikeluarkan dan bobot sisanya dinormalkan ke total 100. Label: ≥80 "Sehat", 60–79 "Waspada", <60 "Perlu perhatian". UI wajib menampilkan rincian skor per komponen agar bisa dijelaskan. Jika data < 14 hari: tampilkan "Data belum cukup".

### 6.12 Deteksi Anomali (statistik sederhana, butuh data minimal)

```
penjualanAnjlok : seri pendapatanBersih harian 28 hari sebelum hari ini; z = (x_hariIni - mean)/std; flag bila z < -2 dan mean>0 (butuh >=14 hari data)
lonjakanBiaya   : total pengeluaran beban per kategori per minggu; flag bila minggu ini > mean + 2*std dari 8 minggu sebelumnya (butuh >=4 minggu data)
marginTidakWajar: margin item penjualan < 0, atau margin produk 7 hari < 50% rata-rata margin produk itu 30 hari sebelumnya
selisihStok     : total adjustment negatif 30 hari > 5% dari nilai persediaan
Keluaran: { type, severity, message, metric, link }  // tidak ada data cukup -> lewati, jangan error
```

### 6.13 Pengingat Repeat Order (RFM)

```
Untuk pelanggan dengan >=2 pesanan:
   avgInterval = rata-rata selisih hari antar pesanan
   daysSinceLast = asOf - tanggalPesananTerakhir
   terlambat = daysSinceLast > 1.5 * avgInterval  &&  daysSinceLast >= 7
   pesan: `${nama} biasanya order tiap ${round(avgInterval)} hari, sudah ${daysSinceLast} hari belum order`
Segmentasi RFM: skor tertil 1-3 untuk R (semakin baru semakin tinggi), F, M (30..90 hari). Label: Juara (R3,F3), Setia (F3), Berisiko (R1 & (F>=2 atau M>=2)), Baru (F1 & R3), Hilang (R1,F1).
Urutkan 'terlambat' menurut total belanja menurun. Tampilkan maksimal 10 di daftar.
```

### 6.14 Estimasi Stok (hari cukup) dan Rekomendasi Restock
```
rataJualHarian = sum(qty terjual 28 hari) / 28
hariCukup      = rataJualHarian > 0 ? onHand / rataJualHarian : Infinity
restock bila: onHand <= minStock  ATAU  hariCukup < 7
saranQty = ceil( rataJualHarian * 14 ) - onHand      // target cukup 14 hari; minimal 0
Dead stock: onHand>0 dan tidak ada penjualan 60 hari
```

### 6.15 Daftar Tindakan Mingguan
Dibuat/diperbarui otomatis setiap Senin (atau saat Pemilik membuka halaman bila minggu berganti). Idempotent: tugas yang sudah `done/dismissed` tidak dibuat ulang untuk `refId` dan `weekStart` yang sama. Urutan prioritas:
1. Tagih piutang bucket >30 hari (satu tugas per pelanggan, nominal terbesar dahulu)
2. Restock stok kritis (onHand ≤ minStock atau hariCukup < 3)
3. Periksa kategori biaya berstatus merah
4. Hubungi pelanggan terlambat repeat order (maksimal 5)
5. Kas runway < 30 hari ("tunda penarikan, tinjau biaya")
6. Catat biaya tetap bulan ini yang belum tercatat (bandingkan RecurringExpense dengan Expense bulan ini)
Pemilik dapat menandai selesai atau abaikan. Status tersimpan.

### 6.16 Peringatan Dashboard (alerts.ts)
Kumpulkan dan urutkan menurut severity (`merah` > `kuning` > `info`): stok menipis/negatif; harga beli naik >10% dibanding rata-rata 60 hari; kategori biaya >120% rata-rata 3 bulan (prorata); penjualan 7 hari < 80% rata-rata 7-harian dari 4 minggu sebelumnya; piutang lewat jatuh tempo; runway < 30 hari; batas pengeluaran kuning/merah; anomali (6.12). Setiap peringatan memiliki `link` ke halaman terkait.

---

## 7. HAK AKSES

```ts
type ModuleKey = 'dashboard'|'sales'|'products'|'stock'|'expenses'|'payments'|'shipping'|'customers'|'finance_reports'|'periodic_reports';
type Level = 'none'|'view'|'manage';           // manage mencakup view
const OWNER_ONLY = ['settings','users','budgets_edit','safe_withdrawal','analytics','copilot','activity_log'] as const;
```
- Pemilik Usaha: akses `manage` ke semua + semua fitur `OWNER_ONLY`.
- Karyawan: hanya modul yang ditugaskan; **tidak pernah** dapat `OWNER_ONLY`. Karyawan dengan `expenses ≥ view` boleh melihat status dan sisa Batas Pengeluaran (baca saja).
- Template (jalan pintas, tetap bisa diubah):
  - Staf Penjualan: sales=manage, customers=manage, products=view, payments=view, dashboard=view
  - Staf Gudang: stock=manage, shipping=manage, products=view, sales=view, dashboard=view
  - Staf Keuangan: payments=manage, expenses=manage, finance_reports=view, sales=view, dashboard=view
  - Kustom: pilih manual per modul
- Modul "Pembelian" lama dihapus. Aksesnya dipetakan ke `expenses`.
- Penegakan: (1) layanan `services/*` memanggil `assertAccess(user, module, level)` di awal setiap use-case dan melempar error terstandar; (2) route guard di UI mengarahkan ke halaman "Anda tidak memiliki akses"; (3) tombol aksi disembunyikan bila hanya `view`; (4) angka keuangan (kas, laba, margin, HPP) tidak dikirim ke akun tanpa akses `finance_reports`. Perhatikan: kolom `avgCost`/HPP di Produk dan laba di detail pesanan **disembunyikan** untuk akun tanpa `finance_reports`.
- Dashboard Karyawan: kartu "Penugasan Saya" + widget hanya dari modul yang ditugaskan (pesanan baru hari ini, stok menipis, perlu dikemas/dikirim, pembayaran belum lunas, status sisa batas pengeluaran).
- Pemilik membuat Karyawan (nama, username otomatis dari nama, unik; kata sandi awal; penugasan), mengubah penugasan (berlaku langsung tanpa reload), dan menonaktifkan akun (tidak bisa login).
- Pemilik tidak boleh menonaktifkan atau menurunkan aksesnya sendiri.
- Pada usaha satu orang, Pemilik merangkap Karyawan (tidak perlu akun tambahan).

---

## 8. IMPOR BERKAS PENJUALAN (Excel/CSV)

Alur UI: Unggah → Pilih kanal → Pemetaan kolom → Pratinjau → Konfirmasi → Laporan hasil.

1. **Parse**: dukung `.xlsx` dan `.csv` (deteksi pemisah `,` dan `;`, encoding UTF-8). Batas ukuran 5 MB / 5.000 baris per impor; di atasnya tolak dengan pesan jelas.
2. **Pemetaan kolom** ke field internal: `externalOrderId`*, `date`*, `productName/SKU`*, `qty`*, `unitPrice`* (atau `lineTotal`), `discountSeller`, `platformFee`, `shippingSellerCost`, `customerName`, `paymentStatus`, `orderStatus`. (*wajib). Pemetaan dapat **disimpan per kanal** dan dimuat otomatis di impor berikutnya.
3. **Pencocokan produk**: cocokkan `SKU` dahulu, lalu `channelNames[channel]`, lalu nama persis (case-insensitive). Produk tidak cocok → baris ditandai "perlu dipetakan"; sediakan dialog untuk memilih produk internal dan **menyimpan pemetaan** ke `channelNames`.
4. **Pengelompokan**: baris dengan `externalOrderId` sama digabung menjadi satu `Sale` dengan banyak item.
5. **Validasi** per pesanan: tanggal valid; qty > 0 integer; harga ≥ 0; kolom wajib ada. Baris salah → `failed` dengan alasan.
6. **Deduplikasi**: kunci `(channelId, externalOrderId)`. Sudah ada → `skipped` (tidak ditimpa). Impor ulang berkas yang sama tidak boleh menambah data.
7. **Fee**: bila kolom `platformFee` dipetakan, pakai nilai file; bila tidak, hitung `round(subtotal * channel.feePct/100)`. Simpan sebagai snapshot di `Sale`.
8. **Status bayar**: bila `paymentStatus`/`orderStatus` dipetakan dan menandakan selesai/dana cair → buat `SalePayment` penuh pada tanggal pesanan; pesanan batal/gagal → `voided=true`; selain itu `belum` dengan `dueDate = date + 7`. Bila tidak dipetakan → anggap lunas (default, dapat diubah di pratinjau).
9. **Efek samping** (untuk pesanan baru): kurangi stok sesuai 6.2, buat status pengiriman `new` bila `useShipping`.
10. **Atomik per impor**: gunakan transaksi; bila terjadi galat sistem, rollback seluruh batch. Catat `ImportBatch` dan log aktivitas. Laporan hasil: `{ok, skipped, failed}` + unduh CSV baris gagal.
11. Fungsi parse/mapping/validasi/dedup berada di `domain/importer.ts` (murni, menerima array baris); pembacaan file ada di lapisan UI/service.

Form input manual (offline/WhatsApp): pilih/buat pelanggan (tersimpan untuk berikutnya), pilih kanal, tambah item dari daftar produk (harga terisi otomatis dan dapat diubah), diskon, ongkir, pilihan **Bayar sekarang** atau **Tempo** (+ tanggal jatuh tempo). Optimalkan kecepatan input (autocomplete produk dan pelanggan, enter untuk tambah baris).

---

## 9. AI BUSINESS COPILOT (LLM sungguhan)

**Prinsip:** LLM hanya *menjelaskan*, tidak menghitung. Semua angka berasal dari hasil *tool*.

Arsitektur:
- Endpoint server `POST /api/copilot` (kunci API hanya di server melalui env, **tidak pernah** dikirim ke klien). Model dikonfigurasi lewat env `COPILOT_MODEL`.
- Cek sesi: peran harus `owner`, selain itu balas 403. Rate limit per pengguna.
- Loop tool-calling maksimal 5 iterasi. Argumen tool divalidasi skema (mis. zod); periode memakai token enum `this_week|last_week|this_month|last_month|last_30d|last_90d` atau rentang ISO tervalidasi (maks 366 hari).
- Respons mengalirkan teks (streaming) dan menyertakan daftar `toolsUsed` + ringkasan parameter untuk bagian "Dasar perhitungan" yang dapat dibuka di UI.
- Riwayat percakapan disimpan, dibatasi 20 pesan terakhir untuk konteks.

Tool (semua memanggil fungsi `domain/`, keluaran JSON ringkas, **tanpa data pribadi pelanggan**: gunakan `customerId`/inisial dan segmen, bukan nomor telepon/alamat):
`get_period_summary`, `get_profit_diagnosis(periodA, periodB)`, `get_channel_profitability`, `get_product_profitability`, `get_restock_recommendations`, `get_slow_moving_products`, `get_receivables_aging`, `get_expense_budget_status`, `get_safe_withdrawal`, `get_health_score`, `get_cashflow`, `get_financial_statements`, `get_reorder_alerts`, `get_weekly_actions`.

System prompt (inti, wajib):
1. Jawab dalam bahasa Indonesia sederhana, ringkas, seperti penasihat untuk pemilik UMKM non-akuntan.
2. **Hanya gunakan angka yang muncul di hasil tool.** Jangan menghitung, memperkirakan, atau mengarang angka. Bila perlu angka yang tidak ada tool-nya, katakan tidak tersedia.
3. Bila tool mengembalikan `insufficientData`, katakan datanya belum cukup dan sebutkan syaratnya.
4. Anda memberi analisis dan saran, **bukan keputusan**. Jangan menyatakan akan mengubah data. Jangan menyuruh tindakan yang melanggar hukum atau pajak.
5. Bila pertanyaan di luar data usaha, nyatakan batasan dengan sopan.
6. Bila periode ambigu, pakai default yang wajar dan sebutkan periode yang dipakai.
7. Jangan menampilkan data pribadi pelanggan.

Perilaku UI:
- Hapus `copilot-scenarios.ts` dari alur produksi. Boleh dipertahankan **hanya** sebagai fixture tes (pertanyaan → tool yang diharapkan dipanggil).
- Tombol pertanyaan cepat tetap ada (mengirim teks pertanyaan ke endpoint yang sama, bukan jawaban skrip): "Kenapa laba turun?", "Kanal mana paling untung?", "Produk apa yang harus di-restock?", "Berapa uang yang aman saya ambil?", "Kategori biaya mana paling boros?", "Piutang mana yang jatuh tempo?", "Ringkas performa bulan ini".
- Hapus catatan "mode demo". Tampilkan "Dihasilkan dari data internal. Angka berasal dari perhitungan sistem."
- Bila API LLM tidak tersedia: tampilkan pesan galat yang jelas dan tawarkan membuka halaman laporan terkait; **jangan** menjawab dengan teks skrip.
- Efek ketik buatan dihapus; gunakan streaming asli.

---

## 10. PERUBAHAN UI PER HALAMAN

| Halaman | Perubahan |
|---|---|
| Setup awal (pertama kali) | Wizard: data usaha → tipe usaha → akun Pemilik → saldo awal (kas awal, stok awal bila `useStock`, piutang/utang awal opsional) → pilih data contoh (Dagang/Produksi/Kosong). Hapus halaman registrasi UMKM. |
| Login | Username/email + kata sandi. Hapus format `@kodeumkm.usaha.in`. |
| Pengaturan Usaha (Pemilik) | Tipe usaha, toggle fitur, kategori biaya (aktif/nonaktif/tambah + kelompok), fee per kanal, `reservePct`, biaya tetap berulang, saldo awal (terkunci setelah ada transaksi, ubah lewat penyesuaian). |
| Dashboard Pemilik | KPI (omzet, laba bersih, pengeluaran, pesanan + % vs periode lalu), kas, uang aman ditarik, skor kesehatan (klik untuk rincian), kartu status batas pengeluaran, piutang jatuh tempo, grafik penjualan 30 hari, omzet+margin per kanal, 5 terlaris dan 5 kurang laku, panel peringatan (6.16), tautan Daftar Tindakan. |
| Dashboard Karyawan | Dinamis sesuai penugasan (Bagian 7). |
| Produk | Form menyesuaikan `kind`; HPP/rata-rata biaya tampil hanya bagi yang punya akses keuangan; editor resep (bila `useProduction`); toggle stok per produk; pemetaan nama per kanal. Pertahankan highlight "Menipis" dan ledger stok. |
| Stok | Hanya bila `useStock`. Tambah kolom "Cukup berapa hari", rekomendasi restock, tombol "Catat Produksi" (bila `useProduction`), dan "Penyesuaian stok" (wajib catatan). |
| Penjualan | Tombol "Input Penjualan" (form 8) dan "Impor Berkas" (alur 8). Tombol "Tambah Pesanan Contoh" dan "Reset Data Demo" hanya muncul bila `DEMO_MODE=true` dan hanya untuk Pemilik. Drawer detail: tampil rincian subtotal, diskon, fee, ongkir, total diterima, pembayaran, tombol Batalkan/Retur. |
| Pengeluaran (ganti Pembelian) | Form: tanggal, kategori, nominal, status bayar/utang + jatuh tempo, pemasok (opsional), catatan; untuk kategori `inventory`: tambah baris item stok (produk/bahan, qty, harga). Tampilkan sisa batas kategori. Dialog alasan bila melewati batas. Tab "Prive" khusus Pemilik. |
| Pembayaran dan Piutang | Tabel piutang dengan umur (bucket), pembayaran sebagian, "Tandai Lunas", "Salin pesan tagihan", tab Utang Usaha. |
| Pengiriman | Hanya bila `useShipping`. Pertahankan kanban. |
| Pelanggan | Tambah kolom total belanja, jumlah order, tanggal order terakhir, segmen RFM (segmen hanya bagi Pemilik). |
| Laporan Keuangan | Tiga tab: Laba/Rugi bertahap (6.7), Neraca (dengan badge Seimbang), Arus Kas. Toggle periode. Hapus ringkasan lama berbasis konstanta Rp2,5 juta. Pertahankan tabel profitabilitas per kanal (ditambah margin dari fee aktual). |
| Laporan Periodik | Harian/mingguan/bulanan: penjualan, pengeluaran, laba, produk terlaris. |
| Batas Pengeluaran (Pemilik) | Tabel kategori: batas (mode+nilai), terpakai, persen, status warna; tombol "Terapkan saran otomatis". |
| Uang Aman Ditarik (Pemilik) | Rincian rumus 6.9 (kas, biaya wajib, cadangan, hasil), target impas harian dengan progres, tombol "Catat penarikan (prive)". |
| Analitik (Pemilik) | Tab: Diagnosis Laba, Skor Kesehatan, Anomali, Repeat Order, Daftar Tindakan. |
| Copilot (Pemilik) | Bagian 9. |
| Manajemen Tim (Pemilik) | Dipertahankan (daftar, tambah, ubah penugasan, nonaktifkan, template). Log Aktivitas tetap. |

Seluruh label peran diganti ke "Pemilik Usaha"/"Karyawan".

---

## 11. DATA CONTOH (SEED) — DETERMINISTIK

Generator di `seed/` memakai PRNG ber-seed tetap (mis. mulberry32) dan tanggal relatif terhadap `asOf`, sehingga hasil sama setiap dijalankan. Setiap set memuat **minimal 90 hari** riwayat. Tersedia: **Dagang**, **Produksi**, **Kosong**. Reset Data Demo mengembalikan ke set terpilih (hanya `DEMO_MODE`, hanya Pemilik, dengan konfirmasi).

**Set Dagang (toko kopi/teh/gula aren, pertahankan 10 produk lama):**
- Kanal: Shopee (fee 5% untuk >21 hari lalu, 7,5% untuk 21 hari terakhir), Tokopedia 3,5%, WhatsApp 0%, Offline 0%.
- Skenario yang harus terlihat di analitik: (a) harga beli Kopi Arabika naik Rp52.000 → Rp62.000 sekitar 3 minggu lalu (memicu diagnosis "laba turun karena HPP"), (b) 2 produk di bawah stok minimum (Kopi Arabika 250g 8/min 15; Teh Melati Premium 12/min 20), (c) 3 pelanggan reseller memakai tempo dan 1 piutang telat >30 hari, (d) kategori Kemasan >100% batas dan Iklan 85%, (e) pelanggan "Toko Budi" order tiap 14 hari tetapi sudah 30 hari belum order, (f) 1 produk tanpa penjualan 60 hari (dead stock).

**Set Produksi (dapur kue):** produk Brownies Box, Nastar Toples, Bolu Pandan; bahan Tepung, Gula, Telur, Cokelat, Mentega, Kemasan; resep lengkap; Brownies stockTracked (produksi massal), Bolu make-to-order (backflush). Skenario: harga cokelat naik, biaya gas melonjak satu minggu, 1 piutang tempo.

Seed Jasa: opsional (usaha jahit; stok mati, biaya langsung per layanan).

Data contoh harus membuat semua tes penerimaan Bagian 13 lulus dan neraca seimbang.

---

## 12. FASE PENGERJAAN (BERURUTAN)

**Fase 0 — Fondasi dan refactor**
- Tanyakan T1 (penyimpanan) ke pengguna.
- Buat struktur `domain/`, `services/`, `data/` (repository), `tests/`; inject `asOf`; helper `money.ts`, `period.ts`.
- Hapus multi-tenant, registrasi UMKM, slug, NIB. Ganti istilah peran. Setup wizard dasar + login baru.
- Pindahkan logika hitung lama (`finance.ts`, `permissions.ts`) ke `domain/` dan buat tes regresi sebelum diubah.
- **Selesai bila:** aplikasi berjalan single-tenant, fitur lama utama tetap berfungsi, tes dasar lulus.

**Fase 1 — Pengaturan, tipe usaha, produk, stok**
- Setup tipe usaha, toggle, kategori biaya (6.1); saldo awal dan `modalAwal` terhitung.
- Produk (kind, stockTracked), resep, bahan, `StockMove` dengan moving average (6.2–6.3), penyesuaian stok, estimasi hari stok.
- **Selesai bila:** tes 6.1–6.3 lulus; mengganti tipe usaha mengubah menu/form sesuai tabel.

**Fase 2 — Penjualan, pembayaran, piutang, pelanggan**
- Form manual, impor berkas (Bagian 8), fee per kanal, pembayaran sebagian, tempo, pembatalan, retur, umur piutang, pengingat tagihan, pelanggan diperkaya, pengiriman bersyarat.
- **Selesai bila:** tes 6.4–6.5 dan impor (termasuk dedup dan rollback) lulus.

**Fase 3 — Pengeluaran, utang, prive, batas pengeluaran**
- Modul Pengeluaran (ganti Pembelian), klasifikasi (6.6), utang usaha, prive, `RecurringExpense`, Batas Pengeluaran (6.8) dengan alasan wajib.
- **Selesai bila:** pembelian stok tidak menjadi beban; prive tidak mengubah laba; tes 6.6 dan 6.8 lulus.

**Fase 4 — Laporan keuangan dan kas**
- Laba/Rugi, Neraca (cek seimbang), Arus Kas, Laporan Periodik, Uang Aman Ditarik, impas harian, runway (6.7, 6.9).
- **Selesai bila:** contoh uji angka di 6.7 dan 6.9 tepat; kas Neraca == kasAkhir Arus Kas; neraca seimbang pada seed.

**Fase 5 — Seed riwayat dan analitik**
- Generator seed 90 hari (Bagian 11). Lalu diagnosis (6.10), skor (6.11), anomali (6.12), RFM (6.13), restock (6.14), tindakan (6.15), peringatan (6.16), dan rebuild Dashboard Pemilik.
- **Selesai bila:** identitas diagnosis terpenuhi, contoh uji PVM tepat, skenario seed muncul sebagai peringatan/tindakan yang benar.

**Fase 6 — AI Copilot**
- Endpoint, tool definitions, runner, sanitasi, UI streaming, pembatasan akses (Bagian 9).
- **Selesai bila:** Karyawan ditolak (403); setiap angka dalam jawaban dapat ditelusuri ke `toolsUsed`; tes pertanyaan uji lulus.

**Fase 7 — Finalisasi**
- Seed Produksi dan Jasa, mode demo, QA lintas peran, performa (dashboard ≤ 3 detik pada data seed), audit izin, dokumentasi (`README`, `docs/ASSUMPTIONS.md`), pembersihan kode mati.

---

## 13. TES PENERIMAAN (WAJIB OTOMATIS)

**Domain (unit)**
1. Moving average: stok 10 @ Rp50.000 lalu beli 10 @ Rp60.000 → avgCost Rp55.000; jual 5 → `cogsUnit` Rp55.000 tersimpan permanen walau harga beli berubah kemudian.
2. HPP resep: bahan dan yield → `recipeUnitCost` benar; produksi massal mengurangi bahan dan menambah produk jadi; backflush mengurangi bahan saat jual.
3. `amountDue` dan status (lunas/sebagian/belum/gagal); pelunasan tidak menambah pendapatan; pembatalan membalik stok dan mengeluarkan pesanan dari laporan.
4. Laba/Rugi, Neraca, dan Arus Kas sesuai contoh angka 6.7 (dua skenario, termasuk prive); `ASET - (LIABILITAS+EKUITAS) == 0` setelah rangkaian transaksi acak (property test, 200 skenario).
5. Pembelian stok bukan beban; prive tidak mengubah laba; pokok utang bukan beban.
6. Batas pengeluaran: ambang 80%/100%, percent_revenue dengan basis `max`, dialog alasan wajib, tidak memblokir penyimpanan.
7. Uang Aman Ditarik (contoh 3.500.000), kas negatif terhadap biaya wajib → 0 dan pesan peringatan; impas harian.
8. Diagnosis: contoh PVM (-480.000 biaya, -200.000 bauran, total -680.000); identitas `Σ efek == Δ laba bersih` pada 100 data acak; produk baru/berhenti tidak merusak identitas; `insufficientData` bila < 7 hari.
9. Skor kesehatan: normalisasi bobot saat komponen tidak berlaku; batas label.
10. Anomali dan RFM: data kurang → dilewati tanpa error; pelanggan terlambat terdeteksi sesuai aturan.
11. Impor: dedup `(channelId, externalOrderId)`, impor ulang berkas sama menghasilkan 0 data baru, baris invalid dilaporkan, rollback saat galat.
12. Izin: Karyawan tanpa akses ditolak di service (bukan hanya UI); fitur `OWNER_ONLY` selalu ditolak untuk Karyawan; Pemilik tidak bisa menonaktifkan diri sendiri.

**Integrasi/UI**
13. Mengganti tipe usaha mengubah menu, form produk, template biaya, dan perhitungan HPP.
14. Setelah satu alur lengkap (impor → bayar → pengeluaran → laporan), angka identik di Dashboard, Laporan Keuangan, Analitik, dan jawaban Copilot.
15. Akun tanpa `finance_reports` tidak menerima angka kas/laba/HPP di respons maupun DOM.
16. Dashboard dimuat ≤ 3 detik pada data seed 90 hari.

---

## 14. YANG TIDAK BOLEH DILAKUKAN

- Jangan membuat integrasi API marketplace/WhatsApp atau melakukan scraping.
- Jangan menambah multi-tenant atau registrasi mandiri.
- Jangan memakai localStorage untuk data bila T1 = Opsi A.
- Jangan menaruh logika hitung di komponen UI atau menulis angka tetap pada jawaban Copilot.
- Jangan membiarkan LLM melihat data pribadi pelanggan atau mengubah data.
- Jangan memblokir pengeluaran yang melewati batas.
- Jangan menghitung HPP dari total pembelian; HPP dari barang terjual (snapshot).
- Jangan mengedit stok sebagai satu angka; selalu lewat `StockMove`.
- Jangan menambahkan fitur opsional (D11) sebelum Fase 7 selesai.
- Jangan mengubah keputusan pada Bagian 2 tanpa persetujuan pengguna.

---

## 15. LAPORAN SETIAP FASE (FORMAT)

Setelah tiap fase, agent melaporkan: (1) apa yang dikerjakan, (2) berkas yang diubah/ditambah, (3) hasil tes (lulus/gagal), (4) asumsi yang diambil (juga ditulis di `docs/ASSUMPTIONS.md`), (5) hal yang butuh keputusan pengguna. Tunggu konfirmasi sebelum lanjut ke fase berikutnya.
