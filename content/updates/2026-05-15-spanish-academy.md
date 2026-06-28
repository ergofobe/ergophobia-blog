---
title: "spanish-academy — week of 2026-05-11"
date: 2026-05-15
description: "Pricing-card polish and a couple of correctness fixes — refining last week's pricing and booking work."
project: "spanish-academy"
tags: [spanish-academy, frontend]
---

A smaller, tidy-up week refining the pricing and booking work from the previous
sprint.

Most of it was on the pricing cards. I cleaned up the plan copy, added a flexible
pack option, and moved the "recommended" badge to the right plan so the
highlighted choice reads clearly. The card grid got attention too — wrapping at
three per row with the final row centered so an odd number of plans still looks
intentional rather than lopsided across screen sizes.

The notable fix was on the inquiry form's file upload: a cached upload URL wasn't
being reset after a successful submission, which could let it leak into a later
retry. Resetting it on success closed that off. The rest of the week was the
usual batch of small correctness and copy fixes — the unglamorous maintenance
that keeps a live, lead-capturing site trustworthy.
