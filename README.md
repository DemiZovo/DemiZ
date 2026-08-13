# DemiZ 个人网站

DemiZ 的个人网站，用于整理代码学习笔记、展示项目和记录生活。

- 正式网站：<https://demizovo.github.io/DemiZ/>
- GitHub 仓库：<https://github.com/DemiZovo/DemiZ>
- 技术栈：Astro、TypeScript、Markdown、GitHub Pages

## 目录

- [环境准备](#环境准备)
- [本地运行](#本地运行)
- [添加技术博客](#添加技术博客)
- [修改、隐藏或删除博客](#修改隐藏或删除博客)
- [添加生活日志](#添加生活日志)
- [使用标签](#使用标签)
- [使用时间归档](#使用时间归档)
- [使用站内搜索](#使用站内搜索)
- [插入图片](#插入图片)
- [更换头像](#更换头像)
- [修改关于我与个人资料](#修改关于我与个人资料)
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
updated: 2026-08-15
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

| 字段            | 必填  | 说明                            |
| ------------- | ---:| ----------------------------- |
| `title`       | 是   | 文章标题，最多 100 个字符               |
| `description` | 是   | 文章摘要，最多 240 个字符               |
| `slug`        | 是   | 文章网址，只能使用英文小写、数字和连字符          |
| `published`   | 是   | 发布日期，格式为 `YYYY-MM-DD`         |
| `updated`     | 否   | 更新日期，不能早于发布日期                 |
| `category`    | 是   | 文章分类                          |
| `tags`        | 否   | 标签列表，例如 `[Astro, TypeScript]` |
| `cover`       | 否   | 封面图片的站内路径                     |
| `draft`       | 否   | `true` 为草稿，正式构建不会发布           |
| `featured`    | 否   | 是否标记为精选内容                     |
| `toc`         | 否   | 是否显示文章目录                      |

发布后的地址为：

```text
https://demizovo.github.io/DemiZ/blog/learning-javascript/
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

## 使用标签

标签页面不需要手工创建。网站会读取所有已发布技术博客和生活日志的 `tags` 字段，自动完成以下工作：

- 在文章卡片中显示标签。
- 在 `/tags/` 页面汇总全部标签及其文章数量。
- 为每个标签生成独立页面，例如 `/tags/Astro/`。
- 在标签详情页列出使用该标签的全部公开内容。

### 新增标签

在文章头部的 `tags` 数组中直接增加标签：

```yaml
tags: [JavaScript, 前端, 学习笔记]
```

保存并重新构建后，新增标签会自动出现在标签页，不需要修改页面代码。

单个标签也可以这样填写：

```yaml
tags: [JavaScript]
```

不使用标签时可以填写：

```yaml
tags: []
```

### 修改或删除标签

修改文章头部的 `tags` 即可：

```yaml
# 修改前
tags: [JS, Web]

# 修改后
tags: [JavaScript, 前端]
```

如果某个标签不再被任何公开内容使用，该标签及其详情页会在下一次构建时自动消失。

标签名称区分不同写法。`JavaScript`、`javascript` 和 `JS` 会被视为三个标签，因此建议统一命名。标签可以使用中文、英文和空格，但同一主题应始终采用相同写法。

设置为 `draft: true` 的内容不会计入正式网站的标签数量，也不会出现在标签详情页。

相关实现文件：

```text
src/pages/tags/index.astro
src/pages/tags/[tag].astro
```

## 使用时间归档

归档页面位于：

```text
https://demizovo.github.io/DemiZ/archives/
```

归档同样自动生成，不需要创建归档文件或手工添加链接。网站读取技术博客和生活日志的 `published` 日期，然后：

1. 按发布日期从新到旧排序。
2. 按年份分组。
3. 显示发布日期、文章标题和详情链接。
4. 自动排除正式构建中的草稿。

例如：

```yaml
published: 2026-08-14
```

这篇内容会自动进入归档页的 `2026` 分组。若修改 `published`，它会在下一次构建后移动到对应年份和排序位置。

`updated` 只表示文章最后更新时间，不影响归档分组；归档始终以 `published` 为准。

相关实现文件：

```text
src/pages/archives.astro
src/lib/content.ts
```

## 使用站内搜索

搜索页面位于：

```text
https://demizovo.github.io/DemiZ/search/
```

构建时，网站会把所有公开技术博客和生活日志写入 `/search-index.json`。当前索引字段包括：

- 标题 `title`
- 摘要 `description`
- 博客分类 `category`；生活日志统一归类为“生活”
- 标签 `tags`
- 发布日期和文章地址（用于显示与跳转）

当前搜索是浏览器端的实时子串匹配，规则如下：

1. 输入时立即搜索，不需要按 Enter。
2. 中文和英文都支持。
3. 英文字母不区分大小写。
4. 查询和索引文本会进行 Unicode NFKC 标准化。
5. 空格会被移除，因此 `GitHub Pages` 和 `GitHubPages` 可以相互匹配。
6. 关键词只要连续出现在标题、摘要、分类或标签中，即视为匹配。
7. 草稿不会进入正式搜索索引。

例如，文章信息为：

```yaml
title: JavaScript 学习笔记
description: 记录前端基础知识。
category: JavaScript
tags: [JavaScript, 前端]
```

搜索“JavaScript”“javascript”“前端”“基础知识”都可以找到它。

当前搜索不会检索 Markdown 正文内容，也没有模糊纠错、拼音搜索或多关键词分词逻辑。如果希望某个关键词可以被搜索到，应将其写入标题、摘要、分类或标签。

相关实现文件：

```text
src/pages/search.astro
src/pages/search-index.json.ts
```

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

图片路径需要以 `/images/` 开头。项目构建时会自动处理 GitHub Pages 的 `/DemiZ` 子路径。

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

## 修改关于我与个人资料

站点基础信息位于：

```text
src/config/site.ts
```

可以修改：

```ts
name: 'DemiZ',
description: 'DemiZ 的代码学习与生活记录。',
url: 'https://demizovo.github.io/DemiZ',
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

### 修改“关于我”正文

打开 `src/pages/about.astro`。页面正文使用普通 Astro/HTML 标签，可以直接修改。例如：

```astro
<article class="article">
  <p class="eyebrow">About</p>
  <h1>关于我</h1>

  <p>你好，我是 {siteConfig.author.name}，目前正在学习前端开发。</p>

  <h2>我在学习什么</h2>
  <p>这里填写正在学习的技术、方向或近期目标。</p>

  <h2>这里记录什么</h2>
  <p>这里填写网站内容介绍。</p>

  <h2>联系我</h2>
  <p>
    <a href={siteConfig.author.github}>GitHub</a>
    ·
    <a href={`mailto:${siteConfig.author.email}`}>{siteConfig.author.email}</a>
  </p>
</article>
```

常用标签：

- `<h2>`：添加一个内容分区标题。
- `<p>`：添加一段文字。
- `<a href="地址">文字</a>`：添加链接。
- `<ul><li>...</li></ul>`：添加无序列表。
- `{siteConfig.author.name}`：读取配置中的昵称。

### 修改昵称、邮箱和 GitHub

这些信息不要分别硬编码到多个页面，应优先修改 `src/config/site.ts`：

```ts
author: {
  name: 'DemiZ',
  bio: '这里填写简短个人简介。',
  github: 'https://github.com/DemiZovo',
  email: 'DemiZovo@163.com',
},
```

保存后，引用这些字段的页面会自动更新。详细经历、学习方向等较长内容仍在 `src/pages/about.astro` 中编辑。

修改完成后运行 `npm run check:content` 和 `npm run build`，确认 Astro 标签配对正确且页面能够生成。

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

<https://github.com/DemiZovo/DemiZ/actions>

部署成功后访问：

<https://demizovo.github.io/DemiZ/>

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
