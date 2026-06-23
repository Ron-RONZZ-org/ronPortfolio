# AGENTS.md — Root Project Rules for ronPortfolio

This is the canonical, repo-wide instruction file for AI agents working on **ronPortfolio**.

## Hierarchical Context Model

Agents **must** follow this rule:

> When working inside a directory, load the nearest `AGENTS.md` file and merge it with parent `AGENTS.md` files up to root.  
> Local rules override global rules.

Context resolution order (highest priority first):
1. `AGENTS-[module].md` in module directories — module-specific context
2. `AGENTS.md` in current working directory (if present)
3. Root `AGENTS.md` — global project rules

---

## Project Overview

**ronPortfolio** is Ron's personal portfolio website — a static site built with Astro. It showcases Ron's professional journey, achievements, education, personal projects, and a blog. The site supports three languages (EN/FR/ZH) via client-side i18n switching.

---

## Language and Naming Conventions

- All code, comments, and commit messages in **English**
- Variable/function names in **camelCase**
- Content collection files: `{language}-{slug}.md` (e.g., `en-weng.md`, `fr-weng.md`)
- Astro components: `PascalCase.astro`
- Page routes: **kebab-case** (`/blog/my-first-post`)
- Static assets: **kebab-case** (`profile-photo.png`)

---

## Tech Stack

| Category | Choice |
|---|---|
| **Framework** | Astro 5.x (static site generator) |
| **Content** | Markdown + YAML frontmatter via Astro Content Collections |
| **i18n** | Client-side JS with build-time inlined JSON translations |
| **Blog search** | MiniSearch (client-side, embedded index) |
| **CSS** | Single global stylesheet (`src/styles/global.css`) |
| **Deployment** | GitHub Pages via GitHub Actions |
| **Package manager** | npm |
| **Testing** | Playwright (e2e, `tests/e2e.mjs`) |

---

## Dependency management

This project uses **npm** for dependency management.

- `package-lock.json` **must be committed** (required for CI reproducibility)
- Install: `npm install`
- Add dependency: `npm install <pkg>`
- Dev dependency: `npm install --save-dev <pkg>`

---

## Project Structure

```
ronPortfolio/
├── src/
│   ├── content/
│   │   ├── config.ts          # Content collection schemas (Zod)
│   │   ├── cv/                # CV milestones (per-language .md files)
│   │   └── blog/              # Blog posts (per-language .md files)
│   ├── layouts/Base.astro     # Shared layout (i18n, head, nav)
│   ├── pages/
│   │   ├── index.astro        # Landing page (profile + links)
│   │   ├── cv.astro           # CV timeline
│   │   ├── contact.astro      # Contact page
│   │   ├── blog/
│   │   │   ├── index.astro    # Blog listing (search/sort/filter)
│   │   │   └── [slug].astro   # Individual blog post
│   │   ├── language/          # Language picker fallback
│   │   └── 404.astro
│   └── styles/global.css
├── public/
│   ├── CNAME                  # Custom domain (rongzhou.me)
│   └── img/                   # Static images
├── examples/blog/             # Sample blog articles (copy to content/)
├── translations/              # i18n string tables (JSON)
├── tests/e2e.mjs              # Playwright end-to-end tests
└── astro.config.mjs
```

---

## Coding Guidelines

1. **Content-first** — CV and blog content lives in `src/content/` as Markdown with YAML frontmatter. Content collections validate schemas at build time.
2. **Zero-JS where possible** — Pages that don't need interactivity should ship no client JavaScript. Only the i18n system and blog search use client JS.
3. **i18n via `data-i18n`** — All user-facing text uses `data-i18n="key"` attributes. Translation keys are defined in `translations/translation-strings.json`. The inline script in `Base.astro` handles language detection and text swapping.
4. **Language-specific content** — CV milestones and blog posts with per-language variants use the `language` field in frontmatter. Client JS shows/hides via `data-lang-content` attributes.
5. **CV milestones** — Each milestone is a separate `.md` file in `src/content/cv/`. Use the `category` field (education/work/achievement/personal) and numeric `start`/`end` years for sorting.
6. **Blog posts** — Each post is a `.md` file in `src/content/blog/`. Required frontmatter: `id`, `title`, `created`, `published`, `tags`. The blog landing page auto-generates search index and filter controls.
7. **No redundant dependencies** — Prefer Astro-native features and minimal client libraries. Currently only `minisearch` is used as a client dependency.
8. **Responsive design** — All pages must work on mobile. Breakpoint at 768px. Test with `npm run build && node tests/e2e.mjs`.
9. **Semantic HTML** — Use `<header>`, `<main>`, `<nav>`, `<article>` appropriately. Maintain the dark theme color scheme defined in CSS variables.

---

## Content Collection Schemas

### CV entry (`src/content/cv/*.md`)
```yaml
---
id: "unique-id"
category: "education"       # education | work | achievement | personal
title: "Display Title"
start: 2023
end: 2024                   # omit for "Present"
icon: "🚀"                  # optional emoji
logo: "https://..."         # optional URL
language: "en"              # en | fr | zh
sortOrder: 1                # optional tiebreaker
---
- Bullet point 1
- Nested:
  - Sub point
```

### Blog post (`src/content/blog/*.md`)
```yaml
---
id: "unique-id"
title: "Post Title"
description: "Short summary"
tags: ["tech", "life"]
series: "Series Name"       # optional
created: "2025-06-23"
modified: "2025-06-23"      # optional
language: "en"
published: true
---
Content in markdown...
```

---

## Development Workflow

```bash
npm install          # Install dependencies
npm run dev          # Start dev server (localhost:4321)
npm run build        # Build to dist/
npm run preview      # Preview built site (localhost:4322)
node tests/e2e.mjs   # Run e2e tests (requires preview server running)
```

- **CI check**: `npm run build` must succeed before pushing.
- **Testing**: After any structural change, run the e2e tests.
- **Deployment**: Push to `main` → GitHub Actions auto-deploys.

---

## Documentation Standards

- **The `AGENTS.md` in this directory is the single source of truth for project conventions.**
- **Content collection schemas** are documented in `src/content/config.ts` (Zod schemas with comments).
- **README.md** provides a quickstart for human contributors.
- **Module-level AGENTS files** should be created when a subdirectory grows to warrant its own rules (e.g., if a CLI tool or API server is added).

---

## Commit Message Format

Use [Conventional Commits](https://www.conventionalcommits.org/):
- `feat:` — new feature or capability
- `fix:` — bug fix
- `chore:` — maintenance, config, or cleanup
- `docs:` — documentation only
- `test:` — adding or fixing tests
- `refactor:` — code restructuring without behavior change

---

## What to Avoid

- Do not add JavaScript frameworks (React, Vue, Svelte) unless a component genuinely needs client-side reactivity
- Do not use external CSS frameworks (Tailwind, Bootstrap) — maintain the custom dark theme
- Do not add server-side rendering (SSR) — the site is fully static (SSG)
- Do not commit `.env` files, secrets, or API keys
- Do not introduce a CMS backend — content is file-based via Content Collections

---

## Module-Level AGENTS Files

No module-level AGENTS files are currently defined. The project is a flat Astro application without standalone submodules.

If a future module (e.g., a CLI tool, API server, or separate build script) is added to a subdirectory, it should get its own `AGENTS-[module].md` in that directory, following the template.

---

## Dependency and Inheritance Map

```
Root AGENTS.md (global rules)
    │
    └── (future: AGENTS.md in any subdirectory — local context)
```

Local rules override global rules. Module-level files focus on domain-specific behavior, constraints, and invariants.
