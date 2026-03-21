#!/usr/bin/env bash
# GitHub OAuth 需包含 workflow 权限才能推送 Actions 工作流文件。
# 运行本脚本后按提示在浏览器完成授权，再推送包含 workflow 的提交。

set -euo pipefail
cd "$(dirname "$0")/.."

echo "正在为 gh 令牌添加 workflow 权限（需在浏览器确认一次）…"
gh auth refresh -h github.com -s workflow

echo "正在推送 main（含 .github/workflows/deploy.yml）…"
git push origin main

echo "完成。请打开 Actions 标签页确认构建成功。"
echo "站点： https://jonathanthebuilder.github.io/Kaodian-V2/"
