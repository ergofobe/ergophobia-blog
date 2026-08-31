---
title: "Ergophobia — week of 2026-08-24"
date: 2026-08-30
description: "PGP-encrypted contact mail with multiple attachments, a hamburger nav for phones, cover images for share cards, and a written-down voice guide."
project: "ergophobia"
tags: [ergophobia, contact-form, frontend]
---

The last post ended with the site freshly moved onto the VPS. This is the follow-through, all from the back half of that same week.

The contact form got most of the attention. Messages are now PGP-encrypted before they reach the mailer, so what sits in the spool and the inbox on the server side is ciphertext rather than someone's plaintext message and phone number. The form also accepts multiple attachments now. A review pass closed two gaps from the move: the honeypot field was confusing to screen readers, and the rate limiter could be worked around in ways it shouldn't have allowed.

The front end got two fixes. On phones the nav links were crowding the header, so they now collapse behind a hamburger menu. Posts carry cover images, which means sharing a link produces a real social card instead of a bare title; that one took a second review pass before I was happy with it.

On the writing side, I wrote VOICE.md, a description of how prose on this site should sound, so agents drafting copy have something concrete to check against. It got a first workout on a new essay arguing that self-sovereignty is a dial, not a switch, including a pass to strip out the usual AI tells.
