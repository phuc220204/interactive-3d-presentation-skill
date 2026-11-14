# Ánh xạ nội dung → slide

## Quy trình cho mỗi slide
1. **Ý chính** — câu người xem phải nhớ → thành `title` (khẳng định/câu hỏi). Chi tiết → `lead`, block, hoặc notes.
2. **Người xem cần THẤY gì?** → chọn hero visual (bảng dưới). Viết `purpose`. Không có gì cần thấy → chữ lớn
   (`center`) + `ambient`.
3. **Bằng chứng** — số liệu → `metric`/`bars`/`chart`/`towers` có `source`; trích dẫn → `quote`; so sánh → `compare`.
4. **Nhịp** — ≥ 3 ý được kể lần lượt → `stepwise`; kết luận → `callout` với `beat` cuối.
5. **Lời nói** — mọi câu giải thích còn lại vào `notes.ts`.

## Nội dung → hero visual
| Nội dung | Hero 3D | Hoặc 2D |
|---|---|---|
| So sánh 2–6 số cùng đơn vị | `towers` | `bars`, `metric` |
| Xu hướng theo thời gian | `timeline` (mốc) | `chart` line/area |
| Cơ cấu, tỉ trọng | — | `chart` donut/stacked |
| Địa điểm, tuyến đường, di cư, thương mại | `globe` (`points`, `arcs`, `route`) | `image` bản đồ |
| Quan hệ giữa các chủ thể | `network` | `diagram` |
| Quy trình, chuỗi nhân quả | `flow` | `flow` block, `diagram` |
| Tác phẩm, hiện vật, ảnh tư liệu | `gallery` (arc/wall/stack) | `image`, `gallery` block |
| Không gian, phong cảnh có chiều sâu | `parallax` | `image` + duotone |
| Vật thể (di vật, phân tử, sản phẩm) | `model` (+ hotspots, morph) | `image` |
| Hàm số, mặt cong, ma trận | `plot` | `math` |
| Giấy tờ, hợp đồng, vé, thư, điện thoại | `cards` | `image` |
| Khái niệm trừu tượng (hội tụ, phân tán, đối lập) | `morph` | `quote`, chữ lớn |
| Code, thuật toán | `network`/`flow` | `code`, `diagram` |
| Cảnh dựng sẵn ấn tượng | `spline`, ThreeUI (≤ 1/3 deck) | `lottie`, `video` |

## Markdown → schema
`npm run scaffold -- --content noi-dung.md --script kich-ban.md --write-notes` tách:
| Markdown | → |
|---|---|
| `# Tiêu đề` đầu file | `deck.title` |
| `## Slide 3` / `### Trang 3` (ưu tiên) → nếu không có thì `---` → nếu không có thì mỗi `## ` | một slide |
| `### …` | `subtitle`/khối con |
| gạch đầu dòng | `list` hoặc `bento` (nếu có "Tiêu đề: mô tả") |
| số + đơn vị (%, tỷ, triệu, USD, km…) | gợi ý `metric`/`towers` |
| năm/ngày đầu dòng | gợi ý `timeline` |
| `A → B → C` | gợi ý `flow` |
| `> trích dẫn — tác giả` | `quote` |
| ``` code ``` | `code` |
| `$$…$$` | `math` |
| `![alt](url)` | `image`/`gallery` |
| link YouTube | `video` |
| bảng markdown | `table` |
Skeleton chỉ là gợi ý — **bạn quyết định** hero visual theo bảng trên.

## Ví dụ theo chủ đề (rút gọn)

**Kinh tế** — "Một tập đoàn lớn hơn cả một nền kinh tế"
```ts
{ id: 's03', section: 'Quy mô', title: 'Một tập đoàn **lớn hơn** cả một nền kinh tế',
  blocks: [{ type: 'metric', items: [
    { value: 391, suffix: ' tỷ USD', label: 'Doanh thu Apple 2024', tone: 'alert', source: 'apple10k' },
    { value: 476, suffix: ' tỷ USD', label: 'GDP Việt Nam 2024', tone: 'cool', source: 'wb' }] }],
  scene: { name: 'towers', purpose: 'Hai cột gần bằng nhau: doanh thu một công ty xấp xỉ GDP cả nước.',
    state: { unit: 'tỷ USD', items: [{ label: 'Apple', value: 391, tone: 'alert' }, { label: 'Việt Nam', value: 476, tone: 'cool' }] } } }
```

**Lịch sử / nghệ thuật** — tường tranh + dòng thời gian theo nhịp
```ts
{ id: 's04', layout: 'split-right', title: 'Ba thế kỷ, ba cách vẽ ánh sáng',
  scene: { name: 'gallery', purpose: 'Ba bức tranh thật xếp theo thời gian để thấy ánh sáng thay đổi.',
    state: { arrangement: 'arc', items: [{ src: URL1, label: '1642' }, { src: URL2, label: '1872' }, { src: URL3, label: '1907' }], focus: 0 } },
  sceneBeats: [{}, { focus: 1 }, { focus: 2 }],
  blocks: [{ type: 'list', stepwise: true, items: ['Baroque: tương phản mạnh', 'Ấn tượng: ánh sáng tự nhiên', 'Lập thể: phá phối cảnh'] }] }
```

**Du lịch / địa lí** — `globe` với `route` + `sceneBeats: [{active:0},{active:1},{active:2}]`.

**Toán** — `plot` `{ mode: 'surface', fn: 'sin(x)*cos(y)', label: 'z = sin x · cos y' }` + `math` ở slide kế.

**Khoa học** — `model` phân tử (.glb) với `hotspots`, hoặc `diagram` chu trình tự vẽ có `draw: true`.

**CNTT** — `code` (có `highlight`) trên `grid`; slide kế `network` kiến trúc dịch vụ.

**Chính trị / xã hội** — `network` các chủ thể (nhà nước, doanh nghiệp, người dân) + `compare` hai quan điểm.

**Văn học** — `quote` lớn trên `center` + ảnh nền tác giả (duotone) — không cần 3D.

**Pitch** — `metric` hero 3 số → `chart` tăng trưởng → `towers` thị trường → `lottie` sản phẩm (1 lần) → `cover` kết.

Ví dụ đầy đủ: `template/examples/*` (chạy `npm run use-example -- <tên>`).
