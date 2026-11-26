// serve.mjs — server statis kecil untuk membuka app/ di peramban.
// Node 22+, pustaka standar saja. Bukan bagian dari entry yang diserahkan
// (main.ts hanya menyalin app/ dan screenshots/), hanya alat bantu lokal.

import { createServer } from 'node:http';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { join, extname, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), 'app');
const PORT = Number(process.argv[2] || process.env.PORT || 8080);

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
};

const server = createServer((req, res) => {
  const path = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  const file = join(ROOT, path === '/' ? 'index.html' : path);
  if (!file.startsWith(ROOT) || !existsSync(file) || !statSync(file).isFile()) {
    res.writeHead(404, { 'content-type': 'text/plain' });
    res.end('not found');
    return;
  }
  res.writeHead(200, { 'content-type': TYPES[extname(file)] || 'application/octet-stream' });
  res.end(readFileSync(file));
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`DompetKeluarga di http://127.0.0.1:${PORT}/`);
});
