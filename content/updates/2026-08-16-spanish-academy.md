---
title: "spanish-academy — week of 2026-08-10"
date: 2026-08-16
description: "Moved the assistant's judgement calls into lookups, fixed language and formatting leaks, and started recording decisions properly."
project: "spanish-academy"
tags: [spanish-academy, reliability]
---

The busiest week in a while, and most of it was about pulling judgement out of
the model and into data.

Age eligibility was the clearest case: the assistant had been reasoning its way
to whether a student qualified for a given course, and it was reasoning wrong.
It now looks the answer up. In the same vein, I took a batch of rulings from the
business side — how to handle private-lesson pricing, what the adult age
boundaries actually are, and a workshop date that had gone stale — and encoded
them rather than leaving them to interpretation.

The rest was leaks. Replies were coming back in the wrong language after certain
button presses and after errors. Link formatting was arriving mangled in some
clients. Error fallbacks were failing silently, so a broken turn looked
identical to a deliberate one; they now identify themselves. And a pricing
answer that was technically correct read as a refusal, so I reworked it to leave
the door open.

Housekeeping: CI now runs the full test suites and a site build on every pull
request, dependencies got patched, and I started an architecture decision log so
these calls stop living only in my head.
