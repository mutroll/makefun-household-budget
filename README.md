# DompetKeluarga — Anggaran Rumah Tangga

[![make.fun · best-household-budget-site-20261126-1457](https://make.fun/badge/best-household-budget-site-20261126-1457.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457?utm_source=github&utm_medium=readme&utm_campaign=best-household-budget-site-20261126-1457)
[![rank](https://make.fun/badge/best-household-budget-site-20261126-1457/mutroll/makefun-household-budget/rank.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-household-budget-site-20261126-1457)
[![reward](https://make.fun/badge/best-household-budget-site-20261126-1457/mutroll/makefun-household-budget/reward.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457?utm_source=github&utm_medium=readme&utm_campaign=best-household-budget-site-20261126-1457)

Situs anggaran rumah tangga untuk **Keluarga Rahma** (Jakarta): satu rumah tangga,
semua angka dalam rupiah dan saling cocok — setiap total adalah jumlah dari
bagiannya.

## Yang ada di situs ini

- **Dashboard** — pemasukan, belanja, sisa, dan tingkat tabungan bulan berjalan;
  belanja per kategori (diagram donat), tagihan yang belum dibayar, transaksi
  terakhir, dan pencatatan pengeluaran cepat.
- **Anggaran** — rencana vs realisasi per kategori (8 amplop anggaran),
  lengkap dengan grafik batang dan editor rencana yang menghitung ulang sisa.
- **Transaksi** — tambah, cari, saring per kategori/jenis, dan hapus transaksi;
  saldo berjalan dihitung dari transaksi yang tampil.
- **Tagihan & Langganan** — 10 tagihan rutin (total Rp 3.879.000/bulan) dengan
  tombol tandai lunas yang mengubah total belum dibayar.
- **Tabungan & Tujuan** — 4 tujuan (dana darurat, liburan, DP rumah,
  pendidikan anak; total terkumpul Rp 75.750.000) dengan setoran yang
  menaikkan progres.
- **Laporan** — tren pemasukan vs belanja Juni–November 2026, sisa tiap bulan,
  dan riwayat bulanan.

## Angka kunci (November 2026)

| | Rp |
|---|---|
| Pemasukan (gaji 12.000.000 + 4.500.000 + usaha 2.000.000) | 18.500.000 |
| Belanja (36 transaksi tercatat) | 11.180.000 |
| Sisa bulan ini | 7.320.000 |
| Rencana belanja (8 kategori) | 13.900.000 |
| Target tabungan | 4.600.000 |

## Cara menjalankan

Situs statis tanpa build step dan tanpa permintaan jaringan sama sekali:

```sh
node --experimental-strip-types serve.mjs   # atau server statis apa pun
```

Lalu buka `http://localhost:8080`. Semua data tersimpan di peramban
(`localStorage`); tautan "Atur ulang data" di kaki halaman mengembalikan
data awal.

## Struktur

- `app/` — situs: `index.html`, `style.css`, `data.js` (data & hitung),
  `state.js` (perubahan pengguna), `charts.js` (grafik canvas),
  `views.js` (enam halaman), `router.js` (rute hash & pemilih bulan),
  `main.js` (titik masuk).
- `main.ts` — menyalin `app/` + `screenshots/` ke keluaran dan menulis
  `dossier.json` (Node 22+, pustaka standar saja).
- `screenshots/` — 4 tangkapan layar situs ini (desktop + ponsel).

## Lisensi

MIT — lihat `LICENSE`.
