import { defineCollection, z } from 'astro:content';

// ── Shared language enum ────────────────────────────────

export const LanguageEnum = z.enum(['en', 'fr', 'zh', 'eo']);

// ── CV entries ──────────────────────────────────────────────
// Shared fields (category, start, end, icon, logo, sortOrder)
// and translated titles live in meta.json, merged at render
// time. The .md files are stubs with id + language + body.

const cvSchema = z.object({
  id: z.string().min(1),
  language: LanguageEnum,
});

// ── Blog posts ──────────────────────────────────────────────

const blogSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional(),
  tags: z.array(z.string()).default([]),
  series: z.string().optional(),
  published: z.boolean().default(true),
  created: z.string(),                    // ISO date string
  modified: z.string().optional(),
  language: LanguageEnum.default('en'),
});

// ── Portfolio entries ───────────────────────────────────────
// Shared fields (category, url, priority, logo, etc.) and
// translated title/description live in meta.json, merged at
// render time. The .md files are stubs with id + language.

const portfolioSchema = z.object({
  id: z.string().min(1),
  language: LanguageEnum,
});

// ── Export collections ──────────────────────────────────────

export const collections = {
  cv:        defineCollection({ type: 'content', schema: cvSchema }),
  blog:      defineCollection({ type: 'content', schema: blogSchema }),
  portfolio: defineCollection({ type: 'content', schema: portfolioSchema }),
};
