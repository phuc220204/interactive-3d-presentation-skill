# Nguồn cảm hứng — học gì, áp vào đâu

Dùng để tìm ý tưởng bố cục/chuyển động khi chỉ đạo nghệ thuật (bước 3). **Học nguyên tắc, không sao chép** thiết kế,
hình ảnh, thương hiệu của trang khác. Mọi ý tưởng vẫn phải qua luật "một ý – một hình" và có `purpose`.

| Nguồn | Link | Học gì | Áp vào template |
|---|---|---|---|
| **Awwwards** | https://www.awwwards.com/ | site đoạt giải: typography lớn, khoảng trắng, chuyển cảnh có chủ đích, chi tiết hover | tiêu đề lớn (`cover`, `center`), nhịp xen kẽ layout, `full` để "thở" |
| **Codrops** | https://tympanus.net/codrops/hub/ | demo + bài hướng dẫn hiệu ứng WebGL/CSS/GSAP (lưới ảnh, chữ tách dòng, shader ảnh) | gallery, parallax, SplitText tiêu đề, diagram stroke-draw |
| **GSAP Showcase** | https://gsap.com/showcase/ | dự án dùng GSAP: nhịp easing, stagger, cuộn kể chuyện | `EASE`/`STAGGER` trong `src/motion/gsap.ts`, nhịp (beats), chế độ cuộn |
| **Three.js Examples** | https://threejs.org/ | ví dụ chính thức: vật liệu, ánh sáng, hạt, hậu kỳ, morph target, loader glTF | cảnh mới trong `src/three/scenes/`, `theme.effects`, model morph |
| **Dark Design** | https://www.dark.design/ | tuyển chọn site nền tối: tương phản, ánh sáng điểm, glow tiết chế | theme `obsidian`, `neon`, `blueprint`; bloom vừa phải |
| **Siteinspire** | https://www.siteinspire.com/ | site lọc theo phong cách/ngành (editorial, minimal, portfolio…) | chọn theme theo ngành; layout báo chí cho `ivory` |
| **Video tham khảo (YouTube)** | https://www.youtube.com/watch?v=j74kjYvzzLk | xem cách trình bày/chuyển động trong video để lấy ý tưởng nhịp và chuyển cảnh | nhịp `sceneBeats`, camera Theatre.js, mức `motion` |

Deck tham chiếu gốc của skill: https://presentation-group6-mln-122.vercel.app/ — 3D mang nội dung (địa cầu có tuyến
thương mại thật, cột theo số thật), không trang trí.

## Cách dùng khi làm deck
1. Sau khi chốt brief, nếu user muốn "giống kiểu X" → mở nguồn tương ứng, ghi 2–3 nguyên tắc rút ra vào `brief.notes`.
2. Chuyển nguyên tắc thành cấu hình có sẵn (theme, layout, scene, nhịp) trước khi nghĩ tới code mới.
3. Chỉ viết cảnh/hiệu ứng mới khi không có gì sẵn diễn đạt được ý — và vẫn tuân thủ `design-rules.md`.
