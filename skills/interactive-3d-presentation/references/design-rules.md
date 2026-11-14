# Luật thiết kế — để deck đẹp mà không rối mắt

## 1. Một ý – một hình
- **Mỗi slide phục vụ luận điểm chính.** Ý hay mà lệch luận điểm hoặc thiếu nguồn → để ngoài deck. Câu chốt mỗi
  phần nối về luận điểm. Thứ tự ưu tiên: yêu cầu/rubric → mạch lạc → sáng tạo.
- Mỗi slide trả lời **một** câu hỏi và có **một** hero visual. Tự hỏi: *người xem cần THẤY gì để hiểu ý này?*
  Hình trả lời câu đó là hero; mọi hình khác bỏ đi.
- Hero visual là **một** trong: cảnh 3D (`scene` khác `ambient`) · hoặc block hình (`image`, `gallery`, `video`,
  `chart`, `diagram`, `lottie`). Khi đã có block hình thì `scene: { name: 'ambient' }`.
- Ngoại lệ hợp lệ: layout `grid`/`center` đặt cảnh 3D mờ phía sau — vẫn chỉ nên có một thứ thu hút mắt.
- Ảnh nền (`slide.image`) là lớp không khí, không phải hero: đừng chồng thêm ThreeUI/parallax/model lên nó.
- Không có "watermark" 3D: sau biểu đồ, sơ đồ, bảng, ảnh… không được có vật thể trang trí chìm. `ambient` tự tắt trên các
  slide này; đừng thay `ambient` bằng `morph`/ThreeUI chỉ để "đỡ trống" — khoảng trống là có chủ đích.
- Validator: 2 block hình → lỗi; cảnh 3D + block hình trong `split/split-right/cover/full` → lỗi.

## 2. 3D phải mang nghĩa
- Viết `purpose` trước, chọn cảnh sau. Ví dụ tốt:
  - `towers` — "Chiều cao cột so sánh doanh thu Apple với GDP Việt Nam: một công ty lớn hơn cả một nền kinh tế."
  - `globe` — "Tuyến đường Hà Nội → Huế → Hội An sáng dần theo từng chặng của chuyến đi."
  - `gallery` — "Ba bức tranh thật của ba thời kỳ đặt cạnh nhau để thấy sự đổi màu."
- Ví dụ xấu (→ dùng `ambient`): "cho đẹp", "tạo không khí công nghệ", "hạt bay thể hiện sự năng động".
- Số trên cảnh 3D phải là số thật của slide (cùng nguồn). Cảnh minh hoạ ý niệm (`morph`, ThreeUI) không mang số.
- Hiệu ứng nặng (ThreeUI, Spline, parallax, model) tối đa ~1/3 số slide, không lặp cùng một hiệu ứng > 2 slide liền.

## 3. Chữ
- **Đọc được trên máy chiếu**: chữ nhỏ nhất ≥ 18 px ở sân khấu 1920 px; tương phản chữ ≥ 4,5 : 1 (máy chiếu làm nhạt
  màu); thông tin chính không dùng màu `muted`.
- `kicker` (dòng nhỏ trên tiêu đề) nên nối với câu hỏi chính: "CÂU HỎI 2 · Nguyên nhân".
- **Đổi hình không đổi chữ/số**: lượt chỉnh giao diện không được sửa nội dung; muốn sửa nội dung → phiếu phản biện.
- **Tiêu đề = một câu khẳng định hoặc câu hỏi**, ≤ ~70 ký tự ("Một tập đoàn lớn hơn cả một nền kinh tế", không phải
  "Tổng quan về tập đoàn"). Phần sau đưa vào `subtitle`/`lead`.
- Ngoài tiêu đề ≤ ~40 từ trên màn hình (validator cảnh báo); `lead` ≤ 260 ký tự; list ≤ 6 mục; bento ≤ 6 thẻ;
  bảng ≤ 7 dòng; code ≤ 18 dòng. Lời giải thích nằm trong `notes.ts`.
- Rich text: `**điểm tích cực/giải pháp**` (accent), `!!rủi ro/xung đột!!` (alert), `==số liệu/thuật ngữ==` (cool),
  `*nghiêng*`, `[chữ có nguồn](^idNguon)`, `$$công thức$$`. Mỗi slide tối đa 2–3 điểm nhấn màu.
- Font theme đều có dấu tiếng Việt. Không viết hoa toàn bộ câu tiếng Việt dài (khó đọc dấu).

## 4. Màu có nghĩa
`accent` = tích cực/giải pháp/điểm chính · `alert` = rủi ro/xung đột/giảm · `cool` = trung tính/dữ liệu/pháp lý ·
`ink`/`muted` = chữ thường. Dùng `tone` nhất quán xuyên suốt deck (cùng một chủ thể luôn cùng một màu).
Không đặt mã màu cứng trong slide — luôn qua `tone` hoặc biến theme.

## 5. Chuyển động có nghĩa
- Chuyển động phải nói đúng điều lời nói đang nói: hiện mục đang nói, sáng chặng đang kể, cột mọc khi nêu số.
- Không chuyển động trang trí lặp vô hạn chiếm tâm điểm; cảnh vào xong trong ~1,5 s, "diễn" xong trong ~12 s.
- Nhiều ý trong một slide → chia nhịp (`beat`/`stepwise`) thay vì hiện cùng lúc.
- `prefers-reduced-motion` → mọi thứ hiện ngay ở trạng thái cuối (engine tự lo, đừng phá bằng animation riêng).

## 6. Nhịp thị giác của cả deck
- Xen kẽ layout (split → grid → center → split-right…) và loại hero (3D → ảnh → biểu đồ → chữ lớn).
- Mở đầu (`cover`) và kết (`center`/`full`) được phép ấn tượng hơn; thân bài ưu tiên rõ ràng.
- Một deck một theme. Không đổi theme theo phần.

## 7. Anti-pattern (đã thử và loại)
| Đừng | Vì | Thay bằng |
|---|---|---|
| Nhiều cảnh/hiệu ứng trên một slide | rối mắt, không biết nhìn đâu | một hero + ambient |
| Nền hạt bay/ThreeUI ở mọi slide | nhàm, nặng máy, mất nghĩa | 1–2 lần ở mở đầu/chuyển phần |
| Lật trang 3D, zoom cả slide, xoay cả sân khấu | chóng mặt, khó đọc | chuyển cảnh mặc định (fade + trượt nhẹ) |
| Câu đố "bấm để hiện đáp án" khắp nơi | ngắt mạch thuyết trình | nhịp `beat` do người nói điều khiển |
| Biểu đồ 3D cho số ít/không so sánh | trang trí giả dữ liệu | `metric` lớn hoặc `bars` |
| Ảnh AI vẽ người/sự kiện/địa danh thật | sai sự thật, mất uy tín | ảnh thật có credit |
| Ảnh "na ná" (ảnh phố bất kỳ cho Hội An) | sai nội dung | tìm đúng ảnh, xem trước khi dùng |
| Chữ đặt lên vùng ảnh/3D sáng | không đọc được | layout split (ảnh sang vùng hình), giảm `opacity` ảnh nền |
| Nhuộm màu ảnh minh hoạ (duotone, sepia) khi user không yêu cầu | sai màu thật của địa danh, tác phẩm, sản phẩm | giữ `treatment: 'color'` (mặc định) |
| Địa cầu đồng màu khi chủ đề là một nước | khán giả không biết nhìn vào đâu | `highlight` nước đó + `zoom` |
| Bảng > 3 cột trong `split` | chật | layout `grid` |
