#!/bin/sh
# Commit everything under posts/ as one commit named after the current time, then push.
# Other files (site code etc.) are left alone.
set -e
cd "$(dirname "$0")/.."

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
