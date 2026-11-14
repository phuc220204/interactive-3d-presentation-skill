# Kiểm tra & QA

## 1. `npm run validate` — kiểm tra tĩnh (không cần trình duyệt)
**Lỗi (phải sửa):** thiếu id/title/section/scene · layout/scene/block không tồn tại · state sai · ThreeUI ngoài catalog ·
network trỏ node không có · hàm plot không hỗ trợ · **scene thiếu `purpose`** · **2 block hình** · **scene 3D + block
hình trên split/cover/full** · scene ngoài `brief.scenes` · theme.ts khác `brief.theme` · nguồn thiếu apa/short ·
`[..](^id)`/`source`/`sourceId` không tồn tại · URL nguồn thuộc `bannedDomains` · ảnh/diagram/lottie thiếu `alt` ·
file diagram không có · video thiếu src/youtube · chart số giá trị ≠ số nhãn · `offline` mà asset chưa pull ·
**URL nguồn không https · link thuộc miền cấm (so theo tên miền, quét cả chữ & ghi chú) · còn chỗ giữ chỗ (TODO, TBD, lorem,
[Người 1]) · màu cứng (#hex, rgb()) trong `src/content` hoặc SVG sơ đồ · index.html/CSS tải từ internet · YouTube khi offline ·
waffle vượt tổng ô · công thức `simulation` lạ · connector trỏ block id không có**.
**Cảnh báo (nên sửa):** thiếu brief.ts · ảnh nền + scene + block hình · hiệu ứng nặng lặp > 2 slide liền hoặc > 1/3
deck · tiêu đề dài/nhãn chủ đề · lead > 260 ký tự · > ~40 từ · quá nhiều block/mục · code > 18 dòng · asset chưa có
credit · ảnh user thiếu credit · thiếu ghi chú · **ghi chú < 40 ký tự · nguồn thiếu `kind` · từ nhạy cảm (`deck.sensitiveTerms`) ·
annotation không thấy cụm chữ** · `motion: 'calm'` dùng hiệu ứng nặng · slide cuối không phải references.
(Cảnh báo "quá nhiều chữ" bật khi > ~70 từ ngoài tiêu đề; mục tiêu thiết kế vẫn là ≤ ~40.)

## 2. `npm run qa` — kiểm tra bằng trình duyệt thật (dev server phải đang chạy)
Dùng Chrome/Edge có sẵn (headless, WebGL). Mỗi slide được đưa tới **nhịp cuối** rồi chụp → `qa/<theme>/<size>/NN-id.png`.
Báo: **tràn** (chữ vượt khung), **đè chữ** (lõi glyph của hai đoạn chữ chồng nhau), lỗi console, asset hỏng.
```bash
npm run qa                                   # theme của deck, 1920×1080
npm run qa -- --theme ivory,obsidian         # thêm một theme tương phản để thử độ bền
npm run qa -- --sizes 1920x1080,1366x768     # máy chiếu cũ
npm run qa -- --only 3,5 --wait 4000         # vài slide, chờ lâu hơn (model/Spline nặng)
npm run qa -- --offline                      # chặn mạng ngoài
npm run qa:threeui -- --only NebulaBackground
```
Exit 1 nếu có vấn đề; chi tiết ở `qa/report.json`.

## CI trên GitHub
Template có `.github/workflows/deck.yml`: mỗi lần push/PR chạy `validate` → kiểm `SCRIPT.md` khớp `notes.ts` → `build` → chụp
QA offline mọi slide; ảnh chụp ở mục **Artifacts** của lần chạy, tóm tắt ở trang Summary. Commit `SCRIPT.md` để bước 2 qua.

## Một file chạy offline
`npm run build:single` → `dist-single/index.html` (~14 MB: JS, CSS, font, ảnh trong `public/` đều nhúng sẵn) mở bằng
double-click. Cảnh báo nếu còn asset ở URL từ xa (chạy `assets:pull` trước) hoặc YouTube.

## 3. Nhìn ảnh (bắt buộc — máy không chấm được thẩm mỹ)
Mở ảnh trong `qa/` và kiểm từng slide:
- [ ] Đúng **một** thứ thu hút mắt; không có lớp hình chồng lớp hình.
- [ ] Cảnh 3D/ảnh nói đúng `purpose`; số trên cảnh khớp số trên chữ.
- [ ] Chữ đọc được (tương phản với nền, không nằm trên vùng 3D/ảnh sáng).
- [ ] Ảnh đúng đối tượng, đủ nét, không watermark.
- [ ] Màu `accent/alert/cool` dùng nhất quán.
- [ ] Nhịp: mở `#n.0` và `#n.cuối` — trạng thái đầu không trống trơn, trạng thái cuối không chật.
- [ ] Slide nguồn liệt kê đủ, có nhãn AI/ảnh tác giả nếu có.

## 4. Kiểm tra tay nhanh (2 phút)
`npm run dev` → bấm qua cả deck bằng click và con lăn · P mở presenter · K soi nguồn · bấm một số có nguồn ·
O tổng quan · `?mode=scroll` nếu bàn giao landing page · bật "giảm chuyển động" trong hệ điều hành và xem lại 1–2 slide.

## Sự cố thường gặp
| Triệu chứng | Cách xử lý |
|---|---|
| Console/QA: `504 (Outdated Optimize Dep)`, `Failed to fetch dynamically imported module …/.vite/deps/…` | dừng `npm run dev`, xoá `node_modules/.vite`, chạy lại (hay gặp trên Windows sau khi cài thêm gói hoặc sửa `vite.config.ts` lúc server đang chạy) |
| QA báo "Không tìm thấy Chrome/Edge" | đặt `CHROME_PATH=đường/dẫn/chrome` |
| Ảnh Wikimedia lỗi 429 | chờ 1 phút; `assets:pull` tự thử lại; dùng URL thumbnail |
| Cảnh `model`/`spline` trống | URL không cho CORS hoặc quá nặng → tải file về `public/`, hoặc `--wait 5000` khi QA |
| Huy hiệu đỏ "OVERFLOW" trên slide (dev) | bớt chữ/block, đổi layout `grid`, chuyển giải thích sang notes |

## 5. Checklist bàn giao
- [ ] `npm run validate` 0 lỗi (cảnh báo còn lại có lý do)
- [ ] `npm run qa` đạt trên theme của deck (+ `--offline` nếu trình chiếu không mạng)
- [ ] `npm run build` thành công; `npm run preview` mở được
- [ ] `npm run script` — thời lượng ≤ mục tiêu
- [ ] Báo user: cách chạy/deploy, phím trình chiếu, số liệu nào là minh hoạ, asset nào cần thay, 2–3 ảnh QA tiêu biểu
