---
title: "spanish-academy — week of 2026-09-14"
date: 2026-09-21
description: "Moved the inquiry form's upload service into the company's own cloud account and prepared a hostname for the assistant's sign-in."
project: "spanish-academy"
tags: [spanish-academy, infrastructure]
---

This was a quiet week, mostly spent moving infrastructure to where it belongs.

The inquiry form lets visitors attach a document, and the service that authorises those uploads had been running in a cloud project that belonged to another of my businesses. It now runs in the academy's own account, with its own storage. Before switching the live form over, I tested it end to end: the preflight check, a signed upload of a real file, the file landing in the new storage, and a disallowed file type being turned away. The old service stayed up until the cut-over was confirmed, so the form never broke for visitors.

Alongside that, I added a one-shot DNS step to point a new subdomain at the hosting for the assistant's sign-in. It touches only that record and nothing else.

I also wired in automated code review on every pull request and then removed it a day later. It added noise without catching anything new. Finally, I rewrote the operational docs so they describe roles and process instead of assuming a particular agent tool.
