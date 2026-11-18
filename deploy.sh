#!/usr/bin/env bash
# อัปโหลดเว็บขึ้น GitHub Pages ด้วยคำสั่งเดียว
# ต้องมี: git, gh (GitHub CLI) และเคย `gh auth login` แล้ว
set -euo pipefail
cd "$(dirname "$0")"

REPO="${1:-geometry-formulas}"
USER_NAME="$(gh api user --jq .login)"
VIS="${VISIBILITY:-public}"   # ถ้าบัญชีเป็น Pro: VISIBILITY=private bash deploy.sh

[ -d .git ] || { git init -q -b main; }
git add -A
git commit -q -m "update site" 2>/dev/null || echo "(ไม่มีอะไรเปลี่ยน)"

if ! gh repo view "$USER_NAME/$REPO" >/dev/null 2>&1; then
  gh repo create "$REPO" "--$VIS" --source=. --remote=origin --push
  # เปิด Pages จากสาขา main
  gh api -X POST "repos/$USER_NAME/$REPO/pages" -f "source[branch]=main" -f "source[path]=/" >/dev/null 2>&1 || true
else
  git remote get-url origin >/dev/null 2>&1 || git remote add origin "https://github.com/$USER_NAME/$REPO.git"
  git push -u origin main
fi

echo
echo "✅ เสร็จแล้ว (รอ 1-2 นาทีให้ GitHub สร้างเว็บ)"
echo "🌐 https://$USER_NAME.github.io/$REPO/"
