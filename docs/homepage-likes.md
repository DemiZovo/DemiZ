# 首页点赞配置

首页点赞使用 Supabase Data API 保存全站共享计数。访客无需登录，可以重复点赞，点赞不可取消。

## 1. 初始化数据库

创建 Supabase 项目后，打开 SQL Editor，执行 [`supabase/home-likes.sql`](../supabase/home-likes.sql)。该脚本会：

- 创建唯一的首页点赞记录；
- 开启 RLS 并禁止匿名用户直接访问数据表；
- 创建读取和原子递增两个 RPC；
- 只向 `anon` 角色开放这两个 RPC。

脚本可以重复执行，已有点赞数不会被重置。

## 2. 本地配置

复制 `.env.example` 为 `.env`，填写 Supabase 控制台中的 Project URL 和 Publishable key：

```text
PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_REPLACE_ME
```

Publishable key 会出现在浏览器产物中，这是预期行为。不要使用 Secret key 或旧版 `service_role` key。

## 3. GitHub Pages 配置

在仓库的 **Settings → Secrets and variables → Actions → Variables** 中新增：

```text
SUPABASE_URL
SUPABASE_PUBLISHABLE_KEY
```

重新运行部署工作流即可。未配置这两个变量时，网站仍能正常构建，但点赞按钮会显示为不可用。
