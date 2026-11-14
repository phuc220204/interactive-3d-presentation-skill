# Content schema — `src/content/*`

**Nguồn sự thật: `src/types.ts`** (có chú thích từng trường). File này tóm tắt và cho ví dụ. Engine (`src/deck`,
`src/three`, `src/blocks`…) **không sửa** khi làm deck; chỉ sửa `src/content/` và `public/assets/`.

```
src/content/
  slides.ts          deck: DeckMeta + slides: Slide[]          ← phần chính
  notes.ts           Record<slideId, string>  lời nói (Markdown nhẹ, [chỉ dẫn sân khấu] trong ngoặc vuông)
  sources.ts         Source[]  nguồn APA + credit asset
  theme.ts           theme = preset('ivory', { colors?, fonts?, effects? })
  brief.ts           Brief  điều đã chốt với user ở bước 0
  theatre-state.json trạng thái Theatre.js (camera sequence), {} nếu không dùng
public/assets/       diagrams/ · user/ · lottie/ · parallax/ · models/ · remote/ (assets:pull)
```

## DeckMeta
```ts
export const deck: DeckMeta = {
  title: 'Hội An — một ngày đi bộ', brand: 'NHÓM 3 · DU LỊCH', lang: 'vi',   // 'vi' | 'en' — chữ giao diện
  targetMinutes: 12,            // npm run script cảnh báo khi lời nói dài hơn
  offline: true,                // validator bắt buộc assets:pull
  mode: 'deck',                 // 'scroll' = landing page Lenis
  bannedDomains: ['wikipedia.org'],  // nguồn thuộc miền này → lỗi
  academic: true,               // + danh sách miền cấm mặc định (Wikipedia, MXH, blog, chat AI…)
  sensitiveTerms: ['bóc lột'],  // validator nhắc cân nhắc cách diễn đạt
  labels: { sources: 'Tham khảo' },  // ghi đè chữ giao diện (xem src/i18n.ts)
};
```

## Slide
| Trường | Ý nghĩa |
|---|---|
| `id` | `s01`, `s02`… (khớp `notes.ts`) |
| `section` | nhãn phần, góc trên phải |
| `layout` | `cover` · `split` (mặc định) · `split-right` · `center` · `grid` · `full` · `references` |
| `kicker` | dòng nhỏ trên tiêu đề ("02 · BỐI CẢNH") |
| `title` | **câu khẳng định/câu hỏi**, Rich |
| `subtitle`, `lead` | phụ đề, đoạn dẫn 1–3 câu |
| `meta` | cover: nhóm, người trình bày, ngày… |
| `blocks` | `Block[]` (xem `layouts-blocks.md`) — 0–3 block |
| `scene` | **bắt buộc**; `{ name: 'ambient' }` khi slide không cần 3D |
| `image` | ảnh nền `{ src, alt, sourceId, treatment, opacity }` — `treatment` mặc định `'color'` (màu gốc) |
| `scope` | chú thích "GIỚI HẠN" cuối slide |
| `sources` | id nguồn hiện ở footer NGUỒN (tự gộp thêm các `[..](^id)` trong slide) |
| `speaker` | người nói (presenter + SCRIPT.md) |
| `beats` | ép số nhịp (thường để engine tự tính) |
| `sceneBeats` | trạng thái cảnh theo nhịp, gộp dồn |
| `camera` | `{ sequence: 'ten', duration: 6 }` Theatre.js |
| `annotations` | chú thích bút tay theo nhịp (`layouts-blocks.md`) |
| `connectors` | đường nối giữa các block có `id` |
| `minutes` | thời lượng dự kiến của slide → presenter + SCRIPT.md |
| `qaWait` | chờ thêm (ms) trước khi QA chụp slide nặng |

## Scene
```ts
scene: {
  name: 'globe',                                   // xem scenes-3d.md (14 cảnh)
  purpose: 'Tuyến đường ba chặng sáng dần theo lời kể.',   // BẮT BUỘC trừ ambient
  state: { route: [{ at: [21.03, 105.85], label: 'Hà Nội' }, { at: [16.46, 107.59], label: 'Huế' }, { at: [15.88, 108.33], label: 'Hội An' }], active: 0 },
  anchor: [0.72, 0.5], scale: 1.1,                 // tuỳ chọn: vị trí (tỉ lệ sân khấu) và cỡ
}
```

## Nhịp (beats)
Một slide có nhịp 0 (vào slide) và các nhịp 1…n. → / Space / click / bút = nhịp tiếp; hết nhịp mới sang slide.
- `block.beat: k` — block hiện ở nhịp k.
- `block.stepwise: true` — list/bento/timeline/flow/table hiện từng mục, mục đầu ở nhịp `beat` (mặc định 1).
- `slide.sceneBeats` — mảng trạng thái cảnh, phần tử i áp dụng ở nhịp i và **gộp dồn** vào `scene.state`:
```ts
blocks: [{ type: 'timeline', stepwise: true, beat: 1, items: [...3 mốc] }],
scene: { name: 'timeline', purpose: '…', state: { items: [...], active: 0 } },
sceneBeats: [{}, { active: 0 }, { active: 1 }, { active: 2 }],   // nhịp 0..3
```
Hash URL `#4.2` = slide 4, nhịp 2.

## Trích dẫn sống
- Trong Rich text: `[514,7 tỷ USD](^unctad2025)` → chữ có gạch chấm, bấm mở ngăn nguồn (APA, link, loại, giấy phép).
- `metric.items[].source`, `chart.source` → số/biểu đồ trở thành trích dẫn.
- Phím **K** soi mọi chỗ có nguồn trên slide. Mọi id phải tồn tại trong `sources.ts` (validator).

## Source
```ts
{ id: 'hoian-photo', kind: 'photo', license: 'CC BY-SA 4.0',
  short: 'Nguyễn (2022)', url: 'https://commons.wikimedia.org/wiki/File:…',
  apa: 'Nguyễn, V. (2022). *Chùa Cầu, Hội An* [Ảnh]. Wikimedia Commons. https://…',
  assets: ['https://upload.wikimedia.org/…/Chua_Cau.jpg'] }   // URL/đường dẫn asset mà entry này credit
// số liệu: page: 'tr. 112' · use: 'GDP danh nghĩa, giá hiện hành' · status: 'original' | 'secondary' (Dẫn lại)
// → hiện trong ngăn nguồn khi khán giả bấm vào số
```
`kind`: `text` · `data` · `photo` · `user` (ảnh user gửi) · `ai` (trang trí AI, phải `depictsReal: false`) ·
`diagram` · `video` · `model` · `lottie` · `spline` · `effect` (thư viện code). Validator đối chiếu mọi asset trên
slide với `assets`/`url` của nguồn → cảnh báo asset chưa có credit.

## Brief
Xem `brief-intake.md`. `theme.ts` phải dùng đúng `brief.theme`; scene phải nằm trong `brief.scenes`.

## Notes
```ts
export const notes: Record<string, string> = {
  s01: 'Chào thầy cô và các bạn. [dừng 2 giây] Hôm nay nhóm mình…',
};
```
`npm run script` → `SCRIPT.md` (lời nói, người nói, số nhịp, thời lượng ước tính; bỏ qua [chỉ dẫn]).
