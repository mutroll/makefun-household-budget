// charts.js — grafik canvas buatan sendiri (tanpa pustaka).
// Semua grafik digambar dari data rumah tangga dan diberi label Rp/bulan.

import { fmtShort } from './data.js';

// Siapkan canvas dengan ketajaman layar (devicePixelRatio) dan kembalikan ctx.
function setup(canvas) {
  const dpr = window.devicePixelRatio || 1;
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  if (!w || !h) return null;
  canvas.width = Math.round(w * dpr);
  canvas.height = Math.round(h * dpr);
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, w, h);
  return { ctx, w, h };
}

function text(ctx, s, x, y, opts = {}) {
  ctx.font = opts.font || '12px system-ui, sans-serif';
  ctx.fillStyle = opts.color || '#334155';
  ctx.textAlign = opts.align || 'left';
  ctx.textBaseline = opts.baseline || 'alphabetic';
  ctx.fillText(s, x, y);
}

// Donat: [{label, value, color}] — dengan total di tengah.
export function drawDonut(canvas, parts) {
  const s = setup(canvas);
  if (!s) return;
  const { ctx, w, h } = s;
  const total = parts.reduce((a, p) => a + p.value, 0);
  const cx = w / 2;
  const cy = h / 2;
  const r = Math.min(w, h) / 2 - 14;
  const inner = r * 0.62;
  let a = -Math.PI / 2;
  for (const p of parts) {
    if (p.value <= 0) continue;
    const sweep = (p.value / total) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r, a, a + sweep);
    ctx.closePath();
    ctx.fillStyle = p.color;
    ctx.fill();
    a += sweep;
  }
  ctx.globalCompositeOperation = 'destination-out';
  ctx.beginPath();
  ctx.arc(cx, cy, inner, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalCompositeOperation = 'source-over';
  text(ctx, 'Total belanja', cx, cy - 8, { align: 'center', font: '12px system-ui, sans-serif', color: '#64748b' });
  text(ctx, fmtShort(total), cx, cy + 12, { align: 'center', font: 'bold 16px system-ui, sans-serif', color: '#0f172a' });
}

// Batang horizontal: [{label, planned, actual, color}] — rencana vs realisasi.
export function drawBudgetBars(canvas, rows) {
  const s = setup(canvas);
  if (!s) return;
  const { ctx, w, h } = s;
  const labelW = 152;
  const rowH = 34;
  const max = Math.max(...rows.map((r) => Math.max(r.planned, r.actual)), 1);
  const barW = w - labelW - 168;
  rows.forEach((r, i) => {
    const y = 14 + i * rowH;
    text(ctx, r.label, 0, y + 12, { font: '11.5px system-ui, sans-serif', color: '#0f172a' });
    const pw = Math.max(2, (r.planned / max) * barW);
    const aw = Math.max(2, (r.actual / max) * barW);
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(labelW, y, pw, 9);
    ctx.fillStyle = r.actual > r.planned ? '#dc2626' : r.color;
    ctx.fillRect(labelW, y + 12, aw, 9);
    text(ctx, fmtShort(r.actual).replace('Rp ', '') + ' / ' + fmtShort(r.planned), labelW + barW + 8, y + 12, { font: '11px system-ui, sans-serif', color: '#475569' });
  });
  text(ctx, '■ rencana (abu)   ■ realisasi (warna)', labelW, h - 4, { font: '11px system-ui, sans-serif', color: '#64748b' });
}

// Garis: pemasukan vs belanja per bulan. labels = ['Jun', ...], series = [{name, color, values}]
export function drawLine(canvas, labels, series) {
  const s = setup(canvas);
  if (!s) return;
  const { ctx, w, h } = s;
  const padL = 58, padR = 12, padT = 26, padB = 26;
  const iw = w - padL - padR;
  const ih = h - padT - padB;
  const all = series.flatMap((sr) => sr.values);
  const max = Math.max(...all, 1) * 1.08;
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 1;
  for (let g = 0; g <= 4; g++) {
    const y = padT + (ih * g) / 4;
    ctx.beginPath();
    ctx.moveTo(padL, y);
    ctx.lineTo(w - padR, y);
    ctx.stroke();
    const val = max * (1 - g / 4);
    text(ctx, fmtShort(val), padL - 6, y + 4, { align: 'right', font: '11px system-ui, sans-serif', color: '#64748b' });
  }
  const xAt = (i) => padL + (iw * i) / (labels.length - 1);
  const yAt = (v) => padT + ih * (1 - v / max);
  series.forEach((sr) => {
    ctx.strokeStyle = sr.color;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    sr.values.forEach((v, i) => {
      if (i === 0) ctx.moveTo(xAt(i), yAt(v));
      else ctx.lineTo(xAt(i), yAt(v));
    });
    ctx.stroke();
    ctx.fillStyle = sr.color;
    sr.values.forEach((v, i) => {
      ctx.beginPath();
      ctx.arc(xAt(i), yAt(v), 3.5, 0, Math.PI * 2);
      ctx.fill();
    });
  });
  labels.forEach((lb, i) => {
    text(ctx, lb, xAt(i), h - 8, { align: 'center', font: '11px system-ui, sans-serif', color: '#475569' });
  });
  let lx = padL;
  series.forEach((sr) => {
    ctx.fillStyle = sr.color;
    ctx.fillRect(lx, 6, 12, 4);
    text(ctx, sr.name, lx + 16, 11, { font: '12px system-ui, sans-serif', color: '#334155' });
    lx += 16 + ctx.measureText(sr.name).width + 22;
  });
}

// Batang vertikal: [{label, value, color}] — mis. tabungan per bulan.
export function drawVbars(canvas, rows) {
  const s = setup(canvas);
  if (!s) return;
  const { ctx, w, h } = s;
  const padL = 52, padB = 24, padT = 22;
  const iw = w - padL - 8;
  const ih = h - padT - padB;
  const max = Math.max(...rows.map((r) => r.value), 1) * 1.1;
  ctx.strokeStyle = '#e2e8f0';
  for (let g = 0; g <= 3; g++) {
    const y = padT + (ih * g) / 3;
    ctx.beginPath();
    ctx.moveTo(padL, y);
    ctx.lineTo(w - 8, y);
    ctx.stroke();
    text(ctx, fmtShort(max * (1 - g / 3)), padL - 6, y + 4, { align: 'right', font: '11px system-ui, sans-serif', color: '#64748b' });
  }
  const slot = iw / rows.length;
  const bw = Math.min(44, slot * 0.6);
  rows.forEach((r, i) => {
    const bh = (r.value / max) * ih;
    const x = padL + slot * i + (slot - bw) / 2;
    const y = padT + ih - bh;
    ctx.fillStyle = r.color;
    ctx.fillRect(x, y, bw, bh);
    text(ctx, fmtShort(r.value), x + bw / 2, y - 6, { align: 'center', font: '11px system-ui, sans-serif', color: '#0f172a' });
    text(ctx, r.label, x + bw / 2, h - 8, { align: 'center', font: '11px system-ui, sans-serif', color: '#475569' });
  });
}
