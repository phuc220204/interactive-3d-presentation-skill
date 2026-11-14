#!/usr/bin/env node
/**
 * QA bằng trình duyệt thật (Chrome/Edge có sẵn trên máy, headless, có WebGL):
 *   • chụp mọi slide ở NHỊP CUỐI (mọi thứ đã hiện) → qa/<theme?>/<size>/NN-id.png
 *   • báo tràn chữ (data-fit), CHỮ ĐÈ CHỮ (thuật toán lõi chữ, port từ chup-slide.js), lỗi console, asset hỏng
 *   • --offline: chặn mọi request không phải localhost → kiểm tra deck trình chiếu được khi mất mạng
 *
 *   npm run dev                          (cửa sổ khác)
 *   npm run qa
 *   npm run qa -- --sizes 1920x1080,1366x768 --only 3,5 --wait 2600 --theme whiteboard,sketchbook --offline
 *   npm run qa -- --url http://localhost:5174
 * Exit 1 nếu có tràn, đè chữ hoặc lỗi.   CHROME_PATH=… để chỉ định trình duyệt.
 */
import { appendFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const argv = process.argv.slice(2);
const opt = (k, d) => {
  const i = argv.indexOf(`--${k}`);
  return i >= 0 ? (argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : 'true') : d;
};
async function findServer() {
  for (let port = 5173; port <= 5185; port++) {
    try {
      const r = await fetch(`http://localhost:${port}/`, { signal: AbortSignal.timeout(1500) });
      if (r.ok && /id="root"/.test(await r.text())) return `http://localhost:${port}`;
    } catch {
      /* not this port */
    }
  }
  console.error('Không thấy dev server ở cổng 5173–5185. Chạy "npm run dev" trước, hoặc truyền --url http://localhost:<cổng>.');
  process.exit(2);
}
const url = opt('url') ?? (await findServer());
const sizes = opt('sizes', '1920x1080').split(',').map((s) => s.split('x').map(Number));
const only = opt('only') ? new Set(opt('only').split(',').map((n) => Number(n) - 1)) : null;
const wait = Number(opt('wait', 2600));
const out = opt('out', 'qa');
const themes = opt('theme') ? opt('theme').split(',') : [null];
const offline = argv.includes('--offline');

const exe = [
  process.env.CHROME_PATH,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
].filter(Boolean).find((p) => existsSync(p));
if (!exe) {
  console.error('Không tìm thấy Chrome/Edge. Đặt CHROME_PATH.');
  process.exit(2);
}
let puppeteer;
try {
  puppeteer = (await import('puppeteer-core')).default;
} catch {
  console.error('Thiếu puppeteer-core: npm i -D puppeteer-core');
  process.exit(2);
}

/** Runs in the page: text runs whose glyph cores overlap (ignores decorative aria-hidden text, same heading, notes). */
function findOverlaps() {
  const S = document.querySelector('[data-slide]');
  if (!S) return [];
  const vis = (e) => {
    const cs = getComputedStyle(e);
    return e.getClientRects().length && cs.visibility !== 'hidden' && +cs.opacity > 0.05;
  };
  const els = [...S.querySelectorAll('*')].filter(
    (e) => [...e.childNodes].some((c) => c.nodeType === 3 && c.textContent.trim()) && vis(e) && !e.closest('[aria-hidden="true"], .katex-mathml, svg'),
  );
  const R = els.map((e) => {
    const g = document.createRange();
    g.selectNodeContents(e);
    return [e, [...g.getClientRects()]];
  });
  // browser line boxes are taller than glyphs (room for Vietnamese marks): compare the middle 56%
  const core = (r) => {
    const k = r.height * 0.22;
    return { left: r.left, right: r.right, top: r.top + k, bottom: r.bottom - k };
  };
  const out = [];
  for (let a = 0; a < R.length; a++)
    for (let c = a + 1; c < R.length; c++) {
      const A = R[a][0];
      const C = R[c][0];
      if (A.contains(C) || C.contains(A)) continue;
      const h = A.closest('h1,h2');
      if (h && h === C.closest('h1,h2')) continue;
      let hit = null;
      for (const x0 of R[a][1])
        for (const y0 of R[c][1]) {
          const x = core(x0);
          const y = core(y0);
          const w = Math.min(x.right, y.right) - Math.max(x.left, y.left);
          const hh = Math.min(x.bottom, y.bottom) - Math.max(x.top, y.top);
          if (w > 2 && hh > 2) hit = `${Math.round(w)}×${Math.round(hh)}px`;
        }
      if (hit) out.push(`"${A.textContent.trim().slice(0, 28)}" đè "${C.textContent.trim().slice(0, 28)}" (${hit})`);
    }
  return out;
}

const browser = await puppeteer.launch({
  executablePath: exe,
  headless: true,
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--hide-scrollbars', '--autoplay-policy=no-user-gesture-required'],
});
const report = { url, browser: exe, offline, sizes: [], ok: true };

for (const th of themes)
  for (const [w, h] of sizes) {
    const page = await browser.newPage();
    await page.setViewport({ width: w, height: h, deviceScaleFactor: 1 });
    const errors = [];
    const blocked = [];
    if (offline) {
      await page.setRequestInterception(true);
      page.on('request', (r) => {
        const u = r.url();
        if (/^(https?:\/\/(localhost|127\.0\.0\.1)|data:|blob:)/.test(u)) r.continue();
        else {
          blocked.push(u);
          r.abort();
        }
      });
    }
    page.on('console', (m) => {
      const t = m.text();
      if (m.type() === 'error' && !/synchronously unmount a root|Failed to load resource.*(favicon)/.test(t)) errors.push(t);
      if (m.type() === 'warning' && t.startsWith('[deck]')) errors.push(t);
    });
    page.on('pageerror', (e) => errors.push(String(e)));
    const u = new URL(url);
    if (th) u.searchParams.set('theme', th);
    await page.goto(u.toString(), { waitUntil: 'networkidle2', timeout: 60000 });
    await page.waitForFunction(() => window.__deck && document.fonts.status === 'loaded', { timeout: 30000 });
    const count = await page.evaluate(() => window.__deck.count);
    const qaWaits = await page.evaluate(() => window.__deck.qaWaits ?? []);
    const dir = th ? join(out, th, `${w}x${h}`) : join(out, `${w}x${h}`);
    mkdirSync(dir, { recursive: true });
    const slides = [];
    for (let i = 0; i < count; i++) {
      if (only && !only.has(i)) continue;
      await page.evaluate((n) => window.__deck.goEnd(n), i);
      await new Promise((r) => setTimeout(r, wait + (qaWaits[i] ?? 0)));
      const audit = await page.evaluate(() => window.__deck.audit());
      const overlaps = await page.evaluate(findOverlaps);
      const file = join(dir, `${String(i + 1).padStart(2, '0')}-${audit.id}.png`);
      await page.screenshot({ path: file });
      slides.push({ n: i + 1, ...audit, overlaps, file });
      if (audit.overflow.length || overlaps.length) report.ok = false;
      const flag = [audit.overflow.length ? 'TRÀN ' + audit.overflow.join(', ') : '', overlaps.length ? `ĐÈ CHỮ ×${overlaps.length}: ${overlaps[0]}` : ''].filter(Boolean).join(' · ');
      console.log(`${th ? th + '  ' : ''}${w}x${h}  ${String(i + 1).padStart(2, '0')} ${audit.id}  ${flag || 'ok'}`);
    }
    if (errors.length) report.ok = false;
    if (offline && blocked.length) {
      report.ok = false;
      errors.push(...[...new Set(blocked)].map((b) => `offline: request ra ngoài bị chặn ${b.slice(0, 100)}`));
    }
    report.sizes.push({ theme: th, size: `${w}x${h}`, slides, errors });
    if (errors.length) console.log('lỗi:\n  ' + [...new Set(errors)].join('\n  '));
    await page.close();
  }
await browser.close();
mkdirSync(out, { recursive: true });
writeFileSync(join(out, 'report.json'), JSON.stringify(report, null, 2));
// GitHub Actions: Markdown summary on the run page
if (process.env.GITHUB_STEP_SUMMARY) {
  const lines = [`## QA ảnh chụp — ${report.ok ? '✅ đạt' : '❌ có vấn đề'}`, ''];
  for (const sz of report.sizes) {
    const bad = sz.slides.filter((x) => x.overflow.length || x.overlaps.length);
    lines.push(`- ${sz.theme ?? 'theme mặc định'} ${sz.size}: ${sz.slides.length} slide, ${bad.length} slide lỗi, ${sz.errors.length} lỗi console`);
    for (const x of bad) lines.push(`  - ${x.n} ${x.id}: ${[...x.overflow.map((o) => 'tràn ' + o), ...x.overlaps].join('; ').slice(0, 200)}`);
    for (const e of [...new Set(sz.errors)].slice(0, 10)) lines.push(`  - lỗi: ${e.slice(0, 200)}`);
  }
  appendFileSync(process.env.GITHUB_STEP_SUMMARY, lines.join('\n') + '\n');
}
console.log(report.ok ? '\nQA đạt.' : '\nQA có vấn đề — xem qa/report.json');
process.exit(report.ok ? 0 : 1);
