# Hỏi đáp, phản biện & quiz

Thuyết trình tốt chưa đủ: người nói phải trả lời được câu hỏi **không cần AI, không cần nhìn tài liệu**. Agent chuẩn bị
`docs/qa-3c.md` và (nếu cần) `docs/quiz.md` trong deck.

## 1. Ngân hàng câu hỏi 3C
Mỗi câu hỏi nhắm vào một người nói và slide cụ thể, gồm ba lớp:
- **Context** — bối cảnh/dữ liệu chính bạn trình bày ("Slide 4 nói doanh thu A lớn hơn GDP B…").
- **Concept** — khái niệm chuyên môn đứng sau ("GDP đo giá trị gia tăng, doanh thu đo tổng bán ra").
- **Conflict** — mâu thuẫn logic/thực tiễn người hỏi sẽ xoáy vào ("Vậy so hai số đó có khập khiễng không?").
```markdown
### Câu n: <chủ đề> (nhắm vào <người> – slide x, y)
- Context: …
- Concept: …
- Conflict: … (có số/trang)
- Gợi ý trả lời: <hướng + trang/nguồn>
- Câu trả lời mẫu (<tên>): > "Cảm ơn câu hỏi. Bạn đúng ở chỗ … Mình muốn làm rõ … Theo <nguồn, trang> … Vì vậy quan điểm của mình là …"

| Câu | Người trả lời chính | Slide | Khái niệm cốt lõi | Mâu thuẫn trọng tâm |
```
Cấu trúc câu trả lời: **cảm ơn → thừa nhận điểm đúng → làm rõ → số/trang → quan điểm**. Agent soạn 2–3 câu cho mỗi người
nói, ưu tiên các slide có số liệu so sánh, khái niệm dễ nhầm, kết luận mạnh. Người nói tập trả lời to, không đọc.

## 2. Câu hỏi mở cho khán giả
Câu hỏi mở (khảo sát nhanh, kêu gọi hành động) thường được đánh giá cao hơn quiz. Mẫu ghi chú:
`[Chờ 5 giây. Mời một bạn, tối đa 20 giây. Nếu lớp im lặng thì nêu ba kịch bản trên màn hình rồi đi tiếp.]`
Đặt câu hỏi mở ở slide 2 (đặt vấn đề), kết luận quay lại trả lời nó.

## 3. Quiz (Kahoot, Quizizz, Mentimeter…)
```markdown
# Câu hỏi quiz (N câu, khoảng X phút)
Đáp án đúng in đậm. Nguồn/trang ghi sau mỗi câu. Thiếu giờ thì bỏ câu a, b.
1. <câu hỏi>? A. … B. **…** C. … D. … (nguồn: id, tr. N)
```
- 5–10 câu, ≤ 5 phút. Mỗi câu có nguồn/trang. Câu về số liệu hỏi **số đó đo cái gì**, không chỉ hỏi giá trị.
- Quiz chỉ là tương tác mức thấp; luôn kèm một yếu tố **mở** (câu hỏi thảo luận, khảo sát, lời kêu gọi).
- Mã QR/link quiz đặt ở slide riêng (`image` block là ảnh QR có credit "tạo bởi <công cụ>").

## 4. Slide dự phòng
Slide nguồn (`references`) và các slide phụ lục số liệu **không đọc**, chỉ mở khi được hỏi (phím O để nhảy nhanh,
`#n` để mở thẳng). Ghi chú của chúng: `[Slide dự phòng — chỉ mở khi được hỏi.]`.
