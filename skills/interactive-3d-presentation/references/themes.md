# Theme

Một deck = một theme (`src/content/theme.ts`, khớp `brief.theme`). Theme điều khiển: màu (biến CSS → Tailwind
`bg-bg`, `text-accent`…), font, "skin" thẻ (editorial/clean/sketch/chalk), hoa văn nền (plain/grid/dots/lined/
blueprint/paper/chalk), cách 3D hoà trộn (phát sáng trên nền tối, mực in trên nền sáng), bloom, hạt nhiễu, bo góc.

## 8 preset
| Preset | Chế độ | Cảm giác | Font | Hợp với |
|---|---|---|---|---|
| `obsidian` | tối | điện ảnh, sang, vàng + đỏ son | Playfair Display / Be Vietnam Pro | kinh tế, chính trị, hội thảo, mở đầu ấn tượng |
| `ivory` | sáng | giấy ngà, báo chí học thuật | Playfair Display / Lora | lịch sử, văn học, nghệ thuật, luận văn |
| `whiteboard` | sáng | bảng trắng lưới, bút dạ | Be Vietnam Pro 800 | bài giảng, đào tạo nội bộ, khoa học |
| `chalkboard` | tối | bảng phấn xanh, nét phấn | Itim / Mali | toán, khoa học, lớp học |
| `sketchbook` | sáng | sổ vẽ tay, giấy ấm, bút highlight | Pangolin / Mali | du lịch, sáng tạo, thiếu nhi, ý tưởng |
| `blueprint` | tối | bản vẽ kỹ thuật xanh | Space Grotesk / IBM Plex Mono | kỹ thuật, CNTT, kiến trúc |
| `neon` | tối | keynote công nghệ, lime + magenta | Space Grotesk | pitch, sản phẩm, sự kiện công nghệ |
| `drafting` | sáng | bản vẽ kỹ thuật trên giấy can: lưới 2 cấp, khung tự vẽ, gạch chéo, bút dạ quét, chuyển cảnh lau, tiến độ sợi chỉ | Space Grotesk / IBM Plex Mono | kỹ thuật, năng lượng, bài giảng, quy trình, kinh tế học |

Mọi font có dấu tiếng Việt và được đóng gói sẵn (chạy offline).

## Tuỳ biến
```ts
import { preset } from '../themes';
export const theme = preset('whiteboard', {
  colors: { accent: '#0a7b5c', alert: '#c2410c' },             // màu thương hiệu
  fonts: { display: "'Montserrat', 'Be Vietnam Pro', sans-serif" },
  effects: { tiltShift: true },                                  // hậu kỳ 3D (xem dưới)
  bloom: 0.4, grain: 0.03, radius: 8,
});
```
- Font mới: `npm i @fontsource/montserrat` rồi `import '@fontsource/montserrat/700.css'` (các độ đậm cần dùng) trong
  `src/main.tsx` — kiểm tra font có subset `vietnamese` trên fontsource.org. Không dùng link Google Fonts nếu cần offline.
- Màu: giữ tương phản chữ ≥ 4.5:1 với `bg`. `accent/alert/cool` phải phân biệt được với nhau.
- Xem thử preset khác: `/?theme=sketchbook`. Dev: Shift+T đổi vòng theme (chỉ để duyệt — deck thật một theme).

## Chuyển cảnh & thanh tiến độ
- `transition: 'wipe'` — slide mới lộ ra theo vệt quét có vạch sáng (bấm tiếp giữa chừng thì hoàn tất ngay); mặc định `'fade'`.
- `progress: 'thread'` — thanh tiến độ là sợi chỉ lượn sóng, có nút thắt ở chỗ đổi người nói; mặc định `'bar'`.
- Theme `drafting` bật sẵn cả hai; theme khác bật bằng `preset('ivory', { transition: 'wipe' })`.

## Biến thể sáng / tối khi trình chiếu (phím D)
Phòng quá sáng hoặc quá tối: nhấn **D** để đổi theme hiện tại sang biến thể sáng ↔ tối (giữ font, skin, màu nhấn được
chỉnh cho đủ tương phản), lựa chọn được nhớ trên máy đó; `?look=alt` để xem trước. Thiết kế và QA vẫn trên theme gốc.

## Hậu kỳ (`theme.effects`) — chọn tối đa 1–2
| Hiệu ứng | Giá trị | Cảm giác | Hợp với |
|---|---|---|---|
| bloom (`theme.bloom`) | 0–1.2 | phát sáng | theme tối |
| `dof` | true | chiều sâu ống kính, nền mờ | model, gallery |
| `tiltShift` | true | mô hình thu nhỏ | du lịch, bản đồ, đô thị |
| `sepia` | 0–1 | ảnh lưu trữ | lịch sử |
| `halftone` | true | chấm in báo | editorial, truyện tranh |
| `chromatic` | 0.0004–0.0015 | viền màu ống kính | công nghệ, neon |
| `noise` | 0–0.3 | hạt phim trong 3D | điện ảnh |
Hậu kỳ chỉ áp dụng cho lớp 3D, không làm mờ chữ.

## Ảnh theo theme
**Mặc định mọi ảnh giữ màu gốc (`'color'`).** Chỉ khi user yêu cầu một phong cách đồng bộ mới dùng: `treatment: 'duotone'` tô ảnh theo hai màu theme (đồng bộ mọi ảnh khác nguồn), `'mono'` đen trắng, `'color'` giữ
màu (tác phẩm nghệ thuật, sản phẩm — phải giữ màu thật).
