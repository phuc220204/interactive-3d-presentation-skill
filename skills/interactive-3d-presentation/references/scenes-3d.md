# 15 cảnh 3D

Một canvas WebGL dùng chung cho cả deck; mỗi loại cảnh giữ một instance và **biến hình** giữa các slide (cột cao
lên/thấp xuống, địa cầu quay tới điểm mới) thay vì tải lại. Màu, nét, độ phát sáng tự theo theme (sáng: mực in; tối:
phát sáng). Nhãn trong cảnh là chữ DOM thật (sắc nét, có dấu).

Mọi cảnh khác `ambient` cần `purpose`. Trạng thái có thể đổi theo nhịp bằng `slide.sceneBeats`.

## Cảnh mang dữ liệu
### `towers` — cột 3D theo số liệu
```ts
{ name: 'towers', purpose: '…', state: { unit: '%', items: [{ label: 'A', value: 42, display: '42%', tone: 'alert' }, …] } }
```
2–6 cột, chiều cao tỉ lệ `value`. Dùng: so sánh quy mô (GDP, doanh thu, dân số, điểm số). Không dùng cho xu hướng.

### `globe` — địa cầu
`focus: [lat, lon]` quay điểm ra trước · `points[{at, label, tone}]` · `arcs[{from, to, tone}]` (dòng thương mại,
di cư, chuyến bay) · `route[{at, label}]` + `active` (hành trình đánh số, `sceneBeats` đẩy `active` từng chặng) ·
`spin`. Gần Việt Nam tự ghi **Hoàng Sa, Trường Sa (Việt Nam)**. Dùng: du lịch, địa lí, lịch sử chiến dịch, thương mại.

### `network` — mạng lưới chủ thể
`nodes[{id, label, tone, size, center}]`, `links[{a, b, tone}]`. ≤ 12 node. Dùng: quan hệ chính trị/xã hội,
chuỗi cung ứng, kiến trúc phần mềm, nhân vật tác phẩm.

### `flow` — đường ống quy trình
`steps[{label, tone}]`, `active`. 3–6 bước; `sceneBeats` chuyển `active` theo lời kể. Dùng: quy trình sản xuất,
cơ chế chính sách, pipeline dữ liệu, chu trình sinh học.

### `timeline` — dòng thời gian xoắn
`items[{label, tone}]`, `active`. 3–7 mốc. Dùng: lịch sử, lộ trình sản phẩm, tiểu sử.

### `plot` — đồ thị toán
`mode: 'surface'` + `fn` theo x, y (vd. `sin(x)*cos(y)`) hoặc `matrix`; `mode: 'curve'` + `fn` theo x;
`range`, `label`, `tone`. Hàm cho phép: `+ - * / ^ ( ) sin cos tan exp log sqrt abs pow min max pi e`.
Dùng: hàm số, tối ưu, địa hình dữ liệu, xác suất.

## Cảnh cho asset 2D/3D thật
### `gallery` — tranh/ảnh treo trong không gian
`items[{src, label}]`, `arrangement: 'arc' | 'wall' | 'stack'`, `focus` (ảnh đưa lên trước), `frame` (passe-partout).
3–5 ảnh là đẹp nhất. Dùng: nghệ thuật, lịch sử (ảnh tư liệu), du lịch, portfolio sản phẩm.

### `parallax` — chiều sâu 2.5D từ nhiều lớp 2D
`layers[{src, depth 0..1, scale, x, y}]`: nền ảnh thật (depth 0) + lớp PNG/SVG cắt nền phía trước. Chuột/nhịp làm
các lớp lệch nhau. Dùng: phong cảnh, phố cổ, mở đầu điện ảnh. Có sẵn `public/assets/parallax/rooftops.svg`,
`lanterns.svg`. Hiệu ứng nặng — 1–2 lần/deck.

### `model` — mô hình glTF/GLB
`src`, `rotate`, `tilt`, `hotspots[{at:[x,y,z] (-1..1 theo khung bao), label}]`, `morph: {tenTarget: 0..1}`
(tween theo nhịp), `clip` (tên animation). Lỗi tải → tự chuyển `ambient`. Dùng: di vật, kiến trúc, phân tử,
sản phẩm. Nguồn model: `assets.md`.

### `cards` — giấy tờ/đồ vật 3D
`cards[{kind, label, src, tone}]`, kind: `doc invoice qr photo chart note code book phone ticket letter map`.
`ticket` lấy mã từ label "A → B". Dùng: hồ sơ pháp lý, hoá đơn, thư từ lịch sử, vé hành trình, app điện thoại.

### `gear` — bánh răng 3D đùn khối
`state: { labels: ['bánh chính', 'bánh nhỏ 1', 'bánh nhỏ 2'], teeth, tone, spin }`. Bánh răng nghiêng từ cạnh sang 3/4, ba bánh
ăn khớp quay ngược chiều. Dùng: hệ thống nhiều bộ phận phải cùng chạy (sản xuất, máy móc, quy trình, tổ chức).

## Cảnh ý niệm (không mang số)
### `morph` — đám hạt biến hình
`shape`: `sphere grid wave cluster converge split ring helix cube scatter` + hình cụ thể `person gear chip house arrow`; `tone`.
- `path`: hình tuỳ ý — SVG path trong hộp 0–100 (bản đồ một nước, logo, sản phẩm) → hạt lấp đầy hình đó.
- `stages: [{ shape | path, label }]` + `stageSeconds`: tự chạy một chuỗi hình có nhãn (vd. 4 thời kỳ sản xuất: nhà → bánh răng → chip → mạng), đặt cạnh list `stepwise` cùng thứ tự. Dùng có nghĩa: `converge` =
hội tụ/thống nhất, `split` = đối lập, `cluster` = phân mảnh, `helix` = sinh học/tiến hoá, `grid` = hệ thống/quy
chuẩn. Không dùng làm nền chung.

### `ambient` — nền nhẹ (mặc định)
`state: { density, tone }`. Cho slide chữ/có block hình. Không cần `purpose`.

## Cảnh DOM (thư viện ngoài)
### `threeui` — 18 hiệu ứng ThreeUI (MIT, Meng To)
```ts
{ name: 'threeui', component: 'NebulaBackground', placement: 'background', purpose: '…', props: { opacity: 0.6 } }
```
`placement: 'background'` (nền toàn màn dưới chữ) hoặc `'visual'` (trong vùng hình của layout, viền mờ).
Theme sáng: hiệu ứng "native" vẽ được trên nền sáng; "invert" được đảo màu tự động.
| Hiệu ứng | Gợi ý nghĩa |
|---|---|
| DotMatrixBackground | công nghệ, số hoá, hệ thống |
| RibbonFieldBackground | mở đầu thanh lịch, văn hoá, tài chính |
| StreamConvergenceBackground | hội tụ, tích hợp, chính sách thống nhất |
| EmeraldHorizonBackground | tầm nhìn, tương lai, bền vững, kết |
| WarpFieldBackground | tăng tốc, bước ngoặt, đột phá |
| FlowField | dòng vốn/hàng hoá, thị trường vận động |
| TopoField | địa hình, địa lí, nghiên cứu nhiều lớp |
| ParticleDrift | slide trích dẫn/suy ngẫm, yên tĩnh |
| ConstellationField | tri thức kết nối, giáo dục, vũ trụ |
| NebulaBackground | mở đầu điện ảnh, bức tranh lớn |
| ParticleNetwork | các bên liên quan, mạng xã hội/kinh tế |
| ConnectivityGraph | hạ tầng, nền tảng, kết nối |
| WireframeForms | cấu trúc, khung lý thuyết, mô hình |
| GlobeCollection | năng lượng, ý tưởng lõi (không có dữ liệu) |
| OrbitalSphereBackground | hệ sinh thái, chủ thể trung tâm |
| GenerativeTree | tăng trưởng, phát triển, giáo dục |
| LogicCoreField | AI, tính toán, động cơ hệ thống |
| TopologyField | độ phức tạp, địa hình dữ liệu |
Xem thử: `/?threeui=TenHieuUng`. Credit ThreeUI tự thêm vào slide nguồn.

### `spline` — cảnh dựng trên spline.design
```ts
{ name: 'spline', scene: 'https://prod.spline.design/<id>/scene.splinecode', placement: 'visual', purpose: '…' }
```
User dựng/chọn cảnh trên spline.design → Export → Code → "Public URL". Tải chậm (~1–3 MB), lỗi → ambient.
Muốn offline: `npm run assets:pull` tải file `.splinecode` về.

## Camera theo kịch bản (Theatre.js)
`slide.camera = { sequence: 'bay-quanh', duration: 6 }` phát chuỗi keyframe camera khi vào slide. Soạn bằng
`npm run dev` → `/?studio` (chỉ dev), Export → lưu vào `src/content/theatre-state.json`. Xem `motion.md`.

## Hậu kỳ
`theme.effects` (bloom theo theme; thêm `dof`, `tiltShift`, `sepia`, `halftone`, `chromatic`, `noise`) — xem `themes.md`.
