# Ergophobia — Hugo + Terminal Theme + Cloudflare Workers Redesign

**Date:** 2026-06-27
**Status:** Approved design, pending implementation plan

## Goal

Re-platform the Ergophobia personal blog from Eleventy (GitHub Pages) to Hugo
(Cloudflare Workers Builds), with a bespoke "terminal / hi-tech" theme. The site
stays a personal blog for sharing thoughts and showcasing the projects Jim builds.
Reference architecture: `~/src/ptycoin-blog` (Hugo + Workers Builds + Pagefind),
adapted to a single-language, non-commercial personal site.

## Non-goals

- Multilingual content (ptycoin's en/es split is dropped — English only).
- Commercial features: ads, consent banners, heavy analytics, newsletters.
- Preserving the Eleventy/Docker/GitHub Pages toolchain.

## Decisions (locked)

| Decision | Choice |
|---|---|
| Static site generator | Hugo Extended |
| Theme | Bespoke "terminal / hi-tech", dark-first **+ light "paper terminal" variant** |
| Projects | Dedicated `/projects` section (Hugo content type), terminal `ls`-style listing |
| Search | Pagefind (client-side, `/search`) |
| Feeds | RSS (Hugo built-in) |
| Video | Hugo `video` shortcode (self-hosted MP4 + YouTube/Vimeo) |
| Analytics | Cloudflare Web Analytics (cookieless, minimal), param-gated |
| Deploy | Cloudflare Workers Builds serving `./public` |
| Language | English only |

## Architecture

Hugo Extended static site with a **bespoke theme implemented directly in
`layouts/`** (no external/installed theme). The design system lives entirely in
CSS custom properties in `assets/css/main.css` (`:root` = dark, `[data-theme="light"]`
= light). Colors change there and nowhere else.

### Directory layout

```
hugo.toml                  # site config (single language)
wrangler.jsonc             # Cloudflare Workers static-assets config
package.json               # build scripts + pagefind devDependency
archetypes/
  posts.md                 # archetype for new posts
  projects.md              # archetype for new projects
content/
  _index.md                # home (hero copy in front matter/params)
  about.md
  search.md                # Pagefind UI page
  posts/                   # blog posts (migrated 3 + future)
  projects/                # project entries (content type)
layouts/
  _default/{baseof,list,single,search}.html
  index.html               # home: whoami hero + recent posts + projects teaser
  projects/list.html       # terminal `ls projects/` listing
  projects/single.html     # optional per-project detail page
  404.html
  robots.txt
  partials/{head,header,footer,article-card,project-row,
            theme-toggle,search,hero,analytics}.html
  shortcodes/video.html    # MP4 / YouTube / Vimeo embed
assets/
  css/main.css             # tokenized design system (dark + light)
  js/theme.js              # theme cycle (dark -> light -> system)
static/
  fonts/                   # self-hosted JetBrains Mono + Inter woff2
  img/                     # favicon, og image, post/project covers
scripts/
  cf-build.sh              # hugo --gc --minify + pagefind + 404 copy
  check-content.mjs        # front-matter / asset / project-link validation
  check-content.test.mjs   # node --test
.github/workflows/ci.yml   # Hugo + Pagefind build + tests on PR/main
docs/                      # specs, plans, content-ops notes
```

### Build pipeline (`scripts/cf-build.sh`)

Mirrors ptycoin, simplified for one language:

```sh
set -eu
if [ "${WORKERS_CI:-}" = "1" ] && [ "${WORKERS_CI_BRANCH:-}" = "main" ]; then
  hugo --gc --minify
else
  hugo --gc --minify --baseURL "/"
fi
pagefind --site public
# single-language: 404 is already at public/404.html (no /en/ subdir)
```

Production (`main`) uses the absolute `baseURL` from `hugo.toml`; preview branches
and local builds use host-relative `/` so they don't link back to the live domain.

### Deployment

- `wrangler.jsonc` serves `./public` as static assets with
  `html_handling: "auto-trailing-slash"` and `not_found_handling: "404-page"`.
- Cloudflare **Workers Builds** is connected to the GitHub repo
  (`ergofobe/ergophobia-blog`); pushes to `main` build via `npm run build` and deploy.
- `ergophobia.org` is attached to the Worker as a **custom domain** in the Cloudflare
  dashboard (manual click-ops step, documented in README). DNS moves off GitHub Pages.
- The existing `.github/workflows/deploy.yml` (GitHub Pages) is **removed**.

## Theme: Terminal / Hi-Tech

Dark-first, monospace-accented, with a green primary and amber secondary accent,
plus a light "paper terminal" variant.

### Brand tokens (`assets/css/main.css`)

| Token | Dark | Light | Use |
|---|---|---|---|
| `--bg` | `#0b0f14` | `#f7f4ea` | page background |
| `--panel` | `#11171f` | `#fffdf6` | cards / rows |
| `--line` | `#1e2730` | `#e6e0cf` | borders / rules |
| `--ink` | `#d7e0e8` | `#3a3a32` | body text |
| `--muted` | `#6d7c8a` | `#8a8472` | meta, excerpts |
| `--accent` | `#3ee08f` | `#1f9d57` | links, prompt, primary accent |
| `--accent-2` | `#f0b429` | `#b07a12` | project/`#project` highlights |

Scale: `--radius: 10px`, `--maxw: 860px` (reading), `--maxw-wide: 1080px` (grids).

### Typography

- **JetBrains Mono** — headings, nav, dates, tags, code, all UI chrome.
- **Inter** — body copy (long-form readability).
- Both **self-hosted** as `woff2` in `static/fonts/` with `@font-face` and
  `font-display: swap`. Zero third-party font requests (CWV + GDPR clean).

### Theming mechanism

- Blocking inline script in `partials/head.html` sets `data-theme` before first
  paint from `localStorage.theme` (`dark` | `light` | `system`); default `dark`.
- `assets/js/theme.js` cycles the `#theme-toggle` button dark → light → system,
  persists the choice, and re-resolves `system` on OS preference change.
- CSS only reads `[data-theme="dark|light"]`; `system` resolves to one of those.

### Signature UI elements

- **Home hero**: a `whoami`-style prompt block — `jim@ergophobia:~$ whoami` followed
  by a short identity statement and blinking cursor. Hero copy stored in
  `content/_index.md` front matter so it's editable without touching templates.
- **Nav**: prompt-styled (`posts`, `projects`, `about`, `./search`) + theme toggle.
- **Post/Project rows**: monospace date column, title, short blurb, `#tag` / status pill.
- **Tags** render as `[#tag]` pills; project status as a colored LED (`active` green,
  `wip` amber, `archived` muted).

## Content model

### Posts (`content/posts/*.md`)

```yaml
title: "…"
date: 2026-01-18T18:43:00
description: "…"          # used for excerpt + meta + Pagefind
tags: [xrp, project]
cover: "img/…"            # optional
```

Single template: prompt-style header, byline, body wrapped with
`data-pagefind-body`, tag pills. The 3 existing posts are migrated (drop the
Eleventy `layout:` key, add `tags`).

### Projects (`content/projects/*.md`)

```yaml
title: "xrpl-sweep"
summary: "CLI to recover XRP account reserves from a BIP-39 mnemonic."
status: "active"          # active | wip | archived
repo: "https://github.com/…"
demo: "https://…"         # optional
weight: 10                # ordering
date: 2026-01-18
tags: [xrp, cli]
```

- `layouts/projects/list.html` renders a terminal listing:
  `~/ergophobia $ ls projects/` then one row per project with status LED and
  `↗repo` / `↗demo` links.
- `layouts/projects/single.html` gives each project an optional detail page
  (longer description in the markdown body), cross-linkable from related posts.
- Seeded projects: **xrpl-sweep**, **ergophobia** (this blog), **social-intel**.

### Home (`layouts/index.html`)

whoami hero → "recent posts" list → "projects" teaser (top N by weight) →
links to `/posts` and `/projects`.

## Features

- **Search**: `pagefind --site public` post-build; `/search` page hosts the Pagefind
  UI. Body content marked with `data-pagefind-body` in `single.html`.
- **RSS**: `[outputs] home = ["HTML", "RSS"]` in `hugo.toml`; Hugo's built-in feed.
- **Video**: `layouts/shortcodes/video.html` — `{{< video src="…" >}}` for self-hosted
  MP4 (HTML5 `<video>`), and `{{< video youtube="ID" >}}` / `{{< video vimeo="ID" >}}`
  for privacy-friendly embeds (lazy, no autoplay). Ports the intent of the old
  Eleventy `examples/` (mp4/vimeo) without those demo files.
- **Analytics**: `partials/analytics.html` renders the Cloudflare Web Analytics beacon
  only when `params.analytics.cloudflare_token` is set. Cookieless, no consent banner.

## Migration & cleanup

**Migrate:**
- 3 posts → Hugo front matter; image `peaceful-workspace.webp` → Hugo assets/static.
- Seed 3 projects.

**Remove:**
- Eleventy: `.eleventy.js`, `.eleventyignore`, `_includes/`, `*.njk`, `posts/posts.json`,
  `styles/`, `examples/`.
- GitHub Pages: `.github/workflows/deploy.yml`.
- Docker: `Dockerfile`, `Dockerfile.dev`, `docker-compose.yml`, `.dockerignore`.
- `package.json` rewritten for Hugo (`dev`, `build`, `test`, `check`).

**Cutover:** attach `ergophobia.org` to the Worker (custom domain), then remove the
GitHub Pages DNS/config. Documented in README; dashboard step done by Jim.

## Testing & quality gates

- `scripts/check-content.mjs` (+ `node --test`): validates post/project front matter
  (required keys, valid `status`, referenced `cover`/asset exists, project `repo` is a
  URL). Runs in CI and as `npm run check`.
- CI (`.github/workflows/ci.yml`): install Hugo Extended + Node, `node --test`,
  `npm run check`, then full `npm run build` (Hugo + Pagefind). Build must succeed.
- Accessibility: semantic landmarks, one `h1`/page, visible `:focus-visible`, required
  `alt` on content images, contrast ≥ 4.5:1 in both themes, `aria-current="page"` nav.
- Performance: self-hosted fonts, minified output, no render-blocking third-party JS.

## Open / deferred

- Per-project detail pages are supported but only authored when a project warrants a
  long write-up; otherwise the `/projects` row links straight to repo/demo.
- About page copy to be written during implementation (short, in Jim's voice).
- OG/favicon assets: a simple terminal-mark to be generated during implementation.
