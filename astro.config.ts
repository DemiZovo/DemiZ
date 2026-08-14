import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

import { siteConfig } from './src/config/site';

const site = process.env.SITE_URL ?? siteConfig.url;
const base = process.env.BASE_PATH ?? '/';

export default defineConfig({
  site,
  base,
  output: 'static',
  trailingSlash: 'always',
  integrations: [sitemap({ filter: (page) => !page.includes('/draft-preview/') && !page.endsWith('/write/') })],
  markdown: {
    rehypePlugins: [
      () => (tree) => {
        const visit = (node: any) => {
          if (node?.properties) {
            for (const attribute of ['src', 'href']) {
              const value = node.properties[attribute];
              if (typeof value === 'string' && value.startsWith('/') && !value.startsWith('//')) {
                node.properties[attribute] = `${base.replace(/\/$/, '')}${value}`;
              }
            }
          }
          node?.children?.forEach(visit);
        };
        visit(tree);
      },
    ],
  },
});
