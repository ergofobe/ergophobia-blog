---
title: "ergophobia — week of 2026-06-29"
date: 2026-06-29
description: "Brought the rest of my projects into the living-project-page model and fixed the home page's grid alignment."
project: "ergophobia"
tags: [ergophobia, hugo]
---

A quiet settle-in week after last week's full rebuild.

The main job was extending the living-project-page model to the rest of what I'm
building. I added project cards for spanish-academy, ptycoin and hueristic and
backfilled their work logs from each repo's own history, so the updates feed
reflects where those projects actually are instead of starting cold from this
week. ollie and xrpl-sweep were already in place.

I also taught the update-log machinery to run a per-repo subagent, so each
project's weekly summary is generated with its own context rather than one pass
trying to hold everything at once.

The visible change was small but nagging: the home page hero and article weren't
sitting on the same content grid as everything else, so the left edges didn't
quite line up. Aligned them to the shared grid and the page reads as one column
again.
