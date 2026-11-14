# Asset — tìm, dùng, ghi nguồn, mang theo offline

**Agent tự tìm hình phù hợp nội dung đang trình bày.** Không hỏi user "bạn có ảnh không?" cho từng slide — chỉ hỏi
một lần ở bước 0 (user có ảnh riêng/model/Spline/Lottie không). Còn lại tự tìm, tự xem, tự ghi nguồn.

## Thứ tự ưu tiên
1. **Ảnh/asset user gửi** → `public/assets/user/`, `kind: 'user'`, credit "Ảnh do tác giả cung cấp" (hoặc tên người chụp).
2. **Ảnh thật có giấy phép**, đúng đối tượng đang nói:
   - `npm run find-image -- "Chùa Cầu Hội An" [--png]` → tìm Wikimedia Commons, in URL ảnh, tác giả, giấy phép và
     entry `sources.ts` dán được ngay (`--png` ưu tiên ảnh đã tách nền cho parallax).
   - Công cụ tìm web của agent: Unsplash, Pexels (giấy phép tự do), trang chính thức (bảo tàng, cơ quan nhà nước,
     doanh nghiệp — ghi rõ "Nguồn: …"), Europeana, Library of Congress, The Met Open Access, Rijksmuseum (tác phẩm
     nghệ thuật public domain), NASA (khoa học, vũ trụ).
   - **Mở ảnh xem trước khi dùng**: đúng địa danh/tác phẩm/thời kỳ, đủ độ phân giải (≥ 1600 px cạnh dài cho ảnh
     hero), không watermark, không chữ to trên ảnh.
3. **Sơ đồ SVG tự vẽ** cho cơ chế, cấu trúc, chu trình, kiến trúc (xem dưới) → `kind: 'diagram'`.
4. **Lottie** cho icon/minh hoạ chuyển động (lottiefiles.com, lọc giấy phép miễn phí) → `kind: 'lottie'`.
5. **Model 3D** (.glb/.gltf): Sketchfab (lọc "Downloadable" + CC), Poly Haven (CC0), Khronos glTF Sample Assets,
   Smithsonian 3D (hiện vật, CC0) → `public/models/` hoặc URL có CORS, `kind: 'model'`. ≤ ~10 MB.
6. **Ảnh AI** — chỉ để **trang trí** (hoạ tiết nền, minh hoạ ý niệm): `kind: 'ai'`, `depictsReal: false`, nhãn
   "Minh hoạ tạo bởi AI" tự hiện. **Cấm** dùng ảnh AI cho người thật, sự kiện, địa danh làm bằng chứng, số liệu.

## Ghi nguồn (`sources.ts`) — bắt buộc cho mọi asset
```ts
{ id: 'chua-cau', kind: 'photo', license: 'CC BY-SA 4.0', short: 'Chainwit (2024)',
  url: 'https://commons.wikimedia.org/wiki/File:…',
  apa: 'Chainwit. (2024). *Chùa Cầu sau trùng tu* [Ảnh]. Wikimedia Commons. https://commons.wikimedia.org/wiki/File:…',
  assets: ['https://upload.wikimedia.org/wikipedia/commons/…/Chua_Cau.jpg'] }
```
- `assets` liệt kê URL/đường dẫn file thật đang dùng trên slide → validator đối chiếu; thiếu → cảnh báo.
- Ảnh nền slide: `image: { src, alt, sourceId: 'chua-cau' }`. Ảnh trong block: `credit: 'Chainwit / CC BY-SA'`.
- Slide `references` tự gom mọi nguồn, chia "Tài liệu" và "Hình ảnh & media".
- Nguồn học thuật: `deck.bannedDomains: ['wikipedia.org', 'blogspot.com']` để validator chặn.

## Sơ đồ SVG (block `diagram`)
- File trong `public/assets/diagrams/ten.svg`, `viewBox` rõ ràng, không kích thước cố định.
- Màu: dùng biến theme để đổi theme vẫn đẹp — `stroke="var(--c-ink)"`, `fill="var(--c-accent)"`, hoặc class có sẵn
  `.d-ink .d-accent .d-alert .d-cool .d-muted` (nét) và `.f-ink .f-accent .f-alert .f-cool .f-muted .f-bg2` (nền).
- Nét (`path`, `line`, `circle`…) tự "vẽ ra" khi vào slide/nhịp (`draw: true`); chữ trong SVG để trống `font-family` (kế thừa font theme).
- Mẫu: `public/assets/diagrams/neural-layers.svg`.

## Video
- File mp4/webm (tự phát, tắt tiếng, lặp) hoặc `youtube: 'id'` (chỉ tải khi bấm — không làm chậm deck, cần mạng).
- Credit trong `sources.ts` (`kind: 'video'`). Trình chiếu offline → dùng file thay YouTube.

## Spline
User dựng/chọn cảnh trên spline.design → **tắt Background** (để nền theme hiện qua) → Export → Code → Public URL
(`…/scene.splinecode`) → scene `spline`. Credit `kind: 'spline'`.

## Offline
`deck.offline: true` + `brief.offline: true` → `npm run assets:pull` tải mọi ảnh/model/lottie/spline từ xa về
`public/assets/remote/` và ghi `assets-map.json`; engine tự dùng bản local (`asset(url)`). Kiểm tra:
`npm run qa -- --offline` (chặn mọi request ra ngoài). Font, thư viện đã đóng gói sẵn.

## Kích thước & hiệu năng
Ảnh hero ≤ ~600 KB (JPG/WebP 2000 px), ảnh gallery ≤ 300 KB, PNG tách nền ≤ 1 MB, model ≤ 10 MB, Lottie ≤ 500 KB.
Wikimedia: dùng URL thumbnail `…/thumb/…/1920px-…jpg` thay vì ảnh gốc 20 MB.
