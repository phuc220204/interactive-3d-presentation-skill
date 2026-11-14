# Catalog hiệu ứng — cho user chọn

Đưa bảng này (và ảnh trong `previews/`) cho user ở bước 0 khi họ chưa biết muốn gì. Mỗi mục: trông ra sao · truyền
đạt điều gì · hợp chủ đề nào · độ nặng. **Một deck chọn 2–4 mục cùng họ** — không chọn hết.
Độ nặng: ● nhẹ · ●● vừa · ●●● nặng (≤ 1/3 deck, máy yếu có thể giật).

## A. Theme (một deck một theme) — `previews/theme-*.jpg`
| Theme | Ảnh | Cảm giác |
|---|---|---|
| obsidian | `theme-obsidian.jpg` | tối, điện ảnh, sang trọng |
| ivory | `theme-ivory.jpg` | giấy ngà, báo chí, học thuật |
| whiteboard | `theme-whiteboard.jpg` | bảng trắng lớp học, sạch |
| chalkboard | `theme-chalkboard.jpg` | bảng phấn xanh, nét phấn |
| sketchbook | `theme-sketchbook.jpg` | sổ vẽ tay, ấm, thân thiện |
| blueprint | `theme-blueprint.jpg` | bản vẽ kỹ thuật |
| neon | `theme-neon.jpg` | keynote công nghệ, rực |
| drafting | `theme-drafting.jpg` | bản vẽ kỹ thuật trên giấy can: nét tự vẽ, gạch chéo, chuyển cảnh lau |

## B. Cảnh 3D mang dữ liệu
| Hiệu ứng | Ảnh | Trông ra sao | Truyền đạt | Hợp với | Nặng |
|---|---|---|---|---|---|
| Cột 3D `towers` | `towers.jpg` | cột mọc lên theo số, nhãn số trên đỉnh | so sánh quy mô | kinh tế, pitch, xã hội | ● |
| Địa cầu tô nổi quốc gia `globe.highlight` + `zoom` | `globe-highlight.jpg` | nước chủ đề tô đỏ, có biên giới các nước; Ctrl + lăn chuột phóng to, Ctrl + kéo xoay | bài về một quốc gia / vùng | ●● |
| Địa cầu `globe` (arcs) | `globe-arcs.jpg` | địa cầu chấm, cung sáng nối hai điểm | dòng chảy giữa nơi chốn | thương mại, di cư, quan hệ quốc tế | ●● |
| Địa cầu `globe` (route) | `globe-route.jpg` | điểm đánh số nối theo chặng, quay tới chặng hiện tại | hành trình theo thời gian | du lịch, lịch sử chiến dịch | ●● |
| Mạng lưới `network` | `network.jpg` | nút + cạnh sáng, nút trung tâm lớn | ai liên quan tới ai | chính trị, xã hội, kiến trúc phần mềm | ● |
| Quy trình `flow` | `flow.jpg` | ống dẫn các bước, bước hiện tại sáng | trình tự, nhân quả | quy trình, chính sách, sinh học | ● |
| Dòng thời gian `timeline` | `timeline.jpg` | xoắn ốc mốc thời gian, mốc hiện tại nổi | thời gian, giai đoạn | lịch sử, lộ trình, tiểu sử | ● |
| Đồ thị `plot` (mặt cong) | `plot-surface.jpg` | mặt z = f(x,y) có lưới, xoay chậm | hình dạng hàm, địa hình dữ liệu | toán, ML, kinh tế lượng | ● |
| Đồ thị `plot` (đường) | `plot-curve.jpg` | đường y = f(x) vẽ ra trên trục | hành vi hàm số | toán, khoa học | ● |
| Biến hình `morph` | `morph.jpg`, `morph-stages.jpg` | đám hạt biến hình: hội tụ / tách đôi / cụm / xoắn; hình cụ thể (người, bánh răng, chip, nhà, mũi tên) hoặc hình tuỳ ý từ SVG path; tự chạy chuỗi giai đoạn có nhãn | ý niệm, chuyển đổi qua các thời kỳ | mở đầu, chuyển phần, "từ… đến…" | ● |
| Bánh răng `gear` | `gear.jpg` | 3 bánh răng 3D đùn khối ăn khớp, nghiêng vào rồi quay | hệ thống nhiều bộ phận cùng chạy | sản xuất, máy móc, quy trình, tổ chức | ●● |

## C. Cảnh cho asset 2D/3D thật
| Hiệu ứng | Ảnh | Trông ra sao | Truyền đạt | Hợp với | Nặng |
|---|---|---|---|---|---|
| Tường tranh `gallery` | `gallery-3d.jpg` | ảnh/tranh thật có viền giấy treo vòng cung, ảnh chính đưa lên trước | so sánh tác phẩm, tư liệu | nghệ thuật, lịch sử, du lịch | ●● |
| Chiều sâu `parallax` | `parallax.jpg` | ảnh nền + lớp PNG/SVG phía trước lệch theo chuột | không gian, không khí nơi chốn | du lịch, địa lí, mở đầu | ●●● |
| Mô hình `model` (+ camera Theatre) | `model.jpg` | vật thể glTF xoay chậm, nhãn điểm; camera bay theo kịch bản | chi tiết vật thể | hiện vật, kiến trúc, phân tử, sản phẩm | ●●● |
| Đồ vật `cards` | `cards.jpg` | vé, bản đồ, thư, điện thoại… lơ lửng | giấy tờ, công cụ, sản phẩm số | du lịch, pháp lý, app | ● |

## D. Block 2D chuyển động (hero thay cho 3D)
| Hiệu ứng | Ảnh | Trông ra sao | Hợp với |
|---|---|---|---|
| Biểu đồ `chart` (line/area/donut/stacked) | `chart-area.jpg`, `chart-donut.jpg` | đường vẽ ra, miếng mọc lên, màu theme | số liệu theo thời gian, cơ cấu |
| Sơ đồ `diagram` | `diagram.jpg` | SVG tự vẽ nét theo nhịp, màu theme | cơ chế, cấu trúc, kiến trúc |
| Lottie `lottie` | `lottie.jpg` | minh hoạ vector chuyển động lặp | thao tác sản phẩm, icon sống |
| Lưới ảnh `gallery` block | `gallery-block.jpg` | lưới ảnh, bấm phóng to | nhiều ảnh thật ngang hàng |
| Ảnh nền `slide.image` | `backdrop.jpg` | ảnh thật màu gốc, mờ sau chữ | không khí, trích dẫn |
| Code `code` | `code.jpg` | code tô màu, từng dòng trượt vào, dòng quan trọng nổi | lập trình |
| Công thức `math` | `plot-curve.jpg` (góc trái) | KaTeX sắc nét | toán, khoa học |
| Video `video` | — | mp4 tự phát / YouTube bấm mới tải | demo, tư liệu |

## D2. Bộ "bản vẽ kỹ thuật" 2D (mọi theme; đẹp nhất với `drafting`)
| Hiệu ứng | Ảnh | Trông ra sao | Hợp với |
|---|---|---|---|
| Thẻ mở phần `layout: 'section'` | `section.jpg` | số phần khổng lồ dạng nét tự vẽ, tiêu đề hiện theo cụm, người nói + khoảng slide | bài 3–4 phần, nhiều người nói |
| Lưới ô `waffle` | `waffle.jpg` | 100 ô bật lần lượt (ô vuông, người, đồng xu, nhà, giọt nước, cây) | tỉ lệ "x trên 100" dễ hình dung |
| Vòng đo `gauge` + con dấu | `gauge.jpg` | vòng chạy tới giá trị, 40 vạch sáng theo, mốc mục tiêu; kết luận đóng dấu | tiến độ so với mục tiêu |
| Đường kích thước `dimension` | `dimension.jpg` | đường mũi tên 2 đầu vẽ đúng tỉ lệ có đầu bút, số đếm lên | so thời gian, khoảng cách |
| Mô phỏng `simulation` | `simulation.jpg` | thanh trượt + kết quả tính lại tức thì (thanh hoặc cân thăng bằng) | "nếu… thì…", hỏi đáp |
| Chú thích bút tay `annotations` | `annotation.jpg` | khoanh tròn/gạch chân/đóng khung/mũi tên + chữ viết tay, vẽ ra theo nhịp | chỉ vào con số chính |
| Đường nối `connectors` | `connectors.jpg` | đường gấp khúc giữa các block, nét chảy + hạt chạy | dòng chảy, quy trình nhanh |
| Câu hỏi mở viền kiến bò · trích dẫn gõ chữ | `ants.jpg` | viền nét đứt chạy quanh; câu trích dẫn gõ từng chữ | kết bài, câu hỏi cho khán giả |
| Số đếm trong chữ `==1.220 tỷ==` · bút dạ quét dưới `**chữ nhấn**` | (mọi ảnh) | số đếm lên giữ định dạng; vệt highlight quét qua (skin sketch/drafting) | mọi chủ đề |
| Tóm tắt giai đoạn `morph.summary` | `morph-summary.jpg` | các giai đoạn hiện cạnh nhau thành lưới 2×2 có mũi tên | kết một chuỗi "từ… đến…" |
| Đường dẫn tới ngăn nguồn · biểu tượng loại nguồn | `annotation.jpg` (xem trực tiếp) | bấm số có nguồn → nét đứt nối tới ngăn nguồn; slide tài liệu có icon + thống kê theo loại | mọi deck có trích dẫn |
| Chuyển cảnh lau · tiến độ sợi chỉ | (xem trực tiếp) | slide mới lộ theo vệt quét có vạch sáng; thanh tiến độ lượn sóng có nút đổi người nói | `drafting` hoặc `transition: 'wipe'` |

## E. Hiệu ứng thư viện ngoài
| Hiệu ứng | Ảnh | Trông ra sao | Khi nào | Nặng |
|---|---|---|---|---|
| ThreeUI (18 hiệu ứng) | `threeui.jpg` | nền WebGL: tinh vân, dải lụa, dòng hội tụ, chân trời… | mở đầu, chuyển phần, kết — tối đa 1–2 lần | ●●● |
| Spline | — (xem spline.design/community) | cảnh 3D thiết kế trên spline.design (vật liệu, ánh sáng đẹp); tắt Background trong Spline trước khi xuất | user có cảnh Spline / sản phẩm 3D | ●●● |
| Camera Theatre.js | (xem `model.jpg`) | camera bay theo keyframe khi vào slide | slide "khoảnh khắc" điện ảnh | ●● |
| Landing page Lenis | — | trang cuộn mượt quán tính, section hiện dần | bản web gửi sau buổi thuyết trình | ● |

## F. Hậu kỳ cho lớp 3D (`theme.effects`)
bloom (phát sáng — theme tối) · `dof` (nền mờ ống kính) · `tiltShift` (mô hình thu nhỏ) · `sepia` (ảnh cũ) ·
`halftone` (chấm in báo) · `chromatic` (viền màu ống kính) · `noise` (hạt phim). Chọn 0–2. Xem `themes.md`.

## G. Chuyển động & tương tác (luôn có)
Chữ hiện theo dòng · số đếm lên · nhịp từng bước (click/phím/con lăn/bút) · cảnh biến hình liên tục giữa slide ·
trích dẫn bấm được (K soi nguồn) · bento bấm mở chi tiết · tổng quan (O) · presenter (P) · reduced-motion.

## Gói gợi ý (đưa user chọn 1)
| Gói | Gồm | Hợp với |
|---|---|---|
| **Tĩnh lặng học thuật** | ivory · timeline, gallery, chart · motion calm | luận văn, lịch sử, văn học |
| **Dữ liệu sống** | obsidian · towers, globe arcs, network, chart · motion standard | kinh tế, chính trị, báo cáo |
| **Lớp học sinh động** | whiteboard/chalkboard · plot, diagram, flow, lottie · standard | khoa học, toán, đào tạo |
| **Nhật ký hành trình** | sketchbook · globe route, gallery, parallax ×1, cards · standard | du lịch, địa lí |
| **Kỹ thuật** | blueprint · network, flow, code, diagram · standard | CNTT, kỹ thuật |
| **Keynote điện ảnh** | neon/obsidian · towers, model + Theatre, ThreeUI ×2, chart · cinematic | pitch, ra mắt sản phẩm |
| **Bản vẽ kỹ thuật** | drafting · section, waffle, gauge, dimension, simulation, annotations, connectors, gear · standard | năng lượng, kỹ thuật, kinh tế học, bài giảng có số liệu |
