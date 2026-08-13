# 隐私友好访问统计方案

## 方案比较与结论

| 方案 | Cookie | 托管与维护 | 指标覆盖 | 大陆访问与本项目适配 |
| --- | --- | --- | --- | --- |
| Umami | 无 | 可托管或使用云服务 | PV、访客、页面、来源、设备、国家/地区、事件 | 脚本地址可用自有域名和就近区域；功能完整，推荐 |
| Cloudflare Web Analytics | 无 | 托管，维护最低 | 基础流量与性能指标 | 接入简单，但脚本/上报端固定且 404 自定义分析能力较弱 |
| Plausible | 无 | 付费云或自托管 | 功能完整，原生支持 404 事件 | 成熟但云服务有成本；自托管维护量高于当前需求 |
| GoatCounter | 无 | 免费托管或自托管 | 基础指标完整 | 极轻量，但托管节点与界面/扩展能力选择较少 |

第一版选择 **Umami**。它的追踪脚本小、无 Cookie、不开启跨站识别，原生支持 DNT，所需指标都可直接在后台查看。`scriptUrl` 可指向自有统计子域，因此可以把实例放在经实际网络测试后延迟较低的香港、新加坡或其他合规区域。与任何境外服务一样，大陆连通性不能仅靠产品名称保证；发布前必须从目标网络实测。若统计服务不可达，网站会静默降级。

## 统一配置

唯一入口为 `src/config/analytics.ts`：

```ts
{
  enabled: boolean,
  provider: 'umami',
  siteId: string,
  scriptUrl: string,
  showPublicCount: false,
}
```

正式 GitHub Actions 环境设置：

```text
PUBLIC_DEPLOY_ENV=production
PUBLIC_ANALYTICS_ENABLED=true
PUBLIC_ANALYTICS_SITE_ID=<Umami website id>
PUBLIC_ANALYTICS_SCRIPT_URL=https://stats.example.com/script.js
```

本地与 Preview 不设置 `PUBLIC_DEPLOY_ENV=production`。此外客户端只允许在 `siteConfig.url` 的 hostname 上加载脚本，避免把正式构建产物放在 localhost 或预览域名时误报。

## 安全、性能与数据最小化

- 仅 HTTPS 脚本地址；动态脚本同时设置 `async` 与 `defer`，不阻塞页面。
- DNT 或 GPC 开启时不请求脚本；Umami 自身再设置 `data-do-not-track=true`。
- `data-domains` 限定正式域名；排除查询字符串和 hash，避免 URL 中潜在敏感信息进入统计。
- 不调用 `identify`，不发送自定义用户属性，不统计表单内容。
- 加载失败、广告拦截、无网络和错误配置均静默处理，页面不依赖统计回调。
- `showPublicCount=false`；未来若增加公开阅读量，只有接口成功且返回有效正整数时才渲染区域，失败时隐藏，绝不回退显示 `0`。
- 404 页面会按浏览器地址自动形成页面浏览记录；在 Umami 后台按 404 页面标题或异常路径检查。若以后需要严格区分 HTTP 状态，可增加不含用户数据的 `404` 自定义事件。

## 验收标准与发布检查

1. 配置：五个必需字段存在，默认 `showPublicCount=false`，缺少 `siteId` 或 `scriptUrl` 时不输出引导脚本。
2. 开发：运行 `pnpm dev`，所有页面源码与 Network 均无统计脚本和上报请求。
3. Preview：运行普通 `pnpm build && pnpm preview`（不设置 production 部署变量），结果同上。
4. 生产构建：仅在构建命令中注入四个 `PUBLIC_*` 值；检查 `dist` 含统计引导代码，但不含私钥。
5. 域名门禁：在 localhost 打开该生产构建，Network 仍无统计脚本请求；部署到 `siteConfig.url` 对应域名后才加载。
6. DNT/GPC：在浏览器开启信号后刷新，Network 无统计脚本和上报请求；关闭后重新验证。
7. 降级：DevTools 阻止 `scriptUrl` 或切换离线，页面内容、导航和布局正常且控制台无未处理异常。
8. 数据：正式域名访问首页、文章、来源链接、移动设备和不存在路径；后台确认 PV、访客、热门页面、来源、设备、粗略地区及异常路径出现。不要用真实个人信息测试。
9. 隐私：上线前替换 `/privacy/` 中两个方括号占位，确保运营方、托管地区、保留期限和联系方式准确；核对服务端未启用独立 pageview 明细或额外识别功能。
10. 发布：确认 GitHub 仓库中无管理端账号、API key、数据库地址或私钥；确认统计域名 TLS 正常，并从至少一个大陆网络实测延迟与失败时体验。

## 参考

- Umami 官方 Tracker configuration：https://docs.umami.is/docs/tracker-configuration
- Umami 官方简介与指标：https://docs.umami.is/docs
- Cloudflare Web Analytics：https://developers.cloudflare.com/web-analytics/about/
- Plausible 404 tracking：https://plausible.io/docs/error-pages-tracking-404
- GoatCounter privacy：https://www.goatcounter.com/help/privacy
