import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const imagePattern = /\.(?:webp|avif|png|jpe?g)$/i;

const slug = z.string().regex(slugPattern, '必须是英文小写短链接，单词用连字符分隔');
const image = z.string().regex(imagePattern, '必须是受支持的图片路径');
const tags = z.array(z.string().trim().min(1)).default([]);
const optionalUpdated = z.coerce.date().optional();

const blog = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/blog' }),
  schema: z.object({
    title: z.string().trim().min(1).max(100),
    description: z.string().trim().min(1).max(240),
    slug,
    published: z.coerce.date(),
    updated: optionalUpdated,
    category: z.string().trim().min(1),
    tags,
    cover: image.optional(),
    draft: z.boolean().default(false),
    featured: z.boolean().default(false),
    toc: z.boolean().default(true),
  }).refine(({ published, updated }) => !updated || updated >= published, {
    message: 'updated 不得早于 published',
    path: ['updated'],
  }),
});

const galleryItem = z.object({
  src: image,
  alt: z.string().trim().min(1, '相册图片必须提供替代文字'),
  caption: z.string().trim().optional(),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
});

const life = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/life' }),
  schema: z.object({
    title: z.string().trim().min(1).max(100),
    description: z.string().trim().min(1).max(240),
    slug,
    published: z.coerce.date(),
    updated: optionalUpdated,
    tags,
    cover: image.optional(),
    gallery: z.array(galleryItem).default([]),
    draft: z.boolean().default(false),
    featured: z.boolean().default(false),
  }).refine(({ published, updated }) => !updated || updated >= published, {
    message: 'updated 不得早于 published',
    path: ['updated'],
  }),
});

export const collections = { blog, life };
