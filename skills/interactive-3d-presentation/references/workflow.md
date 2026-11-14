# Quy trình làm việc (một người + agent)

Skill dành cho **một người tự "vibe code" bài thuyết trình cùng agent**. File này nói cách làm việc qua nhiều buổi cho
gọn, không mất việc và không để AI làm thay phần phải hiểu. (Làm theo nhóm: tự tuỳ biến thêm phân công, review, khoá
nội dung cho nhóm mình — skill không áp đặt.)

## 1. Nhịp làm việc mỗi buổi
1. **Đầu buổi**: agent đọc `AGENTS.md`, `src/content/brief.ts`, mục cuối `docs/HISTORY.md` → nhắc lại user đã chốt gì,
   còn treo gì, rồi hỏi hôm nay làm gì.
2. **Làm theo lát mỏng**: mỗi lần 1–3 slide → `npm run validate` → xem trên `npm run dev` (hoặc ảnh `npm run qa -- --only n`)
   → user duyệt → làm tiếp. Không dựng cả 15 slide rồi mới cho xem.
3. **Thay đổi lớn** (ý chính, số mới, hình mang thông tin, đổi theme) → phiếu phản biện (`ai-critique.md`) trước.
4. **Cuối buổi**: `npm run validate`, `npm run script`; ghi `docs/HISTORY.md`; nếu dùng Git thì commit.

## 2. Bản nháp A/B/C khi chưa chắc phong cách
User phân vân → agent dựng **2–3 slide tiêu biểu** (bìa + 1 slide số liệu + 1 slide hình) và cho xem bằng
`?theme=obsidian`, `?theme=ivory`… hoặc ảnh `npm run qa -- --theme a,b,c --only 1,3,5`. User chọn → ghi vào `brief.ts`
→ mới làm cả deck. Không đổi theme giữa chừng.

## 3. Lời nói của chính user
- Agent soạn **dàn ý + câu chuyển + gợi ý ví dụ**; user viết lại lời nói bằng giọng mình (hoặc agent viết nháp và
  user sửa). Không giao toàn bộ kịch bản cho AI nếu bài có chấm điểm (`ai-disclosure.md`).
- Sau mỗi lần sửa nội dung: agent hỏi 1–2 câu kiểm tra hiểu bài (`ai-critique.md` §4).
- Tập: `npm run script` → đọc to, bấm giờ thật; P mở cửa sổ người nói; luyện `docs/qa-3c.md`.

## 4. Nhật ký `docs/HISTORY.md` & chuyển sang chat mới
Cuộc trò chuyện dài sẽ đầy ngữ cảnh. Agent ghi một mục sau mỗi buổi dài, và **mục "Bàn giao"** khi sắp chuyển chat/AI:
```markdown
## dd/mm/yyyy: <đợt việc>
- Đã chốt / đã làm: …  (không thêm số liệu mới / thêm số X — đã kiểm chứng)
- Còn treo: …
## Bàn giao sang chat mới
- Đã chốt: theme …, luận điểm …, số slide …
- Việc tiếp theo: 1. … 2. …
- Link deck đã deploy:
```
Chat mới: "Đọc `AGENTS.md` và mục cuối `docs/HISTORY.md` rồi làm tiếp."

## 5. Dùng nhiều AI
- Một file luật cho mọi AI: `AGENTS.md` (`CLAUDE.md`, `GEMINI.md`, `.github/copilot-instructions.md` trỏ về nó). AI trên
  web (ChatGPT, Gemini web): dán `AGENTS.md` + `ai-critique.md` vào đầu cuộc trò chuyện.
- Nhờ AI thứ hai review → AI chính phản biện lại từng điểm, mở nguồn trước khi nhận (`ai-critique.md` §5).

## 6. Git & GitHub (tuỳ chọn, khuyên dùng)
```bash
git init && git add -A && git commit -m "deck: khởi tạo"      # lần đầu
git add -A && git commit -m "slide 6: thêm số liệu xuất khẩu 2024"  # mỗi khi xong một lát
```
- Commit cả `SCRIPT.md` (sinh từ notes) để thấy lời nói thay đổi ra sao.
- Đẩy lên GitHub: workflow `.github/workflows/deck.yml` tự chạy validate + build + QA ảnh (tải ảnh ở mục Artifacts).
- Deploy: Vercel/Netlify (import repo, build `npm run build`, thư mục `dist`), hoặc GitHub Pages.
- Không có Git: `npm run use-example` vẫn sao lưu nội dung vào `.content-backup/` trước khi ghi đè.

## 7. Trước buổi thuyết trình
- 1–2 ngày trước: **ngừng thêm nội dung**, chỉ sửa lỗi (chính tả, số sai, đè chữ). Chạy `submission-checklist.md`.
- Chuẩn bị bản dự phòng: `npm run build:single` → `dist-single/index.html` chép USB (mở bằng double-click, không cần mạng).
- Thử trên máy chiếu thật; D đổi sáng/tối nếu phòng sáng.
