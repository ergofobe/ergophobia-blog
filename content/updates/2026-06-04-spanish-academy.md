---
title: "spanish-academy — week of 2026-06-01"
date: 2026-06-04
description: "Consolidating the stack onto Zoho: booking and all the lead forms migrated to a single platform."
project: "spanish-academy"
tags: [spanish-academy, integrations]
---

This week was a platform consolidation. The site had accumulated a handful of
separate services for booking and forms, and the school wanted everything in one
place where their team already works — so I moved the lead-handling stack onto a
single CRM and booking suite.

I replaced the previous class-booking widget with the new platform's booking
flow, embedded so it opens in place rather than bouncing visitors off-site. Then
I migrated the inquiry, newsletter and translation forms over to the same CRM, so
every lead now lands in one system with consistent handling. I also started the
groundwork for a native placement exam by extracting the question bank out of an
old third-party form, so the school owns the content directly.

The rest was keeping the deploy healthy: pinning the site generator to a known
version after an upstream release broke the build, upgrading the deploy tooling
to clear several dependency security alerts, fixing the multilingual SEO tags,
and promoting the school's flagship "Spanish for Foreigners" track to a top-level
menu item so its biggest audience finds it immediately.
