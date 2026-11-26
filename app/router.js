// router.js — rute hash (#/dashboard, #/anggaran, …), pemilih bulan,
// dan pengiriman aksi pengguna (tombol hapus, lunas, simpan) ke state.js.

import { MONTHS, monthById } from './data.js';
import {
  addTx, deleteTx, setPlanned, setBillPaid, addContribution, resetAll,
} from './state.js';
import { VIEWS } from './views.js';

export const ROUTES = ['dashboard', 'anggaran', 'transaksi', 'tagihan', 'tabungan', 'laporan'];

let currentMonth = '2026-11';
let currentRoute = 'dashboard';
let txFilter = { cat: 'semua', q: '', kind: 'semua' };

export function getMonth() { return currentMonth; }
export function getRoute() { return currentRoute; }

function routeFromHash() {
  const h = location.hash.replace(/^#\/?/, '').split('?')[0];
  return ROUTES.includes(h) ? h : 'dashboard';
}

function renderMonthSelect() {
  const sel = document.getElementById('month-select');
  if (!sel) return;
  sel.innerHTML = MONTHS.map((m) => (
    `<option value="${m.id}" ${m.id === currentMonth ? 'selected' : ''}>${m.label}</option>`
  )).join('');
}

export function render() {
  currentRoute = routeFromHash();
  const view = VIEWS[currentRoute];
  const main = document.getElementById('view');
  document.querySelectorAll('nav a').forEach((a) => {
    a.classList.toggle('active', a.getAttribute('href') === `#/${currentRoute}`);
    if (a.getAttribute('href') === `#/${currentRoute}`) a.setAttribute('aria-current', 'page');
    else a.removeAttribute('aria-current');
  });
  document.title = `${view.title} — DompetKeluarga`;
  main.innerHTML = view.render(currentMonth, txFilter);
  if (view.draw) view.draw(currentMonth);
  bindForms(main);
  window.scrollTo(0, 0);
}

// Pasang pengendali formulir setelah tiap render.
function bindForms(main) {
  const quick = main.querySelector('#quick-add');
  if (quick) {
    quick.addEventListener('submit', (e) => {
      e.preventDefault();
      const f = new FormData(quick);
      const amount = Number(f.get('amount'));
      const desc = String(f.get('desc') || '').trim();
      if (!desc || !(amount > 0)) return;
      addTx(currentMonth, new Date().getDate(), String(f.get('cat')), desc, amount, 'out');
      render();
    });
  }
  const add = main.querySelector('#add-tx');
  if (add) {
    add.addEventListener('submit', (e) => {
      e.preventDefault();
      const f = new FormData(add);
      const amount = Number(f.get('amount'));
      const desc = String(f.get('desc') || '').trim();
      const day = Math.min(31, Math.max(1, Number(f.get('day')) || 1));
      if (!desc || !(amount > 0)) return;
      addTx(currentMonth, day, String(f.get('cat')), desc, amount, String(f.get('kind')));
      render();
    });
  }
  const filter = main.querySelector('#filter-tx');
  if (filter) {
    filter.addEventListener('submit', (e) => {
      e.preventDefault();
      const f = new FormData(filter);
      txFilter = {
        cat: String(f.get('cat') || 'semua'),
        kind: String(f.get('kind') || 'semua'),
        q: String(f.get('q') || ''),
      };
      render();
    });
  }
  main.querySelectorAll('form.inline-form[data-cat]').forEach((form) => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const f = new FormData(form);
      const amount = Number(f.get('amount'));
      if (amount >= 0) setPlanned(currentMonth, form.dataset.cat, amount);
      render();
    });
  });
  main.querySelectorAll('form.goal-form').forEach((form) => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const f = new FormData(form);
      const amount = Number(f.get('amount'));
      if (amount > 0) addContribution(form.dataset.goal, amount);
      render();
    });
  });
}

// Klik tombol aksi (delegasi di #view).
function onAction(e) {
  const btn = e.target.closest('[data-action]');
  if (!btn) return;
  const action = btn.dataset.action;
  if (action === 'del-tx') {
    if (window.confirm(`Hapus transaksi “${btn.dataset.desc}”?`)) {
      deleteTx(btn.dataset.id);
      render();
    }
  } else if (action === 'toggle-bill') {
    const paid = btn.textContent.includes('Tandai lunas');
    setBillPaid(currentMonth, btn.dataset.id, paid);
    render();
  } else if (action === 'reset-all') {
    if (window.confirm('Kembalikan semua data ke keadaan awal? Perubahan Anda akan hilang.')) {
      resetAll();
      txFilter = { cat: 'semua', q: '', kind: 'semua' };
      render();
    }
  }
}

export function initRouter() {
  renderMonthSelect();
  document.getElementById('month-select').addEventListener('change', (e) => {
    currentMonth = e.target.value;
    render();
  });
  document.getElementById('view').addEventListener('click', onAction);
  document.getElementById('reset-data').addEventListener('click', (e) => {
    e.preventDefault();
    if (window.confirm('Kembalikan semua data ke keadaan awal? Perubahan Anda akan hilang.')) {
      resetAll();
      txFilter = { cat: 'semua', q: '', kind: 'semua' };
      render();
    }
  });
  window.addEventListener('hashchange', render);
  render();
}
