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
  version: "1.1"
---

# Project Update Log

Generates the weekly **work log** for the blog's [[living-project-pages]] model:
one update post per project that had real changes this week. The project card's
work log and the `/projects/` ordering update automatically from these posts.

## When to run

Weekly (the scheduler fires it), or on demand. Each run covers the window since
each project's **last** update post, so skipped weeks self-heal. For a
**backfill**, set a project's `since` further back (project inception) and let
its subagent emit *one post per week that had real work* — multiple posts, not
one.

## Architecture: one subagent per repo

The orchestrator (this context) does git and filesystem work only. Each project's
repo is scanned **and drafted inside its own subagent**, which returns finished
post markdown. This keeps every repo's raw commit log out of the main context and
out of every other repo's context — no cross-repo bleed, and the orchestrator
stays small even across a many-week backfill.

## Procedure

Create a todo per step and work them in order.

1. **Branch.** Work on a fresh branch off `main` (e.g. `project-log-<date>`). If
   the checkout is dirty with unrelated changes, only ever stage the files you
   write in steps 4–5.

2. **Select projects (orchestrator).** Read every `content/projects/*.md`.
   Include a project only if its front-matter `status` is `active` or `wip` (skip
   `archived`). For each build a work item: `slug` = filename without `.md`;
   `owner/repo` from the `repo:` URL; and `since` = the date of the newest
   existing `content/updates/*-<slug>.md` (`ls … | sort | tail -1`), or 7 days ago
   if none (or project inception for a backfill). Skip any project whose `repo:`
   another included project already owns — never scan the same repo twice.

3. **Dispatch one subagent per project (in parallel).** Give each subagent its
   `owner/repo`, `since`, `slug`, the absolute path to
   `<skill-dir>/scripts/project-changes.sh`, and
   `references/update-post-template.md`. Instruct it to:
   - Run `project-changes.sh <owner/repo> <since>` — this filters to **your**
     commits (the helper defaults `author` to your `gh` login). It also reports
     repo visibility.
   - Decide per the template + the **skip rule** below; for a backfill, group the
     window into ISO weeks and draft one post per week with substance.
   - **Return only** structured post markdown — for each post: target filename
     `content/updates/<post-date>-<slug>.md`, the front matter, and the body.
     Return `{skip, reason}` if nothing qualifies. The subagent does **not** write
     files, touch git, or bump cards.

   **Skip rule (the subagent applies it):** no post for a week with zero of your
   commits, or only noise — pure `chore`/`ci`/version-bump churn with no
   `feat`/`fix`/`docs`/`refactor` of substance. Never pad. For a **PRIVATE** repo
   (per the helper's visibility line), stay high-level: themes and outcomes only,
   no file names, internal identifiers, or unreleased specifics.

4. **Collect & write (orchestrator).** Write each returned post to its
   `content/updates/<date>-<slug>.md`. Posts are ~120–220 words, summarized (never
   verbatim commits), in the first-person builder voice of the existing posts.

5. **Bump the cards (orchestrator).** For each project that produced a post, set
   the `date:` in `content/projects/<slug>.md` to its **newest** new post's date,
   so it floats to the top of the recency-sorted list.

6. **Validate (gate).** All three must pass before shipping; fix and re-run until
   green:
   ```bash
   npm run check     # content validator
   npm test          # validator unit tests
   hugo --gc         # clean build, exit 0
   ```

7. **Ship (auto-merge).** Commit only the files from steps 4–5:
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
- **Only your work.** The helper filters commits to your `gh` login by default,
  so other contributors and bots (dependabot, etc.) don't leak into your work
  log. Pass a third arg to `project-changes.sh` to override the author, or `*`
  for all authors.
- **One repo, one subagent — never two cards on one repo.** If two project cards
  share a `repo:`, only one can own its history; scan it once. Don't double-count.
- **Backfill = many posts per repo.** A backfilling subagent returns one post per
  ISO week with substance, not a single catch-all. Write them all; bump the card
  to the newest.

## The scheduler

`scheduler-prompt.md` holds the prompt the weekly cron fires. It is a thin
trigger that invokes this skill across all active + wip projects for the past
week.
