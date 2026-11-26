// data.js — data rumah tangga Keluarga Rahma (Jakarta) dan fungsi hitung.
// Semua total dihitung dari daftar transaksi, jadi angka selalu cocok:
// pemasukan = jumlah item pemasukan, belanja = jumlah transaksi keluar,
// sisa = pemasukan - belanja, tabungan bulan = sisa - (bukan belanja).
// Semua angka dalam rupiah (IDR).

export const HOUSEHOLD = {
  name: 'Keluarga Rahma',
  members: 'Rahma & Budi + 2 anak',
  city: 'Jakarta Selatan',
  siteName: 'DompetKeluarga',
  tagline: 'Anggaran rumah tangga yang rapi, tanpa ribet.',
};

// Kategori belanja + anggaran bulanan yang direncanakan (sama tiap bulan).
// Total rencana belanja = Rp 13.900.000; target tabungan = Rp 4.600.000.
export const CATEGORIES = [
  { id: 'belanja',    name: 'Belanja Harian',      color: '#0f766e', planned: 4500000 },
  { id: 'makan',      name: 'Makan di Luar',       color: '#b45309', planned: 1200000 },
  { id: 'transport',  name: 'Transportasi',        color: '#1d4ed8', planned: 1500000 },
  { id: 'tagihan',    name: 'Tagihan & Utilitas',  color: '#7c3aed', planned: 2300000 },
  { id: 'pendidikan', name: 'Pendidikan Anak',     color: '#be185d', planned: 2000000 },
  { id: 'kesehatan',  name: 'Kesehatan',           color: '#15803d', planned: 800000 },
  { id: 'hiburan',    name: 'Hiburan & Langganan', color: '#a16207', planned: 900000 },
  { id: 'pakaian',    name: 'Pakaian & Lainnya',   color: '#475569', planned: 700000 },
];

export const PLANNED_TOTAL = CATEGORIES.reduce((s, c) => s + c.planned, 0); // 13.900.000
export const SAVINGS_TARGET = 4600000; // 18.500.000 - 13.900.000

// Tagihan rutin bulanan. Jumlah tagihan = Rp 3.879.000
// (lunas Rp 3.629.000 + belum dibayar Rp 250.000 pada November 2026).
export const BILLS = [
  { id: 'listrik',  name: 'Listrik PLN',        amount: 650000,  due: 5,  cat: 'tagihan', note: 'Token & tagihan bulanan' },
  { id: 'air',      name: 'Air PDAM',           amount: 180000,  due: 5,  cat: 'tagihan', note: 'Pemakaian air bersih' },
  { id: 'internet', name: 'Internet rumah',     amount: 350000,  due: 15, cat: 'tagihan', note: 'Wi-Fi 100 Mbps' },
  { id: 'bpjs',     name: 'BPJS Kesehatan',     amount: 300000,  due: 10, cat: 'tagihan', note: '4 anggota keluarga' },
  { id: 'spp',      name: 'SPP Sekolah',        amount: 1500000, due: 5,  cat: 'pendidikan', note: 'Sekolah anak pertama' },
  { id: 'streaming',name: 'Langganan streaming',amount: 149000,  due: 1,  cat: 'hiburan', note: 'Film & serial keluarga' },
  { id: 'gas',      name: 'Gas LPG',            amount: 300000,  due: 18, cat: 'tagihan', note: '2 tabung 12 kg' },
  { id: 'pulsa',    name: 'Pulsa & data',       amount: 200000,  due: 12, cat: 'tagihan', note: '2 nomor keluarga' },
  { id: 'rt',       name: 'Iuran RT',           amount: 100000,  due: 28, cat: 'tagihan', note: 'Keamanan & kebersihan' },
  { id: 'sosial',   name: 'Dana sosial',        amount: 150000,  due: 30, cat: 'tagihan', note: 'Arisan warga & sumbangan' },
];

// Tagihan yang BELUM dibayar pada bulan berjalan (November 2026).
// Bulan-bulan sebelumnya semuanya lunas.
export const UNPAID_DEFAULT = { '2026-11': ['rt', 'sosial'] };

// Tujuan tabungan. Total terkumpul Rp 75.750.000 dari target Rp 167.000.000.
export const GOALS = [
  { id: 'darurat',   name: 'Dana Darurat',     target: 30000000,  saved: 18750000, note: 'Target 6x pengeluaran pokok' },
  { id: 'liburan',   name: 'Liburan Keluarga', target: 12000000,  saved: 5400000,  note: 'Yogyakarta, libur sekolah' },
  { id: 'rumah',     name: 'DP Rumah',         target: 100000000, saved: 42000000, note: 'Rumah pertama keluarga' },
  { id: 'sekolah',   name: 'Pendidikan Anak',  target: 25000000,  saved: 9600000,  note: 'Biaya masuk SMP 2028' },
];

// Transaksi: [tanggal, kategori, keterangan, jumlah]
// kind 'in' = pemasukan, 'out' = pengeluaran. Pemasukan tiap bulan sama:
// gaji Rahma 12.000.000 + gaji Budi 4.500.000 + usaha sampingan 2.000.000
// = Rp 18.500.000.
const INCOME = (m) => [
  [1, 'in', 'Gaji Rahma (kantor)', 12000000],
  [1, 'in', 'Gaji Budi (toko)', 4500000],
  [10, 'in', 'Usaha sampingan (kue)', 2000000],
];

export const MONTHS = [
  {
    id: '2026-06', label: 'Juni 2026',
    tx: [
      ...INCOME('2026-06'),
      [3, 'belanja', 'Belanja pasar mingguan', 1080000],
      [10, 'belanja', 'Belanja supermarket', 1240000],
      [17, 'belanja', 'Belanja pasar mingguan', 980000],
      [24, 'belanja', 'Belanja supermarket', 820000],
      [5, 'makan', 'Makan keluarga di luar', 480000],
      [19, 'makan', 'Restoran akhir pekan', 570000],
      [2, 'transport', 'Bensin & tol', 500000],
      [15, 'transport', 'Bensin & ojek online', 480000],
      [28, 'transport', 'Tol & parkir', 340000],
      [5, 'tagihan', 'Listrik, air & internet', 1150000],
      [12, 'tagihan', 'BPJS, pulsa & gas', 800000],
      [5, 'pendidikan', 'SPP sekolah', 1500000],
      [18, 'pendidikan', 'Buku & alat tulis', 250000],
      [9, 'kesehatan', 'Apotek & vitamin', 510000],
      [1, 'hiburan', 'Langganan streaming', 149000],
      [14, 'hiburan', 'Bioskop & langganan aplikasi', 571000],
      [21, 'pakaian', 'Pakaian anak', 430000],
    ],
  },
  {
    id: '2026-07', label: 'Juli 2026',
    tx: [
      ...INCOME('2026-07'),
      [2, 'belanja', 'Belanja pasar mingguan', 1150000],
      [9, 'belanja', 'Belanja supermarket', 1080000],
      [16, 'belanja', 'Belanja pasar mingguan', 1020000],
      [23, 'belanja', 'Belanja supermarket', 1050000],
      [6, 'makan', 'Makan keluarga di luar', 520000],
      [20, 'makan', 'Restoran akhir pekan', 660000],
      [3, 'transport', 'Bensin & tol', 520000],
      [14, 'transport', 'Bensin & ojek online', 490000],
      [25, 'transport', 'Tol & parkir', 400000],
      [5, 'tagihan', 'Listrik, air & internet', 1200000],
      [13, 'tagihan', 'BPJS, pulsa & gas', 850000],
      [5, 'pendidikan', 'SPP sekolah', 1500000],
      [17, 'pendidikan', 'Buku & alat tulis', 300000],
      [11, 'kesehatan', 'Periksa & obat', 620000],
      [1, 'hiburan', 'Langganan streaming', 149000],
      [13, 'hiburan', 'Bioskop & langganan aplikasi', 431000],
      [22, 'pakaian', 'Seragam & sepatu', 400000],
    ],
  },
  {
    id: '2026-08', label: 'Agustus 2026',
    tx: [
      ...INCOME('2026-08'),
      [3, 'belanja', 'Belanja pasar mingguan', 1020000],
      [10, 'belanja', 'Belanja supermarket', 1050000],
      [17, 'belanja', 'Belanja pasar mingguan', 990000],
      [24, 'belanja', 'Belanja supermarket', 990000],
      [7, 'makan', 'Makan keluarga di luar', 490000],
      [21, 'makan', 'Restoran akhir pekan', 600000],
      [4, 'transport', 'Bensin & tol', 500000],
      [15, 'transport', 'Bensin & ojek online', 480000],
      [27, 'transport', 'Tol & parkir', 380000],
      [5, 'tagihan', 'Listrik, air & internet', 1180000],
      [14, 'tagihan', 'BPJS, pulsa & gas', 810000],
      [5, 'pendidikan', 'SPP sekolah', 1500000],
      [19, 'pendidikan', 'Buku & alat tulis', 260000],
      [10, 'kesehatan', 'Apotek & vitamin', 380000],
      [1, 'hiburan', 'Langganan streaming', 149000],
      [12, 'hiburan', 'Bioskop & langganan aplikasi', 541000],
      [23, 'pakaian', 'Pakaian anak', 300000],
    ],
  },
  {
    id: '2026-09', label: 'September 2026',
    tx: [
      ...INCOME('2026-09'),
      [2, 'belanja', 'Belanja pasar mingguan', 1060000],
      [9, 'belanja', 'Belanja supermarket', 1090000],
      [16, 'belanja', 'Belanja pasar mingguan', 1030000],
      [23, 'belanja', 'Belanja supermarket', 1030000],
      [6, 'makan', 'Makan keluarga di luar', 510000],
      [20, 'makan', 'Restoran akhir pekan', 640000],
      [3, 'transport', 'Bensin & tol', 530000],
      [15, 'transport', 'Bensin & ojek online', 490000],
      [26, 'transport', 'Tol & parkir', 460000],
      [5, 'tagihan', 'Listrik, air & internet', 1190000],
      [13, 'tagihan', 'BPJS, pulsa & gas', 820000],
      [5, 'pendidikan', 'SPP sekolah', 1500000],
      [18, 'pendidikan', 'Buku & alat tulis', 290000],
      [11, 'kesehatan', 'Periksa & obat', 450000],
      [1, 'hiburan', 'Langganan streaming', 149000],
      [14, 'hiburan', 'Bioskop & langganan aplikasi', 461000],
      [22, 'pakaian', 'Seragam & sepatu', 310000],
    ],
  },
  {
    id: '2026-10', label: 'Oktober 2026',
    tx: [
      ...INCOME('2026-10'),
      [3, 'belanja', 'Belanja pasar mingguan', 1010000],
      [10, 'belanja', 'Belanja supermarket', 990000],
      [17, 'belanja', 'Belanja pasar mingguan', 1000000],
      [24, 'belanja', 'Belanja supermarket', 980000],
      [5, 'makan', 'Makan keluarga di luar', 470000],
      [19, 'makan', 'Restoran akhir pekan', 550000],
      [2, 'transport', 'Bensin & tol', 480000],
      [14, 'transport', 'Bensin & ojek online', 450000],
      [25, 'transport', 'Tol & parkir', 360000],
      [5, 'tagihan', 'Listrik, air & internet', 1210000],
      [13, 'tagihan', 'BPJS, pulsa & gas', 810000],
      [5, 'pendidikan', 'SPP sekolah', 1500000],
      [17, 'pendidikan', 'Buku & alat tulis', 300000],
      [10, 'kesehatan', 'Periksa & obat', 560000],
      [1, 'hiburan', 'Langganan streaming', 149000],
      [12, 'hiburan', 'Bioskop & langganan aplikasi', 601000],
      [21, 'pakaian', 'Pakaian anak', 520000],
    ],
  },
  {
    id: '2026-11', label: 'November 2026',
    tx: [
      ...INCOME('2026-11'),
      [2, 'belanja', 'Pasar tradisional', 420000],
      [4, 'belanja', 'Supermarket — mingguan', 685000],
      [8, 'belanja', 'Pasar tradisional', 380000],
      [11, 'belanja', 'Supermarket — mingguan', 720000],
      [15, 'belanja', 'Pasar tradisional', 410000],
      [18, 'belanja', 'Supermarket — mingguan', 655000],
      [22, 'belanja', 'Pasar tradisional', 395000],
      [25, 'belanja', 'Supermarket — belanja kecil', 185000],
      [3, 'makan', 'Warteg keluarga', 85000],
      [7, 'makan', 'Restoran akhir pekan', 320000],
      [12, 'makan', 'Kopi & sarapan', 75000],
      [16, 'makan', 'Restoran keluarga', 285000],
      [21, 'makan', 'Warung makan', 95000],
      [24, 'makan', 'Kopi & camilan', 115000],
      [1, 'transport', 'Bensin', 250000],
      [6, 'transport', 'Tol & parkir', 120000],
      [9, 'transport', 'Bensin', 250000],
      [14, 'transport', 'Ojek online', 95000],
      [17, 'transport', 'Bensin', 250000],
      [20, 'transport', 'Tol & parkir', 115000],
      [24, 'transport', 'Ojek online', 100000],
      [5, 'tagihan', 'Listrik PLN', 650000],
      [5, 'tagihan', 'Air PDAM', 180000],
      [10, 'tagihan', 'BPJS Kesehatan', 300000],
      [12, 'tagihan', 'Pulsa & data', 200000],
      [15, 'tagihan', 'Internet rumah', 350000],
      [18, 'tagihan', 'Gas LPG', 300000],
      [5, 'pendidikan', 'SPP Sekolah', 1500000],
      [19, 'pendidikan', 'Buku & alat tulis', 250000],
      [8, 'kesehatan', 'Apotek', 180000],
      [16, 'kesehatan', 'Dokter gigi', 240000],
      [1, 'hiburan', 'Langganan streaming', 149000],
      [10, 'hiburan', 'Bioskop keluarga', 291000],
      [15, 'hiburan', 'Langganan aplikasi', 200000],
      [13, 'pakaian', 'Seragam & sepatu', 260000],
      [23, 'pakaian', 'Peralatan rumah', 125000],
    ],
  },
];

// --- Fungsi hitung: semua total berasal dari daftar transaksi ---

export function monthById(id) {
  return MONTHS.find((m) => m.id === id) || MONTHS[MONTHS.length - 1];
}

// Ubah baris mentah [tgl, kat, ket, jml] menjadi objek transaksi.
export function normalizeTx(month, raw) {
  return raw.map((r, i) => ({
    id: `${month.id}-${i}`,
    day: r[0],
    cat: r[1],
    desc: r[2],
    amount: r[3],
    kind: r[1] === 'in' ? 'in' : 'out',
  }));
}

export function sumTx(list, kind) {
  return list.filter((t) => t.kind === kind).reduce((s, t) => s + t.amount, 0);
}

export function incomeOf(list) { return sumTx(list, 'in'); }
export function spendingOf(list) { return sumTx(list, 'out'); }

// Belanja per kategori untuk satu bulan (dari transaksi).
export function categoryActual(list, catId) {
  return list.filter((t) => t.kind === 'out' && t.cat === catId)
    .reduce((s, t) => s + t.amount, 0);
}

// Ringkasan satu bulan: pemasukan, belanja, sisa, tingkat tabungan.
export function monthSummary(list) {
  const income = incomeOf(list);
  const spending = spendingOf(list);
  const remaining = income - spending;
  const rate = income > 0 ? remaining / income : 0;
  return { income, spending, remaining, rate };
}

// Format rupiah: 18500000 -> "Rp 18.500.000"
export function fmt(n) {
  return 'Rp ' + Number(n).toLocaleString('id-ID');
}

// Format singkat untuk label grafik: 18500000 -> "Rp 18,5 jt"
export function fmtShort(n) {
  if (n >= 1000000) {
    const v = n / 1000000;
    return 'Rp ' + (Number.isInteger(v) ? v : v.toFixed(1).replace('.', ',')) + ' jt';
  }
  if (n >= 1000) return 'Rp ' + Math.round(n / 1000) + ' rb';
  return fmt(n);
}

export function pct(n) {
  return (n * 100).toLocaleString('id-ID', { maximumFractionDigits: 1 }) + '%';
}

export function monthName(id) {
  const m = monthById(id);
  return m ? m.label : id;
}
