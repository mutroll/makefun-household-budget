// main.js — titik masuk situs: jalankan router begitu DOM siap.
// Tidak ada permintaan jaringan di sini: semua modul adalah berkas lokal.

import { initRouter } from './router.js';

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initRouter);
} else {
  initRouter();
}
