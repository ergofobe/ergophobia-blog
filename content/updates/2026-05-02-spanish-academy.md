---
title: "spanish-academy — week of 2026-04-27"
date: 2026-05-02
description: "Forms wired up for real, a move to Cloudflare hosting, analytics, and a third language: Simplified Chinese."
project: "spanish-academy"
tags: [spanish-academy, i18n]
---

This week was about turning the site from a brochure into something that
captures and tracks leads — and reaching a new audience.

I wired the inquiry forms into a real CRM-backed flow, including file uploads and
language-matched auto-reply emails, plus country and city fields so the school
knows where prospects are coming from. To support that I moved hosting onto
Cloudflare and added build-version tracking so I can tell exactly which release
is live. Analytics went in too — site analytics and a marketing tracking pixel —
so the school can finally see what's working.

The headline change was adding Simplified Chinese as a full third language
alongside English and Spanish. Panama City has a sizeable Chinese community, and
the school wanted to reach it; because copy was already driven by translation
strings, standing up a third locale was mostly translation work rather than
rebuilding pages.

I also did a discoverability pass for the AI era — structured data, a robots
file, and a plain-language description of the site for language models — plus the
usual SEO fixes and privacy and terms pages.
