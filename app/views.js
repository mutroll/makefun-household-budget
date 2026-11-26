// views.js — tampilan tiap halaman. Setiap halaman dirender dari data
// (data.js + state.js) sehingga semua angka selalu cocok dengan sumbernya.

import {
  CATEGORIES, MONTHS, PLANNED_TOTAL, SAVINGS_TARGET, HOUSEHOLD,
  fmt, fmtShort, pct, monthSummary, categoryActual, monthById,
} from './data.js';
import {
  monthTx, monthBills, goalsWithExtra, totalSaved, totalTarget, plannedFor,
} from './state.js';
import { drawDonut, drawBudgetBars, drawLine, drawVbars } from './charts.js';

function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

function catName(id) {
  if (id === 'in') return 'Pemasukan';
  const c = CATEGORIES.find((x) => x.id === id);
  return c ? c.name : id;
}

function catColor(id) {
  const c = CATEGORIES.find((x) => x.id === id);
  return c ? c.color : '#0f766e';
}

// ---------- Dashboard ----------
function dashboardHTML(monthId) {
  const list = monthTx(monthId);
  const s = monthSummary(list);
  const bills = monthBills(monthId);
  const unpaid = bills.filter((b) => !b.paid);
  const unpaidTotal = unpaid.reduce((a, b) => a + b.amount, 0);
  const byCat = CATEGORIES
    .map((c) => ({ ...c, actual: categoryActual(list, c.id) }))
    .sort((a, b) => b.actual - a.actual);
  const recent = [...list].sort((a, b) => b.day - a.day || (b.kind === 'in' ? -1 : 1)).slice(0, 5);
  const saved = totalSaved();
  const target = totalTarget();

  const tips = [];
  const over = byCat.filter((c) => c.actual > c.planned);
  if (over.length) {
    tips.push(`<b>${esc(over[0].name)}</b> sudah melewati anggaran ${fmt(over[0].planned)} — realisasi ${fmt(over[0].actual)}. Kurangi belanja kategori ini sampai akhir bulan.`);
  } else {
    tips.push('Semua kategori masih di bawah anggaran bulan ini. Pertahankan sampai akhir bulan.');
  }
  tips.push(`Sisa bulan ini ${fmt(s.remaining)} — sisihkan target tabungan ${fmt(SAVINGS_TARGET)} di awal bulan depan agar tidak terpakai.`);
  tips.push(`Kategori terbesar bulan ini: <b>${esc(byCat[0].name)}</b> (${fmt(byCat[0].actual)}). Cek halaman Anggaran untuk melihat rinciannya.`);

  return `
  <section class="hero">
    <div>
      <h1>Selamat datang, ${esc(HOUSEHOLD.name)}</h1>
      <p class="sub">Bulan ${esc(monthById(monthId).label)} — ${esc(HOUSEHOLD.members)}, ${esc(HOUSEHOLD.city)}. Semua angka di bawah dihitung dari transaksi yang tercatat.</p>
    </div>
    <p class="hero-note">Sisa bulan ini<br><strong>${fmt(s.remaining)}</strong><br>dari pemasukan ${fmt(s.income)}</p>
  </section>

  <section class="kpis" aria-label="Ringkasan bulan">
    <article class="kpi"><span>Pemasukan</span><strong>${fmt(s.income)}</strong><small>Gaji + usaha sampingan</small></article>
    <article class="kpi"><span>Belanja</span><strong>${fmt(s.spending)}</strong><small>${list.filter((t) => t.kind === 'out').length} transaksi tercatat</small></article>
    <article class="kpi"><span>Sisa</span><strong>${fmt(s.remaining)}</strong><small>Belum dialokasikan</small></article>
    <article class="kpi"><span>Tingkat tabungan</span><strong>${pct(s.rate)}</strong><small>Target ${fmt(SAVINGS_TARGET)} / bulan</small></article>
  </section>

  <div class="grid2">
    <section class="card">
      <h2>Belanja per kategori</h2>
      <canvas id="chart-donut" class="chart" height="220" aria-label="Diagram belanja per kategori"></canvas>
      <ul class="legend">
        ${byCat.map((c) => `<li><i style="background:${c.color}"></i><span>${esc(c.name)}</span><b>${fmt(c.actual)}</b><em>${pct(s.spending ? c.actual / s.spending : 0)}</em></li>`).join('')}
      </ul>
    </section>
    <section class="card">
      <h2>Tagihan yang belum dibayar</h2>
      ${unpaid.length ? `
      <ul class="bill-mini">
        ${unpaid.map((b) => `<li><span>${esc(b.name)} <small>jatuh tempo ${b.due} ${esc(monthById(monthId).label.split(' ')[0])}</small></span><b>${fmt(b.amount)}</b></li>`).join('')}
      </ul>
      <p class="total-row"><span>Total belum dibayar</span><b>${fmt(unpaidTotal)}</b></p>
      <p><a class="btn" href="#/tagihan">Lihat semua tagihan →</a></p>` : `
      <p class="ok">Semua tagihan bulan ini sudah lunas. 🎉</p>
      <p><a class="btn" href="#/tagihan">Lihat tagihan →</a></p>`}
      <h2 class="mt">Tabungan keluarga</h2>
      <p class="total-row"><span>Terkumpul semua tujuan</span><b>${fmt(saved)} dari ${fmt(target)}</b></p>
      <div class="bar"><i style="width:${Math.round((saved / target) * 100)}%;background:#0f766e"></i></div>
      <p><a class="btn" href="#/tabungan">Lihat tujuan tabungan →</a></p>
    </section>
  </div>

  <div class="grid2">
    <section class="card">
      <h2>Transaksi terakhir</h2>
      <ul class="tx-list">
        ${recent.map((t) => `<li><span>${t.day} ${esc(monthById(monthId).label.split(' ')[0])} — ${esc(t.desc)}</span><b class="${t.kind}">${t.kind === 'in' ? '+' : '−'}${fmt(t.amount)}</b></li>`).join('')}
      </ul>
      <p><a class="btn" href="#/transaksi">Semua transaksi →</a></p>
    </section>
    <section class="card">
      <h2>Catat pengeluaran cepat</h2>
      <form id="quick-add" class="form">
        <label>Keterangan <input name="desc" required maxlength="80" placeholder="cth. Belanja sayur"></label>
        <label>Kategori
          <select name="cat">${CATEGORIES.map((c) => `<option value="${c.id}">${esc(c.name)}</option>`).join('')}</select>
        </label>
        <label>Jumlah (Rp) <input name="amount" type="number" min="1000" step="500" required placeholder="50000"></label>
        <button class="btn primary" type="submit">Tambah pengeluaran</button>
      </form>
      <p class="hint">Transaksi tersimpan di peramban ini dan langsung mengubah total, grafik, dan sisa bulan.</p>
      <h2 class="mt">Tips bulan ini</h2>
      <ul class="tips">${tips.map((t) => `<li>${t}</li>`).join('')}</ul>
    </section>
  </div>`;
}

function dashboardDraw(monthId) {
  const list = monthTx(monthId);
  const parts = CATEGORIES.map((c) => ({
    label: c.name, value: categoryActual(list, c.id), color: c.color,
  })).filter((p) => p.value > 0);
  const cv = document.getElementById('chart-donut');
  if (cv) drawDonut(cv, parts);
}

// ---------- Anggaran ----------
function budgetHTML(monthId) {
  const list = monthTx(monthId);
  const s = monthSummary(list);
  const rows = CATEGORIES.map((c) => {
    const planned = plannedFor(monthId, c.id, c.planned);
    const actual = categoryActual(list, c.id);
    const remain = planned - actual;
    const used = planned > 0 ? Math.min(100, Math.round((actual / planned) * 100)) : 0;
    return { ...c, planned, actual, remain, used };
  });
  const plannedTotal = rows.reduce((a, r) => a + r.planned, 0);
  const actualTotal = rows.reduce((a, r) => a + r.actual, 0);

  return `
  <section class="page-head">
    <h1>Anggaran ${esc(monthById(monthId).label)}</h1>
    <p class="sub">Rencana belanja keluarga vs realisasi. Ubah angka rencana, lalu simpan — sisa anggaran langsung dihitung ulang.</p>
  </section>
  <section class="kpis">
    <article class="kpi"><span>Rencana belanja</span><strong>${fmt(plannedTotal)}</strong><small>8 amplop anggaran</small></article>
    <article class="kpi"><span>Realisasi</span><strong>${fmt(actualTotal)}</strong><small>Dari transaksi tercatat</small></article>
    <article class="kpi"><span>Sisa anggaran</span><strong>${fmt(plannedTotal - actualTotal)}</strong><small>${pct(plannedTotal ? (plannedTotal - actualTotal) / plannedTotal : 0)} dari rencana</small></article>
    <article class="kpi"><span>Target tabungan</span><strong>${fmt(SAVINGS_TARGET)}</strong><small>${s.remaining >= SAVINGS_TARGET ? 'Sisa bulan ini cukup ✓' : 'Sisa bulan ini belum cukup'}</small></article>
  </section>
  <section class="card">
    <h2>Rencana vs realisasi per kategori</h2>
    <canvas id="chart-budget" class="chart tall" height="300" aria-label="Grafik rencana vs realisasi"></canvas>
    <table class="tbl">
      <thead><tr><th>Kategori</th><th>Rencana (Rp)</th><th>Realisasi (Rp)</th><th>Sisa (Rp)</th><th>Terpakai</th><th>Ubah rencana</th></tr></thead>
      <tbody>
        ${rows.map((r) => `
        <tr class="${r.remain < 0 ? 'over' : ''}">
          <td><i class="dot" style="background:${r.color}"></i> ${esc(r.name)}</td>
          <td>${fmt(r.planned)}</td>
          <td>${fmt(r.actual)}</td>
          <td>${fmt(r.remain)}</td>
          <td><div class="bar slim"><i style="width:${r.used}%;background:${r.remain < 0 ? '#dc2626' : r.color}"></i></div> ${r.used}%</td>
          <td>
            <form class="inline-form" data-cat="${r.id}">
              <input type="number" name="amount" min="0" step="50000" value="${r.planned}" aria-label="Rencana ${esc(r.name)}">
              <button class="btn small" type="submit">Simpan</button>
            </form>
          </td>
        </tr>`).join('')}
      </tbody>
      <tfoot><tr><td><b>Total</b></td><td><b>${fmt(plannedTotal)}</b></td><td><b>${fmt(actualTotal)}</b></td><td><b>${fmt(plannedTotal - actualTotal)}</b></td><td></td><td></td></tr></tfoot>
    </table>
    <p class="hint">Total rencana + target tabungan = pemasukan bulanan (${fmt(plannedTotal)} + ${fmt(SAVINGS_TARGET)} = ${fmt(plannedTotal + SAVINGS_TARGET)}; pemasukan ${fmt(s.income)}).</p>
  </section>`;
}

function budgetDraw(monthId) {
  const list = monthTx(monthId);
  const rows = CATEGORIES.map((c) => ({
    label: c.name,
    planned: plannedFor(monthId, c.id, c.planned),
    actual: categoryActual(list, c.id),
    color: c.color,
  }));
  const cv = document.getElementById('chart-budget');
  if (cv) drawBudgetBars(cv, rows);
}

// ---------- Transaksi ----------
function transactionsHTML(monthId, filter = {}) {
  const list = monthTx(monthId);
  const { cat = 'semua', q = '', kind = 'semua' } = filter;
  const ql = q.trim().toLowerCase();
  let shown = [...list].sort((a, b) => b.day - a.day);
  if (cat !== 'semua') shown = shown.filter((t) => t.cat === cat);
  if (kind !== 'semua') shown = shown.filter((t) => t.kind === kind);
  if (ql) shown = shown.filter((t) => t.desc.toLowerCase().includes(ql));
  const totalIn = shown.filter((t) => t.kind === 'in').reduce((a, t) => a + t.amount, 0);
  const totalOut = shown.filter((t) => t.kind === 'out').reduce((a, t) => a + t.amount, 0);

  // Saldo berjalan: urut tanggal naik, pemasukan menambah, belanja mengurangi.
  const asc = [...shown].sort((a, b) => a.day - b.day);
  let bal = 0;
  const balById = new Map();
  for (const t of asc) {
    bal += t.kind === 'in' ? t.amount : -t.amount;
    balById.set(t.id, bal);
  }

  return `
  <section class="page-head">
    <h1>Transaksi ${esc(monthById(monthId).label)}</h1>
    <p class="sub">Semua uang masuk dan keluar bulan ini. Tambah, cari, saring, atau hapus — total dan saldo berjalan ikut berubah.</p>
  </section>
  <section class="card">
    <h2>Tambah transaksi</h2>
    <form id="add-tx" class="form grid-form">
      <label>Tanggal <input name="day" type="number" min="1" max="31" value="26" required></label>
      <label>Keterangan <input name="desc" required maxlength="80" placeholder="cth. Belanja sayur"></label>
      <label>Kategori
        <select name="cat">${CATEGORIES.map((c) => `<option value="${c.id}">${esc(c.name)}</option>`).join('')}</select>
      </label>
      <label>Jenis
        <select name="kind"><option value="out">Pengeluaran</option><option value="in">Pemasukan</option></select>
      </label>
      <label>Jumlah (Rp) <input name="amount" type="number" min="1000" step="500" required placeholder="50000"></label>
      <button class="btn primary" type="submit">Simpan transaksi</button>
    </form>
  </section>
  <section class="card">
    <h2>Daftar transaksi <span class="count">${shown.length} transaksi</span></h2>
    <form id="filter-tx" class="form filter-row">
      <label>Kategori
        <select name="cat">
          <option value="semua">Semua kategori</option>
          ${CATEGORIES.map((c) => `<option value="${c.id}" ${cat === c.id ? 'selected' : ''}>${esc(c.name)}</option>`).join('')}
        </select>
      </label>
      <label>Jenis
        <select name="kind">
          <option value="semua" ${kind === 'semua' ? 'selected' : ''}>Masuk &amp; keluar</option>
          <option value="in" ${kind === 'in' ? 'selected' : ''}>Pemasukan</option>
          <option value="out" ${kind === 'out' ? 'selected' : ''}>Pengeluaran</option>
        </select>
      </label>
      <label>Cari <input name="q" type="search" value="${esc(q)}" placeholder="cth. pasar, listrik"></label>
      <button class="btn" type="submit">Terapkan</button>
    </form>
    <div class="table-wrap">
    <table class="tbl">
      <thead><tr><th>Tgl</th><th>Keterangan</th><th>Kategori</th><th>Masuk (Rp)</th><th>Keluar (Rp)</th><th>Saldo berjalan (Rp)</th><th></th></tr></thead>
      <tbody>
        ${shown.length ? shown.map((t) => `
        <tr>
          <td>${t.day}</td>
          <td>${esc(t.desc)}</td>
          <td>${esc(catName(t.cat))}</td>
          <td>${t.kind === 'in' ? fmt(t.amount) : '—'}</td>
          <td>${t.kind === 'out' ? fmt(t.amount) : '—'}</td>
          <td>${fmt(balById.get(t.id))}</td>
          <td><button class="btn small danger" data-action="del-tx" data-id="${esc(t.id)}" data-desc="${esc(t.desc)}">Hapus</button></td>
        </tr>`).join('') : `<tr><td colspan="7">Tidak ada transaksi yang cocok dengan filter ini.</td></tr>`}
      </tbody>
      <tfoot><tr><td colspan="3"><b>Total yang tampil</b></td><td><b>${fmt(totalIn)}</b></td><td><b>${fmt(totalOut)}</b></td><td><b>${fmt(totalIn - totalOut)}</b></td><td></td></tr></tfoot>
    </table>
    </div>
    <p class="hint">Saldo berjalan dihitung dari transaksi yang tampil saja. Hapus transaksi yang salah catat; tombol “Atur ulang data” di kaki halaman mengembalikan data awal.</p>
  </section>`;
}

// ---------- Tagihan ----------
function billsHTML(monthId) {
  const bills = monthBills(monthId);
  const total = bills.reduce((a, b) => a + b.amount, 0);
  const paid = bills.filter((b) => b.paid).reduce((a, b) => a + b.amount, 0);
  const unpaid = total - paid;
  const monthShort = monthById(monthId).label.split(' ')[0];

  return `
  <section class="page-head">
    <h1>Tagihan &amp; Langganan ${esc(monthById(monthId).label)}</h1>
    <p class="sub">Semua tagihan rutin keluarga. Tandai lunas begitu dibayar — total yang belum dibayar langsung berkurang.</p>
  </section>
  <section class="kpis">
    <article class="kpi"><span>Total tagihan bulan ini</span><strong>${fmt(total)}</strong><small>${bills.length} tagihan rutin</small></article>
    <article class="kpi"><span>Sudah dibayar</span><strong>${fmt(paid)}</strong><small>${bills.filter((b) => b.paid).length} dari ${bills.length} tagihan</small></article>
    <article class="kpi"><span>Belum dibayar</span><strong>${fmt(unpaid)}</strong><small>${bills.filter((b) => !b.paid).length} tagihan menunggu</small></article>
    <article class="kpi"><span>Jatuh tempo terdekat</span><strong>${unpaid > 0 ? esc(bills.filter((b) => !b.paid).sort((a, b) => a.due - b.due)[0].name) : '—'}</strong><small>${unpaid > 0 ? 'Tgl ' + bills.filter((b) => !b.paid).sort((a, b) => a.due - b.due)[0].due + ' ' + monthShort : 'Semua lunas'}</small></article>
  </section>
  <section class="card">
    <h2>Daftar tagihan</h2>
    <table class="tbl">
      <thead><tr><th>Tagihan</th><th>Keterangan</th><th>Jatuh tempo</th><th>Jumlah (Rp)</th><th>Status</th><th></th></tr></thead>
      <tbody>
        ${bills.map((b) => `
        <tr class="${b.paid ? '' : 'due'}">
          <td><b>${esc(b.name)}</b></td>
          <td>${esc(b.note)}</td>
          <td>Tgl ${b.due} ${esc(monthShort)}</td>
          <td>${fmt(b.amount)}</td>
          <td>${b.paid ? '<span class="badge ok">Lunas ✓</span>' : '<span class="badge warn">Belum dibayar</span>'}</td>
          <td><button class="btn small" data-action="toggle-bill" data-id="${b.id}">${b.paid ? 'Batalkan lunas' : 'Tandai lunas'}</button></td>
        </tr>`).join('')}
      </tbody>
      <tfoot><tr><td colspan="3"><b>Total</b></td><td><b>${fmt(total)}</b></td><td colspan="2"><b>${fmt(paid)} lunas · ${fmt(unpaid)} belum</b></td></tr></tfoot>
    </table>
    <p class="hint">Tagihan yang lunas sudah tercatat sebagai transaksi di halaman Transaksi dengan jumlah yang sama. Iuran RT dan dana sosial bulan ini jatuh tempo tanggal 28 dan 30 — belum dibayar.</p>
  </section>`;
}

// ---------- Tabungan ----------
function goalsHTML(monthId) {
  const goals = goalsWithExtra();
  const saved = totalSaved();
  const target = totalTarget();
  return `
  <section class="page-head">
    <h1>Tabungan &amp; Tujuan</h1>
    <p class="sub">Setiap rupiah yang disisihkan punya tujuan. Tambah setoran ke tujuan mana pun — progresnya langsung naik.</p>
  </section>
  <section class="kpis">
    <article class="kpi"><span>Total terkumpul</span><strong>${fmt(saved)}</strong><small>Semua tujuan tabungan</small></article>
    <article class="kpi"><span>Total target</span><strong>${fmt(target)}</strong><small>4 tujuan keluarga</small></article>
    <article class="kpi"><span>Progres keseluruhan</span><strong>${pct(target ? saved / target : 0)}</strong><small>${fmt(target - saved)} lagi menuju semua target</small></article>
    <article class="kpi"><span>Setoran otomatis</span><strong>${fmt(SAVINGS_TARGET)} / bln</strong><small>Dipotong di awal bulan</small></article>
  </section>
  <div class="grid2">
    ${goals.map((g) => {
      const p = g.target > 0 ? Math.min(100, Math.round((g.saved / g.target) * 100)) : 0;
      return `
    <section class="card goal">
      <h2>${esc(g.name)}</h2>
      <p class="sub">${esc(g.note)}</p>
      <p class="total-row"><span>Terkumpul</span><b>${fmt(g.saved)} dari ${fmt(g.target)}</b></p>
      <div class="bar big"><i style="width:${p}%;background:#0f766e"></i></div>
      <p class="total-row"><span>Progres</span><b>${p}% · kurang ${fmt(g.target - g.saved)}</b></p>
      <form class="inline-form goal-form" data-goal="${g.id}">
        <label>Tambah setoran (Rp) <input type="number" name="amount" min="10000" step="10000" required placeholder="100000"></label>
        <button class="btn primary small" type="submit">Setor</button>
      </form>
    </section>`;
    }).join('')}
  </div>
  <section class="card">
    <h2>Kenapa menabung di awal bulan?</h2>
    <p>Keluarga Rahma menyisihkan ${fmt(SAVINGS_TARGET)} begitu gaji masuk — sebelum belanja. Dana darurat sudah ${fmt(goals[0].saved)} dari ${fmt(goals[0].target)}; begitu penuh, setoran dialihkan ke DP rumah. Sisa ${esc(monthById(monthId).label)} (${fmt(monthSummary(monthTx(monthId)).remaining)}) masih di atas target, jadi semua tujuan tetap berjalan.</p>
  </section>`;
}

// ---------- Laporan ----------
function reportHTML(monthId) {
  const rows = MONTHS.map((m) => {
    const list = monthTx(m.id);
    const s = monthSummary(list);
    return { ...m, ...s };
  });
  const totalIn = rows.reduce((a, r) => a + r.income, 0);
  const totalOut = rows.reduce((a, r) => a + r.spending, 0);
  const avgSpend = Math.round(totalOut / rows.length);
  const list = monthTx(monthId);
  const byCat = CATEGORIES.map((c) => ({
    label: c.name, value: categoryActual(list, c.id), color: c.color,
  })).filter((p) => p.value > 0);
  const labels = MONTHS.map((m) => m.label.split(' ')[0].slice(0, 3));

  return `
  <section class="page-head">
    <h1>Laporan ${esc(monthById(monthId).label)}</h1>
    <p class="sub">Tren enam bulan terakhir: pemasukan stabil ${fmt(18500000)} per bulan, belanja rata-rata ${fmt(avgSpend)} per bulan.</p>
  </section>
  <section class="kpis">
    <article class="kpi"><span>Total pemasukan 6 bln</span><strong>${fmt(totalIn)}</strong><small>${fmt(18500000)} × 6 bulan</small></article>
    <article class="kpi"><span>Total belanja 6 bln</span><strong>${fmt(totalOut)}</strong><small>Rata-rata ${fmt(avgSpend)} / bulan</small></article>
    <article class="kpi"><span>Total tersisa 6 bln</span><strong>${fmt(totalIn - totalOut)}</strong><small>Masuk ke tabungan keluarga</small></article>
    <article class="kpi"><span>Bulan paling hemat</span><strong>${esc(rows.reduce((a, r) => (r.spending < a.spending ? r : a)).label)}</strong><small>Belanja ${fmt(Math.min(...rows.map((r) => r.spending)))}</small></article>
  </section>
  <div class="grid2">
    <section class="card">
      <h2>Pemasukan vs belanja (Jun–Nov 2026)</h2>
      <canvas id="chart-line" class="chart" height="240" aria-label="Grafik pemasukan vs belanja enam bulan"></canvas>
      <p class="hint">Pemasukan stabil; belanja bergerak antara ${fmt(Math.min(...rows.map((r) => r.spending)))} dan ${fmt(Math.max(...rows.map((r) => r.spending)))} per bulan.</p>
    </section>
    <section class="card">
      <h2>Sisa tiap bulan (masuk tabungan)</h2>
      <canvas id="chart-save" class="chart" height="240" aria-label="Grafik sisa tiap bulan"></canvas>
      <p class="hint">Sisa = pemasukan − belanja. November tertinggi sejauh ini: ${fmt(rows[5].remaining)}.</p>
    </section>
  </div>
  <div class="grid2">
    <section class="card">
      <h2>Belanja per kategori — ${esc(monthById(monthId).label)}</h2>
      <canvas id="chart-report-donut" class="chart" height="220" aria-label="Diagram belanja per kategori bulan ini"></canvas>
    </section>
    <section class="card">
      <h2>Riwayat bulanan</h2>
      <table class="tbl">
        <thead><tr><th>Bulan</th><th>Pemasukan (Rp)</th><th>Belanja (Rp)</th><th>Sisa (Rp)</th><th>Tabungan</th></tr></thead>
        <tbody>
          ${rows.map((r) => `<tr><td>${esc(r.label)}</td><td>${fmt(r.income)}</td><td>${fmt(r.spending)}</td><td>${fmt(r.remaining)}</td><td>${pct(r.rate)}</td></tr>`).join('')}
        </tbody>
        <tfoot><tr><td><b>Total 6 bulan</b></td><td><b>${fmt(totalIn)}</b></td><td><b>${fmt(totalOut)}</b></td><td><b>${fmt(totalIn - totalOut)}</b></td><td><b>${pct(totalIn ? (totalIn - totalOut) / totalIn : 0)}</b></td></tr></tfoot>
      </table>
    </section>
  </div>`;
}

function reportDraw(monthId) {
  const rows = MONTHS.map((m) => {
    const s = monthSummary(monthTx(m.id));
    return { ...m, ...s };
  });
  const labels = MONTHS.map((m) => m.label.split(' ')[0].slice(0, 3));
  const line = document.getElementById('chart-line');
  if (line) drawLine(line, labels, [
    { name: 'Pemasukan', color: '#0f766e', values: rows.map((r) => r.income) },
    { name: 'Belanja', color: '#dc2626', values: rows.map((r) => r.spending) },
  ]);
  const save = document.getElementById('chart-save');
  if (save) drawVbars(save, rows.map((r, i) => ({
    label: labels[i], value: r.remaining, color: '#0f766e',
  })));
  const donut = document.getElementById('chart-report-donut');
  if (donut) {
    const list = monthTx(monthId);
    drawDonut(donut, CATEGORIES.map((c) => ({
      label: c.name, value: categoryActual(list, c.id), color: c.color,
    })).filter((p) => p.value > 0));
  }
}

export const VIEWS = {
  dashboard: { title: 'Dashboard', render: dashboardHTML, draw: dashboardDraw },
  anggaran: { title: 'Anggaran', render: budgetHTML, draw: budgetDraw },
  transaksi: { title: 'Transaksi', render: (m, f) => transactionsHTML(m, f), draw: null },
  tagihan: { title: 'Tagihan & Langganan', render: billsHTML, draw: null },
  tabungan: { title: 'Tabungan & Tujuan', render: goalsHTML, draw: null },
  laporan: { title: 'Laporan', render: reportHTML, draw: reportDraw },
};
