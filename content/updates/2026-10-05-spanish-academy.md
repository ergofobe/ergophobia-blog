---
title: "spanish-academy — week of 2026-09-28"
date: 2026-10-05
description: "Put hard time limits on every slow step of an assistant reply, and capped upload sizes on the server."
project: "spanish-academy"
tags: [spanish-academy, reliability]
---

Most of this week went into one recurring complaint: the assistant would sometimes give up on a reply and fall back to its generic error message, and the logs couldn't say why.

Each reply has a fixed time budget, but several steps were running outside it. The model call used library defaults that allow far longer than the whole budget, and it retried quietly. So a single slow or rate-limited response could use up all the time and get logged as a plain timeout. That call now has its own deadline and doesn't retry, and the error names what actually went wrong. Reading the incoming request, setting up the client and the booking calls to the CRM all count against the same budget now. I also found a path where a reply containing only formatting got stripped to nothing and saved into the conversation. After that, every later turn in that conversation failed. Empty replies are now caught before they're stored.

On the upload side, the server now refuses to authorise a file that is over the size limit for its type. Before, it took the browser's word for it. I also pinned the test tooling for the edge workers to clear a security advisory without breaking their test setup.
