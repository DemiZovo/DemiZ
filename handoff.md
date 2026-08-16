# DemiZ v2 交接文档（handoff）

> 最后更新：2026-08-16
> 状态：**构建已在本机跑通**（`astro check` / `build` / `verify:build` 全绿）。Phase 0–2 完成，Phase 3（文章阅读体验）核心部分已完成，Phase 4–7 未开始。

---

## 一、项目目标与已完成工作

### 整体目标

把 DemiZ 从「功能堆砌的个人站」升级为「可长期填充内容的系统」。四条总纲：

- **魔法负责让人记住**（小樱 / 库洛牌 / 魔法术语，集中在 Hero 和 3D 分类卡）
- **Apple-like UI 负责让操作自然**（清晰层级、克制材质、留白、排版、自然动画）
- **Typography 负责让内容好读**（正文 720px / 17px / 1.75–1.85 行高）
- **真实文字负责让人认识 DemiZ**（Now / Moments / Friends / 随机微文案，不靠堆动画）

最终一句话验收：让人第一感觉是「这是 DemiZ 的网站」，而不是「Apple 风的小樱博客」。

### 信息架构（已定稿）

| 导航 | 定位 | 说明 |
|------|------|------|
| 魔法笔记 `/blog/` | 我理解的 | Blog |
| 工作台 `/workshop/` | 我做的 | 原写作台并入 |
| 宝物柜 `/collection/` | 我喜欢的 | 原 projects 改名 |
| 日常手账 `/life/` | 我经历的 | 原 life，保留 |
| 关于 `/about/` | — | guestbook 降级到这里 |

已取消的一级入口：库洛牌全书（→ Archive）、魔法属性（→ Blog 分类）、卡牌标签（→ Tags）、魔法许愿簿（→ About）、写作台（→ Workshop）。

### 本次会话完成的工作（Phase 0–2）

1. **Phase 0 — Design Tokens**：新建 `src/styles/tokens.css`，把颜色/字体/间距/圆角/阴影/Glass/Motion/容器宽度/Z-index 全部收进单一来源；`sakura-theme.css` 里的重复变量定义已删除（保留视觉表达层）。
2. **Phase 2 数据 — 分类模型**：新建 `src/data/categories.ts`（4 大分类：ai-infra / web / engineering / dev）+ `src/lib/categories.ts`；5 篇文章 frontmatter 的 `category` 从中文自由文本迁移为 slug。
3. **Phase 1 — Navbar + Footer**：`Header.astro` 收敛为「品牌 + 5 一级导航 + 搜索 + 主题切换」，删除 more 菜单、写作台入口、旧 secondary 链接；`Footer.astro` 改为「Explore 链接 + 版权 + 随机微文案」。
4. **Phase 2 — Blog 重构**：新建 3D 分类卡 `CategoryCard.astro`（Portal，桌面 4 卡 + 移动横滑）和极简文章行 `ArticleRow.astro`；重写 `/blog/` 首页为「分类卡 + 极简 Latest 列表」。
5. **Phase 2 — 扁平 URL + 分发路由**：`/blog/[slug].astro` 成为分发器（分类 → `BlogCategory`，文章 → `BlogArticle`）；`/categories/`、`/projects/` 改为 301 重定向（含旧中文分类名迁移映射）。
6. **Phase 2 — 配套页面**：新建 `/workshop/`（承载 Writer 入口）和 `/collection/`（占位）；Archive/Tags/搜索索引的分类链接与显示名统一走新分类模型。

### 本次会话完成的工作（构建验证 + Phase 3）

7. **构建验证跑通**（上一会话遗留的最高优先项）：`pnpm install` 重新链接了被挂载层压扁的 node_modules symlink 后，`astro check` / `astro build` / `verify:build` 全部通过（0 error，54 pages，62 generated files）。
8. **修复 5 个真实 bug**（`astro check`/`build` 暴露，上一会话人工核对漏掉）：
   - `collection/index.astro`、`workshop/index.astro` 的 `BaseLayout`/`urls` import 路径少一层 `../`（→ 改 `../../`）。
   - `BlogArticle.astro` 传 `previous && {...}` 得到 `null`，与 `ArticleNavigation` 的 `NavigationItem | undefined` 不符（→ 改三元 `? ... : undefined`）。
   - `categories/[category].astro` 的 `legacyAliases` 在 frontmatter 顶层，Astro 把 `getStaticPaths` 提升到模块作用域时它不会跟随 → 运行时 `legacyAliases is not defined`。**已把映射移到 `src/lib/categories.ts` 导出 `legacyCategoryAliases`**（`astro check` 查不出这个，只有 build 会爆）。
   - 3 个重定向桩页面的 `ts(6133) 'sitePath' 未使用` 误报：`sitePath` 只在顶层 `return Astro.redirect(...)` 里用，astro check 的 noUnusedLocals 不追踪顶层 return。加 `@ts-nocheck`（仅纯重定向桩，不影响 build）。
9. **Phase 3 — 文章阅读体验**（V2-020 → V2-028 核心部分）：
   - **正文 typography**：正文列宽 720px（45rem）、正文 17px / 行高 1.8（移动 16px）、h1 52px 上限（clamp 到 3.25rem）、h2 margin-top 72px、h3 48px、段落间距 20–24px、`pre` radius 16px + padding 20–24px、行内 code 淡 accent 底色。
   - **文章头去卡片化**：`article-hero`（带边框/背景）→ 极简 `article-header`（分类 eyebrow → 标题 → 描述 → 日期 · 阅读时间 · Updated → 状态 → tags）。
   - **阅读时间**：新建 `src/lib/reading.ts`（`readingMinutes`，中文按 300 字/分钟、英文按 220 词/分钟，取上限向上取整）。
   - **note status**：blog schema 加 `status`（`z.enum(['seed','growing','evergreen']).default('growing')`），`BlogArticle` 显示 `Seed · 刚种下 / Growing · 成长中 / Evergreen · 常青`。
   - **Updated 日期**：`updated` 存在时在 meta 显示 `Updated {date}`。
   - **文章 Footer「收录完成」**：`article-ending`（✦ + 收录完成 + 一条 DemiZ 自己写的收尾语，按 slug 稳定取一条，SSR 一致，不随机跳），放在 prev/next 之前。
   - **顶部阅读进度条**：`ArticleReaderTools` 加固定 2px 顶部进度条（accent 渐变，滚动 32px 后出现），与侧栏进度共用同一 scroll ratio。

---

## 二、目录结构与关键文件

```
DemiZ-private-web/
├── astro.config.ts            # Astro 7，static output，BASE_PATH 控制子路径，trailingSlash: always
├── package.json               # pnpm 10.11.1，astro 7.2.1
├── tsconfig.json              # extends astro/tsconfigs/strictest（严格模式）
├── handoff.md                 # 本文档
├── src/
│   ├── content.config.ts      # content collections：blog + life（schema 在此）
│   ├── content/
│   │   ├── blog/              # 5 篇文章（category 已改为 slug）
│   │   └── life/              # 1 篇
│   ├── data/
│   │   └── categories.ts      # ★ 分类唯一数据源（新增/改名/换卡牌只改这里）
│   ├── lib/
│   │   ├── content.ts         # 公开内容边界：getPublicBlog / getPublicLife / entryPath
│   │   ├── categories.ts      # getBlogCategories / getBlogByCategory / categoryLabel / legacyCategoryAliases
│   │   ├── reading.ts         # ★ readingMinutes（中文 300字/分、英文 220词/分）
│   │   ├── urls.ts            # sitePath（base-aware 路径）
│   │   └── projects.ts        # ⚠ 已弃用（旧 GitHub 项目逻辑，可删）
│   ├── config/
│   │   ├── site.ts            # 站点元信息（name/url/author/email）
│   │   ├── projects.ts        # ⚠ 已弃用（空数组）
│   │   └── analytics.ts / guestbook.ts
│   ├── components/
│   │   ├── Header.astro       # ★ 新导航
│   │   ├── Footer.astro       # ★ 新页脚（随机微文案）
│   │   ├── CategoryCard.astro # ★ 新 3D 分类卡（Portal）
│   │   ├── ArticleRow.astro   # ★ 新极简文章行
│   │   ├── BlogArticle.astro  # ★ 新文章视图（从 [slug] 拆出）
│   │   ├── BlogCategory.astro # ★ 新分类视图（从 [slug] 拆出）
│   │   ├── ArticleNavigation.astro / ArticleReaderTools.astro / ArticleHero 相关
│   │   └── …（MagicEffects / Giscus / Analytics 等保留）
│   ├── pages/
│   │   ├── index.astro        # 首页（本次未改，Hero 保留）
│   │   ├── blog/
│   │   │   ├── index.astro    # ★ Blog 首页（分类卡 + Latest）
│   │   │   └── [slug].astro   # ★ 分发器：分类 OR 文章
│   │   ├── categories/
│   │   │   ├── index.astro    # ★ 301 → /blog/
│   │   │   └── [category].astro # ★ 301 → /blog/{slug}/（含旧中文名映射）
│   │   ├── projects/index.astro # ★ 301 → /collection/
│   │   ├── workshop/index.astro  # ★ 新工作台（Writer 入口）
│   │   ├── collection/index.astro # ★ 新宝物柜（占位）
│   │   ├── archives.astro     # ★ 分类链接已更新
│   │   ├── tags/index.astro / tags/[tag].astro  # 保留
│   │   ├── life/index.astro / life/[slug].astro # 保留
│   │   ├── about.astro        # ★ 加了魔法许愿簿入口
│   │   ├── guestbook.astro    # 保留（已从导航移除，About 有入口）
│   │   ├── search.astro / search-index.json.ts  # ★ 分类显示名已更新
│   │   ├── rss.xml.ts         # 保留（走 entryPath，自动正确）
│   │   └── write.astro        # Writer（保留，分类字段已接 datalist）
│   └── styles/
│       ├── tokens.css         # ★ 设计系统单一来源
│       ├── global.css         # ★ 字体改走 --font-sans
│       ├── features.css       # 保留
│       └── sakura-theme.css   # ★ 变量定义已移除，只剩视觉表达层
```

---

## 三、已实现功能与代码变更点

### 数据层变更

- `src/data/categories.ts`（新）：`Category` 接口含 slug/name/zh/description/card/order；`categories` 数组 + `getCategory()` + `getOrderedCategories()`。
- `src/lib/categories.ts`（新）：`getBlogCategories()`（分类+计数，按 order 排序）、`getBlogByCategory(slug)`、`categoryLabel(slug)`（中文名，未注册回退原文）。
- 文章 frontmatter 迁移：
  - `ai-infra-system-design-notes.md`：`"AI Infra"` → `"ai-infra"`
  - `from-url-to-page-rendering.md`：`Web 基础` → `web`
  - `wsl2-setup-and-commands.md`：`开发环境` → `dev`
  - `deploying-astro-to-github-pages.md`：`部署` → `engineering`
  - `astro-content-collections-notes.md`：`Astro` → `web`，tags 加了 `Web`

### 导航与页脚

- `Header.astro`：删 more 菜单、写作台、archive/category/tag/message 图标；只留 blog/workshop/collection/life/about 五个 icon + search/moon/sun。品牌即首页。
- `Footer.astro`：Explore 链接（Archive/Tags/RSS/隐私说明/GitHub，GitHub 外部链接 `target=_blank`）+ 版权 + 随机微文案（5 条候选取 1）。

### Blog 页面

- `blog/index.astro`：`page-head`（eyebrow "Coding Grimoire" + 标题 + 描述 + 搜索/Archive 入口）→ `探索领域`（4 张 CategoryCard）→ `最近记录`（ArticleRow 列表，最多 6 篇）。桌面 4 卡 grid，移动端横滑 scroll-snap。
- `blog/[slug].astro`：`getStaticPaths` 同时产出文章路径（含 prev/next）和分类路径，按 `kind` 分发。
- `BlogArticle.astro`：文章视图（原 [slug] 内容），分类显示中文名，链接走 `/blog/{slug}/`。
- `BlogCategory.astro`：极简分类页（eyebrow "✦ The Power" + 标题 + 中文名 + 描述 + 计数 + 热门 tags + ArticleRow 列表），无卡片、无 3D。

### 重定向（301）

- `/categories/` → `/blog/`
- `/categories/{旧中文名或新slug}/` → `/blog/{slug}/`（旧中文名映射：AI Infra→ai-infra、Web 基础→web、开发环境→dev、部署→engineering、Astro→web）
- `/projects/` → `/collection/`

### 设计 Token

`tokens.css` 定义全部变量（含 dark 主题 `--bg:#211a1d` 酒红夜空底），`global.css` 字体改 `var(--font-sans)`，`write.astro` 补了 tokens import。

---

## 四、现存问题 / BUG / 未完成待办

### 已知待办（重要度排序）

1. ~~【最高】构建验证未跑通~~ **已解决**：本机 `pnpm install` + `check` + `build` + `verify:build` 全绿。
2. **【高】旧 CSS 死代码**：`global.css` 里 `.more-menu*`、`sakura-theme.css` 里 `.more-menu-list`、`.magic-note-grid`、`.card-progress`、`.mini-card-wall`、`.treasure-*`、`.journal-*`、`.lost-card` 等是旧页面残留（无 DOM 引用，无害但占体积）。建议后续 Phase 3 剩余部分顺手清理。
3. **【中】`lib/projects.ts` + `config/projects.ts` 已弃用**：旧 GitHub 项目拉取逻辑，workshop 已不用。可删（连同 `astro.config.ts` 里若有相关配置）。
4. **【中】`/guestbook/` 页面仍在但导航无入口**：只有 About 里的「魔法许愿簿」链接可达。这是规格设计（降级到 About），但建议确认是否还要保留独立路由。
5. **【低】Writer 的分类字段**：`write.astro` 的 category 输入已加 `<datalist>` 和默认值 `web`，但 Writer 产出的文章 category 仍是自由文本（无校验）。若用户手写中文分类会再次产生未注册分类。后续可加前端校验或用下拉框强制选择。
6. **【低】首页 `index.astro` 本次未动**：仍引用 `.home-updates` 卡片列表和 `getPublicContent`。Phase 5 才重做（Hero → Now → Latest Notes → Workshop Preview → Moments → Friends → Footer）。
7. **【低】search-index / tags 页面**：tags 页仍聚合 blog+life 的 tags（符合「Tag 是具体技术点」）；search-index 的 category 已改为中文名（`categoryLabel`），但搜索结果里 category 是纯展示、不链接，可接受。

### Phase 3 剩余未做（可继续）

- **代码块 header**：规格想有 `example.ts  Copy` 顶部文件名条（现在只有 hover 右上角复制按钮，由 `MagicEffects.astro` 注入）。可后续给 markdown 代码块加 `title` 元数据支持。
- **图片突破正文**：规格想技术图 900–1100px 突破 720px 正文列（现图片仍在正文列内，`.article img` 有 radius）。可后续加 `figure--wide` 支持。
- **Mobile TOC Sheet**：规格想移动端把侧栏 TOC 变成 floating `[☰]` 按钮 + sheet（现移动端 TOC 折叠在 reader-tools 顶部，仍是内联展示，未做成 sheet）。
- **life 文章页**：本次只改了 blog 的文章页（`BlogArticle.astro`）；`life/[slug].astro` 仍用旧 `article-hero` 盒子样式。可顺手对齐。

### 无已知语法 BUG（人工核对过）

- 组件样式作用域问题已处理：`blog/index.astro` 里 `.category-grid .category-card` 已改 `:global(.category-card)`（Astro scoped style 不匹配子组件元素）。
- `Footer` 的外部链接已不经过 `sitePath()`（避免 `/` 前缀污染 GitHub URL）。
- 重定向已确认 `Astro.redirect` 不自动加 base（源码 `fetch-state.js` 返回 `Location: path` 原样），所以手动 `sitePath()` 正确、无双前缀。

---

## 五、下一步计划（按规格 Phase 顺序）

规格结尾建议按 `V2-001 → V2-019` 推进，本次已完成 Phase 0–2 的代码 + 构建验证 + Phase 3 核心。下一步：

1. ~~先跑通构建~~ **已跑通**。
2. **Phase 3 收尾**（V2-022 → V2-028 剩余）：代码块 header（文件名 + Copy 条）、图片突破正文（figure--wide）、Mobile TOC Sheet、life 文章页对齐。
3. **Phase 4 — Workshop**（V2-030 → V2-034）：完善 workshop 页、把 Writer 正式迁移进去、首页加 Workshop Preview。
4. **Phase 5 — 首页**（V2-040 → V2-044）：Now 数据文件 `src/data/now.ts`、Latest Notes 3–4 篇、Moments Preview、Hero 动画清理。
5. **Phase 6 — About + Friends + 活人感**（V2-050 → V2-054）：About 重写、友人帐 `src/data/friends.ts`、随机 Footer 文案已做、个人微文案。
6. **Phase 7 — 魔法 polish**（V2-060 → V2-063）：页面转场、分类卡点击转场、reduced motion、dark mode 精修。
7. **最终**：性能审计（JS <100–150KB gzipped）、无障碍审计、移动端审计、SEO 清理。

---

## 六、重要约束 / 项目约定 / 踩过的坑

### 长期三条规则（任何 UI 改动都必须遵守）

1. **卡牌只做 Portal**（分类/领域入口），不做普通内容容器。
2. **Glass 只做控制层**（Navbar/Search/Modal/Sheet/Floating TOC），正文和普通内容区不玻璃化。
3. **活人感靠真实内容**，不靠堆动画（每页最多一个抢注意力的动画）。

### 设计系统约定

- 所有颜色/间距/圆角/阴影/动画时长/容器宽度/Z-index 从 `tokens.css` 取，组件里禁止随手写死值。
- 动画两档：普通交互 140–360ms，魔法/卡牌 600–900ms；必须支持 `prefers-reduced-motion: reduce`。
- 主题色（sakura pink / magic gold）占比 5–10%，只用于 link hover / active nav / 分类指示 / 小星星 / 进度条 / focus ring。
- Category 与 Tag 严格分离：每篇 1 个 category（大领域）、多个 tag（具体技术点）。改分类只改 `categories.ts`，不碰文章。
- SEO/HTML 用正常语言（Blog/Archive/Tags），魔法术语只做视觉品牌名。

### 踩过的坑

1. **Astro scoped style 跨组件**：组件 A 的 `<style>` 里写 `.parent .child-component-element` 匹配不到组件 B 的元素（scoped attribute 不同）。跨组件样式必须 `:global(...)`。本次已在 `blog/index.astro` 的移动端分类卡样式里修正。
2. ~~【重要】本沙盒无法构建~~ **已解决（本次本机跑通）**：挂载目录 `node_modules` 的 pnpm 符号链接被挂载层压平成了空目录。**解法**：`pnpm install` 会重新链接（本机网络可达即可）。下次若再遇到顶层 `node_modules/*` 空目录，先 `pnpm install` 再构建，别浪费时间手工查符号链接。
3. **`Astro.redirect` 不加 base**：`Astro.redirect(path)` 返回原样 `Location: path`，站点部署在 `/DemiZ/` 子路径下必须手动 `sitePath()`。外部 URL 不要过 `sitePath()`。
4. **`Astro.redirect` 默认 302**：本次显式传 `301`（重定向是永久性的语义）。
5. **`export const prerender` 已移除**：Astro 7 用 `output: 'static'`（已在 astro.config.ts），无需也不建议写 `prerender`。
6. **斜杠尾随**：站点 `trailingSlash: always`，所有内部链接以 `/` 结尾。
7. **【新增】frontmatter 顶层 const 不会被 `getStaticPaths` 看见**：Astro 会把 `getStaticPaths` 提升到模块作用域单独编译（见 `dist/.prerender/chunks/*.mjs`），但 frontmatter 里 `export async function getStaticPaths` 之外的顶层 `const` 仍留在组件函数内 → 运行时 `xxx is not defined`。**`astro check` 查不出这个，只有 build 会爆**。解法：`getStaticPaths` 依赖的数据放到 `.ts` 模块里导出再 import（本次 `legacyCategoryAliases` 已迁到 `src/lib/categories.ts`）。
8. **【新增】纯重定向桩页面的 `ts(6133)` 误报**：`sitePath` 只在顶层 `return Astro.redirect(...)` 里用，`astro check` 的 `noUnusedLocals` 不追踪顶层 return → 报「未使用」。解法：这类 5 行的纯重定向桩加 `@ts-nocheck`（不影响 build）。

### 内容策略约束

- 内容少时靠「更大留白 + 更大 typography + 更强分类卡 + 更少内容」，不靠加组件。
- 30+ 篇前不加 Featured/Series/Related；80+ 篇前不做知识图谱。
- Friends note 必须 DemiZ 自己写，没话说就不加；不要「喵/ovo/nya」式模仿他人人格。
