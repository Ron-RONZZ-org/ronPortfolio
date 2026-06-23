# ronPortfolio

Ron's personal portfolio — built with Astro.

## Live Site

[rongzhou.me](https://rongzhou.me)

## Tech Stack

- **Framework**: [Astro](https://astro.build) 5.x (static site generator)
- **Content**: Markdown with YAML frontmatter via Astro Content Collections
- **i18n**: Client-side with inlined translations (EN/FR/ZH)
- **Search**: Client-side with MiniSearch (blog)
- **Deployment**: GitHub Pages via GitHub Actions

## Project Structure

```
├── src/
│   ├── layouts/Base.astro   # Shared layout (i18n, nav, head)
│   ├── pages/
│   │   ├── index.astro      # Landing page
│   │   ├── cv.astro         # CV timeline
│   │   ├── contact.astro    # Contact page
│   │   ├── blog/
│   │   │   ├── index.astro  # Blog listing (search/sort/filter)
│   │   │   └── [slug].astro # Individual articles
│   │   ├── language/        # Language picker fallback
│   │   └── 404.astro
│   ├── content/
│   │   ├── config.ts        # Content collection schemas
│   │   └── cv/              # CV milestones (per language)
│   └── styles/global.css
├── public/
│   ├── CNAME                # Custom domain
│   └── img/                 # Static images
├── examples/blog/           # Sample blog articles
├── translations/            # i18n string tables
└── astro.config.mjs
```

## Development

```bash
npm install
npm run dev     # Start dev server (http://localhost:4321)
npm run build   # Build to dist/
npm run preview # Preview build
```

## Adding a CV Milestone

Create a file in `src/content/cv/{lang}-{slug}.md`:

```markdown
---
id: "my-milestone"
category: "work"             # education | work | achievement | personal
title: "My Milestone"
start: 2025
end: 2026                    # omit for "Present"
icon: "🚀"
logo: "https://example.com/logo.png"
language: "en"
sortOrder: 1
---
- Bullet point 1
- Bullet point 2
  - Nested sub-point
```

## Adding a Blog Post

Create a file in `src/content/blog/{slug}.md`:

```markdown
---
id: "my-post"
title: "Post Title"
description: "Short description"
tags: ["tech", "life"]
series: "Series Name"
created: "2025-06-23"
modified: "2025-06-23"
language: "en"
published: true
---
Content in markdown...
```

## Deployment

Pushes to `main` automatically deploy via GitHub Actions.
The custom domain (rongzhou.me) is configured via `public/CNAME`.

## License

MIT
