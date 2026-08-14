# Deployment choices

Read only after the user selects or asks to compare a deployment target. Verify current provider documentation when exact settings, limits, pricing, or action versions matter.

## GitHub Pages

Best for static output stored in GitHub. Confirm whether the repository is a user/organization site or a project site. Derive the base path instead of hard-coding a repository name. Use Actions when the framework needs a build step. Validate root-relative links and generated asset paths against the final subpath.

## Cloudflare Pages

Suitable for static sites and edge-enabled applications. Confirm build command, output directory, environment variables, preview behavior, and whether Functions are required.

## Vercel

Suitable for framework-integrated static and server-rendered sites. Confirm the framework preset, root/output settings, environment variables, preview/production domains, and whether server features are actually needed.

## Netlify

Suitable for static sites, previews, redirects, forms, and functions. Confirm build/output settings, redirects, environment variables, and any provider-specific form or function behavior.

## Self-hosted or other provider

Ask for the runtime and delivery constraints: static file hosting, Node server, container, reverse proxy, CI/CD system, domain, TLS, and rollback expectations. Produce portable build artifacts when possible.

## Deployment safeguards

- Keep secrets in provider-managed environment variables.
- Use an example environment file containing names but no secret values.
- Make preview and production configuration explicit.
- Set canonical site URL and base path from the deployment environment.
- Confirm custom-domain and DNS changes before applying them.
- Do not enable analytics, paid resources, or external services without consent.
- Run a production build and link/path checks before publishing.
