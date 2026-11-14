# Playbook theo chủ đề

Dùng khi user nói "tuỳ bạn" hoặc để đề xuất mặc định ở bước 0. Mỗi dòng là **một** họ hiệu ứng — đừng trộn hai dòng.
Ví dụ chạy được: `npm run use-example -- <tên>`.

| Chủ đề | Theme | family | Cảnh nên dùng (`brief.scenes`) | Hình ảnh | Bẫy cần tránh |
|---|---|---|---|---|---|
| **Kinh tế** (`economics-vi`) | obsidian / ivory | data-3d | towers, globe (arcs thương mại), network, flow | chart, metric có nguồn | số không nguồn; biểu đồ 3D cho 1 con số |
| **Chính trị, xã hội, pháp luật** | ivory / obsidian | editorial-2d | network (chủ thể), flow (thủ tục), timeline | ảnh tư liệu chính thức, quote | ảnh AI về người/sự kiện thật; màu thiên vị |
| **Lịch sử** (`history-art`) | ivory (+`sepia` nhẹ) | editorial-2d | timeline, gallery (tư liệu), globe (chiến dịch), model (hiện vật) | ảnh lưu trữ public domain, bản đồ cổ | ảnh minh hoạ sai thời kỳ; bản đồ thiếu Hoàng Sa, Trường Sa |
| **Địa lí, môi trường một vùng** | sketchbook / whiteboard / ivory | illustrated | globe `highlight` + `regions` + `zoom`, plot (địa hình ma trận), parallax | ảnh vệ tinh/phong cảnh thật (màu gốc), diagram | dùng ảnh "na ná" khác địa điểm; địa cầu đồng màu không chỉ rõ vùng |
| **Du lịch** (`travel-hoi-an`) | sketchbook | illustrated | globe route, gallery, parallax (1 lần), cards (vé, bản đồ), model | ảnh thật địa danh, user | quá nhiều ảnh mỗi slide; tilt-shift khắp nơi |
| **Văn học** | ivory | editorial-2d | gallery (bìa sách, chân dung), cards (book/letter), timeline (tác phẩm) | chân dung tác giả, bìa sách, quote lớn | chữ dài trên slide — đưa trích đoạn vào notes |
| **Nghệ thuật** (`history-art`) | ivory / obsidian | editorial-2d | gallery (arc/wall, `treatment: 'color'`), parallax | tác phẩm thật (bảo tàng open access) | duotone làm sai màu tác phẩm |
| **Khoa học** (`science-lesson`) | chalkboard / whiteboard | illustrated | plot, model (phân tử), morph (helix), flow (chu trình) | diagram SVG, ảnh NASA/hiển vi, lottie | mô hình sai khoa học; ảnh AI cho hiện tượng thật |
| **Toán** (`science-lesson`) | chalkboard / whiteboard | technical | plot (surface/curve), flow (chứng minh) | math (KaTeX), diagram | công thức trong ảnh thay vì KaTeX |
| **CNTT, lập trình** (`tech-talk-en`) | blueprint / neon | technical | network (kiến trúc), flow (pipeline), plot (hàm loss) | code, diagram, video demo | code > 18 dòng; nền hạt "công nghệ" vô nghĩa |
| **Kinh doanh, pitch** (`business-pitch-en`) | neon / obsidian | data-3d | towers (thị trường), cards (app/phone), morph (converge) | metric, chart, lottie sản phẩm, ảnh sản phẩm | số đẹp không nguồn; quá 3 số mỗi slide |
| **Giáo dục chung, đào tạo** | whiteboard | illustrated | flow, timeline, cards (note) | diagram, lottie | quá nhiều chữ |
| **Kỹ thuật, năng lượng, môi trường** (`drafting-lesson`) | drafting / blueprint | technical | gear, morph (stages), plot | waffle, gauge, dimension, simulation, annotations | số minh hoạ không ghi rõ là minh hoạ |
| **Sự kiện, giới trẻ** | neon / sketchbook | playful | morph, cards, spline (1–2) | ảnh sự kiện, lottie | hiệu ứng nặng mọi slide |

## Cấu trúc deck gợi ý (10–15 phút, 8–12 slide)
1. `cover` — luận điểm + 1 cảnh ý niệm/ảnh mạnh.
2. Câu hỏi/bối cảnh — list stepwise hoặc `center` câu hỏi.
3–8. Thân bài — mỗi slide một ý, xen kẽ 3D / ảnh / biểu đồ / chữ lớn; 1 slide `full` để "thở".
9. Kết luận — `center` + callout hoặc quote.
10. `references`.

## Song ngữ
`deck.lang: 'vi' | 'en'` đổi toàn bộ chữ giao diện (nhịp, nguồn, ghi chú, trợ giúp…) và định dạng số
(`vi-VN`: 514,7 · `en-US`: 514.7). Nội dung giữ nguyên ngôn ngữ của user.
