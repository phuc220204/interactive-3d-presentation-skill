# Bước 0 — Hỏi brief (bắt buộc trước khi dựng deck)

Mục tiêu: biết user muốn **sản phẩm cuối trông và vận hành thế nào** trước khi viết dòng nào. Hỏi gọn trong 1–2
lượt; mỗi câu có **đề xuất mặc định** (dựa trên chủ đề, xem `topics.md`) để user chỉ cần đồng ý hoặc sửa. Nếu công cụ
hỏi đáp có lựa chọn (AskUserQuestion…) thì dùng, tối đa 4 câu một lượt, câu quan trọng trước.

Không hỏi lại điều user đã nói. Nếu user bảo "tuỳ bạn" → tự chọn theo `topics.md`, rồi **tóm tắt lựa chọn trong
3–5 dòng** và làm luôn (user sửa sau được vì mọi thứ nằm trong `brief.ts` + `theme.ts`).

## Lượt 1 — Mục đích & phong cách (luôn hỏi)
| # | Câu hỏi | Lựa chọn gợi ý | Ghi vào |
|---|---|---|---|
| 1 | Deck dùng để làm gì, cho ai, bao nhiêu phút? | thuyết trình môn học · bài giảng · hội thảo · pitch gọi vốn · giới thiệu sản phẩm · landing page | `brief.purpose/audience/minutes`, `deck.targetMinutes` |
| 2 | Ngôn ngữ giao diện & nội dung? | Tiếng Việt · English | `brief.lang`, `deck.lang` |
| 3 | Phong cách / theme? (cho xem `effects-catalog.md` mục Theme) | obsidian (tối, sang) · ivory (giấy, học thuật) · whiteboard (bảng trắng) · chalkboard (bảng phấn) · sketchbook (sổ vẽ tay) · blueprint (bản vẽ kỹ thuật nền xanh) · drafting (bản vẽ trên giấy can, hiệu ứng nét tự vẽ) · neon (keynote công nghệ) · theo màu thương hiệu | `brief.theme`, `theme.ts` |
| 4 | Mức hiệu ứng? | **tĩnh lặng** (chữ & hình là chính, 3D nhẹ) · **tiêu chuẩn** (mỗi slide một hình 3D/2D có nghĩa) · **điện ảnh** (camera bay, hậu kỳ, vài cảnh lớn) | `brief.motion`, `brief.family` |

## Lượt 2 — Hình ảnh, asset, tương tác (hỏi khi chưa rõ)
| # | Câu hỏi | Lựa chọn gợi ý | Ghi vào |
|---|---|---|---|
| 5 | Font chữ? | giữ font của theme (đều có dấu tiếng Việt) · font thương hiệu (tên + file/URL Google Fonts) · viết tay · serif cổ điển · sans hiện đại | `theme.ts` → `fonts` |
| 6 | Màu thương hiệu / màu chủ đạo? | giữ màu theme · mã hex của user | `theme.ts` → `colors.accent/alert/cool` |
| 7 | Hình ảnh lấy từ đâu? (chọn nhiều) | ảnh thật agent tự tìm (có credit) · ảnh user gửi · sơ đồ SVG agent vẽ · minh hoạ AI (chỉ trang trí) · video/YouTube · không cần ảnh | `brief.imagery` |
| 8 | Có model 3D / cảnh Spline / Lottie riêng không? | không · có file .glb/.gltf · có link Spline · có file Lottie · nhờ agent tìm model miễn phí (Sketchfab/Poly Haven, có giấy phép) | `brief.imagery`, `scene.model/spline`, block `lottie` |
| 9 | Hiệu ứng muốn có? (cho xem catalog) | dữ liệu 3D (cột, địa cầu, mạng lưới) · tường ảnh/tranh 3D · parallax nhiều lớp · hạt/biến hình · nền động ThreeUI · camera bay · không 3D, chỉ 2D chuyển động | `brief.scenes`, `brief.family` |
| 10 | Trình chiếu thế nào? | phím + click + con lăn (mặc định) · bút trình chiếu · cửa sổ người nói 2 màn hình · bật thẻ Q&A bấm mở · nhiều người nói | `brief.interaction`, `slide.speaker` |
| 11 | Có mạng khi trình chiếu không? | có · không chắc / không → tải asset về máy | `brief.offline`, `deck.offline` |
| 12 | Dạng sản phẩm? | slide 16:9 (mặc định) · landing page cuộn mượt · cả hai (cùng nội dung, `?mode=scroll`) | `deck.mode` |
| 13 | Nguồn có yêu cầu riêng? | APA 7 (mặc định) · cấm Wikipedia/blog (học thuật) · không cần trích dẫn | `deck.bannedDomains` |
| 14 | Bài có chấm điểm? Rubric / yêu cầu của đề? | dán rubric · không chấm điểm | `brief.notes` (cờ phạt riêng), `submission-checklist.md` |
| 15 | Một người nói hay nhiều người? | 1 người (mặc định) · nhiều người (tên + slide) | `slide.speaker` — `npm run script` tính giờ theo từng người |
| 16 | Có phần hỏi đáp / phản biện / quiz không? | soạn câu hỏi 3C · quiz 5–10 câu · câu hỏi mở cho khán giả | `docs/qa-3c.md`, `docs/quiz.md` (`qa-defense.md`) |
| 17 | Có cần khai báo dùng AI? Lưu bằng Git/GitHub? | phụ lục AI · Git + CI | `ai-disclosure.md`, `workflow.md` |
| 18 | Học thuật nghiêm ngặt về nguồn? | có → bậc nguồn + miền cấm mặc định | `deck.academic: true` (`sources-verification.md`) |

## Mẫu câu hỏi gửi user (sửa theo ngữ cảnh)
> Trước khi dựng, mình chốt nhanh vài điểm (đã đề xuất sẵn, bạn chỉ cần sửa chỗ khác ý):
> 1. **Mục đích:** thuyết trình môn học ~15 phút, khán giả là giảng viên & lớp.
> 2. **Phong cách:** `ivory` — nền giấy ngà, chữ serif, hợp nội dung lịch sử. (Khác: bảng trắng, bảng phấn, sổ vẽ, tối sang trọng, bản vẽ kỹ thuật, neon.)
> 3. **Hiệu ứng:** tiêu chuẩn — mỗi slide một hình có nghĩa: dòng thời gian 3D, tường tranh 3D, bản đồ địa cầu; không dùng nền hạt bay.
> 4. **Hình ảnh:** mình tự tìm ảnh thật có giấy phép (Wikimedia…) và ghi nguồn; nếu bạn có ảnh riêng cứ gửi.
> 5. **Trình chiếu:** click/→/con lăn để qua từng ý, có cửa sổ ghi chú cho người nói; tải sẵn ảnh để chạy không cần mạng.
> Font, màu thương hiệu, model 3D riêng, video — bạn có yêu cầu gì không?

## Ghi brief
Sau khi chốt, ghi `src/content/brief.ts` (kiểu `Brief` trong `src/types.ts`) và `theme.ts`:
```ts
export const brief: Brief = {
  purpose: 'Thuyết trình môn Lịch sử 15 phút', audience: 'Giảng viên và lớp', minutes: 15, lang: 'vi',
  theme: 'ivory', family: 'editorial-2d',
  scenes: ['timeline', 'gallery', 'globe'],       // CHỈ những cảnh này (ambient luôn được phép)
  imagery: ['photo', 'diagram'], motion: 'standard',
  interaction: ['keys', 'click', 'wheel', 'clicker', 'presenter-window'], offline: true,
  notes: 'Font tiêu đề serif; nhấn màu đỏ son cho mốc chiến tranh.',
};
```
`family` — họ hiệu ứng duy nhất của deck:
| family | Cảm giác | Cảnh thường dùng |
|---|---|---|
| `data-3d` | số liệu sống, phân tích | towers, globe, network, flow, chart |
| `editorial-2d` | báo chí, học thuật, ảnh thật là chính | gallery, timeline, image, quote |
| `illustrated` | lớp học, sổ vẽ, thân thiện | diagram, plot, cards, lottie, parallax |
| `cinematic` | mở màn ấn tượng, kể chuyện | parallax, model, globe + camera Theatre, ThreeUI 1–2 lần |
| `technical` | kỹ thuật, lập trình, năng lượng | network, flow, gear, morph, plot + code, diagram, waffle, gauge, dimension, simulation |
| `playful` | sự kiện, giới trẻ, sản phẩm tiêu dùng | cards, morph, lottie, spline |

Validator: theme trong `theme.ts` phải trùng `brief.theme`; scene ngoài `brief.scenes` → lỗi; `motion: 'calm'` mà
dùng ThreeUI/Spline/parallax/model → cảnh báo. Muốn cho phép một hiệu ứng ThreeUI cụ thể: thêm
`'threeui:TenHieuUng'` vào `scenes` (vd. `'threeui:NebulaBackground'`).
