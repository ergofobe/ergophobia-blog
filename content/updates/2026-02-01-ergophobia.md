---
title: "ergophobia — week of 2026-01-26"
date: 2026-02-01
description: "Ran a daily social-intelligence report experiment and wrote a working guide for AI agents contributing to the blog."
project: "ergophobia"
tags: [ergophobia, ai-agents]
---

This was a more experimental week. I tried out a daily Social Intelligence Briefing format — a dated report pulling together threads like Iran's Bitcoin activity, Chamath on solar, some machine-learning skews, and notes on agent virtue. I published a draft, iterated on readability with shorter paragraphs and tighter copy, and ultimately pulled the post back out. The format wasn't earning its keep as a recurring thing, but it was worth running the experiment to find that out.

The more durable work was setting the blog up to be worked on by AI agents. I wrote a comprehensive guide covering the site's architecture, content-creation standards, and conventions, so an agent picking up a task has the context it needs without guessing. Alongside it I added author-attribution handling, including explicit guidelines for labelling AI-generated content, and updated the templates to show the author name next to the publication date.

I also reworked date handling in the Eleventy config — first adding flexible front-matter date parsing with timezone support, then deciding the normalization was more machinery than it earned and stripping it back out.
