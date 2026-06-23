import { defineCollection, z } from 'astro:content';

// ── CV entries ──────────────────────────────────────────────

const cvSchema = z.object({
  id: z.string().min(1),
  category: z.enum(['education', 'work', 'achievement', 'personal']),
  title: z.string().min(1),
  start: z.number(),
  end: z.number().optional(),             // absent = "Present"
  icon: z.string().optional(),
  logo: z.string().optional(),
  language: z.enum(['en', 'fr', 'zh']),
  sortOrder: z.number().optional(),       // tiebreaker within same year
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
  language: z.enum(['en', 'fr', 'zh']).default('en'),
});

// ── Portfolio entries ───────────────────────────────────────

const portfolioSchema = z.object({
  id: z.string().min(1),
  category: z.enum(['software', 'research', 'association']),
  title: z.string().min(1),
  description: z.string().optional(),
  url: z.string().optional(),              // primary project link
  sourceUrl: z.string().optional(),        // source code link (for software)
  logo: z.string().optional(),             // path to logo image
  language: z.enum(['en', 'fr', 'zh']),
  sortOrder: z.number().optional(),
});

// ── Export collections ──────────────────────────────────────

export const collections = {
  cv:        defineCollection({ type: 'content', schema: cvSchema }),
  blog:      defineCollection({ type: 'content', schema: blogSchema }),
  portfolio: defineCollection({ type: 'content', schema: portfolioSchema }),
};
