# AGENTS.md

Repo này chứa một Agent Skill: **interactive-3d-presentation** — dựng bài thuyết trình web 16:9 có tương tác 3D
(và landing page cuộn mượt) cho mọi chủ đề.

Khi user yêu cầu tạo slide / bài thuyết trình / deck / landing page có 3D (dù agent của bạn chưa tự nạp skill):
1. Đọc `skills/interactive-3d-presentation/SKILL.md` và làm đúng quy trình 10 bước trong đó — **bắt đầu bằng việc hỏi brief**
   (`skills/interactive-3d-presentation/references/brief-intake.md`).
2. Dựng deck bằng cách copy `skills/interactive-3d-presentation/template/` ra một thư mục mới **ngoài repo này**
   (vd. `../ten-deck`), rồi `npm install`. Không sửa trực tiếp template trong repo.
3. Đọc thêm file trong `skills/interactive-3d-presentation/references/` khi SKILL.md chỉ tới.

Khi user muốn sửa chính skill này: tài liệu ở `skills/interactive-3d-presentation/SKILL.md` + `references/` (viết tiếng
Việt), engine ở `skills/interactive-3d-presentation/template/src/`. Sau khi sửa engine: `npm install`, `npm run validate`,
`npm run build`, và `npm run qa` (cần `npm run dev` đang chạy) trong thư mục template.
