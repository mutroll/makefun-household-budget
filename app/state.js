// state.js — keadaan yang bisa diubah pengguna: transaksi tambahan,
// perubahan anggaran, status lunas tagihan, dan setoran tabungan.
// Disimpan di localStorage (penyimpanan situs sendiri, tanpa jaringan)
// dan digabung di atas data dasar dari data.js saat dibaca.

import { MONTHS, BILLS, GOALS, UNPAID_DEFAULT, monthById, normalizeTx } from './data.js';

const KEY = 'dompetkeluarga-v1';

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return fresh();
    const p = JSON.parse(raw);
    return {
      addedTx: Array.isArray(p.addedTx) ? p.addedTx : [],
      deletedTx: Array.isArray(p.deletedTx) ? p.deletedTx : [],
      budget: p.budget && typeof p.budget === 'object' ? p.budget : {},
      billPaid: p.billPaid && typeof p.billPaid === 'object' ? p.billPaid : {},
      goalExtra: p.goalExtra && typeof p.goalExtra === 'object' ? p.goalExtra : {},
    };
  } catch (e) {
    return fresh();
  }
}

function fresh() {
  return { addedTx: [], deletedTx: [], budget: {}, billPaid: {}, goalExtra: {} };
}

let state = load();

function save() {
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* abaikan */ }
}

// --- Transaksi bulan ini (data dasar + tambahan pengguna - yang dihapus) ---
export function monthTx(monthId) {
  const base = normalizeTx(monthById(monthId), monthById(monthId).tx);
  const added = state.addedTx.filter((t) => t.month === monthId);
  const removed = new Set(state.deletedTx);
  return [...base, ...added].filter((t) => !removed.has(t.id));
}

export function addTx(monthId, day, cat, desc, amount, kind) {
  const id = `user-${monthId}-${Date.now()}`;
  state.addedTx.push({ id, month: monthId, day, cat, desc, amount, kind });
  save();
  return id;
}

export function deleteTx(id) {
  state.deletedTx.push(id);
  save();
}

// --- Anggaran: rencana per kategori per bulan (default dari data.js) ---
export function plannedFor(monthId, catId, fallback) {
  const key = `${monthId}:${catId}`;
  return state.budget[key] !== undefined ? state.budget[key] : fallback;
}

export function setPlanned(monthId, catId, amount) {
  state.budget[`${monthId}:${catId}`] = amount;
  save();
}

// --- Tagihan: lunas / belum ---
export function billIsPaid(monthId, billId) {
  const key = `${monthId}:${billId}`;
  if (state.billPaid[key] !== undefined) return state.billPaid[key];
  const unpaid = UNPAID_DEFAULT[monthId] || [];
  return !unpaid.includes(billId);
}

export function setBillPaid(monthId, billId, paid) {
  state.billPaid[`${monthId}:${billId}`] = paid;
  save();
}

export function monthBills(monthId) {
  return BILLS.map((b) => ({ ...b, paid: billIsPaid(monthId, b.id) }));
}

// --- Tujuan tabungan: terkumpul = dasar + setoran pengguna ---
export function goalsWithExtra() {
  return GOALS.map((g) => ({
    ...g,
    saved: g.saved + (state.goalExtra[g.id] || 0),
  }));
}

export function addContribution(goalId, amount) {
  state.goalExtra[goalId] = (state.goalExtra[goalId] || 0) + amount;
  save();
}

export function totalSaved() {
  return goalsWithExtra().reduce((s, g) => s + g.saved, 0);
}

export function totalTarget() {
  return GOALS.reduce((s, g) => s + g.target, 0);
}

// Kembalikan semua perubahan pengguna ke data awal.
export function resetAll() {
  state = fresh();
  save();
}
