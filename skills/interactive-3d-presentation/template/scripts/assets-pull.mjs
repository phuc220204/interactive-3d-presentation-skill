#!/usr/bin/env node
/**
 * Tải mọi asset từ xa (ảnh, model .glb/.gltf + texture, lottie, spline, poster video) về máy để trình chiếu
 * KHÔNG CẦN MẠNG.   npm run assets:pull   [--force]
 * → public/assets/remote/<tên>  +  public/assets/assets-map.json  { "url gốc": "/assets/remote/<tên>" }
 * Mọi component tải media qua asset(url) nên deck tự dùng bản local. YouTube không tải được (cần mạng) — dùng
 * video file thay thế nếu phải trình chiếu offline.
 */
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { loadModules } from './load-content.mjs';

const force = process.argv.includes('--force');
const [{ slides, sources }] = await loadModules('/src/content/index.ts');

const urls = new Set();
const add = (u) => u && /^https?:\/\//.test(u) && urls.add(u);
for (const s of slides) {
  add(s.image?.src);
  for (const b of s.blocks ?? []) {
    if (b.type === 'image') add(b.src);
    if (b.type === 'gallery') b.items.forEach((i) => add(i.src));
    if (b.type === 'video') (add(b.src), add(b.poster));
    if (b.type === 'diagram' || b.type === 'lottie') add(b.src);
  }
  const st = s.scene?.state ?? {};
  if (s.scene?.name === 'gallery') st.items?.forEach((i) => add(i.src));
  if (s.scene?.name === 'parallax') st.layers?.forEach((l) => add(l.src));
  if (s.scene?.name === 'cards') st.cards?.forEach((c) => add(c.src));
  if (s.scene?.name === 'model') add(st.src);
  if (s.scene?.name === 'spline') add(s.scene.scene);
}
void sources;

const dir = 'public/assets/remote';
mkdirSync(dir, { recursive: true });
const mapPath = 'public/assets/assets-map.json';
const map = existsSync(mapPath) ? JSON.parse(readFileSync(mapPath, 'utf8')) : {};
const UA = { 'User-Agent': 'deck-3d-template/1.0 (offline asset pull)' };

const nameFor = (u) => {
  const clean = u.split('?')[0];
  const ext = (clean.match(/\.(\w{2,6})$/) || [, 'bin'])[1].toLowerCase();
  const base = decodeURIComponent(clean.split('/').pop() || 'asset').replace(/\.[^.]+$/, '').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^\w-]+/g, '-').slice(0, 40);
  return `${base}-${createHash('sha1').update(u).digest('hex').slice(0, 8)}.${ext}`;
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
/** Polite fetch: one request at a time, retries 429/5xx with back-off (Wikimedia rate-limits bursts). */
async function politeFetch(u) {
  for (let attempt = 0; attempt < 5; attempt++) {
    const r = await fetch(u, { headers: UA });
    if (r.ok) return r;
    if (r.status !== 429 && r.status < 500) throw new Error(`${r.status} ${u}`);
    const wait = Number(r.headers.get('retry-after')) * 1000 || 2000 * 2 ** attempt;
    console.log(`  … ${r.status}, chờ ${Math.round(wait / 1000)} s rồi thử lại`);
    await sleep(wait);
  }
  throw new Error(`hết lượt thử ${u}`);
}

async function fetchTo(u, file) {
  const r = await politeFetch(u);
  const buf = Buffer.from(await r.arrayBuffer());
  writeFileSync(`${dir}/${file}`, buf);
  await sleep(700);
  return buf;
}

let ok = 0;
let fail = 0;
for (const u of urls) {
  if (map[u] && existsSync(`public${map[u]}`) && !force) {
    ok++;
    continue;
  }
  try {
    if (/\.gltf(\?|$)/i.test(u)) {
      // .gltf references external .bin / textures: pull them into a sub-folder, keep relative paths
      const sub = nameFor(u).replace(/\.gltf$/, '');
      mkdirSync(`${dir}/${sub}`, { recursive: true });
      const json = JSON.parse((await (await fetch(u, { headers: UA })).text()));
      const baseUrl = u.slice(0, u.lastIndexOf('/') + 1);
      for (const ref of [...(json.buffers ?? []), ...(json.images ?? [])]) {
        if (ref.uri && !ref.uri.startsWith('data:')) {
          const r = await fetch(baseUrl + ref.uri, { headers: UA });
          writeFileSync(`${dir}/${sub}/${decodeURIComponent(ref.uri).split('/').pop()}`, Buffer.from(await r.arrayBuffer()));
          ref.uri = decodeURIComponent(ref.uri).split('/').pop();
        }
      }
      writeFileSync(`${dir}/${sub}/scene.gltf`, JSON.stringify(json));
      map[u] = `/assets/remote/${sub}/scene.gltf`;
    } else {
      const file = nameFor(u);
      const buf = await fetchTo(u, file);
      map[u] = `/assets/remote/${file}`;
      console.log(`  ↓ ${(buf.length / 1024).toFixed(0).padStart(6)} KB  ${file}`);
    }
    ok++;
  } catch (e) {
    fail++;
    console.log(`  ✖ ${u}\n    ${e.message}`);
  }
}
writeFileSync(mapPath, JSON.stringify(map, null, 2) + '\n');
console.log(`✔ ${ok}/${urls.size} asset đã có bản local${fail ? ` · ${fail} lỗi` : ''} → ${mapPath}`);
process.exit(fail ? 1 : 0);
