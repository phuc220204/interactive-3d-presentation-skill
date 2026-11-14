# Nguồn & kiểm chứng

Số liệu sai hoặc nguồn bịa làm mất uy tín cả bài, dù hình đẹp đến đâu. Agent **không đưa số, năm, tên văn bản, trích dẫn
từ trí nhớ**. Mỗi thông tin quan trọng phải được mở tận nguồn.

## 1. Bậc nguồn
| Bậc | Gồm | Dùng thế nào |
|---|---|---|
| **Bậc 1 — Gốc** | giáo trình/tài liệu môn (ghi số trang in), văn bản pháp luật & văn kiện trên cổng chính thống, thống kê nhà nước, tổ chức quốc tế (World Bank, IMF, UN, WHO…), báo cáo thường niên của chính tổ chức, bài báo khoa học có DOI | luận cứ chính |
| **Bậc 2 — Dẫn lại** | tạp chí có ISSN, báo của cơ quan nhà nước/báo lớn | chỉ khi không mở được bản gốc; ghi rõ "Dẫn lại" và bản gốc là gì |
| **Cấm làm luận cứ** | Wikipedia, blog cá nhân, mạng xã hội, diễn đàn, Medium, trang tổng hợp không rõ tác giả, trang chia sẻ tài liệu, **nội dung/số liệu do AI sinh** | không dùng |
Lưu ý: **Wikimedia Commons** (kho ảnh có giấy phép) khác **Wikipedia** (bách khoa). Ảnh từ Commons dùng được kèm credit;
dữ kiện từ Wikipedia thì không. Bài học thuật: `deck.bannedDomains` + `deck.academic: true` để validator chặn.

## 2. Luật chọn số
- Dùng **số mới nhất của nguồn bậc cao nhất**. Có số mới mà dùng số cũ là lỗi.
- Hai nguồn lệch nhau → chọn nguồn gốc, ghi lý do trong bảng kiểm chứng.
- Mỗi số có **năm và đơn vị**. Không so hai số khác mẫu số/khác thước đo như thể cùng loại
  (vd. doanh thu công ty vs GDP — phải nói rõ là hai đại lượng khác nhau).
- Suy luận của người làm phải **nói là suy luận**, không gán cho văn bản.
- Trích nguyên văn: để trong ngoặc kép, ghi trang. Ghi rõ bản PDF/ấn bản đang dùng (số trang PDF có thể lệch số trang in).
- Số trên hình (cột 3D, biểu đồ) phải là số đã có nguồn trên slide — hình không được mang số mới.

## 3. Thêm một số mới = sửa đủ 3 chỗ trong cùng một lần
1. `docs/verification.md` — dòng kiểm chứng: giá trị · nguồn · Gốc/Dẫn lại · link · ngày mở.
2. `src/content/sources.ts` — entry APA (`id`, `short`, `apa`, `url`, `kind`, `page?`, `use?`).
3. Slide — `source: 'id'` trên metric/chart hoặc `[số](^id)` trong chữ (bấm được, K soi nguồn).

## 4. Bảng kiểm chứng (`docs/verification.md` trong deck)
```markdown
Trạng thái: **Gốc** = đọc ở nơi phát hành; **Dẫn lại** = đọc qua báo/tạp chí, chưa mở bản gốc.
Các link do agent mở bằng công cụ đọc web → **người làm phải tự mở lại từng link và đối chiếu từng số trước khi nộp.**

| Số liệu / trích dẫn | Giá trị | Nguồn (id) | Trạng thái | Link | Ngày mở |
|---|---|---|---|---|---|
| GDP Việt Nam 2024 | 476,3 tỷ USD | wb2025 | Gốc | https://… | 2026-11-14 |

## Bẫy đã phát hiện (người nói phải biết)
- Hai số khác mẫu số: …
- Cụm từ bị gán sai văn bản: …
- Báo diễn đạt lệch số gốc: …
## Đã bỏ khỏi slide (và lý do)
- … (không ghi năm khảo sát / cỡ mẫu)
## Điểm AI khác đưa ra sai, đã kiểm
- …
```

## 5. Quy trình agent khi tìm số
1. Tìm bằng công cụ web của agent, ưu tiên bậc 1.
2. **Mở trang**, tìm đúng con số, đúng năm, đúng đơn vị; chụp lại câu chứa số (trích ngắn) vào cột ghi chú nếu cần.
3. Không mở được / trang cần đăng nhập → ghi "chưa kiểm chứng được", báo user, không dùng.
4. Ghi đủ 3 chỗ (mục 3). Chạy `npm run validate` (bắt id thiếu, miền cấm, URL không https).
5. Khi bàn giao: liệt kê các dòng "Dẫn lại" và các số user phải tự mở lại.
