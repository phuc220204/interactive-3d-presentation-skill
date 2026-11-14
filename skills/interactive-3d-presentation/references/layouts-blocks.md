# Layout & block

Sân khấu cố định 1920×1080, tự co theo màn hình. Cỡ tiêu đề tự giảm theo độ dài. Chế độ dev hiện huy hiệu đỏ khi tràn.

## 8 layout
| Layout | Bố cục | Dùng khi | Sức chứa |
|---|---|---|---|
| `cover` | tiêu đề rất lớn bên trái, `meta` hàng dưới, 3D bên phải | slide mở đầu, mở phần lớn | title ≤ 60 ký tự, lead 1 câu |
| `split` (mặc định) | cột chữ trái ~6/12, hero visual phải | phần lớn slide nội dung | 1–2 block |
| `split-right` | đảo chiều: hình trái, chữ phải | xen kẽ nhịp với split | 1–2 block |
| `center` | câu lớn giữa, 3D mờ phía sau | tuyên bố, trích dẫn, câu hỏi chuyển phần | 0–1 block (quote/callout) |
| `grid` | tiêu đề trên, block toàn chiều rộng | bento, bảng, timeline, code, gallery, chart rộng | 1–2 block |
| `full` | 3D/ảnh chiếm toàn màn, chú thích nhỏ góc trái | khoảnh khắc thị giác (globe, parallax, model) | title ngắn, không block |
| `references` | danh sách APA tự gom (biểu tượng theo loại nguồn + hàng thống kê "4 văn bản · 3 dữ liệu · 5 ảnh"), cuộn được | slide cuối | — |
| `section` | thẻ mở phần: số phần khổng lồ dạng nét tự vẽ, tiêu đề hiện theo cụm, người nói + khoảng slide của phần | mở đầu mỗi phần lớn (bài 3–4 phần) | title ≤ 60 ký tự, subtitle "Phần n · …", không block |

## 23 block
Mọi block nhận thêm `beat?: number` (hiện ở nhịp k) và với list/bento/timeline/flow/table: `stepwise?: true`.

| Block | Dùng cho | Trường chính | Giới hạn |
|---|---|---|---|
| `metric` | 1–3 con số lớn đếm lên | `items[{value, decimals, prefix, suffix, label, note, tone, source}]`, `hero` | 3 số (trên `split` có `lead`: ≥ 3 số thì bỏ `hero` để khỏi tràn) |
| `compare` | hai phía đối lập/bổ sung | `left/right{title, tag, tone, points[]}`, `relation: vs/and/to`, `verdict` | 3–4 ý/bên |
| `bento` | thẻ ý, bấm mở chi tiết (Q&A) | `items[{title, body, detail, tag, tone, span, value}]`, `columns` | 6 thẻ |
| `timeline` | mốc thời gian ngang | `items[{date, title, body, tone}]`, `active` | 6 mốc |
| `flow` | quy trình các bước | `steps[{title, body, tone}]`, `direction` | 5 bước |
| `quote` | trích dẫn | `text, author, role`, `typing: true` (gõ từng chữ + con trỏ) | 1 |
| `callout` | lưu ý/kết luận | `label, body, tone`, `style: 'stamp'` (con dấu đóng xuống — kết luận) · `'ants'` (viền kiến bò — câu hỏi mở) | 1 |
| `table` | so sánh nhiều chiều | `columns, rows, highlightCol, rowTones` | 7 dòng; >3 cột → `grid` |
| `bars` | thanh ngang so sánh | `items[{label, value, tone}]`, `unit, decimals` | 7 thanh |
| `list` | gạch đầu dòng | `items[]`, `style: bullet/numbered/check` | 6 mục |
| `image` | ảnh hero | `src, alt, caption, credit, treatment, ratio` | 1 |
| `gallery` | lưới ảnh, bấm phóng to | `items[{src, alt, caption, credit}]`, `columns, treatment, ratio` | 6 ảnh |
| `video` | file mp4/webm hoặc YouTube (bấm mới tải) | `src` hoặc `youtube`, `poster, caption, ratio` | 1 |
| `chart` | line/area/donut/stacked SVG | `kind, labels, series[{name, values, tone}], unit, source, height` | 4 series |
| `diagram` | sơ đồ SVG tự vẽ nét theo nhịp, màu theo theme | `src` (`public/assets/diagrams/…`), `alt, caption, height, draw` | 1 |
| `lottie` | minh hoạ/icon chuyển động | `src` (.lottie/.json), `alt, loop, height, caption` | 1 |
| `code` | code tô màu (prism) | `lang, code, title, highlight[], caption` | 18 dòng |
| `math` | công thức KaTeX | `tex, caption` (inline: `$$…$$` trong Rich) | 1–2 |
| `references` | danh sách nguồn | — (chỉ dùng trên layout references) | — |
| `waffle` | lưới 100 ô (hoặc `total`): tỉ lệ đếm được bằng mắt ("62/100 kWh") | `parts[{value, label, tone}]`, `icon: square/circle/person/coin/house/drop/tree`, `source` | 3 phần |
| `gauge` | vòng đo + 40 vạch + mốc mục tiêu: tiến độ so với mục tiêu | `items[{value, max, target, label, suffix, tone, source}]` | 3 vòng |
| `dimension` | đường kích thước kỹ thuật vẽ đúng tỉ lệ, mũi tên 2 đầu, số đếm lên: thời gian, khoảng cách, chênh lệch | `items[{label, value, display, tone}]`, `unit`, `source` | 4 đường |
| `simulation` | mô hình "nếu… thì…": người nói kéo thanh trượt, kết quả tính lại tức thì | `input{label,min,max,step,value,unit}`, `outputs[{label, fn (theo x), unit, decimals, tone}]`, `viz: bars/balance/none`, `autoplay` | 3 kết quả |

Block hình (tính là hero visual): `image`, `gallery`, `video`, `chart`, `diagram`, `lottie`, `waffle`, `gauge`, `dimension`, `simulation`.

## Lớp vẽ tay trên slide (mọi layout)
- **Chú thích bút tay** `slide.annotations`: `[{ type: 'circle' | 'underline' | 'box' | 'arrow', target: 'cụm chữ trên slide' | '#id', beat, tone, note, dim }]`
  → khoanh/gạch/đóng khung/mũi tên kèm chữ viết tay, vẽ ra đúng nhịp người nói chỉ vào; `dim: true` làm mờ phần còn lại.
  Dùng cho "chỉ vào con số này": tối đa 1–2 nét mỗi slide.
- **Đường nối** `slide.connectors`: `[{ from: 'idA', to: 'idB', accent, beat }]` giữa các block có `id` → đường gấp khúc
  góc bo tự đo vị trí; `accent: true` = nét chảy + hạt chạy dọc (dòng tiền, dòng điện, dữ liệu).
- **Số đếm trong chữ**: `==1.220 tỷ==`, `==4,53%==`, `==60–80 năm==` tự đếm lên khi vào slide, giữ nguyên định dạng.
Trên `split`/`split-right` với `scene: { name: 'ambient' }`, block hình **tự chuyển sang nửa vùng hình** của sân khấu
(rộng 760 px, nơi cảnh 3D thường đứng), các block chữ ở lại cột chữ, nền ambient mờ hẳn đi. Vì vậy: slide có hình 2D
→ để `ambient`, đặt block hình ở bất kỳ vị trí nào trong `blocks`.
Màu Lottie được nướng sẵn trong file — chọn Lottie hợp màu theme (hoặc sửa màu trên lottiefiles.com trước khi tải).

## Ghép thường gặp
- `split` + `metric` + scene `towers` (cùng số) — số đếm lên, cột mọc lên.
- `split` + `list stepwise` + scene `flow` có `sceneBeats` `active` theo từng bước.
- `grid` + `bento` (`detail` cho Q&A) + `ambient`.
- `grid` + `chart` + `callout beat: 1` kết luận.
- `split-right` + `quote` + scene `gallery` (tác phẩm của tác giả).
- `center` + `quote` + ảnh nền (màu gốc, `opacity` 0.3–0.45).
- `full` + scene `globe` route / `parallax` / `model` — slide "thở" giữa các slide dày chữ.
- `section` mở mỗi phần → các slide `split` có `waffle`/`gauge`/`dimension` + `annotations` khoanh số chính.
- `grid` + 2–3 `callout` có `id` + `connectors` accent = sơ đồ dòng chảy nhanh không cần vẽ SVG.
- `split` + `simulation` cho phần hỏi đáp "nếu… thì sao?".

## Chú thích tone
`accent` tích cực · `alert` rủi ro · `cool` dữ liệu/trung tính · `ink` · `muted`.
