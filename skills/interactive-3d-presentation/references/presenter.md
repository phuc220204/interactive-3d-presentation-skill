# Trình chiếu — phím, chuột, bút, người nói

## Điều khiển
| Hành động | Phím / chuột |
|---|---|
| Nhịp tiếp (hết nhịp → slide tiếp) | → · Space · PageDown · ↓ · **click trái vào sân khấu** · bút trình chiếu (gửi PageDown/→) |
| Lùi | ← · PageUp · ↑ · **Shift+click** · **chuột phải** |
| Con lăn / touchpad | một cử chỉ = một bước (khoá 800 ms, không trượt nhiều slide) |
| Phóng to / xoay địa cầu | **Ctrl + lăn chuột** / **Ctrl + kéo chuột** (không chuyển slide) |
| Màn hình cảm ứng | vuốt trái/phải |
| Đầu / cuối | Home / End |
| Tổng quan (lưới slide) | O hoặc M |
| Ghi chú người nói (ngăn kéo) | S hoặc N |
| Cửa sổ người nói (màn hình thứ 2) | P (mở `?presenter`) |
| Soi nguồn (gạch chân mọi số có nguồn) | K |
| Bấm đồng hồ | T |
| Toàn màn hình | F |
| Đổi sáng / tối (phòng sáng, máy chiếu yếu) | D |
| Trợ giúp | ? hoặc H |
| Đóng ngăn/lớp phủ | Esc |
| Đổi theme (chỉ khi dev) | Shift+T |
Click vào phần tử tương tác (thẻ bento, ảnh gallery, nút video, link, chữ trích dẫn, thanh trượt `simulation`) **không** chuyển nhịp.
Deck nhiều người nói: góc dưới trái hiện tên người đang nói; `progress: 'thread'` đánh dấu chỗ đổi người.

## Cửa sổ người nói (`?presenter`)
Nhấn P → cửa sổ mới (kéo sang laptop, deck chính lên máy chiếu). Hiển thị: tiêu đề slide hiện tại + slide kế, chấm nhịp,
ghi chú cỡ chữ lớn, người nói (`slide.speaker`), đồng hồ (T bắt đầu), thời lượng mục tiêu (`deck.targetMinutes`).
Điều khiển ở cửa sổ nào cũng được — hai cửa sổ đồng bộ qua BroadcastChannel (cùng trình duyệt, cùng máy).

## Ghi chú & kịch bản
**Luật viết lời nói** (học từ bài thuyết trình nhóm thật):
- Viết như đang nói chuyện; **thuật ngữ giải thích bằng lời thường ngay lần đầu**; trích dẫn giữ nguyên văn nhưng
  giải thích bằng lời.
- Mỗi người ~3,5–4,5 phút (150 âm tiết/phút); `npm run script` in bảng theo người nói. Thêm câu thì bớt câu.
  Ước tính ≠ thời gian thật — phải bấm giờ khi tập (bài thật ước tính 27 phút cho giới hạn 20 phút).
- Cuối phần mỗi người là **câu chuyển theo nội dung** sang người sau; kết luận quay về câu hỏi mở ở đầu bài.
- Chỉ dẫn sân khấu trong `[ngoặc vuông]`: `[Bấm một lần.]`, `[Dừng một nhịp.]`, `[Chờ 5 giây…]` — không tính giờ.
- Slide dự phòng (nguồn, phụ lục số liệu): `[Slide dự phòng — chỉ mở khi được hỏi.]`, không tính giờ.
- `slide.minutes` (tuỳ chọn): thời lượng dự kiến từng slide → presenter hiện dự kiến/đã qua.

- `notes.ts`: lời nói đầy đủ cho từng slide (Markdown nhẹ). `[chỉ dẫn]` trong ngoặc vuông = hành động, không đọc.
- `slide.speaker`: ai nói slide này (nhóm nhiều người).
- `npm run script` → `SCRIPT.md` để in/tập: lời nói từng slide, người nói, số nhịp, thời lượng ước tính
  (vi 150 âm tiết/phút, en 140 từ/phút), tổng theo từng người; cảnh báo khi vượt `deck.targetMinutes`.

## Trích dẫn sống (Q&A)
- Số/cụm có gạch chấm = có nguồn → bấm mở ngăn nguồn (APA, link, loại, giấy phép, trang `page`, ý nghĩa `use`,
  "Dẫn lại" nếu `status: 'secondary'`); một **đường dẫn nét đứt** vẽ từ con số tới ngăn nguồn để cả phòng thấy số nào đang được hỏi.
- K: soi toàn bộ chỗ có nguồn trên slide — trả lời nhanh câu "số này lấy ở đâu?".
- Bento `detail`: bấm thẻ mở thêm giải thích khi có câu hỏi.

## Tập dượt
- `#6.2` mở thẳng slide 6 nhịp 2. O để nhảy nhanh.
- Bút trình chiếu: hầu hết gửi PageDown/PageUp — chạy ngay. Nút "màn hình đen" (gửi `.` hoặc B) không dùng.
- Mở bằng Chrome/Edge, F toàn màn hình; deck tự co theo mọi độ phân giải, giữ tỉ lệ 16:9.

## Landing page (`?mode=scroll` hoặc `deck.mode: 'scroll'`)
Cùng nội dung, cuộn mượt (Lenis); mỗi slide là một section hiện dần khi cuộn tới, mọi nhịp hiện sẵn; chấm điều hướng
bên phải; cảnh 3D theo section đang xem. Dùng làm trang tóm tắt gửi sau buổi thuyết trình.
