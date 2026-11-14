#!/usr/bin/env node
/**
 * Probe every ThreeUI effect in src/threeui/catalog.ts on dark + light themes.
 *   npm run dev            (other terminal)
 *   npm run qa:threeui -- [--url http://localhost:5173] [--themes obsidian,whiteboard] [--only ParticleNetwork,TopoField]
 * → qa/threeui/<theme>/<Name>.png + console errors per effect. Use it before adding a new effect to the catalog.
 */
import { existsSync, mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const argv = process.argv.slice(2);
const opt = (k, d) => {
  const i = argv.indexOf(`--${k}`);
  return i >= 0 ? argv[i + 1] : d;
};
const url = opt('url', 'http://localhost:5173');
const themes = opt('themes', 'obsidian,whiteboard').split(',');
const src = readFileSync('src/threeui/catalog.ts', 'utf8');
let names = [...src.matchAll(/^\s{2}(\w+): \{\s*$/gm)].map((m) => m[1]);
if (opt('only')) names = opt('only').split(',');

const exe = [process.env.CHROME_PATH, 'C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/usr/bin/google-chrome', '/usr/bin/chromium'].filter(Boolean).find((p) => existsSync(p));
const puppeteer = (await import('puppeteer-core')).default;
const browser = await puppeteer.launch({ executablePath: exe, headless: true, args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
let bad = 0;
for (const th of themes) {
  const dir = join('qa', 'threeui', th);
  mkdirSync(dir, { recursive: true });
  for (const n of names) {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });
    const errs = [];
    page.on('pageerror', (e) => errs.push(String(e).slice(0, 160)));
    page.on('console', (m) => (m.type() === 'error' || m.text().startsWith('[deck]')) && errs.push(m.text().slice(0, 160)));
    await page.goto(`${url}/?threeui=${n}&theme=${th}`, { waitUntil: 'networkidle2', timeout: 60000 });
    await new Promise((r) => setTimeout(r, 2500));
    const canvases = await page.evaluate(() => document.querySelectorAll('canvas, iframe').length);
    await page.screenshot({ path: join(dir, `${n}.png`) });
    if (errs.length || !canvases) bad++;
    console.log(`${th.padEnd(11)} ${n.padEnd(30)} ${canvases ? 'render' : 'NO CANVAS'} ${errs.length ? '✖ ' + errs.join(' | ') : ''}`);
    await page.close();
  }
}
await browser.close();
process.exit(bad ? 1 : 0);
