---
title: "hueristic — week of 2026-06-15"
date: 2026-06-21
description: "From empty repo to a playable, shippable daily puzzle: game engine, Worker backend, PWA front end, and a skinnable theme layer."
project: "hueristic"
tags: [hueristic, cloudflare]
---

This was week one — the build. It went from nothing to a daily puzzle you can
actually play.

The core came first: the scoring logic, a game-mode registry with guess
validation, date handling, and a generator that precomputes each day's puzzle so
everyone gets the same one. I added a guardrail that checks every generated
puzzle is actually solvable within the allowed guesses before it ships, so a day
can't go out broken. A key design call: the hidden code stays on the server.
Guesses are scored server-side and the client only ever sees closeness feedback,
never the answer.

The front end is a small vanilla-TypeScript single-page app — a fixed-grid board
with keyboard input and undo, local persistence of progress and stats, a
spoiler-free share grid, and a PWA shell with a service worker and add-to-home
nudge. I also built a skinnable theme layer so colors and branding are config,
not hardcoded.

By the end of the week the polish landed too: clean routes with a 404, a
how-to-play overlay, six-language localization, dark mode, an endless practice
mode, and per-timezone daily switchover. It deploys automatically on merge.
