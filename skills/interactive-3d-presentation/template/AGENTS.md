# AGENTS.md — luật cho mọi AI cộng tác trong dự án deck này

Dự án là một bài thuyết trình web 16:9 có 3D tương tác (React 19 · Tailwind v4 · React-Three-Fiber · GSAP), dựng từ
template của skill *interactive-3d-presentation*. Đọc file này trước khi sửa bất cứ thứ gì.

## Bản đồ
| Đường dẫn | Là gì | Sửa khi làm deck? |
|---|---|---|
| `src/content/slides.ts` | `deck` (meta) + `slides[]` | **có** — phần chính |
| `src/content/notes.ts` | lời nói từng slide (kịch bản) | **có** |
| `src/content/sources.ts` | nguồn APA + credit mọi asset | **có** |
| `src/content/theme.ts` | `preset('ten', overrides)` | **có** |
| `src/content/brief.ts` | những gì user đã chốt (theme, họ hiệu ứng, cảnh được phép…) | chỉ khi user đổi ý |
| `src/content/theatre-state.json` | keyframe camera Theatre.js | khi soạn camera ở `?studio` |
| `public/assets/` | `diagrams/` SVG · `user/` ảnh user · `lottie/` · `parallax/` · `models/` · `remote/` (tự sinh) | **có** |
| `src/types.ts` | schema (nguồn sự thật cho mọi trường) | không |
| `src/deck`, `src/three`, `src/blocks`, `src/layouts`, `src/hud`, `src/motion`, `src/threeui` | engine | không, trừ khi sửa lỗi engine |
| `examples/` | 8 deck mẫu | không (đọc để học) |
| `docs/` | kiểm chứng số, phụ lục AI, câu hỏi 3C, quiz, nhật ký | **có** |
| `scripts/` | công cụ | không |

## Lệnh
```bash
npm run dev                       # http://localhost:5173  (?theme=ivory · ?mode=scroll · ?presenter · ?studio · ?threeui=Ten)
npm run validate                  # PHẢI 0 lỗi trước khi bàn giao
npm run qa -- --theme <theme>     # (dev đang chạy) chụp mọi slide ở nhịp cuối → qa/, báo tràn / đè chữ / lỗi console
npm run qa -- --offline           # chặn mạng: deck phải chạy đủ
npm run script                    # SCRIPT.md: lời nói + thời lượng ước tính
npm run assets:pull               # tải asset từ xa về public/assets/remote (trình chiếu offline)
npm run find-image -- "từ khoá"   # tìm ảnh Wikimedia Commons + sinh entry nguồn
npm run scaffold -- --content a.md --script b.md --write-notes
npm run use-example -- <tên>      # nạp deck mẫu (sao lưu nội dung hiện tại vào .content-backup/)
npm run build                     # dist/ tĩnh (đường dẫn tương đối)
npm run build:single              # một file dist-single/index.html chạy offline
```

## Luật
1. **Một ý – một hình.** Mỗi slide một hero visual: cảnh 3D *hoặc* một block hình (`image gallery video chart diagram lottie`).
2. **3D có nghĩa.** Mọi scene khác `ambient` có `purpose` một câu. Không viết được → `ambient`. Cảnh phải nằm trong `brief.scenes`.
3. **Một theme, một họ hiệu ứng** (theo `brief.ts`). Không thêm hiệu ứng "cho đẹp".
4. **Trung thành nội dung.** Không bịa số, nguồn, trích dẫn. Số trên slide có `source` hoặc `[chữ](^idNguon)`.
5. **Asset có credit**: mỗi ảnh/model/lottie/video có entry trong `sources.ts` (`kind`, `license`, `assets` hoặc `url`).
   Ảnh AI chỉ trang trí: `kind: 'ai'`, `depictsReal: false`. Ảnh user: `kind: 'user'`, file trong `public/assets/user/`.
6. **Chữ ít, lời nói nhiều**: ≤ ~40 từ ngoài tiêu đề; tiêu đề là câu khẳng định/câu hỏi; giải thích vào `notes.ts`.
7. **Màu qua `tone`/biến theme**, không mã màu cứng trong slide. SVG diagram dùng `var(--c-ink)`, `var(--c-accent)`… hoặc class `.d-*`/`.f-*`.
8. **Bản đồ Biển Đông** luôn ghi Hoàng Sa, Trường Sa (Việt Nam).
9. Sau mỗi thay đổi: `npm run validate`; trước bàn giao: `npm run qa` và **mở ảnh trong `qa/` để nhìn**.
10. **Thái độ phản biện**: không khen chiều lòng; không chắc thì nói không chắc; không đoán số/trang/tên văn bản. Thay đổi
    lớn (ý chính, số mới, hình mang thông tin) → viết phiếu phản biện trước (skill: `references/ai-critique.md`).
11. **Số mới sửa đủ 3 chỗ**: `docs/verification.md` · `sources.ts` · trên slide. Không mở được nguồn gốc → "chưa kiểm chứng
    được", không dùng.
12. **Khai báo AI**: mỗi việc đáng kể ghi một dòng vào `docs/ai-appendix.md`; cột kiểm chứng do người làm tự viết.
13. Sau khi sửa nội dung, hỏi user 1–2 câu về đúng chỗ vừa sửa. Ghi nhật ký vào `docs/HISTORY.md`.

## Tài liệu trong `docs/`
`verification.md` (kiểm chứng số) · `ai-appendix.md` (phụ lục AI) · `qa-3c.md` (câu hỏi phản biện) · `quiz.md` · `HISTORY.md`.
`CLAUDE.md`, `GEMINI.md`, `.github/copilot-instructions.md` đều trỏ về file này.

## Tương tác trình chiếu (đừng phá)
→ / Space / PageDown / click trái / bút trình chiếu = nhịp tiếp · ← / Shift+click / chuột phải = lùi · con lăn (1 cử chỉ
= 1 bước) · vuốt · S ghi chú · P cửa sổ người nói · K soi nguồn · D sáng/tối · O tổng quan · F toàn màn hình · T bấm giờ · ? trợ giúp.
Phần tử bấm được (bento, gallery, nút, link, `.cite`) không kích hoạt "nhịp tiếp".
