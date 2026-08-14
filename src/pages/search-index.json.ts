import type { APIRoute } from 'astro';
import { entryPath, getPublicContent } from '../lib/content';
import { sitePath } from '../lib/urls';

export const GET: APIRoute = async () => {
  const entries = await getPublicContent();
  return new Response(JSON.stringify(entries.map(entry => ({
    title: entry.data.title,
    description: entry.data.description,
    category: entry.collection === 'blog' ? entry.data.category : '生活',
    tags: entry.data.tags,
    collection: entry.collection,
    published: entry.data.published.toISOString(),
    url: sitePath(entryPath(entry)),
    searchableText: (entry.body ?? '')
      .replace(/^---[\s\S]*?---/, '')
      .replace(/```[\s\S]*?```/g, ' ')
      .replace(/`[^`]*`|<[^>]+>|[#>*_~\[\]()!-]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 6000),
  }))), { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
};
