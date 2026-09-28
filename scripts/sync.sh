#!/bin/sh
# Build, then commit everything under posts/ as one commit named after the current time, and push.
# Other files (site code etc.) are left alone.
set -e
cd "$(dirname "$0")/.."

# Build first so a broken post (e.g. a missing image) never gets pushed.
log="$(mktemp)"
if ! npm run build >"$log" 2>&1; then
  grep -iE -A3 'error' "$log" || tail -20 "$log"
  echo "빌드가 실패해서 올리지 않았어요. 위 에러를 고친 뒤 다시 실행하세요."
  exit 1
fi

git add posts
if git diff --cached --quiet -- posts; then
  echo "올릴 변경 사항이 없어요."
else
  git commit -q -m "$(date '+%Y-%m-%d %H:%M')" -- posts
  git log --oneline -1
fi
git pull -q --rebase --autostash
git push -q
echo "push 완료. 1~2분 뒤 사이트에 반영돼요."
