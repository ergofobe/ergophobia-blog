---
title: "ptycoin"
date: 2026-06-29
summary: "Bilingual (EN/ES) crypto news and project-spotlight blog, LatAm-rooted and globally relevant, built on Hugo and Cloudflare."
status: "active"
repo: "https://github.com/ptycoin/ptycoin-blog"
repo_private: true
demo: "https://ptycoin.com"
tags: [hugo, crypto, i18n]
---

## Overview

PTYcoin is a bilingual crypto publication — news, market reads, policy coverage,
project spotlights and explainer guides — written for Latin America but relevant
anywhere. The premise is simple: most crypto coverage is English-first and
US-centric, so PTYcoin treats Spanish and English as equals and keeps a LatAm
lens woven through the reporting rather than bolted on. Every article ships in
both languages, paired so a reader can switch between them and a publisher can
trust the catalog is never half-translated.

## How it works

Content is the product, so the content model carries the weight. Each story is
two Markdown files — one English, one Spanish — joined by a shared
`translationKey`; CI rejects any post that isn't paired, which keeps the
bilingual promise honest. Articles fall into a fixed set of beats (news, markets,
policy, projects, guides) and run through a bespoke plain-CSS Hugo Extended theme
with light/dark theming, hreflang, and a language-preference redirect so visitors
land in their language. Search is client-side via Pagefind, indexed in both
languages at build time. GitHub Actions builds the site and runs the pairing and
front-matter checks on every PR; merging to `main` triggers an automatic deploy
to Cloudflare, so publishing is just merging.

**Stack:** Hugo Extended · plain-CSS bespoke theme · Pagefind · GitHub Actions · Cloudflare.
