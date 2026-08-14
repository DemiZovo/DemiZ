# DemiZ 私有写作台

写作台使用 Cloudflare Workers 免费版托管，并通过 GitHub OAuth 将访问者限制为一个固定的 GitHub 用户 ID。未登录用户不会收到写作台 HTML；发布时，Markdown 与图片会作为同一个 Git commit 写入仓库。

草稿箱使用浏览器 IndexedDB 保存文章字段和图片，不写入 GitHub。AI 写作助手通过 Workers AI binding 调用 Cloudflare 托管模型，可生成大纲、正文或润色结果；只有点击“替换正文”或“追加到正文”后，结果才会进入编辑器。

## 1. 生成私有写作台资源

```bash
pnpm run build:writer
```

该命令会把 `/write` 的页面与专属资源复制到 `writer-worker/public/`，并从公开的 `dist/` 中移除 `/write`。

## 2. 创建 GitHub OAuth App

在 GitHub `Settings → Developer settings → OAuth Apps` 创建应用：

- Homepage URL：Worker 部署后的 `https://<name>.<account>.workers.dev`
- Authorization callback URL：`https://<name>.<account>.workers.dev/callback`

保存 Client ID，并将 Client Secret 作为 Worker Secret 配置。不要将 Client Secret 写入仓库。

## 3. 配置 Worker

部署配置 `wrangler.toml` 位于仓库根目录，供 Cloudflare 自动构建和本地 Wrangler 共用，且不包含秘密。请在 Cloudflare 的 **Settings → Variables & Secrets** 配置普通变量：

- `GITHUB_REPOSITORY`：例如 `OWNER/REPOSITORY`
- `GITHUB_BRANCH`：公开站点的默认分支
- `GITHUB_CLIENT_ID`：OAuth App Client ID
- `ALLOWED_GITHUB_USER_ID`：唯一允许登录的 GitHub 数字用户 ID

配置三个加密 Secret：

```bash
npx wrangler secret put GITHUB_CLIENT_SECRET
npx wrangler secret put GITHUB_TOKEN
npx wrangler secret put SESSION_SECRET
```

`SESSION_SECRET` 使用密码生成器生成至少 32 字节的随机值。`GITHUB_TOKEN` 使用细粒度令牌，只授予目标仓库的 Contents 读写权限。

根目录 `wrangler.toml` 已包含 Workers AI binding：

```toml
[ai]
binding = "AI"
```

Workers AI 不需要额外的浏览器密钥。AI 请求仍受 GitHub 登录会话和同源检查保护。

## 4. 部署

在项目根目录执行：

```bash
pnpm run build:writer
npx wrangler deploy
```

部署后，在 GitHub 仓库的 Actions variables 中新增：

```text
WRITER_URL=https://<name>.<account>.workers.dev/
```

下一次公开站点构建后，“更多”菜单会显示写作台入口。未配置 `WRITER_URL` 时，生产站点不会显示失效入口。

## 安全边界

- OAuth Client Secret、仓库 Token 和会话签名密钥只保存在 Worker Secret。
- 每次登录都调用 GitHub `/user` 并比较不可更名的数字用户 ID，而不是用户名。
- 会话 Cookie 使用 `HttpOnly`、`Secure` 和 `SameSite=Lax`，有效期 12 小时。
- 发布接口同时检查登录会话和同源请求。
- AI 接口同样检查登录会话和同源请求；发送给 AI 的写作要求与正文会由 Cloudflare Workers AI 处理。
- 草稿只存在当前浏览器中，清除站点数据会一并删除草稿。
- Worker 返回 `noindex` 与严格的 CSP，公开 Pages 构建不包含 `/write`。
