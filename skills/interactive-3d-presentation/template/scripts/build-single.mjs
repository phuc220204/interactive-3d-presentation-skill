#!/usr/bin/env node
/**
 * Một file HTML duy nhất, mở bằng double-click, không cần mạng, không cần server.   npm run build:single
 *   1. vite build --mode single  → dist-single/index.html (JS, CSS, font đã nhúng)
 *   2. nhúng mọi file trong public/ (ảnh, SVG, Lottie, model, ảnh đã assets:pull) thành data: URL vào
 *      window.__DECK_ASSETS__ — asset(url) tự dùng bản nhúng.
 * Cảnh báo: asset còn ở URL từ xa (chưa `npm run assets:pull`), YouTube (cần mạng), file > 20 MB.
 */
import { execSync } from 'node:child_process';
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { extname, join, relative } from 'node:path';
import { loadModules } from './load-content.mjs';

const MIME = {
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp',
  '.gif': 'image/gif', '.avif': 'image/avif', '.json': 'application/json', '.lottie': 'application/zip',
  '.glb': 'model/gltf-binary', '.gltf': 'model/gltf+json', '.bin': 'application/octet-stream',
  '.mp4': 'video/mp4', '.webm': 'video/webm', '.splinecode': 'application/octet-stream',
};

// remote assets still not local → they will need internet
const [{ slides }] = await loadModules('/src/content/index.ts');
const map = JSON.parse(readFileSync('public/assets/assets-map.json', 'utf8'));
const remote = new Set();
let youtube = 0;
const scan = (v) => {
  if (typeof v === 'string' && /^https?:\/\//.test(v) && /\.(png|jpe?g|webp|gif|avif|svg|json|lottie|glb|gltf|mp4|webm|splinecode)(\?|$)/i.test(v) && !map[v]) remote.add(v);
  else if (Array.isArray(v)) v.forEach(scan);
  else if (v && typeof v === 'object') Object.entries(v).forEach(([k, x]) => (k === 'youtube' ? youtube++ : scan(x)));
};
scan(slides);

console.log('▶ vite build --mode single');
execSync('npx vite build --mode single', { stdio: 'inherit' });

const files = [];
const walk = (d) => {
  for (const f of readdirSync(d)) {
    const p = join(d, f);
    if (statSync(p).isDirectory()) walk(p);
    else if (f !== 'assets-map.json' && MIME[extname(f).toLowerCase()]) files.push(p);
  }
};
walk('public');
const inlined = {};
for (const p of files) {
  const url = '/' + relative('public', p).split('\\').join('/');
  inlined[url] = `data:${MIME[extname(p).toLowerCase()]};base64,${readFileSync(p).toString('base64')}`;
}
const out = 'dist-single/index.html';
let html = readFileSync(out, 'utf8');
const tag = `<script>window.__DECK_ASSETS__=${JSON.stringify(inlined)}</script>`;
html = html.replace('<head>', '<head>' + tag);
writeFileSync(out, html);

const mb = Buffer.byteLength(html) / 1024 / 1024;
console.log(`\n✔ ${out} — ${mb.toFixed(1)} MB, ${files.length} asset nhúng`);
if (mb > 20) console.log('⚠ File > 20 MB: nén ảnh (≤ 2000 px, WebP/JPG), bỏ model/video nặng, hoặc dùng `npm run build` + deploy web.');
if (remote.size) console.log(`⚠ ${remote.size} asset còn ở URL từ xa (cần mạng) — chạy \`npm run assets:pull\` rồi build lại:\n  ` + [...remote].slice(0, 5).join('\n  '));
if (youtube) console.log(`⚠ ${youtube} video YouTube cần mạng khi trình chiếu — thay bằng file mp4 nếu không có mạng.`);
