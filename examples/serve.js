#!/usr/bin/env node
const http = require('http');
const fs   = require('fs');
const path = require('path');

const PORT = process.env.PORT || 8080;
const ROOT = path.join(__dirname, '..');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js':   'application/javascript',
  '.mjs':  'application/javascript',
  '.css':  'text/css',
  '.json': 'application/json',
  '.ts':   'text/plain; charset=utf-8',
  '.map':  'application/json',
  '.png':  'image/png',
  '.svg':  'image/svg+xml',
};

const server = http.createServer((req, res) => {
  const raw  = decodeURIComponent(req.url.split('?')[0]);
  let   full = path.join(ROOT, raw);

  if (!full.startsWith(ROOT)) {
    res.writeHead(403);
    return res.end('Forbidden');
  }

  if (fs.existsSync(full) && fs.statSync(full).isDirectory()) {
    full = path.join(full, 'index.html');
  }

  if (!fs.existsSync(full)) {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    return res.end(`404 – ${raw}`);
  }

  const ext  = path.extname(full).toLowerCase();
  const type = MIME[ext] || 'application/octet-stream';

  res.writeHead(200, { 'Content-Type': type });
  fs.createReadStream(full).pipe(res);
});

server.listen(PORT, () => {
  console.log(`DDA examples  →  http://localhost:${PORT}`);
});
