# Khai báo sử dụng AI (Phụ lục AI)

Nhiều môn học/tổ chức yêu cầu khai báo dùng AI. Không khai báo, hoặc AI làm toàn bộ mà người làm không giải thích được,
thường bị phạt nặng nhất. Agent **giữ sổ khai báo trung thực** trong `docs/ai-appendix.md` của deck.

## 1. Mẫu Phụ lục AI
```markdown
# Phụ lục: Sử dụng AI
**Cam kết:** Chúng tôi đã sử dụng AI một cách liêm chính và đã tự kiểm chứng tất cả thông tin quan trọng dưới đây.

| Nhiệm vụ (người làm: việc) | Công cụ AI | Prompt / câu lệnh chính | Kết quả AI cung cấp (tóm tắt) | Cách kiểm chứng & sử dụng (người làm TỰ VIẾT) | Minh chứng (link chat/commit) |
|---|---|---|---|---|---|
| Lan: rút gọn lời nói slide 5 | Claude Code | "Rút lời nói slide 5 còn 1 phút…" | Bản rút gọn 140 âm tiết | Đọc to bấm giờ 58 s, sửa 2 câu cho hợp giọng | commit abc123 |

## Quyết định do người làm đưa ra sau khi phản biện bản AI
- …
## Góp ý của người làm cho bản AI
- …
## Ví dụ kiểm chứng (AI sai so với nguồn gốc)
- AI đưa "x%" không nguồn → đã bỏ, thay bằng số thống kê chính thức (link).
```

## 2. Luật
- **Cột "Cách kiểm chứng & sử dụng" do người làm tự viết** — agent không điền hộ (agent chỉ để trống hoặc ghi "chờ <tên>
  viết"). Ghi rõ: đã mở link nào, đọc trang nào, đã sửa gì so với bản AI.
- Mỗi dòng bắt đầu bằng **tên người làm**. Cột minh chứng: link chat hoặc commit/PR.
- Agent thêm một dòng **sau mỗi việc đáng kể** nó làm (soạn dàn ý, viết lời nói, tìm nguồn, tạo hình, review).
  Việc thuần kỹ thuật (sửa layout, chạy QA) không cần ghi.
- Ảnh tạo bởi AI: ghi trong phụ lục **và** trong `sources.ts` (`kind: 'ai'`, `depictsReal: false`) — deck tự gắn nhãn.

## 3. Bài học
- **AI không được viết toàn bộ kịch bản.** Agent soạn dàn ý, câu chuyển, gợi ý ví dụ; người nói viết lại bằng lời của
  mình. "AI viết toàn bộ" thường bị chấm 0 cho tiêu chí dùng AI.
- Slide "khai báo AI" trong deck là **tuỳ chọn**; phụ lục thường là file riêng nộp kèm (xuất từ `docs/ai-appendix.md`
  sang PDF/Docs).
- Tự kiểm phụ lục: người làm tự tích các mục, không ai tích hộ.
