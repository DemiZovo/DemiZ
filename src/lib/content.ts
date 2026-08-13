import { getCollection, type CollectionEntry } from 'astro:content';

export type BlogEntry = CollectionEntry<'blog'>;
export type LifeEntry = CollectionEntry<'life'>;
export type PublicEntry = BlogEntry | LifeEntry;

const newestFirst = <T extends PublicEntry>(a: T, b: T) =>
  b.data.published.getTime() - a.data.published.getTime();

/** 唯一的公开内容边界：生产环境永远排除 draft。 */
export const isPublicEntry = <T extends PublicEntry>(entry: T): boolean =>
  import.meta.env.DEV || !entry.data.draft;

export async function getPublicBlog(): Promise<BlogEntry[]> {
  return (await getCollection('blog', isPublicEntry)).sort(newestFirst);
}

export async function getPublicLife(): Promise<LifeEntry[]> {
  return (await getCollection('life', isPublicEntry)).sort(newestFirst);
}

export async function getPublicContent(): Promise<PublicEntry[]> {
  const [blog, life] = await Promise.all([getPublicBlog(), getPublicLife()]);
  return [...blog, ...life].sort(newestFirst);
}

export const entryPath = (entry: PublicEntry) =>
  `/${entry.collection === 'blog' ? 'blog' : 'life'}/${entry.data.slug}/` as const;
