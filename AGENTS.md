# AGENTS.md — AI Agent Guide for Ergophobia Blog

## Stack

- **SSG:** Hugo Extended (bespoke dark-first terminal theme)
- **Search:** Pagefind (bundled by `npm run build`)
- **Deploy:** Cloudflare Workers Builds — serves `./public`; pushes to `main` deploy automatically; PRs get a preview URL
- **Language:** English only

## Directory Structure

```
layouts/
  baseof.html          # root shell
  index.html           # home page
  _default/            # list, single, search, 404
  projects/            # project list + single overrides
  partials/            # header, footer, head, post-row, search, etc.
  shortcodes/          # video shortcode
content/
  posts/               # blog posts (YYYY-MM-DD-slug.md)
  projects/            # project pages (slug.md)
assets/css/main.css    # ALL design tokens — :root dark, [data-theme="light"] light
static/fonts/          # self-hosted web fonts
public/                # build output (do not edit directly)
```

## Content Authoring

### Posts — `content/posts/YYYY-MM-DD-slug.md`

```yaml
---
title: "Post Title"
date: 2026-01-09T21:50:00
description: "One-line meta description."
tags: [tag1, tag2]
---
```

Create: `hugo new posts/my-post.md`

### Projects — `content/projects/slug.md`

```yaml
---
title: "Project Name"
summary: "One-line description shown in the project list."
status: active          # active | wip | archived
repo: "https://github.com/..."
demo: "https://..."
weight: 10              # lower = listed first
tags: [hugo, cloudflare]
---
```

Create: `hugo new projects/my-project.md`

### Video Shortcode

```
{{</* video youtube="VIDEO_ID" */>}}
{{</* video vimeo="VIDEO_ID" */>}}
{{</* video mp4="/path/to/file.mp4" */>}}
```

## Dev / Build / Test Commands

```bash
npm run dev      # hugo server + live reload at http://localhost:1313
npm run build    # hugo --gc --minify + pagefind → ./public
npm run check    # validate post/project front matter
npm test         # unit tests (node --test)
```

## Theme

- Dark is the default; the header toggle cycles dark → light → system.
- **All colors live exclusively in `assets/css/main.css`** — `:root` block for dark mode, `[data-theme="light"]` block for light mode. Do not add color overrides anywhere else.

## Rules for Agents

1. Never edit files in `public/` — auto-generated.
2. Edit templates only for site-wide changes, not per-post tweaks.
3. Run `npm run check` and `npm test` after any structural change; `npm run build` before committing.
4. Follow existing template patterns in `layouts/`.
5. Images go in `static/` and are referenced as `/img/filename.ext`.
