---
title: "spanish-academy — week of 2026-08-17"
date: 2026-08-23
description: "Flipped the assistant into a mode where every conversation goes to a human."
project: "spanish-academy"
tags: [spanish-academy, reliability]
---

One change this week, but a significant one: the assistant can now be switched
into a mode where it hands every conversation straight to a live person instead
of answering.

This isn't a retreat from the automated path. It's the escape hatch I should
have built earlier. The last few weeks have been a steady run of the assistant
getting a detail wrong in front of a customer — a schedule, an age rule, a
price — and each time the only lever I had was to patch the specific case and
redeploy. Now there's a single switch that takes the machine out of the loop
entirely while I fix whatever broke, and it can be flipped without shipping
code.

It also gives us a way to run staffed hours deliberately: when someone is
available to answer, let them; when nobody is, fall back to the assistant. I'd
rather the fallback be a slower human reply than a fast confident wrong one.

Nothing tagged for release this window — the work went out continuously.
