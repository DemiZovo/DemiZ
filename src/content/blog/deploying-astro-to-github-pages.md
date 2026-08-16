---
title: 将 Astro 网站部署到 GitHub Pages
description: 记录项目站点的路径配置、自动构建和发布前验证要点。
slug: deploying-astro-to-github-pages
published: 2026-08-11
category: engineering
tags: [Astro, GitHub Pages, CI]
draft: false
featured: false
toc: true
---

GitHub Pages 的项目站点通常位于 `用户名.github.io/仓库名/`，因此部署时不仅要生成静态文件，还要正确处理仓库子路径。

## 集中配置站点地址

Astro 的 `site` 用于生成 canonical、RSS 和 Sitemap 中的绝对地址，`base` 用于页面、资源和脚本的站内路径。组件不应各自硬编码仓库名称。

## 自动部署

GitHub Actions 在每次更新后安装锁定依赖，执行类型检查和生产构建，再把 `dist` 上传到 Pages。Pull Request 只检查，不覆盖正式网站。

## 发布前验证

构建成功只是第一步。还需要确认草稿没有进入页面、搜索或 RSS，所有站内链接都能映射到真实产物，并检查输出中没有 `localhost` 或本机路径。

把这些检查写进脚本，可以让以后新增文章和页面时继续保持相同的发布标准。
