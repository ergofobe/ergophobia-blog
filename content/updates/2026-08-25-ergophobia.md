---
title: "Ergophobia — week of 2026-08-24"
date: 2026-08-25
description: "Moved the live site off Cloudflare Workers onto my own VPS, with a pull-based deploy and a self-hosted contact form."
project: "ergophobia"
tags: [ergophobia, hosting]
---

The site no longer runs on Cloudflare Workers. It's served from huginn, a Hetzner
VPS I already keep around for mail, with Caddy out front. The deploy is
pull-based rather than pushed: huginn fetches `origin/main`, resets its own
checkout to it, builds the site with Hugo, runs Pagefind over the output, and
rsyncs the result into place. From my laptop the whole thing is one ssh call in
`scripts/deploy.sh`. Owning the box means the build and the origin are the same
machine, which is simpler to reason about than a hosted pipeline I can only watch
from outside.

The contact form moved with it. It used to be a Worker; now it's a small Bun
service on the same host. Hugo renders the page, the Bun process handles the
POST, rate-limits by IP, and hands the message to local sendmail, then redirects
back to the form with a status.

I also wrote the new rule into AGENTS.md and CLAUDE.md, because the old habit is
now wrong: pushing to `main` isn't a publish anymore, and someone has to run the
deploy afterward.
