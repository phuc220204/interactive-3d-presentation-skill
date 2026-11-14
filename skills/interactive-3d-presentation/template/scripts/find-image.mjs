#!/usr/bin/env node
/**
 * Find openly-licensed photos on Wikimedia Commons and print ready-to-paste entries
 * (backdrop `image` + `sources.ts` APA record with license).
 *
 *   npm run find-image -- "Hanoi street vendor"            [--limit 6] [--width 1920]
 *   npm run find-image -- "lantern" --png                  (PNG only — look for transparent cut-outs for `parallax`)
 *
 * Only Wikimedia Commons is queried (no API key). For Unsplash/Pexels, search on their site and
 * credit manually: "Photographer. (Year). Title [Ảnh]. Unsplash. URL" + license "Unsplash License".
 */
const argv = process.argv.slice(2);
const q = argv.filter((a, i) => !a.startsWith('--') && !argv[i - 1]?.startsWith('--')).join(' ');
const opt = (k, d) => {
  const i = argv.indexOf(`--${k}`);
  return i >= 0 ? argv[i + 1] : d;
};
if (!q) {
  console.error('usage: npm run find-image -- "<keywords>" [--limit 6] [--width 1920]');
  process.exit(1);
}
const limit = Number(opt('limit', 6));
const width = Number(opt('width', 1920));
const url =
  'https://commons.wikimedia.org/w/api.php?' +
  new URLSearchParams({
    action: 'query',
    generator: 'search',
    gsrsearch: `${q} ${argv.includes('--png') ? 'filetype:png' : 'filetype:bitmap'}`,
    gsrnamespace: '6',
    gsrlimit: String(limit),
    prop: 'imageinfo',
    iiprop: 'url|extmetadata|size',
    iiurlwidth: String(width),
    format: 'json',
    origin: '*',
  });

const res = await fetch(url, { headers: { 'User-Agent': 'deck-3d-template/1.0 (image search helper)' } });
const body = await res.text();
let j;
try {
  j = JSON.parse(body);
} catch {
  console.error('Wikimedia API refused the request (rate limit?). Wait a minute and retry. ' + body.slice(0, 120));
  process.exit(1);
}
const pages = Object.values(j.query?.pages ?? {});
if (!pages.length) {
  console.log('No results.');
  process.exit(0);
}
const strip = (s = '') => s.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
for (const p of pages) {
  const ii = p.imageinfo?.[0];
  if (!ii) continue;
  const m = ii.extmetadata ?? {};
  const title = p.title.replace(/^File:/, '').replace(/\.[a-z]+$/i, '');
  let author = strip(m.Artist?.value);
  author = (author || '').replace(/\(more photos\)/gi, '').replace(/\.+$/, '').trim();
  if (!author || /unknown author/i.test(author)) author = 'Unknown author';
  const family = author === 'Unknown author' ? 'Wikimedia Commons' : author.split(/[,;(]/)[0].trim().split(' ').slice(-1)[0];
  const year = (strip(m.DateTimeOriginal?.value).match(/\d{4}/) || strip(m.DateTime?.value).match(/\d{4}/) || ['n.d.'])[0];
  const license = strip(m.LicenseShortName?.value) || 'see page';
  const src = (ii.thumburl || ii.url).split('?')[0];
  const page = ii.descriptionurl;
  const id = 'img-' + title.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').slice(0, 32).replace(/-$/, '');
  console.log(`\n— ${title}  (${ii.width}×${ii.height}, ${license})`);
  console.log(`  slide.image: { src: '${src}', alt: '<mô tả tiếng Việt>', sourceId: '${id}', treatment: 'duotone' }`);
  console.log(`  sources.ts : { id: '${id}', kind: 'image', license: '${license}', short: '${family} (${year})',`);
  console.log(`                 apa: '${author}. (${year}). ${title} [Ảnh]. Wikimedia Commons. ${page}' },`);
}
