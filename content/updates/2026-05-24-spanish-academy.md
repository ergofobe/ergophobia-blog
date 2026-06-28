---
title: "spanish-academy — week of 2026-05-18"
date: 2026-05-24
description: "A performance sprint: faster image loading, responsive images everywhere, and deferred third-party scripts."
project: "spanish-academy"
tags: [spanish-academy, performance]
---

This week was a dedicated performance push, driven by real page-speed scores. A
marketing site lives or dies on first impression, and the homepage was loading
heavier than it needed to.

The biggest win was the homepage hero. I resized and lazy-loaded the slideshow
images so the page paints its main content faster instead of waiting on
oversized art. From there I routed images across the site — homepage and every
page hero — through a single responsive-image helper, so the browser downloads an
appropriately sized version for each device rather than one huge file for
everyone. I also deferred the third-party scripts (analytics, chat, tracking
pixels) so they stop blocking the initial render.

Alongside the speed work I cleared out a batch of build-time deprecation warnings
and removed some dead fallback code so the project builds clean. I also wired up
automated code review on pull requests, which has already started catching small
issues before they land. Faster pages, a quieter build, and a bit more
guardrail on every change.
