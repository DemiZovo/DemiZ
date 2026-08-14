---
name: make-a-web
description: Plan, build, redesign, validate, and optionally deploy reusable personal websites, portfolios, blogs, documentation sites, landing pages, and small content-driven websites. Use when Codex is asked to make a website from scratch or turn broad website ideas into an implementation while allowing the visual style, feature set, content model, framework, and deployment destination to vary by user.
---

# Make a Web

Build an individual website from discovery through verification. Do not assume the site owner, branding, features, framework, repository, domain, or hosting provider.

## Start with discovery

Inspect any existing repository, requirements, assets, and deployment configuration before asking questions. Do not ask for information already available.

Before implementation, confirm choices that materially change the result. Ask in one or two compact rounds, offering concrete options plus a free-form choice. Cover:

1. Site purpose and primary audience.
2. Visual direction and any reference sites or brand assets.
3. Required pages and optional functions.
4. Content ownership: hard-coded pages, local Markdown/MDX, CMS, or external data.
5. Deployment destination and repository/base-path constraints.

If the user has not chosen optional functions, present a short menu selected from [references/options.md](references/options.md). Ask only about relevant options; do not dump the entire catalog. If the user wants rapid prototyping, state reasonable defaults and proceed after the minimum decisions are known.

Never request secrets in chat or commit tokens, analytics IDs, private keys, personal addresses, or account credentials. Use documented environment-variable placeholders.

## Define the implementation contract

Summarize the agreed scope before writing code:

- site type and audience;
- page map;
- visual direction;
- selected functions;
- content source and editing workflow;
- technical constraints;
- deployment target;
- acceptance criteria.

Keep unselected capabilities out of navigation and avoid placeholder sections that look finished but do nothing. Distinguish launch scope from future ideas.

## Choose the architecture

Adapt to the repository when one exists. For a new project, choose the smallest architecture that satisfies the scope:

- Prefer static generation for portfolios, blogs, documentation, and content sites.
- Use local Markdown/MDX when the owner wants version-controlled content without a CMS.
- Add a CMS, database, authentication, server rendering, or client framework only when a selected feature requires it.
- Centralize site identity, author/organization data, navigation, and external links in configuration rather than duplicating them across pages.
- Treat third-party APIs as optional enhancements when the core site can work without them.

When using structured content, validate stable slugs, dates, summaries, tags, images, draft state, and accessibility text. Centralize production filtering so drafts cannot leak into pages, feeds, search indexes, or sitemaps.

## Implement the selected design

Create a coherent design system from the chosen visual direction rather than applying a fixed house style. Define typography, color tokens, spacing, content width, borders, radii, shadows, interactive states, and responsive breakpoints.

Requirements that apply across styles:

- Use semantic HTML and keyboard-accessible controls.
- Preserve visible focus states and sufficient contrast.
- Provide meaningful image alternative text; use empty alt text only for decorative images.
- Design mobile and desktop layouts intentionally.
- Avoid unnecessary animation and honor reduced-motion preferences.
- Keep navigation, cards, buttons, forms, and article typography internally consistent.
- Use real supplied content. Clearly label temporary copy and never invent personal claims.

If visual assets are needed and unavailable, ask for them or use neutral placeholders that are easy to replace. Do not embed another person's identity or copyrighted branding as a default.

## Implement optional functions safely

Read [references/options.md](references/options.md) for the selected functions only. Typical capabilities include blog collections, tags, archives, search, RSS, projects, galleries, theme switching, analytics, contact methods, SEO, and deployment automation.

Apply these invariants:

- One public-content boundary controls draft filtering.
- Public URLs come from stable slugs or explicit routes.
- Search, feeds, archives, and tag pages consume the same public dataset.
- External service failure does not break the build when a local fallback is possible.
- Analytics is opt-in and paired with an accurate privacy notice.
- Contact forms include a real delivery and abuse-prevention plan; otherwise use safe contact links.

## Handle deployment as a user-specific choice

Do not assume GitHub Pages. Read [references/deployment.md](references/deployment.md) after the target is selected.

Separate build-time configuration from personal values. Support repository subpaths, custom domains, and environment variables where applicable. Create deployment configuration only for the chosen provider.

Building deployment files is part of implementation. Publishing, connecting an account, changing DNS, creating remote resources, or enabling paid services requires explicit user authorization.

## Verify before delivery

Use the repository's existing checks first, then add proportional verification. At minimum:

1. Run type/content checks and a production build.
2. Verify required routes and local assets exist.
3. Confirm drafts and secrets are absent from production output.
4. Check base-path behavior for non-root deployments.
5. Test narrow and wide viewports, navigation, focus states, and theme behavior.
6. Inspect representative rendered pages visually and fix obvious layout defects.
7. Report untested external integrations and manual setup steps honestly.

For content sites, prefer an additional output check that detects broken internal targets, development-only paths, invalid encoding, and leaked draft markers.

## Deliver

Lead with what was built and verified. Provide links to important local files, the commands used to validate, environment variables that remain to be configured, and exact deployment steps. Separate completed work from optional follow-ups.

Do not expose personal information in reusable templates, examples, metadata, or documentation. Use neutral placeholders such as `SITE_NAME`, `OWNER_NAME`, `REPOSITORY_NAME`, and `example.com`.
