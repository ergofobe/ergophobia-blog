---
title: "ergophobia"
date: 2026-06-29
summary: "This blog — a bespoke Hugo terminal theme deployed on Cloudflare Workers."
status: "active"
repo: "https://github.com/ergofobe/ergophobia-blog"
demo: "https://ergophobia.org"
weight: 20
tags: [hugo, cloudflare]
---

## Overview

The site you're reading. A quiet corner of the internet that belongs entirely to
me — no character limits, no shadow-bans, no algorithm deciding what stays
visible. Everything I write lives here, and nowhere else.

## How it works

A bespoke, dark-first terminal theme, hand-built rather than pulled from a theme
gallery — the prompt lines, the `ls projects/` listings, the LED status dots are
all part of the aesthetic. It started life on Eleventy and was re-platformed onto
Hugo Extended for faster builds and cleaner content modeling. Pagefind powers
client-side search, and it deploys on every merge to `main` via Cloudflare
Workers Builds.

**Stack:** Hugo Extended · Pagefind · Cloudflare Workers.
