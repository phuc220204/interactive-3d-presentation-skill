# Checklist nộp bài & trình chiếu

## 1. Checklist 10 mục (bài có chấm điểm)
1. Bám đúng yêu cầu/chuẩn đầu ra của đề (đọc lại đề, rubric).
2. Có **luận điểm chính** rõ ràng, không chỉ diễn giải tài liệu. Mỗi slide phục vụ luận điểm.
3. Đúng quy chuẩn hình thức (số slide, thời lượng, ngôn ngữ).
4. Có bìa đủ thông tin (nhóm, thành viên, mã số, lớp, giảng viên, ngày) và slide tài liệu tham khảo riêng.
5. Trích dẫn APA 7 (hoặc chuẩn đề yêu cầu), nguồn chính thống.
6. Không dính lỗi nặng (mục 2).
7. Đủ phụ lục AI (`ai-disclosure.md`), cột kiểm chứng do người làm tự viết.
8. Đã tập, bấm giờ thật, không quá giờ (ước tính `SCRIPT.md` ≠ thời gian thật).
9. Tự giải thích được mọi slide (nhiều người nói: phân công rõ, ai cũng giải thích được phần mình).
10. Mọi hình, bảng, sơ đồ có nguồn.

## 2. Mẫu "cờ phạt" thường gặp (điều chỉnh theo rubric thật của user)
| Mức | Ví dụ |
|---|---|
| **ĐỎ** (mất điểm cả phần) | đạo văn toàn phần; AI tạo toàn bộ nội dung không kiểm chứng; người nói không giải thích được khi hỏi; bịa nguồn |
| **CAM** (trừ nặng) | nguồn không chính thống làm luận cứ chính; đạo văn một phần; dùng AI đáng kể không khai báo; trích cắt xén sai ý |
| **VÀNG** (trừ nhẹ) | nhầm khái niệm/số; lỗi APA; khai báo AI chưa đủ; dùng số cũ khi đã có số mới |
Agent hỏi user rubric thật ở bước 0 (`brief-intake.md`) và ghi các cờ riêng của môn vào `brief.notes`.

## 3. Việc người làm phải tự làm trước khi nộp
1. Mở lại từng link trong `docs/verification.md`, đối chiếu số — ưu tiên dòng "Dẫn lại".
2. Đọc tài liệu gốc, đối chiếu mọi trích dẫn (tên tác giả, nhà xuất bản trên bìa, trang).
3. Tự chốt phần "quan điểm của mình"; sửa kịch bản cho hợp giọng nói của mình.
4. Điền thông tin bìa (`meta` slide cover), chạy `npm run build` (hoặc `build:single`).
5. Hoàn thiện phụ lục AI (`docs/ai-appendix.md`).
6. Tập đến khi trả lời được `docs/qa-3c.md` không cần nhìn.
7. **Thử trên máy chiếu thật**: độ sáng, màu (theme sáng/tối — phím D), cỡ chữ cuối phòng, âm thanh video, bút trình chiếu.

## 4. Đọc được trên máy chiếu
- Chữ nhỏ nhất ≥ 15 px ở sân khấu 1600 px (template dùng sân khấu 1920 → ≥ 18 px). Không dùng `muted` cho thông tin chính.
- Tương phản chữ thường ≥ 4,5 : 1 (máy chiếu làm nhạt màu; bài thật đã phải nâng màu phụ từ 3,97 lên 5,4).
- Xem lại ở mọi biến thể màu sẽ dùng (`npm run qa -- --theme a,b`).

## 5. Nộp file
- Web: `npm run build` → deploy `dist/` (Vercel/Netlify/GitHub Pages) → gửi link.
- Một file chạy offline: `npm run build:single` → `dist-single/index.html` (gửi email, chép USB, mở bằng double-click).
- Kịch bản: `SCRIPT.md`; phụ lục AI, câu hỏi 3C, quiz: thư mục `docs/` (xuất PDF nếu cần).
