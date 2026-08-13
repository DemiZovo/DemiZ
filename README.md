# DemiZovo 个人网站

DemiZ 的个人网站，用于整理代码学习笔记、展示项目和记录生活。

- 正式网站：<https://demizovo.github.io/My-website/>
- GitHub 仓库：<https://github.com/DemiZovo/My-website>
- 技术栈：Astro、TypeScript、Markdown、GitHub Pages

## 目录

- [环境准备](#环境准备)
- [本地运行](#本地运行)
- [添加技术博客](#添加技术博客)
- [修改、隐藏或删除博客](#修改隐藏或删除博客)
- [添加生活日志](#添加生活日志)
- [插入图片](#插入图片)
- [更换头像](#更换头像)
- [修改个人资料](#修改个人资料)
- [展示 GitHub 项目](#展示-github-项目)
- [检查并发布](#检查并发布)
- [访问统计](#访问统计)
- [常见问题](#常见问题)

## 环境准备

推荐使用项目声明的环境：

- Node.js：`22.18.0` 或更高，但低于 `25`
- npm：`10.9.3`
- Git

首次下载项目后，在项目根目录执行：

```bash
npm ci
```

`npm ci` 会严格按照 `package-lock.json` 安装依赖，适合本项目和自动部署环境。

## 本地运行

启动开发服务器：

```bash
npm run dev
```

根据终端提示打开本地地址，通常为：

```text
http://localhost:4321/
```

开发服务器运行时，修改文章或页面后浏览器会自动刷新。按 `Ctrl + C` 停止服务器。

## 添加技术博客

技术博客存放在：

```text
src/content/blog/
```

在该目录新建 Markdown 文件，例如：

```text
src/content/blog/learning-javascript.md
```

使用以下模板：

````markdown
---
title: JavaScript 学习笔记
description: 记录 JavaScript 基础知识和学习心得。
slug: learning-javascript
published: 2026-08-14
category: JavaScript
tags: [JavaScript, 前端]
draft: false
featured: false
toc: true
---

这里写文章正文。

## 第一个小标题

支持常用 Markdown 语法。

### 代码示例

```js
const message = 'Hello';
console.log(message);
```
````

字段说明：

| 字段 | 必填 | 说明 |
|---|---:|---|
| `title` | 是 | 文章标题，最多 100 个字符 |
| `description` | 是 | 文章摘要，最多 240 个字符 |
| `slug` | 是 | 文章网址，只能使用英文小写、数字和连字符 |
| `published` | 是 | 发布日期，格式为 `YYYY-MM-DD` |
| `updated` | 否 | 更新日期，不能早于发布日期 |
| `category` | 是 | 文章分类 |
| `tags` | 否 | 标签列表，例如 `[Astro, TypeScript]` |
| `cover` | 否 | 封面图片的站内路径 |
| `draft` | 否 | `true` 为草稿，正式构建不会发布 |
| `featured` | 否 | 是否标记为精选内容 |
| `toc` | 否 | 是否显示文章目录 |

发布后的地址为：

```text
https://demizovo.github.io/My-website/blog/learning-javascript/
```

文件名可以与 `slug` 相同，方便管理。文章发布后尽量不要修改 `slug`，否则原地址会失效。

## 修改、隐藏或删除博客

### 修改文章

直接编辑对应的 `.md` 文件。需要记录更新时间时，在头部增加：

```yaml
updated: 2026-08-15
```

### 暂时隐藏文章

将文章的草稿状态改为：

```yaml
draft: true
```

草稿可以在本地开发环境中预览，但不会进入正式文章列表、搜索、标签、归档、RSS 或 Sitemap。

### 删除文章

删除对应的 Markdown 文件，例如在 PowerShell 中执行：

```powershell
Remove-Item -LiteralPath "src\content\blog\learning-javascript.md"
```

如果以后可能恢复，建议使用 `draft: true`，不要直接删除。

## 添加生活日志

生活日志存放在：

```text
src/content/life/
```

示例文件：

```markdown
---
title: 周末随记
description: 记录一个轻松的周末。
slug: weekend-notes
published: 2026-08-14
tags: [生活, 随笔]
gallery: []
draft: false
featured: false
---

这里写生活日志正文。
```

修改、隐藏和删除生活日志的方法与技术博客相同。

## 插入图片

静态图片统一放在 `public/images/` 中，建议按用途分类：

```text
public/images/blog/文章名/
public/images/life/日志名/
public/images/profile/
```

推荐优先使用经过压缩的 WebP 或 AVIF 图片，并填写准确的替代文字。

在 Markdown 正文中插入图片：

```markdown
![图片内容说明](/images/blog/learning-javascript/example.webp)
```

博客封面可以在文章头部配置：

```yaml
cover: /images/blog/learning-javascript/cover.webp
```

图片路径需要以 `/images/` 开头。项目构建时会自动处理 GitHub Pages 的 `/My-website` 子路径。

## 更换头像

当前首页和关于页使用纯白圆形占位。

### 1. 准备图片

将正方形头像放入：

```text
public/images/profile/avatar.webp
```

推荐尺寸为 `800 × 800`，也支持 `.jpg` 和 `.png`。

### 2. 修改首页

编辑 `src/pages/index.astro`，将 `avatar-placeholder` 元素替换为：

```astro
<img
  class="avatar"
  src={sitePath('/images/profile/avatar.webp')}
  width="800"
  height="800"
  alt="DemiZ 的头像"
/>
```

首页已经导入 `sitePath`，不需要额外修改导入语句。

### 3. 修改关于页

编辑 `src/pages/about.astro`，在文件头部添加：

```astro
import { sitePath } from '../lib/urls';
```

然后将 `avatar-placeholder avatar-large` 元素替换为：

```astro
<img
  class="avatar avatar-large"
  src={sitePath('/images/profile/avatar.webp')}
  width="800"
  height="800"
  alt="DemiZ 的头像"
/>
```

### 4. 添加样式

在 `src/styles/global.css` 中添加：

```css
.avatar {
  width: 7rem;
  aspect-ratio: 1;
  border: 1px solid var(--border);
  border-radius: 50%;
  object-fit: cover;
}

.avatar-large {
  width: 9rem;
  margin: 1rem 0 1.5rem;
}
```

## 修改个人资料

站点基础信息位于：

```text
src/config/site.ts
```

可以修改：

```ts
name: 'DemiZovo',
description: 'DemiZ 的代码学习与生活记录。',
url: 'https://demizovo.github.io/My-website',
author: {
  name: 'DemiZ',
  bio: '',
  github: 'https://github.com/DemiZovo',
  email: 'DemiZovo@163.com',
},
```

关于页的详细文字位于：

```text
src/pages/about.astro
```

如果修改 GitHub 用户名、仓库名或自定义域名，还要同步检查 `url`、README 和 GitHub Pages 配置。

## 展示 GitHub 项目

项目配置位于：

```text
src/config/projects.ts
```

当前数组为空，因此项目页显示空状态。添加项目示例：

```ts
export const projects: LocalProject[] = [
  {
    id: 'my-project',
    repo: 'DemiZovo/my-project',
    name: 'My Project',
    description: '项目的简短介绍。',
    homepage: 'https://example.com', // 没有项目网站时删除此行
    tags: ['TypeScript', 'Astro'],
    featured: true,
    hidden: false,
    order: 10,
  },
];
```

- `repo` 使用 `GitHub用户名/仓库名` 格式。
- `hidden: true` 可以暂时隐藏项目。
- `order` 越小，显示位置越靠前。
- 构建时会尝试读取 Stars、语言等 GitHub 数据；请求失败时仍会显示本地配置。

## 检查并发布

修改内容后先运行：

```bash
npm run check:content
npm run build
npm run verify:build
```

命令用途：

- `npm run check:content`：同步内容并检查 TypeScript、Astro 和文章字段。
- `npm run build`：生成生产网站到 `dist/`。
- `npm run verify:build`：检查草稿隔离、站内路径和缺失资源。

全部通过后提交并推送：

```bash
git status
git add -A
git commit -m "Update website content"
git push
```

GitHub Actions 会自动检查、构建并部署。可以在以下页面查看进度：

<https://github.com/DemiZovo/My-website/actions>

部署成功后访问：

<https://demizovo.github.io/My-website/>

GitHub Pages 更新通常需要几十秒。如果浏览器仍显示旧内容，可以稍等后刷新，必要时使用强制刷新。

## 访问统计

当前没有启用 Umami，不会加载第三方统计脚本。

未来启用时，需要在 GitHub 仓库的 Actions Variables 或构建环境中设置：

```text
PUBLIC_ANALYTICS_ENABLED=true
PUBLIC_ANALYTICS_SITE_ID=你的站点ID
PUBLIC_ANALYTICS_SCRIPT_URL=https://你的Umami地址/script.js
```

统计配置代码位于：

```text
src/config/analytics.ts
```

启用前还应根据实际服务更新 `src/pages/privacy.astro` 中的隐私说明。

## 常见问题

### 构建提示 slug 不合法

`slug` 只能使用英文小写、数字和连字符，例如：

```text
my-first-blog
```

不要使用空格、中文、大写字母或下划线。

### 文章没有出现在正式网站

依次检查：

1. 文件是否放在 `src/content/blog/` 或 `src/content/life/`。
2. `draft` 是否仍为 `true`。
3. 内容字段是否通过 `npm run check:content`。
4. 修改是否已经 `git commit` 并 `git push`。
5. GitHub Actions 是否部署成功。

### 图片在本地正常、线上无法显示

确认图片位于 `public/images/`，并使用 `/images/...` 路径，不要写本机绝对路径、`file://` 地址或 `public/images/...`。

### 删除文章后旧页面仍存在

确认删除操作已经提交并推送，并等待新一轮 Pages 部署完成。GitHub Pages 更新后，旧静态页面会从新部署产物中移除。

### 想先写完再发布

将文章设置为：

```yaml
draft: true
```

完成后改为 `false`，运行检查并推送即可。
