# Deck 3D — bài thuyết trình web có tương tác 3D

React 19 · TypeScript · Tailwind CSS v4 · React-Three-Fiber · GSAP · ThreeUI · Spline · Lottie · Theatre.js · Lenis.

```bash
npm install
npm run dev          # http://localhost:5173 — starter 6 slide
```
**Trình chiếu:** → / Space / click / bút trình chiếu = tiếp · ← / Shift+click / chuột phải = lùi · con lăn · S ghi chú ·
P cửa sổ người nói · K soi nguồn · D sáng/tối · O tổng quan · F toàn màn hình · T bấm giờ · ? trợ giúp.
**URL:** `?theme=whiteboard` xem theme khác · `?mode=scroll` landing page cuộn mượt · `?presenter` cửa sổ người nói ·
`?studio` soạn camera Theatre.js (dev) · `?threeui=NebulaBackground` xem hiệu ứng ThreeUI · `#4.2` slide 4 nhịp 2.

## Lệnh
| | |
|---|---|
| `npm run use-example -- <tên>` | nạp deck mẫu: `starter` `economics-vi` `travel-hoi-an` `tech-talk-en` `history-art` `science-lesson` `business-pitch-en` `drafting-lesson` |
| `npm run scaffold -- --content noi-dung.md --script kich-ban.md --write-notes` | tách nguồn → `content-skeleton.json` + `src/content/notes.ts` |
| `npm run validate` | kiểm tra nội dung: schema, một hero visual, `purpose`, nguồn, asset, mật độ chữ, brief |
| `npm run find-image -- "từ khoá" [--png]` | tìm ảnh Wikimedia Commons + entry nguồn APA |
| `npm run qa [-- --theme a,b --sizes 1920x1080,1366x768 --only 1,4 --offline]` | chụp mọi slide (Chrome/Edge có sẵn), báo tràn, đè chữ, lỗi console |
| `npm run qa:threeui [-- --only Ten]` | thử hiệu ứng ThreeUI trên theme tối + sáng |
| `npm run script` | `SCRIPT.md`: lời nói, người nói, số nhịp, thời lượng |
| `npm run assets:pull` | tải asset từ xa về máy để trình chiếu offline |
| `npm run build` / `preview` | bản production `dist/` (deploy tĩnh: Vercel, Netlify, GitHub Pages — đường dẫn tương đối) |
| `npm run build:single` | **một file** `dist-single/index.html` chạy offline bằng double-click (gửi email/USB) |

## Cấu trúc
```
src/content/      slides.ts · notes.ts · sources.ts · theme.ts · brief.ts · theatre-state.json   ← sửa ở đây
public/assets/    diagrams/ · user/ · lottie/ · parallax/ · models/ · remote/
src/types.ts      schema (nguồn sự thật)
src/themes/       8 preset: obsidian, whiteboard, sketchbook, chalkboard, blueprint, ivory, neon, drafting
src/deck/         khung deck, sân khấu 16:9, điều hướng, nhịp, store, chế độ cuộn, API QA
src/layouts/      cover, split, split-right, center, grid, full, references
src/blocks/       23 block (metric, chart, waffle, gauge, dimension, simulation, diagram, lottie, code, math, gallery, video…)
src/motion/       GSAP, nhịp vào slide, bộ vẽ nét 2D (draw.ts: nét tự vẽ, bút tay, đường nối, số giữ định dạng)
src/three/        canvas R3F, đạo diễn cảnh, camera Theatre.js, hậu kỳ, 13 cảnh dữ liệu
src/threeui/      ThreeUI + Spline (lớp DOM)
src/hud/          thanh trên, chấm điều hướng, tổng quan, ghi chú, nguồn, trợ giúp, presenter
scripts/          validate, qa, scaffold, find-image, assets:pull, script, use-example
examples/         8 deck mẫu nhiều chủ đề
docs/             verification.md · ai-appendix.md · qa-3c.md · quiz.md · HISTORY.md (mẫu điền)
.github/          workflows/deck.yml (CI: validate + build + QA ảnh) · copilot-instructions.md
```
Luật cho AI cộng tác: `AGENTS.md`. Giấy phép bên thứ ba: `THIRD_PARTY_NOTICES.md`.
