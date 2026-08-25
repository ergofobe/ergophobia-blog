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
- **Deploy:** huginn (Hetzner). Origin is GitHub. Push `main`, then `ssh huginn /usr/local/sbin/ergophobia-deploy` (or `scripts/deploy.sh`). The VPS pulls, builds Hugo+Pagefind into `/var/www/ergophobia`, restarts the Bun contact POST handler. Do not rsync `public/` from a laptop. Cloudflare Workers Builds may still run for CI/previews; live origin is huginn.
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

0. Sync local `main` with `origin` before starting and after merging — see "Sync with origin — before and after every task" above.
1. Never edit files in `public/` — auto-generated.
2. Edit templates only for site-wide changes, not per-post tweaks.
3. Run `npm run check` and `npm test` after any structural change; `npm run build` before committing.
4. Follow existing template patterns in `layouts/`.
5. Images go in `static/` and are referenced as `/img/filename.ext`.
