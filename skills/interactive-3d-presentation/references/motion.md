# Chuyển động & nhịp

## Nguyên tắc
Chuyển động phải **nói đúng điều lời nói đang nói**. Người nói bấm → thứ họ sắp nói xuất hiện/sáng lên. Không có
chuyển động nào chỉ để "cho sinh động".

## Có sẵn, tự động (không cần cấu hình)
| Phần tử | Chuyển động |
|---|---|
| kicker | trượt từ trái |
| tiêu đề | hiện theo từng dòng (SplitText, mặt nạ giữ dấu tiếng Việt) |
| lead, footer, meta | mờ dần lên |
| block, mục list, thẻ | trồi lên lần lượt (stagger 0.08 s) |
| metric | số đếm lên theo locale (514,7 / 514.7) |
| chart | đường vẽ ra, cột/miếng mọc lên |
| diagram | nét SVG tự vẽ |
| cảnh 3D | cùng loại cảnh giữa hai slide → **biến hình liên tục** (cột đổi chiều cao, địa cầu quay tới điểm mới); khác loại → mờ chéo |
| chuyển slide | fade + trượt nhẹ theo hướng đi |

## Nhịp (beats) — người nói điều khiển từng bước
```ts
blocks: [
  { type: 'list', stepwise: true, items: ['A', 'B', 'C'] },        // A ở nhịp 1, B nhịp 2, C nhịp 3
  { type: 'callout', beat: 4, label: 'Kết luận', body: '…' },      // hiện ở nhịp 4
],
scene: { name: 'flow', purpose: '…', state: { steps: [...], active: 0 } },
sceneBeats: [{}, { active: 0 }, { active: 1 }, { active: 2 }],      // cảnh đi theo lời kể
```
- `stepwise` + `beat: 0` → mục đầu hiện ngay khi vào slide.
- Hết nhịp mới sang slide; lùi từ nhịp 0 → về nhịp cuối slide trước.
- Hash `#5.2` mở thẳng slide 5 nhịp 2 (tập dượt). Presenter view hiện chấm nhịp.
- Gợi ý: ≤ 5 nhịp/slide; slide mở đầu và trích dẫn thường không cần nhịp.

Chú thích bút tay (`slide.annotations[].beat`) và đường nối (`slide.connectors[].beat`) cũng là nhịp: người nói bấm → nét
khoanh/mũi tên/đường nối vẽ ra đúng lúc nói tới.

## Mẫu nhịp theo nội dung
| Nội dung | Nhịp |
|---|---|
| Hành trình | `globe.route` + `sceneBeats` tăng `active` từng chặng + list stepwise tên chặng |
| Quy trình | `flow` scene `active` + flow/list block stepwise |
| Lịch sử | `timeline` scene `active` + timeline block stepwise |
| So sánh | `towers` cột thứ hai xuất hiện ở nhịp 1 (`sceneBeats: [{items:[a]}, {items:[a,b]}]`) |
| Tác phẩm | `gallery.focus` đổi theo nhịp |
| Lập luận | list stepwise → `callout` kết luận ở nhịp cuối (`style: 'stamp'` để "đóng dấu") |
| Chỉ vào số | block số liệu + `annotations: [{ type: 'circle', target: '62 kWh', beat: 1 }]` |
| Dòng chảy | 3 `callout` có `id`, `beat` 0/1/2 + `connectors` accent cùng nhịp |
| Mô hình | `model.morph` hoặc hotspot mới theo nhịp |

## Mức chuyển động (`brief.motion`)
- `calm`: chỉ chuyển động mặc định, không ThreeUI/Spline/parallax/model, không camera.
- `standard`: thêm nhịp cảnh, 1–2 cảnh nặng ở điểm nhấn.
- `cinematic`: thêm camera Theatre.js, hậu kỳ (`dof`, `noise`…), parallax mở đầu — vẫn một hero mỗi slide.

## Camera Theatre.js
1. `slide.camera = { sequence: 'bay-quanh', duration: 6 }`.
2. `npm run dev` → mở `http://localhost:5173/?studio#7` → panel Theatre hiện → chọn sheet `bay-quanh` → object `Camera`
   → bấm giữ phải vào `position` → *Sequence all* → kéo playhead, chỉnh số, đặt keyframe (camera mặc định z = 10, nhìn
   về `target` 0,0,0).
3. Project "Deck 3D" → Export → lưu thành `src/content/theatre-state.json`.
4. Khi trình chiếu, chuỗi tự phát khi vào slide; hết chuỗi camera đứng ở keyframe cuối; sang slide khác camera về chỗ cũ.
Không có keyframe → camera đứng yên (vô hại). Ví dụ: `examples/travel-hoi-an` slide 7.
Giữ chuyển động camera nhỏ (dịch ≤ 3–4 đơn vị), chậm (≥ 4 s), dễ chịu.

## Reduced motion
Người xem bật "giảm chuyển động" trong hệ điều hành → chữ/block hiện ngay ở trạng thái cuối (không trồi, không đếm
số, không vẽ nét), không camera Theatre.js; cảnh 3D vẫn hiển thị (chuyển động chậm, nhẹ). Không cần làm gì thêm;
đừng tạo animation riêng bỏ qua cờ này.
