// Tiny static server so the iPad can load the app over home Wi-Fi: node serve.js [port]
// Listens on every network interface; open http://<this-PC's-IP>:<port>/ in Safari on the iPad,
// or open http://localhost:<port>/qr.html on this PC and scan the QR code with a phone or tablet.
const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

const root = __dirname;
const port = Number(process.argv[2]) || 8780;
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.png': 'image/png', '.svg': 'image/svg+xml', '.md': 'text/plain; charset=utf-8'
};

// Home-network addresses for this PC, Wi-Fi / Ethernet first (virtual adapters like WSL or Hyper-V last).
function lanUrls() {
  const out = [];
  for (const [name, list] of Object.entries(os.networkInterfaces())) {
    for (const a of list || []) {
      if (a.family !== 'IPv4' && a.family !== 4) continue;
      if (a.internal) continue;
      const virtual = /vEthernet|WSL|Hyper-V|VirtualBox|VMware|Docker|Loopback/i.test(name);
      const home = /^(192\.168\.|10\.|172\.(1[6-9]|2\d|3[01])\.)/.test(a.address);
      out.push({ url: `http://${a.address}:${port}/`, name, rank: (virtual ? 2 : 0) + (home ? 0 : 1) });
    }
  }
  return out.sort((x, y) => x.rank - y.rank).map(({ url, name }) => ({ url, name }));
}

http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (p === '/lan.json') {
    res.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
    return res.end(JSON.stringify(lanUrls()));
  }
  // the whole game as one downloadable file, built fresh from the current source
  if (p === '/princess-academy.html') {
    try {
      const html = require('./build-single.js')();
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store', 'Content-Disposition': 'attachment; filename="princess-academy.html"' });
      return res.end(html);
    } catch (e) { res.writeHead(500); return res.end('Build failed: ' + e.message); }
  }
  if (p.endsWith('/')) p += 'index.html';
  const file = path.normalize(path.join(root, p));
  if (!file.startsWith(root) || /[\\/]\./.test(file.slice(root.length))) { res.writeHead(403); return res.end(); }
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404); return res.end('Not found'); }
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
    res.end(data);
  });
}).listen(port, '0.0.0.0', () => {
  console.log(`Princess Academy on http://localhost:${port}/`);
  for (const u of lanUrls()) console.log(`  iPad/phone: ${u.url}  (${u.name})`);
  console.log(`  QR code to scan: http://localhost:${port}/qr.html`);
});
