---
id: "hello-astro"
title: "Hello, Astro — Rebuilding My Portfolio"
description: "Why I decided to migrate from vanilla HTML to Astro, and what I learned along the way."
tags: ["meta", "webdev"]
series: "Portfolio Rewrite"
created: "2025-06-23"
modified: "2025-06-23"
language: "en"
published: true
---

## Why Astro?

For years my portfolio was three hand-written HTML files, a single CSS file, and some vanilla JavaScript. It worked. It loaded fast. But as I wanted to add more content — a blog, better i18n, richer CV data — the cracks started to show.

Every new page meant copy-pasting the `<header>` and `<nav>` blocks. Every language required duplicating the entire page structure. The CV timeline was parsed client-side from a custom Markdown format.

I needed something that:

1. **Eliminates repetition** — layouts and components
2. **Handles Markdown natively** — no custom parser for CV data
3. **Ships zero JS** — pages that don't need interactivity shouldn't load JavaScript
4. **Is future-friendly** — easy to add pages, features, content

Astro checked all four boxes.

## What Changed

| Before | After |
|---|---|
| 3 HTML files, copied structure | 1 Base layout, 5 page templates |
| Custom Markdown parser in JS (323 lines) | Content collections + `<Content />` component |
| Client-fetched translations.json | Inlined at build time |
| No build step | Astro build → static `dist/` |
| i18n: JS text swapping only | Same approach, but data inlined |

The biggest win? The CV page. Previously the browser had to fetch `mileStone.md`, parse it, build DOM nodes, and insert them. Now all that HTML is generated at build time. The browser just renders it.

## What I'd Do Differently

If I were starting from scratch:

- Use **content collections** from day one — the schema validation catches typos before deploy
- Set up the blog as a collection early, even if there are no posts — the scaffolding is free
- Keep the i18n simple — inline JSON + `data-i18n` attributes is hard to beat for a personal site

## Next Steps

- Add more blog posts (this is the first!)
- Write some articles about open-source projects I'm working on
- Maybe add a dark mode toggle that remembers preference

Stay tuned.
