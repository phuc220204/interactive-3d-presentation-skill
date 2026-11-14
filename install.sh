#!/usr/bin/env bash
# Cài skill interactive-3d-presentation cho các AI agent (macOS / Linux / Git Bash).
#
#   ./install.sh                        # cài toàn cục cho mọi agent hỗ trợ (Claude Code, Codex, Antigravity)
#   ./install.sh --agent claude         # chỉ một agent: claude | codex | antigravity | all
#   ./install.sh --project ~/my-deck    # cài vào một dự án thay vì toàn cục
set -euo pipefail

NAME="interactive-3d-presentation"
SRC="$(cd "$(dirname "$0")" && pwd)/skills/$NAME"
AGENT="all"
PROJECT=""
while [ $# -gt 0 ]; do
  case "$1" in
    --agent) AGENT="$2"; shift 2 ;;
    --project) PROJECT="$2"; shift 2 ;;
    -h|--help) sed -n '2,7p' "$0"; exit 0 ;;
    *) echo "Tham số không hợp lệ: $1"; exit 1 ;;
  esac
done
[ -f "$SRC/SKILL.md" ] || { echo "Không thấy $SRC/SKILL.md — chạy script trong thư mục repo."; exit 1; }

targets=()
add() { case " ${targets[*]-} " in *" $1 "*) ;; *) targets+=("$1") ;; esac; }
if [ -n "$PROJECT" ]; then
  [[ "$AGENT" == all || "$AGENT" == claude ]] && add "$PROJECT/.claude/skills"
  [[ "$AGENT" == all || "$AGENT" == codex || "$AGENT" == antigravity ]] && add "$PROJECT/.agents/skills"
else
  [[ "$AGENT" == all || "$AGENT" == claude ]] && add "$HOME/.claude/skills"
  [[ "$AGENT" == all || "$AGENT" == codex ]] && add "$HOME/.agents/skills"
  [[ "$AGENT" == all || "$AGENT" == antigravity ]] && add "$HOME/.gemini/config/skills"
fi
[ ${#targets[@]} -gt 0 ] || { echo "--agent phải là claude | codex | antigravity | all"; exit 1; }

for dir in "${targets[@]}"; do
  mkdir -p "$dir"
  rm -rf "${dir:?}/$NAME"
  mkdir -p "$dir/$NAME"
  # copy everything except a local node_modules / build output
  (cd "$SRC" && tar --exclude=./template/node_modules --exclude=./template/dist --exclude=./template/dist-single --exclude=./template/qa --exclude=./template/.content-backup -cf - .) | (cd "$dir/$NAME" && tar -xf -)
  echo "✔ $dir/$NAME"
done
echo "Xong. Khởi động lại agent rồi yêu cầu: \"Tạo slide 3D tương tác về <chủ đề>\"."
