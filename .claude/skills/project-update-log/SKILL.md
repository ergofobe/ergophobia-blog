---
name: project-update-log
description: >
  Scans the blog's active and work-in-progress projects for repository changes
  over the past week and writes one summarized weekly update post per project
  that changed, under content/updates/, then bumps the project card date,
  validates, and ships via an auto-merged PR. Use for the weekly project-update
  run, when generating project work-log entries, or when the user says "run the
  project updater", "scan projects for updates", or "write this week's project
  updates".
compatibility: Requires gh (authenticated), hugo (extended), node, and a clone of the ergophobia-blog repo.
metadata:
  author: jim
  version: "1.0"
---

# Project Update Log

Generates the weekly **work log** for the blog's [[living-project-pages]] model:
one update post per project that had real changes this week. The project card's
work log and the `/projects/` ordering update automatically from these posts.

## When to run

Weekly (the scheduler fires it), or on demand. Each run covers the window since
each project's **last** update post, so skipped weeks self-heal.

## Procedure

Create a todo per step and work them in order.

1. **Branch.** Work on a fresh branch off `main` (e.g. `project-log-<date>`). If
   the checkout is dirty with unrelated changes, only ever stage the files you
   write in steps 6–7.

2. **Select projects.** Read every `content/projects/*.md`. Include a project
   only if its front-matter `status` is `active` or `wip` (skip `archived`). For
   each: `slug` = filename without `.md`; `repo` = the `repo:` URL → `owner/repo`.

3. **Find each project's window.** The newest existing update post is the window
   start:
   ```bash
   ls content/updates/*-<slug>.md 2>/dev/null | sort | tail -1   # read its date:
   ```
   Use that post's `date` as the `since` bound. If there is no prior post, use 7
   days ago.

4. **Fetch changes.** Run the helper:
   ```bash
   scripts/project-changes.sh <owner/repo> <since-YYYY-MM-DD>
   ```
   It prints repo visibility, commit first-lines in the window, and recent tags.

5. **Decide if there's anything to log.** SKIP the project (write no post) when
   the window has zero commits, or only noise — pure `chore`/`ci`/version-bump
   churn with no `feat`/`fix`/`docs`/`refactor` of substance. Honor the "one post
   per project per week **that had changes**" rule; never write an empty or
   filler post. State which projects you skipped and why.

6. **Write the update post** for each project that changed:
   `content/updates/<today>-<slug>.md`, following
   `references/update-post-template.md`. Summarize the week in your own words —
   **never paste commit messages verbatim** — group by theme, name version tags
   if any, and write in the first-person builder voice of the existing posts in
   `content/updates/`. Keep it ~120–220 words. For a **non-public** repo, stay
   high-level: themes and outcomes only, no file names, internal identifiers, or
   anything that could leak unreleased detail.

7. **Bump the card.** Set the `date:` in `content/projects/<slug>.md` to the new
   post's date so the project floats to the top of the recency-sorted list.

8. **Validate (gate).** All three must pass before shipping; fix and re-run until
   green:
   ```bash
   npm run check     # content validator
   npm test          # validator unit tests
   hugo --gc         # clean build, exit 0
   ```

9. **Ship (auto-merge).** Commit only the files from steps 6–7:
   ```bash
   git add content/updates content/projects
   git commit -m "content(updates): weekly project log <date>"
   git push -u origin <branch>
   gh pr create --base main --title "content: weekly project log <date>" --body "..."
   gh pr merge --auto --squash --delete-branch
   ```
   Merging to `main` auto-deploys via Cloudflare Workers Builds. If no project
   changed, write nothing, open no PR, and report "no updates this week."

## Gotchas

- **Validator requires `title` + `date` + `description`** on every update post
  (`scripts/check-content.mjs`); a missing `description` fails CI. Keep each
  front-matter field on one line; arrays as `[a, b]`.
- **`project:` must equal the card's filename base exactly** (e.g. `ollie`), or
  the card's work-log query won't pick the post up.
- **Update posts live ONLY in `content/updates/`** — never `content/posts/`, or
  they leak into the main blog feed.
- **Ordering is by card `date`.** If you don't bump it (step 7), the project
  won't move up even with a new post.
- **Summarize, never verbatim. Redact for private repos.** Determine visibility
  from the helper's output before writing.
- **`gh pr merge --delete-branch` fails locally if `main` is checked out in
  another worktree** — harmless in a clean cron checkout; if it errors after the
  remote merge, just delete the remote branch with `git push origin --delete`.
- **Skip silent weeks.** No substantive commits → no post. Don't pad.

## The scheduler

`scheduler-prompt.md` holds the prompt the weekly cron fires. It is a thin
trigger that invokes this skill across all active + wip projects for the past
week.
