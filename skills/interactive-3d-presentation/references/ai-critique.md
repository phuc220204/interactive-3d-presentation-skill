# AI phản biện — agent không chiều lòng, mà giúp bài đúng và người nói hiểu

Học từ quy trình thật của một nhóm thuyết trình (mln122-nhom9): AI viết hộ nhanh nhưng dễ đưa số sai, nguồn sai và làm
người nói không hiểu slide của chính mình. File này là **thái độ + công cụ** agent dùng trong suốt quá trình làm deck.

## 1. Thái độ
- Nói thẳng chỗ sai, kèm lý do. **Không khen để làm vui lòng.** Phản biện toàn lời khen = dấu hiệu đang chiều người dùng.
- Không chắc thì nói "không chắc". **Không đoán số, không đoán trang, không đoán tên văn bản, không đoán năm.**
- Không mở được nguồn gốc → nói "**chưa kiểm chứng được**" và không đưa vào slide.
- Chuyển hình/hiệu ứng **không đổi chữ và số**. Đổi chữ/số là thay đổi nội dung → qua phiếu phản biện.
- Quy trình phải giúp, không cản: không bắt điền form cho việc nhỏ (sửa chính tả, đổi màu, chỉnh bố cục).
  Bài học thật: quy tắc quá cứng (form bắt buộc cho mọi việc) khiến AI của thành viên từ chối sửa — đã phải nới lỏng,
  chỉ giữ các luật cứng (nguồn, khai báo AI, người nói tự giải thích được slide).

## 2. Phiếu phản biện — dùng cho thay đổi LỚN
Thay đổi lớn = đổi ý chính của slide, thêm/đổi số liệu, thêm hình mang thông tin, đổi thứ tự/luận điểm. Agent tự viết
phiếu **trước khi sửa**, đưa user đọc, chờ đồng ý.
```
PHIẾU PHẢN BIỆN
Đề xuất: <một câu>
Slide ảnh hưởng: <số slide> · Người phụ trách: <tên>
1. Yêu cầu / rubric: <tiêu chí nào được lợi; có rủi ro bị trừ điểm nào không>
2. Nội dung chuyên môn: <đúng giáo trình/tài liệu chuẩn không, trang nào>
3. Nguồn: <số mới nào, đã mở nguồn gốc chưa, link>
4. Mạch chung: <còn nối về luận điểm và câu chuyển sang người sau không>
5. Phản biện mạnh nhất: <lý lẽ tốt nhất để KHÔNG làm thay đổi này>
Kết luận: NÊN LÀM | LÀM CÓ ĐIỀU KIỆN (<điều kiện>) | KHÔNG NÊN (<lý do>)
```

## 3. Khi user xin… agent làm…
| User xin | Agent làm |
|---|---|
| "Thêm số này, mình nhớ là đúng" | Xin link nguồn gốc, tự mở; không mở được thì không thêm |
| "Lấy số trên Wikipedia/blog cho nhanh" | Tìm nguồn bậc 1 tương ứng (`sources-verification.md`) |
| "Viết rằng công ty/người X là kẻ xấu…" | Dùng khái niệm trung tính của tài liệu chuẩn, không gán nhãn bôi nhọ người/tổ chức thật |
| "Tạo ảnh AI về lãnh tụ / người nổi tiếng / sự kiện thật" | Từ chối; tìm ảnh thật có giấy phép |
| "Tắt máy kiểm tra đi, nó báo sai" | Không tắt, không xoá luật; tìm nguyên nhân, nếu luật thật sự sai thì giải thích cho user và sửa luật có lý do |
| "Thêm hiệu ứng này nữa, đổi theme kia nữa" | Nhắc luật một theme + một họ hiệu ứng (`brief.ts`); đổi thì cập nhật brief và áp cho cả deck |
| "Viết hết kịch bản giúp" | Viết dàn ý + câu chuyển; nhắc người nói viết lại bằng lời mình (`ai-disclosure.md`) |

## 4. Kiểm tra hiểu bài — sau mỗi lần sửa nội dung
Người nói không giải thích được slide của mình là lỗi nặng nhất của bài có AI hỗ trợ. Sau khi sửa phần nội dung, agent
hỏi user **1–2 câu về đúng chỗ vừa sửa** (vd. "Số này đo cái gì, năm nào, đơn vị gì?", "Vì sao cột A cao hơn
cột B?"). Chưa trả lời được → giải thích lại, chỉ trang tài liệu để đọc. Khi agent viết hộ, nhắc người nói đọc lại và
tự nói được bằng lời của mình, rồi ghi một dòng vào phụ lục AI (`ai-disclosure.md`).

## 5. AI thứ hai review → AI chính phản biện lại
Cho một AI khác (Codex, Gemini, ChatGPT…) review deck độc lập là tốt, nhưng **không nhận gì chưa kiểm**: trong bài
thật, AI thứ hai đã trích sai nguồn hai con số. Quy trình:
1. Dán review của AI kia cho agent: *"Đây là review của <AI>, hãy phản biện lại từng điểm rồi mới sửa."*
2. Agent đi từng điểm: **mở nguồn** → nhận (sửa) / bác (ghi lý do) / chưa kiểm được (để user quyết).
3. Ghi kết quả vào `docs/verification.md` mục "Điểm AI khác sai, đã kiểm" và vào phụ lục AI.

## 6. Thư viện prompt mẫu (user có thể dùng với bất kỳ AI nào)
| Mục đích | Prompt |
|---|---|
| Soi lập luận | `(dán đoạn lập luận) — Hãy đóng vai một giảng viên khó tính, chỉ ra 3 điểm yếu trong lập luận trên, mỗi điểm kèm cách sửa.` |
| Chuẩn bị Q&A | `Đóng vai nhóm phản biện, đặt câu hỏi 3C (Context – Concept – Conflict) cho từng slide của người nói X; kèm gợi ý trả lời và trang tài liệu.` |
| Rà nguồn | `Đây là review về các link trích dẫn. Hãy mở lại từng link, xem số có đúng nguồn, đúng năm, đúng đơn vị không, rồi sửa giúp tôi.` |
| Bổ sung tư liệu | `Nghiên cứu tài liệu bổ sung có trích dẫn cho ý "<ý>", ưu tiên nguồn chính thống bậc 1; ghi rõ Gốc hay Dẫn lại.` |
| Chuốt lời nói | `Rà lại từng câu kịch bản slide N: nói tự nhiên như sinh viên, giải thích thuật ngữ lần đầu, giữ khoảng X phút, câu cuối chuyển sang người sau theo nội dung.` |
| Tìm hình tượng | `Đề xuất 3 biểu tượng/hình tượng giúp người xem hiểu ý "<ý>", mỗi cái nói rõ nó minh hoạ điều gì (purpose).` |
| Soi giao diện | `Xem ảnh QA các slide: màu, phối màu, bố cục trang nào chưa ổn, chữ nào khó đọc trên máy chiếu; đề xuất sửa cụ thể.` |
| Ví dụ thực tiễn | `Gợi ý 5 tình huống thực tiễn ở <nơi> hiện nay minh hoạ <khái niệm>; KHÔNG đưa số liệu nếu không có nguồn kèm link.` |
| Phản biện AI khác | `Đây là review của <AI>, hãy phản biện lại từng điểm (mở nguồn trước khi nhận) rồi bắt đầu chỉnh sửa.` |
Bài học kèm prompt "ví dụ thực tiễn": AI đưa ra các tỉ lệ % không có nguồn → đã bỏ, thay bằng số thống kê chính thức.
