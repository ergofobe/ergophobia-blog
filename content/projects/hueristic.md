---
title: "hueristic"
date: 2026-06-24
summary: "A daily code-breaking puzzle on Cloudflare Workers — guess the hidden color code, get peg-style feedback, build a streak."
status: "active"
repo: "https://github.com/ergofobe/puzzle-game"
demo: "https://hueristic.games"
tags: [typescript, cloudflare, game]
---

## Overview

A daily code-breaking logic puzzle: a fresh hidden color code each day, a fixed
number of guesses, and feedback after every try telling you how close you are.
Solve it, keep your streak, and share a spoiler-free result grid. One puzzle a
day, the same for everyone — the hook is the daily ritual and the streak.

## How it works

The whole thing runs on a single Cloudflare Worker that serves both the JSON API
and the static front end. The front end is a small vanilla-TypeScript SPA (built
with Vite, no framework): a mobile-first board with keyboard input, undo, local
persistence of your day's progress and stats, and a PWA shell with offline
support.

The daily puzzles live in **KV**, precomputed ahead of time so the same code is
served to every player. The hidden code never reaches the browser — guesses are
scored server-side and the API returns only the closeness feedback, so the
answer can't be sniffed from network traffic. Anonymous aggregate "how everyone
did today" stats are tracked in a **Durable Object**. The daily game lives at
`/classic`, with an endless practice variant and additional modes routed off a
small hub at the root.

**Stack:** TypeScript · Vite · Cloudflare Workers · KV · Durable Objects · Workers Builds (CI/CD).

The running log below is the week-by-week build history.
