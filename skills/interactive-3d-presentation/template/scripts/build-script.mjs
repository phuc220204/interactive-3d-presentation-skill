#!/usr/bin/env node
/**
 * Kịch bản nói tự sinh từ ghi chú (notes.ts) — để slide và lời nói luôn khớp.   npm run script
 * → SCRIPT.md: bảng người nói (slide a–b, tiêu đề đầu → cuối, thời lượng), rồi từng slide (người nói, số nhịp,
 *   thời lượng ước tính / dự kiến `slide.minutes`, lời nói), cuối cùng là "slide dự phòng" (không tính giờ).
 *   vi: 150 âm tiết/phút · en: 140 từ/phút; thêm dòng "nói nhanh" (+20). Không tính [chỉ dẫn sân khấu] và dòng *in nghiêng*.
 *   Slide dự phòng = layout 'references' hoặc ghi chú bắt đầu bằng [Slide dự phòng / [Backup.
 * Cảnh báo (exit 1) khi tổng vượt deck.targetMinutes. Không sửa tay SCRIPT.md — sửa notes.ts rồi chạy lại.
 */
import { writeFileSync } from 'node:fs';
import { loadModules } from './load-content.mjs';

const [{ slides, notes, deck }, { beatCount }] = await loadModules('/src/content/index.ts', '/src/deck/beats.ts');

const vi = (deck.lang ?? 'vi') === 'vi';
const RATE = vi ? 150 : 140;
const FAST = RATE + 20;
const T = vi
  ? { title: 'Kịch bản thuyết trình', speaker: 'Người nói', beats: 'Nhịp', planned: 'dự kiến', total: 'Tổng phần nói', fast: 'nếu nói nhanh', slides: 'Slide', from: 'Từ → đến', time: 'Thời lượng', backup: 'Slide dự phòng (không đọc, chỉ mở khi được hỏi)', none: '_(chưa có ghi chú)_', over: 'Vượt thời lượng mục tiêu — rút bớt lời nói' }
  : { title: 'Talk script', speaker: 'Speaker', beats: 'Beats', planned: 'planned', total: 'Spoken total', fast: 'if speaking fast', slides: 'Slides', from: 'From → to', time: 'Time', backup: 'Backup slides (not read, opened only when asked)', none: '_(no notes)_', over: 'Over the target length — trim the notes' };
const plain = (t = '') => String(t).replace(/\[([^\]]+)\]\(\^[\w.-]+\)/g, '$1').replace(/\*\*|!!|==|\$\$/g, '').replace(/\*([^*]+)\*/g, '$1');
const spokenText = (t) => t.replace(/^\s*\*[^*\n].*\*\s*$/gm, ' ').replace(/\[[^\]]*\]/g, ' ');
const count = (t) => spokenText(t).split(/\s+/).filter((w) => /\p{L}|\d/u.test(w)).length;
const mmss = (sec) => `${Math.floor(sec / 60)}:${String(Math.round(sec % 60)).padStart(2, '0')}`;
const isBackup = (s) => s.layout === 'references' || /^\s*\[(slide dự phòng|backup)/i.test(notes[s.id] ?? '');

let total = 0;
const rows = [];
const backup = [];
const bySpeaker = new Map();
slides.forEach((s, i) => {
  const text = notes[s.id] ?? '';
  const n = i + 1;
  if (isBackup(s)) {
    backup.push(`- ${n}. ${plain(s.title)}`);
    return;
  }
  const sec = (count(text) / RATE) * 60;
  total += sec;
  const sp = s.speaker ?? '—';
  const g = bySpeaker.get(sp) ?? { sec: 0, first: n, last: n, firstTitle: plain(s.title), lastTitle: plain(s.title) };
  g.sec += sec;
  g.last = n;
  g.lastTitle = plain(s.title);
  bySpeaker.set(sp, g);
  const beats = beatCount(s);
  const planned = s.minutes ? ` · ${T.planned} ${mmss(s.minutes * 60)}` : '';
  rows.push(`## ${n}. ${plain(s.title)}\n\n${T.speaker}: **${sp}** · ${T.beats}: ${beats ? beats + 1 : 1} · ~${mmss(sec)}${planned}\n\n${text || T.none}\n`);
});

const out = [
  `# ${T.title} — ${deck.title}\n`,
  vi
    ? `> Tự sinh từ \`src/content/notes.ts\` bằng \`npm run script\` — không sửa tay file này. Ước tính ${RATE} âm tiết/phút (nhanh: ${FAST}), không tính [chỉ dẫn] và dòng *in nghiêng*. \`[Bấm một lần.]\` = một lần bấm trong slide. Phải bấm giờ khi tập.\n`
    : `> Generated from \`src/content/notes.ts\` by \`npm run script\` — do not edit by hand. Estimate at ${RATE} words/min (fast: ${FAST}), [stage directions] and *italic lines* excluded. Rehearse with a timer.\n`,
  `| ${T.speaker} | ${T.slides} | ${T.from} | ${T.time} |\n|---|---|---|---|`,
  ...[...bySpeaker].map(([k, g]) => `| ${k} | ${g.first}–${g.last} | ${g.firstTitle.slice(0, 40)} → ${g.lastTitle.slice(0, 40)} | ~${mmss(g.sec)} |`),
  `| **${T.total}** | | | **~${mmss(total)}**${deck.targetMinutes ? ` / ${deck.targetMinutes}:00` : ''} (${T.fast}: ~${mmss((total * RATE) / FAST)}) |\n`,
  ...rows,
  ...(backup.length ? [`## ${T.backup}\n`, ...backup, ''] : []),
];
writeFileSync('SCRIPT.md', out.join('\n'));
console.log(`✔ SCRIPT.md — ${slides.length} slide, ~${mmss(total)}${deck.targetMinutes ? ` (mục tiêu ${deck.targetMinutes}:00)` : ''}`);
if (bySpeaker.size > 1) for (const [k, g] of bySpeaker) console.log(`  ${k}: slide ${g.first}–${g.last}, ~${mmss(g.sec)}`);
if (deck.targetMinutes && total > deck.targetMinutes * 60) {
  console.log(`⚠ ${T.over}`);
  process.exit(1);
}
