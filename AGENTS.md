# AGENTS.md — AI Agent Guide for Ergophobia Blog

## Sync with origin — before and after every task

BEFORE doing anything else in a session — before reading issues, branching, or editing a single file — make the local checkout match origin. Skip only if the human EXPLICITLY says to work offline or against a stale state.

```bash
git fetch origin
git status --porcelain        # MUST be empty before switching branches
```

- If `git status --porcelain` prints anything, STOP. The tree is dirty — do NOT `git checkout`. A checkout from a dirty branch can silently carry uncommitted edits onto `main`. Tell the human; let them commit, stash, or discard first.
- Only with a clean tree, update the default branch:

```bash
git checkout main && git pull --ff-only origin main
```

- If `git pull --ff-only` fails, local `main` has DIVERGED from `origin/main`. STOP and tell the human. Never force-push, hard-reset, or rebase to force it.
- Resuming mid-task on a feature branch? `git fetch` is still mandatory, but stay on that branch — don't switch to `main`. Only rebase/merge onto it when asked. The non-negotiable part is that `main` is current before cutting a NEW branch.

AFTER a PR merges, or after tearing down a git worktree, bring local `main` back in line with `origin/main` — from the primary checkout, AFTER leaving the worktree (`main` can't be checked out in two worktrees at once), clean tree only:

```bash
git checkout main && git pull --ff-only origin main
```

This applies to every agent and session unless explicitly told otherwise.

## Stack

- **SSG:** Hugo Extended (bespoke dark-first terminal theme)
- **Search:** Pagefind (bundled by `npm run build`)
- **Deploy:** huginn. See **Deploy** below. Cloudflare Workers Builds may still run for CI/previews; they are not the live origin.
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
  contact.md           # contact form (Hugo GET; POST → contact/)
assets/css/main.css    # ALL design tokens — :root dark, [data-theme="light"] light
static/fonts/          # self-hosted web fonts
contact/               # Bun POST handler for /contact (sendmail)
scripts/huginn-deploy.sh  # build + install on huginn (run via /usr/local/sbin/ergophobia-deploy)
public/                # build output (do not edit directly)
```

## Content Authoring

Write in Jim's voice. See [VOICE.md](VOICE.md) before drafting a post,
update, or any first-person copy.

### Posts — `content/posts/YYYY-MM-DD-slug.md`

```yaml
---
title: "Post Title"
date: 2026-01-09T21:50:00
description: "One-line meta description."
cover: "/img/covers/my-post.png"   # optional — social share image + page hero
coverAlt: "What the image shows."  # optional — alt text; defaults to the title
tags: [tag1, tag2]
---
```

Create: `hugo new posts/my-post.md`

### Cover Images — posts only

`cover` is a **post-only** field. Projects and `content/updates/` must not set it; they
fall back to `/img/og-default.png` on socials, and `npm run check` errors if they do.

- Put the file in `assets/img/covers/` and reference it as `/img/covers/slug.png`.
  From `assets/`, Hugo crops a 1200×630 JPEG share card (`og:image`, `twitter:image`,
  with width/height/alt tags) and serves a ≤1200px-wide hero above the post body.
- A path under `static/` also works but is passed through unprocessed — the raw file
  becomes the share card at whatever aspect ratio it happens to be.
- Landscape sources crop best; aim for 1.91:1 or wider-than-tall. Supply at
  least 1200×630 — nothing rejects a smaller file, it just gets upscaled into a
  blurry share card and a stretched hero.
- `coverAlt` falls back to the post title, so the hero is never announced as
  decorative — but write a real one when the image carries meaning.
- Posts without a `cover` are unchanged: `/img/og-default.png`, no hero.

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

## Deploy

Live site is **huginn** (Hetzner), not Cloudflare. Origin is this GitHub repo (`ergofobe/ergophobia-blog`). huginn clones it at `/opt/ergophobia-blog` and **pulls**.

After a site or contact-app change is on `origin/main`:

```bash
git push origin main
scripts/deploy.sh
# same as: ssh huginn /usr/local/sbin/ergophobia-deploy
```

That wrapper on huginn does `git fetch` + `git reset --hard origin/main`, then `scripts/huginn-deploy.sh`: `npm ci`, Hugo (production `baseURL` from `hugo.toml`), Pagefind, rsync `public/` → `/var/www/ergophobia`, restart `ergophobia-contact`.

Verify:

```bash
curl -sS -o /dev/null -w '%{http_code}\n' https://ergophobia.org/
curl -sS -o /dev/null -w '%{http_code}\n' https://ergophobia.org/contact/
```

GET `/contact/` is Hugo (`content/contact.md` + `layouts/_default/contact.html`). POST `/contact` is Bun (`contact/server.ts`) via Caddy; it 303s to `/contact/?status=sent|rate|missing|fail`.

Do **not** rsync `public/` from a laptop. Do **not** `git push` to huginn. Do **not** edit files under `/var/www/ergophobia` or `/opt/ergophobia-blog` by hand.

Caddy, systemd, and mail are **not** in this repo. Caddyfile lives on huginn at `/etc/caddy/Caddyfile` (laptop copy: `~/.config/ergophobia/Caddyfile`). Contact unit: `ergophobia-contact.service`, `WorkingDirectory=/opt/ergophobia-blog/contact`. Changing those is huginn ops, not a blog deploy.

## Theme

- Dark is the default; the header toggle cycles dark → light → system.
- **All colors live exclusively in `assets/css/main.css`** — `:root` block for dark mode, `[data-theme="light"]` block for light mode. Do not add color overrides anywhere else.

## Rules for Agents

0. Sync local `main` with `origin` before starting and after merging — see "Sync with origin — before and after every task" above.
1. Never edit files in `public/` — auto-generated.
2. Edit templates only for site-wide changes, not per-post tweaks.
3. Run `npm run check` and `npm test` after any structural change; `npm run build` before committing.
4. After pushing site or `contact/` changes to `origin/main`, deploy to huginn (`scripts/deploy.sh`). GitHub is not the live host.
5. Follow existing template patterns in `layouts/`.
6. Images go in `static/` and are referenced as `/img/filename.ext`. Post cover images are the exception — they go in `assets/img/covers/` so Hugo can generate the share card (see "Cover Images").
7. First-person copy follows [VOICE.md](VOICE.md).
