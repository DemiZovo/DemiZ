# GitHub Pages 部署说明

## 部署模式

Astro 只读取两个环境变量：`SITE_URL` 是站点源，`BASE_PATH` 是部署前缀。`output` 固定为 `static`，全站保留尾部斜杠。

| 模式 | `SITE_URL` | `BASE_PATH` |
| --- | --- | --- |
| 用户根站 `username.github.io` | `https://username.github.io` | `/` |
| 项目站 | `https://username.github.io` | `/repository-name` |
| 自定义域名 | `https://www.example.com` | `/` |

工作流会根据仓库名自动选择前两种模式。页面及组件调用 `src/lib/urls.ts` 的 `sitePath()`，不写仓库名。Markdown 中以 `/` 开头的图片与链接在构建时统一添加 base；经 Astro 打包的 CSS、JavaScript 和字体自动服从 `base`。

## GitHub 仓库设置

1. 根站仓库命名为 `username.github.io`，默认分支设为生产分支（通常为 `main`）。
2. **Settings → Pages → Build and deployment → Source** 选择 **GitHub Actions**。
3. **Settings → Actions → General → Workflow permissions** 保持默认只读；工作流仅在 deploy job 提升 Pages/OIDC 权限。
4. 若启用 environment protection，在 **Settings → Environments → github-pages** 只允许默认分支部署。
5. PR 的 build job 应成功，deploy job 应为 skipped。部署使用不可变 artifact；构建或部署失败不会删除上一版站点。

## WSL2 本地调试

```bash
cd /mnt/c/Users/zhang/Desktop/个人网站
npm ci
SITE_URL=https://username.github.io BASE_PATH=/ npm run check:content
SITE_URL=https://username.github.io BASE_PATH=/ npm run build
SITE_URL=https://username.github.io BASE_PATH=/ npm run dev -- --host 0.0.0.0
npm run verify:build
```

模拟项目站时用 `BASE_PATH=/repository-name`。生产产物可用 `npx astro preview --host 0.0.0.0` 检查，最终仍须在 Pages 验证静态 404 行为。

## 切换自定义域名

1. 按 GitHub Pages 文档设置 DNS：顶级域用 A/AAAA，子域用指向 `username.github.io` 的 CNAME。
2. 新建 `public/CNAME`，只写一行域名（如 `www.example.com`，无协议和路径）。
3. 将工作流 URL 步骤改成 `SITE_URL=https://www.example.com`、`BASE_PATH=/`，不要保留仓库子路径。
4. **Settings → Pages → Custom domain** 填相同域名；DNS 生效后启用 **Enforce HTTPS**，重新构建。

## 验证清单

- 根站及详情页的导航、图片、CSS、JS、字体均返回 200，DevTools 无子路径资源 404。
- 直接刷新 `/blog/astro-content-model/` 等详情 URL 可打开生成的 `index.html`；GitHub Pages 没有 SPA fallback，路由必须实际生成。
- `/404.html` 为 200，未知路径显示 404，404 页的首页链接包含正确 base。
- `/rss.xml` 为 200；item 是含正确域名、base、尾部斜杠的 HTTPS 绝对 URL，且没有草稿。
- `/sitemap-index.xml`（或产物中的实际 sitemap 文件）为 200；URL 使用生产域名、正确 base 和尾部斜杠。
- 抽查 canonical、`og:url`、`og:image`；产物搜索 `localhost`、`file://`、`C:\\Users`、`/home/` 均无结果。
