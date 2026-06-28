---
title: "ergophobia — week of 2026-06-22"
date: 2026-06-27
description: "Rebuilt the blog from scratch as a bespoke Hugo terminal theme on Cloudflare Workers, with search, projects, and the update-log machinery itself."
project: "ergophobia"
tags: [ergophobia, hugo, cloudflare]
---

This is the first entry in the blog's own work log — fitting, since this week was
the blog itself.

I tore out the old Eleventy/Docker/Pages stack and rebuilt the whole site as a
bespoke Hugo "terminal" theme: a monospaced shell with design tokens, self-hosted
fonts, a light/dark toggle, and a whoami hero on the home page. The three existing
posts moved over to Hugo's list and single templates, and I added a projects
content type — the living project pages that this very update feeds into.

On top of the content layer: Pagefind search, an RSS feed, a 404 page and
robots.txt, a video shortcode, an about page, and favicon/OG assets. Deployment
moved to Cloudflare Workers through a cf-build pipeline and wrangler config, with a
CI workflow and a small content checker guarding front matter. A param-gated Web
Analytics beacon rounds it out.

I also wired up the machinery behind this post: the project-update-log skill and
its weekly scheduler, plus a home page that now leads with a recent-updates feed
beside the projects.
