---
title: "ergophobia — week of 2026-01-05"
date: 2026-01-10
description: "Stood up the blog from an empty repo: an Eleventy static site with theming, embeds, and an automated Pages deploy."
project: "ergophobia"
tags: [ergophobia, eleventy]
---

This was the week the blog came into existence. I started from an empty repository and built out a working static site on Eleventy, choosing it because it stays out of the way and lets me write in plain markdown without a heavy framework underneath.

Most of the effort went into the scaffolding you only build once. I wired up the Eleventy config with a set of custom filters, added Luxon for sane date formatting, and got post excerpts rendering cleanly. On the presentation side I added a dark-mode theme toggle, a proper 404 page, image captions, and a share button, then spent time on responsiveness so the layout holds up on a phone.

The other half was getting it to ship. I added a GitHub Actions workflow that builds with Eleventy and publishes to GitHub Pages on push, which meant sorting out absolute-versus-relative asset paths so links resolve correctly under a Pages subpath. I also dropped in video-platform detection so YouTube and Vimeo links embed on their own. By the end of the week it was a real, deployable site rather than a pile of files.
