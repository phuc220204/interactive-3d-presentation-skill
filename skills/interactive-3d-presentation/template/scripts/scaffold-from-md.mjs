#!/usr/bin/env node
/**
 * Split a slide-content markdown file (and optionally a presenter script) into per-slide chunks,
 * detect structure, and emit a skeleton the agent maps into src/content/slides.ts. Works for any
 * topic and for Vietnamese or English sources.
 *
 *   npm run scaffold -- --content path/slides.md [--script path/script.md] [--write-notes]
 *
 * Output:
 *   content-skeleton.json → { lang, slides: [{ id, n, heading, detected, suggest, notes, raw }] }
 *   src/content/notes.ts  → only with --write-notes (verbatim script text per slide id)
 *
 * Slide boundaries (first that matches wins):
 *   1. headings "# Slide 3", "## SLIDE 03 —", "### Trang 3", "## Slide 3:"
 *   2. horizontal rules "---" between blocks
 *   3. every H2 ("## ")
 */
import { readFileSync, writeFileSync } from 'node:fs';

const argv = process.argv.slice(2);
const arg = (k) => {
  const i = argv.indexOf(`--${k}`);
  return i >= 0 ? (argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : true) : undefined;
};
const contentPath = arg('content');
const scriptPath = arg('script');
if (!contentPath) {
  console.error('usage: npm run scaffold -- --content <slides.md> [--script <script.md>] [--write-notes]');
  process.exit(1);
}

const SLIDE_RE = /^#{1,4}\s*(?:slide|trang)\s*0*(\d+)\b.*$/im;

function split(md) {
  const text = md.replace(/\r\n/g, '\n');
  if (SLIDE_RE.test(text)) {
    const re = new RegExp(SLIDE_RE.source, 'gim');
    const idx = [];
    let m;
    while ((m = re.exec(text))) idx.push({ at: m.index, n: Number(m[1]), heading: m[0].replace(/^#+\s*/, '').trim() });
    return idx.map((h, i) => ({ n: h.n, heading: h.heading, raw: text.slice(h.at, idx[i + 1]?.at ?? text.length).split('\n').slice(1).join('\n').trim() }));
  }
  const byRule = text.split(/\n-{3,}\n/).map((s) => s.trim()).filter(Boolean);
  if (byRule.length > 2) return byRule.map((raw, i) => ({ n: i + 1, heading: (raw.match(/^#+\s*(.+)$/m) || [])[1] ?? '', raw }));
  return text.split(/\n(?=##\s)/).map((raw, i) => ({ n: i + 1, heading: (raw.match(/^#+\s*(.+)$/m) || [])[1] ?? '', raw: raw.trim() }));
}

/* ---------------- labels (vi + en) ---------------- */
const L = {
  kicker: /^\s*[*_]*\s*(kicker|eyebrow|nhãn|tag|chuyên mục)\s*[*_]*\s*:?/i,
  title: /^\s*[*_]*\s*(tiêu đề|title|headline|tựa đề)\s*[*_]*\s*:?/i,
  subtitle: /^\s*[*_]*\s*(phụ đề|subtitle|sub-title)\s*[*_]*\s*:?/i,
  scope: /^\s*[*_>]*\s*(giới hạn|gioi han|phạm vi|scope|limitations?|caveat)\s*[*_]*\s*:?/i,
  source: /^\s*[*_>]*\s*(nguồn|nguon|source|sources|tham khảo|references?|citation)\s*[*_]*\s*:/i,
  figure: /(số nổi bật|số liệu nổi bật|key (figure|number|stat)|big number|highlight)/i,
  note: /^\s*[*_>]*\s*(lưu ý|ghi chú|kết luận|cảnh báo|note|tip|warning|conclusion|takeaway)\s*[*_]*\s*:/i,
  quote: /^\s*>\s*(?!\s*\[!)/,
};
const clean = (s) => s.replace(/^[\s:*_-]+/, '').replace(/[*_]+$/, '').trim();

/* ---------------- domain keyword packs (vi + en) — hints only ---------------- */
const PACKS = {
  travel: /du lịch|điểm đến|hành trình|lịch trình|khách sạn|tour|chuyến đi|phố cổ|di sản|travel|trip|itinerary|destination|tourism|hotel|heritage/i,
  geography: /địa lí|địa lý|khí hậu|địa hình|dân số|châu lục|sông|núi|biển|vùng|bản đồ|geograph|climate|terrain|population|continent|river|mountain|region|map/i,
  history: /lịch sử|triều đại|chiến tranh|cách mạng|thế kỷ|năm \d{3,4}|di tích|cổ vật|history|dynasty|war|revolution|century|empire|ancient|artifact|archaeolog/i,
  literature: /văn học|tác phẩm|nhân vật|tác giả|thơ|truyện|tiểu thuyết|literature|novel|poem|poetry|author|character|chapter/i,
  art: /nghệ thuật|hội hoạ|tranh|điêu khắc|bảo tàng|triển lãm|kiến trúc|art|painting|sculpture|museum|exhibition|architecture|design/i,
  science: /khoa học|thí nghiệm|tế bào|phân tử|nguyên tử|năng lượng|vật lý|hoá học|sinh học|science|experiment|cell|molecule|atom|energy|physics|chemistry|biology/i,
  math: /hàm số|phương trình|đồ thị|đạo hàm|tích phân|ma trận|xác suất|định lý|function|equation|graph|derivative|integral|matrix|probability|theorem/i,
  tech: /lập trình|thuật toán|phần mềm|hệ thống|dữ liệu|api|máy học|ai\b|cloud|programming|algorithm|software|system|database|machine learning|neural|framework|architecture/i,
  business: /doanh thu|khách hàng|thị trường|chiến lược|sản phẩm|đầu tư|lợi nhuận|startup|revenue|customer|market|strategy|product|investment|profit|growth|pitch|kpi/i,
  social: /xã hội|kinh tế|chính trị|pháp luật|nhà nước|chính sách|lợi ích|society|economy|economic|politic|law|policy|government|stakeholder/i,
};

function detect(raw) {
  const lines = raw.split('\n');
  const label = (re) => {
    const l = lines.find((x) => re.test(x));
    return l ? clean(l.replace(re, '')) : null;
  };
  const d = {};
  d.kicker = label(L.kicker);
  d.title = label(L.title) ?? (raw.match(/^#{1,4}\s+(.+)$/m) || [])[1] ?? null;
  d.subtitle = label(L.subtitle);
  d.scope = label(L.scope);
  d.sources = lines.filter((l) => L.source.test(l)).map((l) => clean(l.replace(L.source, '')));
  d.notes = lines.filter((l) => L.note.test(l)).map((l) => clean(l.replace(L.note, '')));
  d.hasKeyFigure = L.figure.test(raw);
  d.bold = [...raw.matchAll(/\*\*([^*]+)\*\*/g)].map((m) => m[1]).filter((b) => !/:\s*$/.test(b));
  const prose = raw.replace(/```[\s\S]*?```/g, ' ').replace(/\$\$[^$]*\$\$/g, ' '); // numbers in code / formulas are not data
  d.numbers = [...prose.matchAll(/(?<![\w/.,])(\d{1,3}(?:[.,]\d{3})*(?:[.,]\d+)?)(?!\d)\s*(%|tỷ|triệu|nghìn|bn|billion|million|k\b|USD|VND|\$|đồng|lần|x\b|°C|°F|°|km²?|m²|m\b|ha\b|kg|tấn|tons?\b|người|people|years?\b|tuổi)?/giu)]
    .filter((m) => !/^(1[0-9]|20)\d{2}$/.test(m[1]))
    .filter((m) => m[2] || m[1].length >= 3)
    .slice(0, 12)
    .map((m) => m[0].trim());
  d.years = [...new Set([...prose.matchAll(/\b(1[0-9]\d{2}|20\d{2})\b/g)].map((m) => m[1]))];
  // tables
  const tables = [];
  let cur = [];
  for (const l of lines) {
    if (/^\s*\|.*\|\s*$/.test(l)) cur.push(l);
    else if (cur.length) (tables.push(cur), (cur = []));
  }
  if (cur.length) tables.push(cur);
  d.tables = tables.map((t) => t.filter((r) => !/^\s*\|[\s:|-]+\|\s*$/.test(r)).map((r) => r.trim().replace(/^\||\|$/g, '').split('|').map((c) => c.trim())));
  d.bullets = lines.filter((l) => /^\s*[-*•]\s+/.test(l)).map((l) => l.replace(/^\s*[-*•]\s+/, '').trim());
  d.numbered = lines.filter((l) => /^\s*\d+[.)]\s+/.test(l)).map((l) => l.replace(/^\s*\d+[.)]\s+/, '').trim());
  d.quotes = lines.filter((l) => L.quote.test(l) && !L.scope.test(l) && !L.source.test(l)).map((l) => l.replace(/^\s*>\s*/, '').trim()).filter(Boolean);
  d.code = [...raw.matchAll(/```(\w+)?\n([\s\S]*?)```/g)].map((m) => ({ lang: m[1] ?? 'text', lines: m[2].split('\n').length }));
  d.math = [...raw.matchAll(/\$\$([^$]+)\$\$|\$([^$\n]+)\$/g)].map((m) => (m[1] ?? m[2]).trim());
  d.images = [...raw.matchAll(/!\[([^\]]*)\]\(([^)\s]+)/g)].map((m) => ({ alt: m[1], src: m[2] }));
  d.videos = [...raw.matchAll(/(https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{6,})|\S+\.(?:mp4|webm))/gi)].map((m) => m[2] ?? m[1]);
  d.models = [...raw.matchAll(/\S+\.(?:glb|gltf)\b/gi)].map((m) => m[0]);
  d.coords = [...raw.matchAll(/(-?\d{1,2}\.\d+)\s*[,;]\s*(-?\d{1,3}\.\d+)/g)].map((m) => [Number(m[1]), Number(m[2])]);
  d.arrows = /→|->|⇒|⟶/.test(raw);
  d.routeArrows = (raw.match(/[A-ZÀ-Ỹ][\p{L} ]{1,30}\s*(→|->)\s*[A-ZÀ-Ỹ][\p{L} ]{1,30}/gu) || []).length > 0;
  d.domains = Object.entries(PACKS).filter(([, re]) => re.test(raw)).map(([k]) => k);
  return d;
}

/** Structure first, domain hints second. Returns layout · blocks · scene suggestions (the agent decides). */
function suggest(d, i, heading = '') {
  if (i === 0) return { layout: 'cover', blocks: [], scene: d.images.length ? 'gallery | parallax' : d.domains.includes('travel') || d.domains.includes('geography') ? 'globe' : 'morph | threeui | globe' };
  if (/tài liệu tham khảo|references|thư mục|bibliography|nguồn tham khảo/i.test(`${heading} ${d.title ?? ''}`)) return { layout: 'references', blocks: [], scene: 'ambient' };
  const s = { layout: 'split', blocks: [], scene: [] };
  const add = (x) => !s.scene.includes(x) && s.scene.push(x);
  if (d.code.length) {
    s.blocks.push(`code (${d.code[0].lang}, ${d.code[0].lines} lines)`);
    add('flow | network | threeui');
  }
  if (d.math.length) {
    s.blocks.push('math');
    add('plot');
  }
  if (d.hasKeyFigure || d.numbers.length) {
    s.blocks.unshift(d.numbers.length > 3 ? 'chart (line/area if over time, donut if shares) or bars' : 'metric');
    if (d.numbers.length >= 2 && d.numbers.length <= 5) add('towers');
  }
  if (d.tables.length) {
    const cols = d.tables[0][0]?.length ?? 0;
    const rows = d.tables[0].length - 1;
    const txt = JSON.stringify(d.tables[0]);
    if (cols === 3 && rows <= 6 && /thống nhất|mâu thuẫn|ưu|nhược|trước|sau|cũ|mới|pros?|cons?|before|after|old|new|vs/i.test(txt)) s.blocks.push('compare or table');
    else s.blocks.push('table');
    if (cols > 3 || rows > 5) s.layout = 'grid';
  }
  if (d.years.length >= 3) {
    s.blocks.push('timeline');
    add('timeline');
    if (d.years.length >= 4) s.layout = 'grid';
  }
  if (d.coords.length || d.routeArrows || d.domains.includes('travel') || d.domains.includes('geography')) add('globe (route / arcs / points)');
  if (d.numbered.length >= 3 || (d.arrows && !d.routeArrows)) {
    s.blocks.push('flow');
    add('flow');
  }
  if (d.images.length >= 2) {
    s.blocks.push('gallery');
    add('gallery | parallax');
  } else if (d.images.length === 1) s.blocks.push('image (or slide.image backdrop)');
  if (d.videos.length) s.blocks.push('video');
  if (d.models.length) add('model');
  if (d.quotes.length) {
    s.blocks.push('quote');
    s.layout = 'center';
  }
  if (d.notes.length) s.blocks.push('callout');
  if (d.bullets.length && !s.blocks.length) s.blocks.push(d.bullets.length > 4 ? 'bento' : 'list');
  // domain hints when structure gave no scene
  if (!s.scene.length) {
    if (d.domains.includes('history')) add('timeline | gallery (artefacts) | model');
    if (d.domains.includes('art') || d.domains.includes('literature')) add('gallery | parallax | cards (book/letter)');
    if (d.domains.includes('science')) add('model | morph | plot');
    if (d.domains.includes('tech')) add('network | flow | cards (code/phone)');
    if (d.domains.includes('business')) add('towers | cards (phone/chart) | threeui');
    if (d.domains.includes('social')) add('network | morph (split/converge)');
  }
  if (!s.scene.length) add('morph | ambient');
  return { layout: s.layout, blocks: s.blocks, scene: s.scene.join(' · ') };
}

function guessLang(text) {
  const vi = (text.match(/[ăâđêôơưạảấầẩẫậắằẳẵặẹẻẽếềểễệỉịọỏốồổỗộớờởỡợụủứừửữựỳỵỷỹ]/gi) || []).length;
  const letters = (text.match(/\p{L}/gu) || []).length || 1;
  return vi / letters > 0.01 ? 'vi' : 'en';
}

const contentText = readFileSync(contentPath, 'utf8');
const content = split(contentText);
const script = scriptPath ? split(readFileSync(scriptPath, 'utf8')) : [];
const pad = (n) => String(n).padStart(2, '0');
const lang = guessLang(contentText);

const out = content.map((c, i) => {
  const d = detect(c.raw);
  // "## Slide 3: Title" / "### Trang 3 — Title" → the part after the number is the title
  if (!d.title) d.title = c.heading.replace(/^(?:slide|trang)\s*0*\d+\s*[:.—–-]?\s*/i, '').trim() || null;
  const sc = script.find((x) => x.n === c.n) ?? script[i];
  return { id: `s${pad(i + 1)}`, n: c.n, heading: c.heading, detected: d, suggest: suggest(d, i, c.heading), notes: sc?.raw ?? null, raw: c.raw };
});
const domains = [...new Set(out.flatMap((s) => s.detected.domains))];

writeFileSync('content-skeleton.json', JSON.stringify({ lang, domains, slides: out }, null, 2));
console.log(`✔ ${out.length} slides → content-skeleton.json   lang: ${lang}   domains: ${domains.join(', ') || '—'}${script.length ? `   script: ${script.length} sections` : ''}`);
for (const s of out) console.log(`  ${s.id}  ${s.heading.slice(0, 44).padEnd(44)} → ${s.suggest.layout} · [${s.suggest.blocks.join(', ')}] · ${s.suggest.scene}`);
if (script.length && script.length !== out.length) console.log(`⚠ script has ${script.length} sections vs ${out.length} slides — check notes mapping manually`);
console.log(`\nNext: set deck.lang = '${lang}', pick a theme (see SKILL.md), then map each slide into src/content/slides.ts.`);

if (arg('write-notes')) {
  if (!script.length) {
    console.error('--write-notes needs --script');
    process.exit(1);
  }
  const body = out.map((s) => `  ${s.id}: ${JSON.stringify((s.notes ?? '').replace(/\n{3,}/g, '\n\n').trim())},`).join('\n');
  writeFileSync(
    'src/content/notes.ts',
    `/**\n * SPEAKER NOTES — generated by scripts/scaffold-from-md.mjs from ${String(scriptPath).split(/[\\/]/).pop()}.\n * Verbatim; edit only to fix mapping.\n */\nexport const notes: Record<string, string> = {\n${body}\n};\n`,
  );
  console.log('✔ wrote src/content/notes.ts');
}
