---
title: "spanish-academy — week of 2026-07-13"
date: 2026-07-20
description: "Entry-point and assistant fixes, a routing bug that broke certificate links, and the whole dependency alert backlog cleared."
project: "spanish-academy"
tags: [spanish-academy, analytics]
---

Most of the week went into the site's conversational assistant and the paths
that feed it. I scoped its script so it only loads where it should, added a
language chooser to one of the course entry points at the generator level rather
than patching it page by page, and wired an ad-campaign opener into the default
flow so paid social traffic lands in the right conversation. The assistant also
picked up rolling course availability instead of fixed dates, and now routes
families asking about special needs to the enrollment form with proper guidance.

The second thread was plumbing. Certificate and API links were being answered by
the wrong layer and broke when opened directly in a browser, so I reordered
request handling to fix it. I also cleared the entire backlog of dependency
security alerts — 54 of them — by bringing the test toolchain up to date.

The rest was measurement and documentation: lead events now fire server-side
alongside contact CTA tracking, the review-analytics tooling got a rewrite, and
I wrote a runbook for the certificate email workflow.
