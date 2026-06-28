# Update post template

Write each post to `content/updates/<YYYY-MM-DD>-<slug>.md`, where the date is
the run date and `<slug>` matches the project card's filename base.

## Front matter

```yaml
---
title: "<Project> — week of <Monday-of-the-week, YYYY-MM-DD>"
date: <run date, YYYY-MM-DD>
description: "<one sentence — the week's headline, used in the card work log and feed>"
project: "<slug>"          # MUST equal the card filename base, e.g. ollie
tags: [<slug>, <one or two topical tags>]
---
```

All three of `title`, `date`, `description` are required by the content
validator. `description` is what shows in the card's work log, so make it a
crisp one-liner, not a restatement of the title.

## Body

- **120–220 words.** Reverse the temptation to list every commit.
- **Summarize in your own words.** Never paste commit messages verbatim.
- **Group by theme**, not by chronology or PR number. Two or three short
  paragraphs beat a bullet dump.
- **Name version tags** cut during the window (e.g. "Tags v2.1 through v2.2.2").
- **Voice:** first-person, plain, builder-to-reader — match the existing posts in
  `content/updates/`. No marketing adjectives, no hype, no emoji.
- **Redaction:** if the helper reported the repo is PRIVATE, stay high-level —
  themes and outcomes only. No file names, internal identifiers, secrets, or
  unreleased specifics.

## Worked example (public repo)

```markdown
---
title: "Ollie — week of 2026-06-08"
date: 2026-06-13
description: "Fleet web UI CRUD, an equipment maintenance log, a live events feed — and Ollie goes open source under AGPL."
project: "ollie"
tags: [ollie, mcp]
---

Two things happened this week.

First, the Fleet web app got its full CRUD build: you can now run the back
office from the browser, not just the API or MCP. Alongside it, an equipment
maintenance log, an Events page redesigned into a live ops feed, and
driver-to-equipment cross-linking.

Second, I did the open-source launch prep: an AGPL-3.0 license, a SECURITY
policy, a CONTRIBUTING guide, and CI guards (gitleaks and CodeQL). Tags v2.1
through v2.2.2. Ollie is now public.
```

After writing, bump `content/projects/<slug>.md`'s `date:` to this post's date.
