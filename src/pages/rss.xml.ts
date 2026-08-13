import rss from '@astrojs/rss';
import { getPublicContent } from '../lib/content';
import { siteConfig } from '../config/site';
import { absoluteSiteUrl } from '../lib/urls';

export async function GET(context: { site: URL }) {
  const entries = await getPublicContent();
  return rss({
    title: siteConfig.name,
    description: siteConfig.description,
    site: absoluteSiteUrl('/', context.site),
    items: entries.map((entry) => ({
      title: entry.data.title,
      description: entry.data.description,
      pubDate: entry.data.published,
      link: absoluteSiteUrl(`/${entry.collection}/${entry.data.slug}/`, context.site).href,
    })),
  });
}
