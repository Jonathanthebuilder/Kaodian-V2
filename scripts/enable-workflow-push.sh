#!/usr/bin/env bash
# GitHub OAuth 需包含 workflow 权限才能推送 Actions 工作流文件。
# 运行本脚本后按提示在浏览器完成授权，再推送 workflow。

set -euo pipefail
cd "$(dirname "$0")/.."

echo "正在为 gh 令牌添加 workflow 权限（需在浏览器确认一次）…"
gh auth refresh -h github.com -s workflow

echo "正在提交并推送 .github/workflows/deploy.yml …"
git add .github/workflows/deploy.yml
git status
if git diff --cached --quiet; then
  echo "没有需要提交的变更。"; exit 0
fi
git commit -m "ci: GitHub Actions 部署到 Pages"
git push origin main

echo "完成。若已配置自定义域名，请在仓库 Settings → Pages 中检查 DNS 与 HTTPS。"
