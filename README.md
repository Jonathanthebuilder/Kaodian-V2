# 德国入籍考点通（Kaodian v2）

静态站点：按**联邦州（Bundesland）**查询德国入籍考试（*Leben in Deutschland* / Einbürgerungstest）常见考点机构（多为 VHS 等），支持区域内筛选、关键词搜索，以及一键复制地址与联系方式。

## 本地开发

```bash
npm install
npm run dev
```

浏览器打开终端提示的本地地址即可。

## 数据更新

原始页面文本保存在 `data/raw-source.txt`。若你替换了该文件，可重新生成 JSON：

```bash
npm run parse-data
```

会写入 `public/data/venues.json`（16 个联邦州，约 706 条机构记录）。

## 构建与预览

```bash
npm run build
npm run preview
```

产物在 `dist/`，为纯静态文件，可部署到任意静态托管。

## GitHub Pages 部署（当前进度）

| 项目 | 状态 |
|------|------|
| 仓库 | [Jonathanthebuilder/Kaodian-V2](https://github.com/Jonathanthebuilder/Kaodian-V2) |
| 默认站点 URL | <https://jonathanthebuilder.github.io/Kaodian-V2/>（workflow 推送成功并跑通 Actions 后生效） |
| Pages 源 | 已设为 **GitHub Actions**（workflow） |
| `public/CNAME` | 已包含 `kaodian.94software.com`（构建后会写入 `dist/CNAME`） |

### 还需你在本机执行的一步（约 1 分钟）

GitHub 要求：推送 **Actions 工作流文件**（`.github/workflows/*.yml`）时，OAuth 令牌必须带 **`workflow` 权限**。当前环境无法替你完成该授权，请在本项目目录执行：

```bash
bash scripts/enable-workflow-push.sh
```

脚本会：`gh auth refresh -s workflow`（在浏览器确认一次）→ `git push origin main`，把**已包含** `deploy.yml` 的提交推上去。推送成功后，在 **Actions** 里等待绿色勾，即可访问上面的 `github.io` 地址。

若你更习惯手动操作，等价命令为：

```bash
gh auth refresh -h github.com -s workflow
git push origin main
```

### 绑定原域名 `kaodian.94software.com`

1. 在仓库 **Settings → Pages → Custom domain** 填写 `kaodian.94software.com` 并保存（与 `public/CNAME` 一致）。
2. 在 DNS 服务商处为子域名添加 **CNAME**：主机名 `kaodian` → 目标 **`jonathanthebuilder.github.io`**（不要加 `https://`）。
3. 等待校验通过后在 Pages 中勾选 **Enforce HTTPS**。

`vite.config.ts` 已使用 **`base: './'`**，`github.io/仓库名` 与自定义域名根路径均可正常加载静态资源与数据。

---

## 其他托管（可选）

| 平台 | 说明 |
|------|------|
| [Cloudflare Pages](https://pages.cloudflare.com/) | 连接 Git 或上传 `dist` |
| [Netlify](https://www.netlify.com/) | 构建命令 `npm run build`，目录 `dist` |

本站无服务端接口，无需数据库或 Node 运行时。

## 技术栈

- [Vite](https://vitejs.dev/) + TypeScript
- 无前端框架，便于长期维护与托管

## 免责声明

考点与联系方式来自公开整理，**报名与考试安排以各机构及外管局最新规定为准**。
