# Thư viện — đã tích hợp & chỉ tham khảo

Mọi thư viện nặng được **tải lười**: chỉ deck nào dùng mới tải (chunk riêng). Chunk chính ~290 KB (gzip ~90 KB).

## Đã tích hợp trong template
| Thư viện | Trong deck là | Hiệu ứng / cảm giác | Khi nào chọn | Bật bằng |
|---|---|---|---|---|
| **React-Three-Fiber + drei** (three.js) | 12 cảnh dữ liệu: towers, globe, network, flow, timeline, plot, gallery, parallax, model, cards, morph, ambient | 3D sống, mượt, biến hình giữa các slide | khi số liệu/không gian/quan hệ cần được *thấy* | `slide.scene` |
| **@react-three/postprocessing** | bloom, DOF, tilt-shift, sepia, halftone, chromatic, noise | chất điện ảnh/in ấn cho lớp 3D | 1–2 hiệu ứng hợp theme | `theme.effects`, `theme.bloom` |
| **glTF morph targets / clips** | `model.state.morph`, `model.state.clip` | vật thể biến hình (mở nắp, phân tử tách), nhân vật cử động | model có sẵn morph/animation | `sceneBeats: [{morph:{Open:0}},{morph:{Open:1}}]` |
| **GSAP** (+SplitText, useGSAP) | toàn bộ chuyển động chữ/block, nhịp, stroke-draw sơ đồ, đếm số | chữ trồi theo dòng, số đếm lên, nét vẽ ra | luôn có | tự động |
| **ThreeUI** (Meng To, MIT) | 18 nền/visual WebGL có sẵn | hạt, tinh vân, dải lụa, mạng lưới | mở đầu/chuyển phần, ≤ 1/3 deck | `scene: { name: 'threeui', component }` |
| **Spline** (`@splinetool/runtime`) | cảnh 3D dựng trên spline.design | 3D thiết kế tay, vật liệu đẹp, tương tác chuột | user có cảnh Spline / muốn sản phẩm 3D đẹp nhanh | `scene: { name: 'spline', scene: url }` |
| **Theatre.js** (`@theatre/core`, studio chỉ khi dev) | chuỗi camera theo keyframe | camera bay quanh model, lướt qua địa cầu như phim | slide "khoảnh khắc" cần đạo diễn | `slide.camera`, soạn ở `?studio` |
| **Lenis** | chế độ landing page | cuộn mượt quán tính, section hiện dần | cần trang web cuộn thay vì slide | `deck.mode: 'scroll'` / `?mode=scroll` |
| **Lottie** (`@lottiefiles/dotlottie-react`) | block `lottie` | icon/minh hoạ vector chuyển động | giải thích thao tác, sản phẩm, icon sống | `{ type: 'lottie', src }` |
| **AutoAnimate** | bento mở/đóng chi tiết | bố cục tự trượt mượt | Q&A bấm thẻ | tự động trong bento |
| **KaTeX** | block `math`, `$$…$$` trong chữ | công thức sắc nét | toán, khoa học, kinh tế lượng | `{ type: 'math', tex }` |
| **Prism** (prism-react-renderer) | block `code` | code tô màu theo theme, dòng nổi bật | CNTT, lập trình | `{ type: 'code', lang, code, highlight }` |
| **Tailwind CSS v4** | toàn bộ giao diện, biến theme | — | — | — |
| **vite-plugin-singlefile** | `npm run build:single` | một file HTML chạy offline | gửi email/USB, máy không mạng | tự động |
| Bộ vẽ 2D riêng (`src/motion/draw.ts`) | nét tự vẽ giữ nét đứt + mũi tên, bút tay, đường nối, số giữ định dạng | phong cách bản vẽ kỹ thuật | chú thích, đường kích thước, sơ đồ | `annotations`, `connectors`, `dimension` |

## Chỉ tham khảo (không gộp vào template) — khi nào nên dùng chúng thay vì engine này
| Thư viện | Là gì | Chọn nó khi | Vì sao không gộp |
|---|---|---|---|
| **Reveal.js** | framework slide HTML lâu đời, plugin phong phú | cần xuất PDF chuẩn, slide lồng dọc, nhiều plugin cộng đồng, nội dung chủ yếu chữ/markdown | trùng vai trò khung deck; không có cảnh 3D mang dữ liệu |
| **Impress.js** | slide đặt trong không gian 3D CSS (kiểu Prezi) | muốn cả deck là một "bản đồ" zoom/xoay giữa các ý | xoay/zoom cả sân khấu gây chóng mặt, khó đọc (anti-pattern) |
| **Motion** (Framer Motion) | animation React khai báo | dự án React UI nhiều trạng thái, layout animation | GSAP đã đảm nhiệm; hai hệ animation trong một deck khó đồng bộ |
| **Anime.js** | animation JS nhẹ | trang tĩnh nhỏ không dùng React/GSAP | trùng GSAP |
| **Curtains.js** | WebGL cho ảnh/video DOM (méo, gợn sóng khi cuộn) | landing page nghệ thuật, hiệu ứng ảnh lỏng | chỉ cần cho landing thể nghiệm; dễ lạm dụng |
| **Swup / Barba.js** | chuyển trang mượt giữa nhiều trang HTML | site nhiều trang (multi-page) | deck là ứng dụng một trang |

Muốn thêm một thư viện: cài bằng npm, **import lười** (`lazy(() => import(...))`), thêm vào `optimizeDeps.include`
trong `vite.config.ts`, ghi giấy phép vào `THIRD_PARTY_NOTICES.md`, và chỉ dùng khi có `purpose`.
