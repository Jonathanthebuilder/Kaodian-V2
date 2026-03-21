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

## 部署建议（替代 Firebase Hosting）

任选其一即可：

| 平台 | 说明 |
|------|------|
| [Cloudflare Pages](https://pages.cloudflare.com/) | 连接 Git 仓库或上传 `dist`，默认全球 CDN |
| [Netlify](https://www.netlify.com/) | 拖拽 `dist` 或 Git 集成，构建命令 `npm run build`，发布目录 `dist` |
| [GitHub Pages](https://pages.github.com/) | 见下文：已配置 `base: './'`，兼容 `github.io/仓库名` 与**自定义域名** |

本站无服务端接口，无需数据库或 Node 运行时。

### GitHub Pages + 绑定原域名（如 kaodian.94software.com）

**可以绑定。** GitHub Pages 支持在仓库里声明自定义域名，并在你的 DNS 商处把域名指到 GitHub。

1. **推送本仓库到 GitHub**（默认分支名 `main` 或 `master` 均可触发 [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)）。

2. **开启 Pages（GitHub Actions 构建）**  
   仓库 → **Settings** → **Pages** → **Build and deployment** → **Source** 选 **GitHub Actions**（不要选「Deploy from a branch」的旧方式，除非你只上传 `dist`）。

3. **在 GitHub 里填写自定义域名**  
   同一页 **Custom domain** 填入你的域名（例如 `kaodian.94software.com`），保存。GitHub 会提示你添加 DNS 记录。

4. **在域名 DNS 处添加记录**（在 94software.com 或你的 DNS 面板）  
   - **推荐（子域名）**：类型 **CNAME**，名称 `kaodian`（或你用的主机名），目标 **`你的用户名.github.io`**（见 GitHub 文档中的准确值）。  
   - **若注册商要求 apex 域名**：可用 **A 记录** 指向 GitHub 提供的 IP（以 [官方文档](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site) 为准）。

5. **（可选）在仓库里放 `CNAME` 文件**  
   在 `public/CNAME` 里只写一行域名，例如 `kaodian.94software.com`，重新构建后 `dist/` 会带上该文件，与网页里设置的域名一致。也可只在 Settings 里配置，不提交文件。

6. **HTTPS**  
   在 Pages 设置里勾选 **Enforce HTTPS**（DNS 生效且证书签发成功后可用）。

当前 `vite.config.ts` 使用 **`base: './'`**，静态资源与 `data/venues.json` 使用相对路径，因此无论是 `https://<user>.github.io/<repo>/` 还是 **`https://你的自定义域名/`** 都能正常加载。

## 技术栈

- [Vite](https://vitejs.dev/) + TypeScript
- 无前端框架，便于长期维护与托管

## 免责声明

考点与联系方式来自公开整理，**报名与考试安排以各机构及外管局最新规定为准**。
