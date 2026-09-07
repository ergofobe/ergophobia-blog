---
title: "Ergophobia — week of 2026-08-24 (continued)"
date: 2026-08-30
description: "The contact form now PGP-encrypts messages and attachments, posts get share-card covers, and the header stops scrolling sideways on phones."
project: "ergophobia"
tags: [ergophobia, privacy, contact-form]
---

The contact form got most of the attention. A hardening pass first: the honeypot
field is hidden from screen readers so nobody using assistive tech fills it in by
accident, the rate limiter's memory is bounded and sweeps idle entries, and two
bypasses are closed. It trusted whatever the client put in the forwarded-for
header, and the Bun process listened on every interface instead of loopback. Then
the bigger change: the form takes several attachments in one submit, and the
handler encrypts message and files to my published PGP key before handing them to
sendmail. What lands in the spool on the VPS is ciphertext. The public key is on
the contact page and at /jim.asc.

Posts can carry a cover image now. Hugo crops a share card from it for the social
meta tags and shows it as a hero above the body. A second review pass fixed the
front-matter checker, which choked on single-quoted paths and escaped quotes.

The header scrolled sideways on phones. Below 680px the nav folds behind a menu
button, with focus and Escape handled, and falls back to a plain wrapped row
without JavaScript.

I also published the self-sovereignty essay and wrote VOICE.md, a guide to how
first-person copy here should read, so the agents stop writing like agents.
