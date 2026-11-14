#!/usr/bin/env node
/**
 * Kiểm tra tĩnh nội dung deck (src/content/*) trước khi mở trình duyệt.   npm run validate
 * Lỗi (✖) → exit 1. Cảnh báo (⚠) không chặn nhưng agent phải xem và sửa hoặc giải thích.
 *
 * Nhóm luật:
 *   1. Cấu trúc: id, layout, block, scene + state hợp lệ, notes, slide Tài liệu cuối.
 *   2. Một ý – một hình: scene khác 'ambient' phải có `purpose`; không vừa scene 3D vừa block hình
 *      ở layout split/cover/full; không chồng backdrop + scene + block hình; ThreeUI/Spline có tiết chế.
 *   3. Mật độ: tiêu đề, lead, số từ ngoài tiêu đề, sức chứa từng block.
 *   4. Brief: theme & scene khớp brief.ts (một họ hiệu ứng), motion 'calm' thì không hiệu ứng nặng.
 *   5. Nguồn & asset: mọi trích dẫn tồn tại, miền bị cấm, mọi asset từ xa có credit, ảnh AI không mô tả
 *      người/sự kiện thật, offline thì mọi asset đã pull. URL nguồn https, miền cấm so theo hostname
 *      (deck.academic: true → thêm danh sách mặc định), quét cả URL trong chữ & ghi chú.
 *   6. Kịch bản: ghi chú ≥ 40 ký tự, không còn chỗ giữ chỗ (TODO, TBD, lorem, [Người 1]…), deck.sensitiveTerms.
 *   7. Màu cứng: không #hex / rgb() / hsl() trong src/content (trừ theme.ts) và public/assets/diagrams/*.svg.
 *   8. Mạng: index.html / CSS không tải gì từ internet; offline thì không YouTube.
 */
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { loadModules } from './load-content.mjs';

let mod;
let threeui = {};
try {
  let cat;
  [mod, cat] = await loadModules('/src/content/index.ts', '/src/threeui/catalog.ts');
  threeui = cat.THREEUI;
} catch (e) {
  console.error('✖ Không tải được src/content/index.ts:\n', e.message);
  process.exit(1);
}

const { slides, notes, sources, deck, brief, theme } = mod;
const errors = [];
const warns = [];
const E = (s, m) => errors.push(`${s ? `[${s}] ` : ''}${m}`);
const W = (s, m) => warns.push(`${s ? `[${s}] ` : ''}${m}`);
const plain = (t = '') =>
  String(t)
    .replace(/\[([^\]]+)\]\(\^[\w.-]+\)/g, '$1')
    .replace(/\$\$[^$]*\$\$/g, 'x')
    .replace(/\*\*|!!|==/g, '')
    .replace(/\*([^*]+)\*/g, '$1');
const words = (t) => plain(t).split(/\s+/).filter(Boolean).length;

/* ---------------- schemas ---------------- */
const PLOT_IDS = new Set(['x', 'y', 'pi', 'e', 'sin', 'cos', 'tan', 'asin', 'acos', 'atan', 'sinh', 'cosh', 'tanh', 'exp', 'log', 'sqrt', 'abs', 'pow', 'min', 'max', 'floor', 'ceil', 'sign']);
const SCENES = {
  ambient: () => true,
  threeui: () => true,
  spline: (st, sc) => typeof sc.scene === 'string',
  globe: (st) => st && (st.focus || st.arcs || st.points || st.route),
  towers: (st) => st && Array.isArray(st.items) && st.items.length >= 1 && st.items.every((i) => typeof i.value === 'number'),
  morph: (st) => {
    const ok = (x) => x && (typeof x.path === 'string' || ['sphere', 'grid', 'wave', 'cluster', 'converge', 'split', 'ring', 'helix', 'cube', 'scatter', 'person', 'gear', 'chip', 'house', 'arrow'].includes(x.shape));
    return st && (Array.isArray(st.stages) ? st.stages.length >= 2 && st.stages.every(ok) : ok(st));
  },
  network: (st) => st && Array.isArray(st.nodes) && Array.isArray(st.links),
  flow: (st) => st && Array.isArray(st.steps) && st.steps.length >= 2,
  timeline: (st) => st && Array.isArray(st.items) && st.items.length >= 2,
  cards: (st) => st && Array.isArray(st.cards) && st.cards.length >= 1,
  gallery: (st) => st && Array.isArray(st.items) && st.items.length >= 1 && st.items.every((i) => i.src),
  parallax: (st) => st && Array.isArray(st.layers) && st.layers.length >= 1 && st.layers.every((l) => l.src && typeof l.depth === 'number'),
  model: (st) => st && typeof st.src === 'string' && /\.(glb|gltf)(\?|$)/i.test(st.src),
  plot: (st) => st && (st.fn || Array.isArray(st.matrix)),
  gear: () => true,
};
const LAYOUTS = ['cover', 'split', 'split-right', 'center', 'grid', 'full', 'references', 'section'];
const BLOCKS = ['metric', 'compare', 'bento', 'timeline', 'flow', 'quote', 'callout', 'table', 'bars', 'list', 'image', 'references', 'chart', 'code', 'math', 'gallery', 'video', 'diagram', 'lottie', 'waffle', 'gauge', 'dimension', 'simulation'];
const VISUAL_BLOCKS = new Set(['image', 'gallery', 'video', 'chart', 'diagram', 'lottie', 'waffle', 'gauge', 'dimension', 'simulation']);
const HEAVY = new Set(['threeui', 'spline', 'parallax', 'model']);

/* ---------------- deck & brief ---------------- */
if (!deck?.title || !deck?.brand) E('deck', 'deck.title / deck.brand là bắt buộc');
if (deck?.lang && !['vi', 'en'].includes(deck.lang)) E('deck', "deck.lang phải là 'vi' hoặc 'en' (thêm ngôn ngữ ở src/i18n.ts)");
if (!Array.isArray(slides) || !slides.length) E('', 'slides[] rỗng');
if (!brief) W('brief', 'Thiếu src/content/brief.ts — hãy hỏi user theo references/brief-intake.md rồi ghi lại.');
else {
  if (brief.theme && theme?.name && brief.theme !== theme.name) E('brief', `theme.ts dùng "${theme.name}" nhưng brief chốt "${brief.theme}"`);
  if (brief.lang && deck?.lang && brief.lang !== deck.lang) W('brief', `brief.lang = ${brief.lang} nhưng deck.lang = ${deck.lang}`);
  if (brief.offline !== undefined && !!brief.offline !== !!deck.offline) W('brief', 'brief.offline và deck.offline không khớp');
}

/* ---------------- sources ---------------- */
const srcIds = new Set(sources.map((s) => s.id));
// sources that are not acceptable as evidence in academic work (facts), learned from a graded course deck.
// Images from commons.wikimedia.org are a different thing (licensed media) and stay allowed.
const ACADEMIC_BANNED = ['wikipedia.org', 'facebook.com', 'fb.com', 'tiktok.com', 'youtube.com', 'youtu.be', 'instagram.com', 'x.com', 'twitter.com',
  'reddit.com', 'quora.com', 'medium.com', 'blogspot.com', 'wordpress.com', 'substack.com', 'studocu.com', '123doc.net', 'tailieu.vn',
  'vndoc.com', 'luanvan.co', 'chatgpt.com', 'chat.openai.com', 'claude.ai', 'gemini.google.com', 'perplexity.ai', 'brainly.com', 'scribd.com'];
const banned = [...(deck.bannedDomains ?? []), ...(deck.academic ? ACADEMIC_BANNED : [])].map((d) => d.toLowerCase().replace(/^www\./, ''));
const hostOf = (u) => {
  try {
    return new URL(u).hostname.toLowerCase().replace(/^www\./, '');
  } catch {
    return '';
  }
};
const isBanned = (u) => {
  const h = hostOf(u);
  return !!h && banned.some((d) => h === d || h.endsWith('.' + d));
};
const credited = new Set(sources.flatMap((s) => [s.url, ...(s.assets ?? [])]).filter(Boolean));
const MEDIA_KINDS = new Set(['photo', 'image', 'user', 'ai', 'diagram', 'video', 'model', 'lottie', 'spline', 'effect']);
for (const s of sources) {
  if (!s.apa || !s.short) E(`nguồn:${s.id}`, 'cần apa + short');
  if (MEDIA_KINDS.has(s.kind) && !s.license) W(`nguồn:${s.id}`, 'asset chưa ghi license');
  if (s.kind === 'ai' && s.depictsReal !== false) E(`nguồn:${s.id}`, "ảnh AI phải có depictsReal: false — AI chỉ dùng cho minh hoạ trang trí, không mô tả người/sự kiện/số liệu thật");
  if (s.url && isBanned(s.url)) E(`nguồn:${s.id}`, `URL thuộc miền bị cấm (${s.url}) — tìm nguồn bậc 1 (references/sources-verification.md)`);
  if (s.url && /^http:\/\//i.test(s.url)) E(`nguồn:${s.id}`, `URL phải là https:// (${s.url})`);
  if (!s.kind) W(`nguồn:${s.id}`, "thiếu kind (text | data | photo | user | ai | diagram | video | model | lottie | spline | effect)");
}

/* ---------------- assets ---------------- */
let remoteMap = {};
try {
  remoteMap = JSON.parse(readFileSync('public/assets/assets-map.json', 'utf8'));
} catch {
  /* none */
}
function assetsOf(s) {
  const out = [];
  const push = (u, what) => u && out.push({ u, what });
  if (s.image) push(s.image.src, 'backdrop');
  for (const b of s.blocks ?? []) {
    if (b.type === 'image') push(b.src, 'image');
    if (b.type === 'gallery') b.items.forEach((i) => push(i.src, 'gallery'));
    if (b.type === 'video') push(b.src ?? (b.youtube ? `youtube:${b.youtube}` : ''), 'video');
    if (b.type === 'diagram') push(b.src, 'diagram');
    if (b.type === 'lottie') push(b.src, 'lottie');
  }
  const st = s.scene?.state ?? {};
  if (s.scene?.name === 'gallery') st.items?.forEach((i) => push(i.src, 'gallery 3D'));
  if (s.scene?.name === 'parallax') st.layers?.forEach((l) => push(l.src, 'parallax'));
  if (s.scene?.name === 'cards') st.cards?.forEach((c) => push(c.src, 'cards'));
  if (s.scene?.name === 'model') push(st.src, 'model');
  if (s.scene?.name === 'spline') push(s.scene.scene, 'spline');
  return out;
}
const isRemote = (u) => /^https?:\/\//.test(u);
const isCredited = (u) => credited.has(u) || [...credited].some((c) => c && u.startsWith(c)) || (u.startsWith('youtube:') && [...credited].some((c) => c?.includes(u.slice(8))));

/* ---------------- slides ---------------- */
const ids = new Set();
let heavyRun = 0;
let lastHeavy = '';
let heavyCount = 0;
for (const [i, s] of slides.entries()) {
  const id = s.id ?? `#${i + 1}`;
  if (!s.id) E(id, 'thiếu id');
  if (ids.has(s.id)) E(id, 'id trùng');
  ids.add(s.id);
  if (!s.title) E(id, 'thiếu title');
  if (!s.section) E(id, 'thiếu section');
  const layout = s.layout ?? 'split';
  if (!LAYOUTS.includes(layout)) E(id, `layout không hợp lệ "${layout}"`);
  const blocks = s.blocks ?? [];
  const scene = s.scene;

  // markers balanced
  const txt = JSON.stringify(s);
  for (const m of ['**', '!!', '==']) if ((txt.split(m).length - 1) % 2) W(id, `dấu ${m} không cân`);

  // scene schema
  if (!scene?.name) E(id, 'thiếu scene');
  else if (!SCENES[scene.name]) E(id, `scene không tồn tại "${scene.name}"`);
  else if (!SCENES[scene.name](scene.state, scene)) E(id, `scene "${scene.name}" thiếu/ sai state`);
  if (scene?.name === 'threeui' && !threeui[scene.component]) E(id, `ThreeUI "${scene.component}" không có trong src/threeui/catalog.ts`);
  if (scene?.name === 'network') {
    const nodeIds = new Set(scene.state.nodes.map((n) => n.id));
    for (const l of scene.state.links) if (!nodeIds.has(l.a) || !nodeIds.has(l.b)) E(id, `network: liên kết ${l.a}→${l.b} trỏ tới node không có`);
  }
  if (scene?.name === 'plot' && scene.state?.fn) {
    const bad = (scene.state.fn.match(/[a-z]+/gi) ?? []).filter((w) => !PLOT_IDS.has(w.toLowerCase()));
    if (bad.length) E(id, `plot fn dùng tên không hỗ trợ: ${bad.join(', ')}`);
  }

  // 2. ONE IDEA – ONE VISUAL
  const meaningful = scene?.name && scene.name !== 'ambient';
  if (meaningful && !scene.purpose && layout !== 'references') E(id, `scene "${scene.name}" thiếu purpose — viết 1 câu: cảnh này minh hoạ điều gì của slide. Không viết được → dùng 'ambient'.`);
  const visualBlocks = blocks.filter((b) => VISUAL_BLOCKS.has(b.type));
  if (visualBlocks.length > 1) E(id, `${visualBlocks.length} block hình (${visualBlocks.map((b) => b.type).join(', ')}) — mỗi slide một hình chính`);
  if (meaningful && visualBlocks.length && ['split', 'split-right', 'cover', 'full'].includes(layout))
    E(id, `vừa scene 3D "${scene.name}" vừa block hình "${visualBlocks[0].type}" — chọn MỘT hero visual (scene → 'ambient', hoặc bỏ block hình)`);
  if (s.image && meaningful && visualBlocks.length) W(id, 'ảnh nền + scene + block hình cùng lúc — rối mắt');
  if (s.image && scene?.name && HEAVY.has(scene.name)) W(id, `ảnh nền + ${scene.name} — hai lớp hình nặng chồng nhau`);
  if (HEAVY.has(scene?.name)) {
    heavyCount++;
    const key = scene.name === 'threeui' ? scene.component : scene.name;
    heavyRun = key === lastHeavy ? heavyRun + 1 : 1;
    lastHeavy = key;
    if (heavyRun > 2) W(id, `"${key}" lặp > 2 slide liên tiếp — đổi nhịp thị giác`);
  } else {
    heavyRun = 0;
    lastHeavy = '';
  }

  // 3. density
  const tl = plain(s.title).length;
  if (tl > 90) W(id, `tiêu đề ${tl} ký tự — chuyển phần sau sang subtitle/lead`);
  if (words(s.title) < 3 && !/[?？]/.test(s.title) && !['cover', 'references', 'center'].includes(layout)) W(id, 'tiêu đề nên là một câu khẳng định hoặc câu hỏi, không phải nhãn chủ đề');
  if (s.lead && plain(s.lead).length > 260) W(id, 'lead > 260 ký tự');
  const bodyWords = words(s.lead ?? '') + words(JSON.stringify(blocks.map((b) => ({ ...b, src: undefined, code: undefined, tex: undefined }))).replace(/"[a-zA-Z]+":/g, ' '));
  if (bodyWords > 70 && layout !== 'references') W(id, `~${bodyWords} từ ngoài tiêu đề — quá nhiều chữ, đưa phần giải thích vào notes`);
  if (blocks.length > 3) W(id, `${blocks.length} block — quá dày`);
  for (const b of blocks) {
    if (!BLOCKS.includes(b.type)) E(id, `block không tồn tại "${b.type}"`);
    if (b.type === 'list' && b.items.length > 6) W(id, `list ${b.items.length} mục (tối đa 6)`);
    if (b.type === 'bento' && b.items.length > 6) W(id, `bento ${b.items.length} thẻ (tối đa 6)`);
    if (b.type === 'table' && b.rows.length > 7) W(id, `table ${b.rows.length} dòng (tối đa 7)`);
    if (b.type === 'table' && ['split', 'split-right'].includes(layout) && b.columns.length > 3) W(id, 'table > 3 cột trong split — dùng grid');
    if (b.type === 'timeline' && b.items.length > 6) W(id, `timeline ${b.items.length} mốc (tối đa 6)`);
    if (b.type === 'image' && !b.alt) E(id, 'image thiếu alt');
    if (b.type === 'gallery' && b.items.some((x) => !x.alt)) E(id, 'gallery: ảnh thiếu alt');
    if (b.type === 'diagram' && !b.alt) E(id, 'diagram thiếu alt');
    if (b.type === 'lottie' && !b.alt) E(id, 'lottie thiếu alt');
    if (b.type === 'diagram' && !isRemote(b.src) && !existsSync(`public${b.src}`)) E(id, `diagram không có file public${b.src}`);
    if (b.type === 'video' && !b.src && !b.youtube) E(id, 'video cần src hoặc youtube');
    if (b.type === 'code' && b.code.split(/\r?\n/).length > 18) W(id, 'code > 18 dòng');
    if (b.type === 'chart' && b.kind !== 'donut' && b.series.some((x) => x.values.length !== b.labels.length)) E(id, 'chart: số giá trị ≠ số nhãn');
    if (b.type === 'chart' && b.kind === 'donut' && b.series[0]?.values.length !== b.labels.length) E(id, 'donut: số giá trị ≠ số nhãn');
    if (b.type === 'waffle') {
      const sum = b.parts.reduce((a, p) => a + p.value, 0);
      if (sum > (b.total ?? 100)) E(id, `waffle: tổng ${sum} > ${b.total ?? 100} ô`);
    }
    if (b.type === 'gauge' && (!b.items?.length || b.items.length > 3)) E(id, 'gauge: 1–3 vòng');
    if (b.type === 'dimension' && (!b.items?.length || b.items.length > 4)) E(id, 'dimension: 1–4 đường');
    if (b.type === 'simulation') {
      if (!(b.input && b.input.max > b.input.min)) E(id, 'simulation: input.min < input.max');
      for (const o of b.outputs ?? []) {
        const bad = (o.fn.match(/[a-z]+/gi) ?? []).filter((w) => !PLOT_IDS.has(w.toLowerCase()) || w.toLowerCase() === 'y');
        if (bad.length) E(id, `simulation fn "${o.fn}" dùng tên không hỗ trợ: ${bad.join(', ')} (chỉ x, số, + - * / ^ ( ) và hàm toán)`);
      }
    }
    if (b.stepwise && !['list', 'bento', 'timeline', 'flow', 'table'].includes(b.type)) W(id, `stepwise không áp dụng cho ${b.type}`);
  }

  // annotations & connectors
  const slideText = plain(JSON.stringify({ t: s.title, st: s.subtitle, l: s.lead, b: blocks }));
  for (const a of s.annotations ?? []) {
    if (!['circle', 'underline', 'box', 'arrow'].includes(a.type)) E(id, `annotation type không hợp lệ "${a.type}"`);
    if (!/^[#.[]/.test(a.target) && !slideText.toLowerCase().includes(a.target.toLowerCase())) W(id, `annotation: không thấy "${a.target}" trong chữ của slide`);
  }
  const blockIds = new Set(blocks.map((b) => b.id).filter(Boolean));
  for (const c of s.connectors ?? []) for (const k of [c.from, c.to]) if (!blockIds.has(k)) E(id, `connector: không có block id "${k}"`);

  // 4. brief
  if (brief) {
    if (meaningful && Array.isArray(brief.scenes) && !brief.scenes.includes(scene.name) && !(scene.name === 'threeui' && brief.scenes.includes(`threeui:${scene.component}`)))
      E(id, `scene "${scene.name}${scene.name === 'threeui' ? ':' + scene.component : ''}" ngoài brief.scenes (${brief.scenes.join(', ')}) — giữ một họ hiệu ứng, hoặc cập nhật brief khi user đồng ý`);
    if (brief.motion === 'calm' && HEAVY.has(scene?.name)) W(id, `brief.motion = 'calm' nhưng dùng ${scene.name}`);
  }

  // 5. citations & assets
  const cited = [...txt.matchAll(/\]\(\^([\w.-]+)\)/g)].map((m) => m[1]).concat([...txt.matchAll(/"source":"([\w.-]+)"/g)].map((m) => m[1]));
  for (const c of [...cited, ...(s.sources ?? [])]) if (!srcIds.has(c)) E(id, `nguồn "${c}" không có trong sources.ts`);
  if (s.image) {
    if (!s.image.alt) E(id, 'ảnh nền thiếu alt');
    if (s.image.sourceId && !srcIds.has(s.image.sourceId)) E(id, `image.sourceId "${s.image.sourceId}" không có trong sources.ts`);
  }
  for (const a of assetsOf(s)) {
    const remote = isRemote(a.u) || a.u.startsWith('youtube:');
    const viaSourceId = a.what === 'backdrop' && s.image?.sourceId;
    if (remote && !viaSourceId && !isCredited(a.u)) W(id, `${a.what}: asset chưa có credit trong sources.ts (thêm url/assets): ${a.u.slice(0, 80)}`);
    if (a.u.startsWith('/assets/user/') && !isCredited(a.u)) W(id, `${a.what}: ảnh user nên có credit (kind 'user')`);
    if (deck.offline && isRemote(a.u) && !remoteMap[a.u]) E(id, `offline: ${a.what} chưa pull về máy — chạy npm run assets:pull`);
  }

  // 6. speaker notes = the talk
  const note = notes[s.id] ?? '';
  if (!note) W(id, 'chưa có ghi chú thuyết trình');
  else if (layout !== 'references' && note.replace(/<[^>]+>|\s/g, '').length < 40) W(id, 'ghi chú < 40 ký tự — viết lời nói thật, không chỉ gạch ý');
  if (/\b(TODO|TBD|FIXME|lorem ipsum)\b|\[(Người|Speaker|Tên) ?\d*\]|<điền|xxx/i.test(note + ' ' + txt)) E(id, 'còn chỗ giữ chỗ (TODO / TBD / lorem / [Người 1] / <điền…>) — thay bằng nội dung thật');
  for (const term of deck.sensitiveTerms ?? []) if ((note + ' ' + txt).toLowerCase().includes(term.toLowerCase())) W(id, `từ nhạy cảm "${term}" — kiểm tra cách diễn đạt`);
  for (const u of (note + ' ' + txt).match(/https?:\/\/[^\s"'<>)\]|]+/g) ?? []) if (isBanned(u)) E(id, `link thuộc miền bị cấm: ${u.slice(0, 80)}`);
  if (deck.offline && blocks.some((b) => b.type === 'video' && b.youtube)) E(id, 'offline: YouTube cần mạng — dùng file mp4/webm trong public/');
}
/* ---------------- 7. hard-coded colours ---------------- */
const COLOR = /#[0-9a-f]{3,8}\b|\b(?:rgba?|hsla?)\(/gi;
const colorFiles = [];
for (const f of existsSync('src/content') ? readdirSync('src/content') : []) if (/\.(ts|tsx)$/.test(f) && f !== 'theme.ts') colorFiles.push(`src/content/${f}`);
for (const f of existsSync('public/assets/diagrams') ? readdirSync('public/assets/diagrams') : []) if (f.endsWith('.svg')) colorFiles.push(`public/assets/diagrams/${f}`);
for (const f of colorFiles) {
  const lines = readFileSync(f, 'utf8').replace(/<mask[\s\S]*?<\/mask>/g, (m) => m.replace(/[^\n]/g, ' ')).split(/\r?\n/);
  lines.forEach((line, n) => {
    const l = line.replace(/&#x?[0-9a-f]+;/gi, '').replace(/https?:\/\/\S+/g, '');
    for (const m of l.match(COLOR) ?? []) {
      if (m.startsWith('#') && ![4, 5, 7, 9].includes(m.length)) continue;
      E(`${f}:${n + 1}`, `màu cứng "${m}" — dùng tone (accent/alert/cool/ink/muted) hoặc var(--c-*) / class .d-* .f-*`);
      break;
    }
  });
}

/* ---------------- 8. network loads in the page shell ---------------- */
const NET = /<script[^>]+src=["']https?:|<link[^>]+href=["']https?:|@import\s+(url\()?["']?https?:|url\(\s*["']?https?:|<iframe/i;
const shell = ['index.html', ...(existsSync('src') ? readdirSync('src').filter((f) => f.endsWith('.css')).map((f) => `src/${f}`) : [])];
for (const f of shell) if (existsSync(f) && NET.test(readFileSync(f, 'utf8'))) E(f, 'tải tài nguyên từ internet (CDN/@import/url(https…)) — đóng gói vào dự án để chạy offline');

if (heavyCount > Math.ceil(slides.length / 3)) W('', `${heavyCount}/${slides.length} slide dùng hiệu ứng nặng (ThreeUI/Spline/parallax/model) — tối đa ~1/3`);
for (const k of Object.keys(notes)) if (!ids.has(k)) W('notes', `ghi chú cho id không tồn tại "${k}"`);
const last = slides[slides.length - 1];
if (sources.length && (last?.layout ?? '') !== 'references') W('', 'slide cuối nên là layout "references"');

console.log(`Deck: ${deck?.title} — ${slides.length} slide, ${sources.length} nguồn, ${Object.keys(notes).length} ghi chú · theme ${theme?.name} · ${deck.lang ?? 'vi'}`);
console.log(`Scene: ${[...new Set(slides.map((s) => s.scene?.name))].join(', ')}`);
if (warns.length) console.log(`\n⚠ ${warns.length} cảnh báo:\n  ` + warns.join('\n  '));
if (errors.length) {
  console.log(`\n✖ ${errors.length} lỗi:\n  ` + errors.join('\n  '));
  process.exit(1);
}
console.log('\n✔ nội dung hợp lệ');
