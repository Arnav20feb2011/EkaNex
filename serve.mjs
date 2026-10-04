// Minimal static file server for the built site in /dist, with SPA fallback.
// Used by the preview launcher (see .claude/launch.json).
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname } from 'node:path';

const DIST = new URL('./dist/', import.meta.url);
const PORT = Number(process.env.PORT) || 4178;

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.json': 'application/json',
  '.txt': 'text/plain; charset=utf-8',
  '.ico': 'image/x-icon',
  '.png': 'image/png',
  '.woff2': 'font/woff2',
};

const server = http.createServer(async (req, res) => {
  try {
    let pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    if (pathname.endsWith('/')) pathname += 'index.html';
    const rel = pathname.replace(/^\/+/, '').replace(/\.\.(\/|\\)/g, '');

    let target = new URL(rel, DIST);
    let data;
    try {
      data = await readFile(target);
    } catch {
      // SPA fallback — serve index.html for client-side routes.
      target = new URL('index.html', DIST);
      data = await readFile(target);
    }
    res.writeHead(200, {
      'content-type': TYPES[extname(target.pathname)] || 'application/octet-stream',
      'cache-control': 'no-cache',
    });
    res.end(data);
  } catch {
    res.writeHead(500, { 'content-type': 'text/plain' });
    res.end('Internal error');
  }
});

server.listen(PORT, () => {
  console.log(`EkaNex preview serving /dist on http://localhost:${PORT}`);
});
