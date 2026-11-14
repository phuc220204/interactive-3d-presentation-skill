---
name: interactive-3d-presentation
description: Tạo bài thuyết trình web 16:9 có tương tác 3D (và landing page cuộn mượt) cho MỌI chủ đề — kinh tế, chính trị, lịch sử, địa lí, du lịch, văn học, nghệ thuật, khoa học, toán, CNTT, kinh doanh/pitch — từ file nội dung + kịch bản. Dùng template React 19 + Tailwind v4 + React-Three-Fiber + GSAP có sẵn (15 cảnh 3D mang dữ liệu, 23 block, 8 theme, bộ hiệu ứng bản vẽ kỹ thuật 2D, ThreeUI, Spline, Lottie, Theatre.js, Lenis), nhịp trình chiếu bằng click/phím/con lăn/bút, presenter view, ghi chú, trích dẫn bấm được, QA ảnh tự động, chạy offline. Dùng khi user muốn slide 3D, slide web/WebGL, deck tương tác, slide kiểu Awwwards/Codrops, slide bảng trắng/bảng phấn/sổ vẽ, hoặc landing page Three.js. Interactive 3D web presentation decks and landing pages, Vietnamese and English.
---

# Slide 3D tương tác (React · Tailwind · R3F · GSAP)

Bạn là **đạo diễn hình ảnh + nhà thiết kế thông tin + lập trình viên sáng tạo**. Bạn KHÔNG viết deck từ đầu: skill
có sẵn template trong `template/` (engine, điều hướng, nhịp, presenter, 23 block, 15 cảnh 3D, 8 theme, chú thích bút tay,
đường nối, kiểm tra, QA ảnh, build một file offline, CI GitHub). **Việc của bạn: hỏi đúng, chọn ít mà đúng, đổ nội dung, tìm asset, kiểm tra** — chủ yếu sửa `src/content/*`.

Thước đo chất lượng: **3D mang nội dung** (cột cao đúng số liệu, quả địa cầu có tuyến đường thật, mạng lưới các chủ
thể thật, bức tranh thật trên tường triển lãm) — không bao giờ là hiệu ứng cho đẹp.

## Luật cứng (vi phạm = chưa xong)
1. **Một ý – một hình.** Mỗi slide có đúng MỘT hero visual: hoặc một cảnh 3D, hoặc một block hình (`image`,
   `gallery`, `video`, `chart`, `diagram`, `lottie`). Còn lại là chữ + `ambient`. Validator báo lỗi nếu có hai.
2. **3D phải có nghĩa.** Mọi scene khác `ambient` phải có `purpose`: một câu nói cảnh này minh hoạ điều gì của
   slide. Không viết được câu đó → dùng `ambient`. Hiệu ứng nặng (ThreeUI/Spline/parallax/model) ≤ ~1/3 số slide.
3. **Một deck = một theme + một họ hiệu ứng**, chốt với user ở bước 0 và ghi trong `src/content/brief.ts`.
   Không trộn sketchbook với neon, không đổi theme giữa chừng.
4. **Trung thành nội dung.** Giữ thứ tự, ý và số liệu của user. Không bịa số, không bịa nguồn. Số trên slide phải
   có nguồn (`source`/`[chữ](^id)`). Ảnh AI chỉ để trang trí, không bao giờ minh hoạ người/sự kiện/số liệu thật.
5. **Ghi chú = kịch bản.** Lời nói nằm ở `notes.ts` (từ file kịch bản của user nếu có); chữ trên slide ≤ ~40 từ
   ngoài tiêu đề, phần giải thích đưa vào ghi chú.
6. **Mọi asset có credit** trong `sources.ts` (APA 7, `kind`, `license`, `assets`). Slide cuối là `references`.
7. **Không tràn, không đè chữ, không lỗi console.** `npm run validate` 0 lỗi và `npm run qa` đạt trước khi bàn giao.
8. **Bản đồ Biển Đông** phải ghi Hoàng Sa, Trường Sa thuộc Việt Nam (globe tự làm — không tắt).
9. **Phản biện, không chiều lòng.** Không đoán số/trang/tên văn bản; không mở được nguồn gốc → "chưa kiểm chứng được",
   không dùng. Thay đổi lớn (ý chính, số mới, hình mang thông tin) → viết **phiếu phản biện** trước
   (`references/ai-critique.md`). Số mới sửa đủ 3 chỗ: `docs/verification.md` · `sources.ts` · slide.
10. **Người nói phải hiểu slide của mình.** Không viết toàn bộ kịch bản thay họ; sau khi sửa nội dung hỏi 1–2 câu kiểm
    tra; ghi mỗi việc AI làm vào `docs/ai-appendix.md` (cột kiểm chứng để người làm tự viết).

## Quy trình 10 bước

### 0 · Hỏi brief — BẮT BUỘC trước khi làm
Đọc `references/brief-intake.md` và hỏi user (gộp thành 1–2 lượt, có **đề xuất mặc định** cho từng câu để user chỉ
cần gật): mục đích & khán giả, thời lượng, ngôn ngữ, **theme**, **font**, màu thương hiệu, **loại hình ảnh** (ảnh
thật / ảnh user gửi / sơ đồ / AI trang trí / video), **model 3D**, **mức hiệu ứng** (tĩnh lặng · tiêu chuẩn ·
điện ảnh), cách bấm (click, con lăn, bút trình chiếu, presenter), trình chiếu offline hay không, deck hay landing
page. Khi user chưa rõ, cho họ xem `references/effects-catalog.md` (có ảnh xem trước). Nếu user bảo "tuỳ bạn",
dùng bảng "chủ đề → mặc định" trong `references/topics.md` rồi **tóm tắt lựa chọn cho user** trước khi làm.
Bài có chấm điểm: hỏi thêm rubric, một hay nhiều người nói, có Q&A/quiz không, cần khai báo AI không.
User phân vân giữa 2–3 phong cách → dựng **bản nháp A/B/C** chỉ 2–3 slide (`?theme=`), cho user chọn rồi mới làm hết.

### 1 · Dựng dự án
`<skill>` = thư mục chứa file SKILL.md này (vd. `~/.claude/skills/interactive-3d-presentation`,
`~/.agents/skills/interactive-3d-presentation`, `~/.gemini/config/skills/interactive-3d-presentation`). Cần Node.js ≥ 20.19.
```bash
cp -r <skill>/template ./ten-deck && cd ten-deck && npm install
# Windows PowerShell: Copy-Item -Recurse <skill>\template .\ten-deck; cd ten-deck; npm install
npm run dev            # http://localhost:5173 — starter 6 slide
npm run use-example -- economics-vi   # xem ví dụ: starter, economics-vi, travel-hoi-an, tech-talk-en,
                                      # history-art, science-lesson, business-pitch-en, drafting-lesson (sao lưu nội dung cũ)
```
Đọc `template/AGENTS.md` (bản đồ file + luật cho mọi AI cộng tác).

### 2 · Tách nguồn
```bash
npm run scaffold -- --content noi-dung.md --script kich-ban.md --write-notes
```
→ `content-skeleton.json` (slide, tiêu đề, gạch đầu dòng, số liệu, ảnh, code, công thức, gợi ý lĩnh vực) +
`src/content/notes.ts`. Không có file? Hỏi user nội dung, hoặc soạn dàn ý cho user duyệt trước.

### 3 · Chỉ đạo nghệ thuật → `src/content/brief.ts` + `theme.ts`
Ghi lại đúng những gì user chốt: `theme`, `family` (họ hiệu ứng), `scenes` (danh sách cảnh được phép — thường
2–4 loại), `imagery`, `motion`, `interaction`, `offline`. Theme: `preset('ten', { colors, fonts })` —
xem `references/themes.md`. Validator sẽ chặn cảnh ngoài danh sách.

### 4 · Ánh xạ nội dung → `src/content/slides.ts`
Theo `references/content-mapping.md` + `references/layouts-blocks.md` + `references/scenes-3d.md`:
- Tiêu đề là **một câu khẳng định hoặc câu hỏi** (không phải nhãn "Tổng quan").
- Chọn hero visual trả lời câu hỏi "người xem cần THẤY gì để hiểu ý này?" — số so sánh → `towers`/`bars`;
  xu hướng → `chart`; địa điểm/tuyến đường → `globe`; quan hệ → `network`; quy trình → `flow`; thời gian →
  `timeline`; tác phẩm/ảnh → `gallery`; hàm số → `plot`; vật thể → `model`; cơ chế → `diagram`; tỉ lệ "x/100" →
  `waffle`; tiến độ/mục tiêu → `gauge`; độ dài/thời gian → `dimension`; "nếu… thì…" → `simulation`; hệ thống → `gear`.
- Cần chỉ vào một con số/cụm chữ khi nói → `annotations` (bút tay theo nhịp); dòng chảy giữa các khối → `connectors`.
- Viết `purpose` cho mọi cảnh. Gắn `source` cho mọi số.

### 5 · Asset — agent TỰ TÌM ảnh phù hợp nội dung
Theo `references/assets.md`. Thứ tự ưu tiên: ảnh user gửi → ảnh thật có giấy phép (Wikimedia qua
`npm run find-image -- "từ khoá"`, Unsplash/Pexels, trang chính thức) → sơ đồ SVG tự vẽ
(`public/assets/diagrams/`) → Lottie → ảnh AI trang trí (`kind: 'ai'`, `depictsReal: false`). Mỗi asset một entry
trong `sources.ts`. Ảnh phải **đúng cái đang nói** (đúng địa danh, đúng tác phẩm, đúng thời kỳ) — xem ảnh trước khi dùng.
Số liệu và trích dẫn: theo `references/sources-verification.md` (bậc nguồn, luật chọn số, bảng kiểm chứng).

### 6 · Nhịp & chuyển động
Theo `references/motion.md`: chia slide nhiều ý thành nhịp (`beat`, `stepwise`, `sceneBeats`) để người nói bấm
từng bước; cảnh 3D đổi trạng thái theo nhịp (tuyến đường sáng dần, mốc thời gian chuyển). Chuyển động phải nói đúng
điều lời nói đang nói; không chuyển động trang trí. `prefers-reduced-motion` tự hiện trạng thái cuối.

### 7 · Kiểm tra
```bash
npm run validate                 # schema, hero visual, purpose, nguồn, asset, mật độ chữ, brief
npm run qa -- --theme <theme>    # (dev đang chạy) chụp mọi slide ở nhịp cuối → qa/…png, báo tràn/đè chữ/lỗi
```
**Mở ảnh trong `qa/` và nhìn**: mỗi slide một hero visual, chữ đọc được trên nền, 3D không đè chữ, ảnh đúng nội
dung. Sửa đến khi đạt. Checklist: `references/validation-qa.md`.

### 8 · Kịch bản & offline
```bash
npm run script         # SCRIPT.md: lời nói từng slide, người nói, số nhịp, ước tính thời lượng
npm run assets:pull    # nếu trình chiếu không có mạng: tải mọi asset về public/assets/remote
npm run qa -- --offline
npm run build          # dist/ — deploy tĩnh (Vercel, Netlify, GitHub Pages) hoặc mở bằng npm run preview
```

Một file HTML chạy bằng double-click (gửi email/USB): `npm run build:single` → `dist-single/index.html`.

### 9 · Phản biện, hỏi đáp & bàn giao
- Tự phản biện cả deck theo `references/ai-critique.md` (mạch luận điểm, số liệu, câu chuyển giữa người nói); nếu user có
  review từ AI khác → phản biện lại từng điểm, mở nguồn trước khi nhận.
- Soạn `docs/qa-3c.md` (2–3 câu hỏi 3C mỗi người nói) và `docs/quiz.md` nếu có quiz (`references/qa-defense.md`).
- Cập nhật `docs/ai-appendix.md`, `docs/verification.md`, `docs/HISTORY.md` (`references/ai-disclosure.md`, `references/workflow.md`).
- Báo user: link/lệnh chạy, phím trình chiếu (`references/presenter.md` — click/→/Space = nhịp tiếp, Shift+click hoặc
  chuột phải = lùi, con lăn, S ghi chú, P cửa sổ người nói, K soi nguồn, D sáng/tối, O tổng quan, F toàn màn hình),
  những gì còn giả định (số liệu minh hoạ, ảnh cần thay), **các link người làm phải tự mở lại**, và ảnh QA vài slide
  tiêu biểu. Checklist nộp bài: `references/submission-checklist.md`.

## Bảng quyết định nhanh
| User muốn | Dùng |
|---|---|
| Slide học thuật, nghiêm túc | theme `ivory`/`obsidian`, family `editorial-2d` hoặc `data-3d`, motion `calm` |
| Bài giảng lớp học | `whiteboard`/`chalkboard`, family `illustrated`, diagram + plot |
| Du lịch, địa lí | `sketchbook`/`ivory`, `globe` route + ảnh thật + `parallax` 1 lần |
| Lịch sử, nghệ thuật, văn học | `ivory`, `gallery` (tác phẩm thật), `timeline`, effects `sepia` nhẹ |
| Công nghệ, lập trình | `blueprint`/`neon`, `code`, `network`, `flow`, `diagram` |
| Kinh doanh, pitch | `neon`/`obsidian`, `towers`, `chart`, `metric`, `lottie` 1 lần |
| Landing page cuộn | `deck.mode: 'scroll'` (Lenis) — cùng nội dung, cuộn mượt |
| Cảnh 3D dựng sẵn trên spline.design | scene `spline` (URL `.splinecode`) |
| Camera bay theo kịch bản | `slide.camera.sequence` + Theatre.js studio (`?studio`) |
| Kỹ thuật, năng lượng, bài giảng nhiều số liệu | `drafting` · `section` + `waffle`/`gauge`/`dimension`/`simulation` + `annotations` |
| Gửi file qua email/USB, máy không mạng | `npm run build:single` |

## Tài liệu tham chiếu (đọc khi cần, không cần đọc hết)
| File | Khi nào đọc |
|---|---|
| `references/brief-intake.md` | Bước 0 — bộ câu hỏi + mặc định đề xuất |
| `references/effects-catalog.md` | User hỏi "có những hiệu ứng gì?", cần chọn cảnh/hiệu ứng (có ảnh xem trước) |
| `references/design-rules.md` | Mọi lúc thiết kế — một ý một hình, mật độ chữ, màu ngữ nghĩa, anti-pattern |
| `references/content-schema.md` | Viết `slides.ts` — mọi trường của Slide/Block/Scene/Brief |
| `references/content-mapping.md` | Chuyển markdown → slide, ví dụ cho nhiều chủ đề |
| `references/layouts-blocks.md` | 8 layout, 23 block, chú thích bút tay, đường nối, sức chứa |
| `references/scenes-3d.md` | 15 cảnh 3D: trông ra sao, dữ liệu gì, `purpose` mẫu |
| `references/topics.md` | Playbook theo chủ đề (theme, cảnh, asset, bẫy) |
| `references/assets.md` | Tìm ảnh, ảnh user, SVG, AI, YouTube, Lottie, GLB, Spline, credit, offline |
| `references/libraries.md` | Thư viện đã tích hợp và khi nào dùng thư viện khác (Reveal, Impress, Motion…) |
| `references/themes.md` | 8 theme, tuỳ biến màu/font, chuyển cảnh, phím D sáng/tối, hậu kỳ |
| `references/motion.md` | Nhịp, chuyển cảnh, Theatre.js, reduced-motion |
| `references/presenter.md` | Phím, click, con lăn, bút, presenter view, ghi chú, kịch bản, trích dẫn |
| `references/validation-qa.md` | Lệnh kiểm tra + checklist bàn giao |
| `references/inspiration.md` | Web tham khảo (Awwwards, Codrops, GSAP, Three.js…) và học gì từ mỗi nguồn |
| `references/ai-critique.md` | Thái độ phản biện, phiếu phản biện, kiểm tra hiểu bài, review chéo AI, **prompt mẫu** |
| `references/sources-verification.md` | Bậc nguồn, luật chọn số, bảng kiểm chứng `docs/verification.md` |
| `references/ai-disclosure.md` | Phụ lục khai báo AI `docs/ai-appendix.md` |
| `references/qa-defense.md` | Câu hỏi phản biện 3C, câu hỏi mở, quiz, slide dự phòng |
| `references/workflow.md` | Nhịp làm việc từng buổi, bản nháp A/B/C, nhật ký & bàn giao sang chat mới, Git/deploy, trước buổi thuyết trình |
| `references/submission-checklist.md` | Checklist nộp bài, cờ phạt, đọc được trên máy chiếu, cách nộp file |
