---
title: "ergophobia"
date: 2026-08-25
summary: "This blog — a bespoke Hugo terminal theme, self-hosted on a Hetzner VPS behind Caddy."
status: "active"
repo: "https://github.com/ergofobe/ergophobia-blog"
demo: "https://ergophobia.org"
weight: 20
tags: [hugo, self-hosting]
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
client-side search. It ran on Cloudflare Workers for a while; it now lives on my
own VPS behind Caddy, which pulls `origin/main` and rebuilds on demand.

**Stack:** Hugo Extended · Pagefind · Caddy on a Hetzner VPS.
