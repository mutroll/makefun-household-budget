// main.ts — menyerahkan situs DompetKeluarga ke make.fun.
// Menyalin app/ dan screenshots/ dari repositori ini ke direktori keluaran
// (MAKEFUN_OUTPUT_DIR di luar grader, /output di dalam grader) lalu menulis
// /output/dossier.json dengan buildDossier dari vendor/makefun-frontend.ts.
// Node 22+, pustaka standar saja. Dijalankan dua kali harus menghasilkan
// byte yang sama persis.
//
// Catatan: direktori keluaran itu sendiri TIDAK PERNAH diubah modenya —
// di sandbox grader direktori itu milik pengguna lain. Hanya berkas dan
// subdirektori yang program ini buat yang dibuat terbaca semua pengguna.

import { cpSync, chmodSync, existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const REPO_ROOT = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = process.env.MAKEFUN_OUTPUT_DIR || '/output';

function makeReadable(dir: string): void {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) {
      makeReadable(p);
      try { chmodSync(p, 0o755); } catch { /* bukan milik kita: abaikan */ }
    } else if (st.isFile()) {
      try { chmodSync(p, 0o644); } catch { /* bukan milik kita: abaikan */ }
    }
  }
}

function main(): void {
  const appSrc = join(REPO_ROOT, 'app');
  const shotsSrc = join(REPO_ROOT, 'screenshots');
  if (!existsSync(appSrc)) throw new Error('app/ tidak ditemukan di ' + REPO_ROOT);
  if (!existsSync(shotsSrc)) throw new Error('screenshots/ tidak ditemukan di ' + REPO_ROOT);

  mkdirSync(OUT_DIR, { recursive: true });
  cpSync(appSrc, join(OUT_DIR, 'app'), { recursive: true });
  cpSync(shotsSrc, join(OUT_DIR, 'screenshots'), { recursive: true });

  const dossier = buildDossier(OUT_DIR, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 16777216,
    app_path_max_bytes: 1000,
  });
  writeFileSync(join(OUT_DIR, 'dossier.json'), dossier);

  // Buat semua yang kita tulis terbaca semua pengguna (grader membaca
  // keluaran sebagai pengguna lain). Direktori keluaran sendiri tidak
  // disentuh — hanya app/, screenshots/, dan isi keduanya.
  makeReadable(join(OUT_DIR, 'app'));
  makeReadable(join(OUT_DIR, 'screenshots'));
  try { chmodSync(join(OUT_DIR, 'app'), 0o755); } catch { /* abaikan */ }
  try { chmodSync(join(OUT_DIR, 'screenshots'), 0o755); } catch { /* abaikan */ }
  try { chmodSync(join(OUT_DIR, 'dossier.json'), 0o644); } catch { /* abaikan */ }
}

main();
