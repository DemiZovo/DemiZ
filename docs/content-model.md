# 内容模型与维护指南

## 目录职责

```text
src/
├─ content.config.ts          # blog/life 集合 Schema
├─ content/
│  ├─ blog/                   # 技术文章 Markdown/MDX
│  └─ life/                   # 生活日志 Markdown/MDX
├─ config/
│  ├─ projects.ts             # 项目人工策展数据
│  └─ site.ts                 # 站点与作者资料
├─ lib/
│  ├─ content.ts              # 公开内容唯一读取边界
│  └─ projects.ts             # 构建时 GitHub 增强与降级
└─ pages/                     # /blog/slug/、/life/slug/ 与输出端点
public/images/
├─ blog/<slug>/               # 技术文章封面与正文图
├─ life/<slug>/               # 日志封面与相册
├─ projects/                  # 项目截图
└─ profile/                   # 头像等个人资源
```

未来可新增 `src/content/gallery`、`snippets`、`learning` 集合；完成 Schema、内容与页面前，不把它们加入导航。

## 字段定义

技术文章：`title` 标题；`description` 摘要；`slug` 稳定 URL；`published` 发布日；`updated?` 更新日；`category` 单一主分类；`tags` 标签；`cover?` 封面；`draft` 草稿；`featured` 精选；`toc` 是否显示目录。

生活日志：共有字段含义相同，不含 `category/toc`；`gallery` 是相册项数组，每项包含 `src`、必填 `alt`，以及可选 `caption/width/height`。

项目：`id` 稳定标识；`repo` 为 `owner/repo`；`name/description/homepage/tags` 是本地展示信息；`featured` 精选；`hidden` 隐藏；`order` 手工升序。GitHub 的 stars、forks、language、updatedAt 与 url 仅在构建时补充，失败时为 `null`，不影响构建。

完整约束以 `src/content.config.ts` 与 `src/config/projects.ts` 为准。日期会被转换为 `Date`；`updated` 不得早于 `published`；slug 只允许小写字母、数字和内部连字符。

## 读取与筛选规则

所有页面、首页、搜索索引和 RSS 必须调用 `src/lib/content.ts`，不得直接调用 `getCollection()`。开发环境保留草稿以便预览；生产构建统一排除 `draft: true`，因此草稿不会产生详情路径，也不会进入搜索或 RSS。Sitemap 根据最终生成的页面收集 URL，未生成的草稿页自然不会进入 Sitemap。

内容按 `published` 倒序；精选可在公开结果上继续用 `entry.data.featured` 过滤。URL 永远取 frontmatter 的 `slug`，移动或重命名 Markdown 文件不会改变公开地址。发布后不要修改 slug；确需修改时应同时增加重定向。

图片优先使用 WebP，按栏目和 slug 放置。Markdown 正文图片必须写 `![替代文字](路径)`；相册由 Schema 强制非空 `alt`。封面是装饰性还是信息性，应由渲染组件提供适当的 alt 策略。

## 新增技术文章或生活日志

1. 在 `src/content/blog/` 或 `src/content/life/` 新建 `.md`/`.mdx`，复制同目录示例的 frontmatter。
2. 选择永久的英文小写连字符 slug；文件名建议与 slug 相同。
3. 将 WebP 图片放到 `public/images/<栏目>/<slug>/`，为每张正文/相册图片填写准确 alt。
4. 写作阶段保持 `draft: true`，运行 `npm run check`；发布时改为 `false` 后运行 `npm run build`。

## 新增项目

1. 在 `src/config/projects.ts` 的数组增加一项，确保 `id` 唯一并填写 `owner/repo`。
2. 本地 `name/description/tags` 应足以在 GitHub API 不可用时独立展示。
3. 用 `featured` 控制精选、`hidden` 控制是否公开、`order` 控制升序位置。
4. 私有仓库或更高 API 限额可在构建环境配置只读 `GITHUB_TOKEN`，不要写入仓库；最后运行 `npm run build` 验证降级路径。
