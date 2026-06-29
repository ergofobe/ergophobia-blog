---
title: "spanish-academy — week of 2026-06-29"
date: 2026-06-29
description: "Sharpened the AI assistant to book up front instead of escalating, and unified the whole site into one atomic deploy."
project: "spanish-academy"
tags: [spanish-academy, ai]
---

Follow-through on last week's assistant launch, turning a capable bot into a
reliable one.

The biggest behavior change: the assistant now collects a visitor's contact
details up front and books the demo class itself, rather than escalating to a
human as soon as things got specific. It also learned the children's and teen
programs, so it can actually advise a parent instead of deflecting, and it now
persists a lead promptly and re-syncs cleanly when someone corrects a detail
mid-conversation. Those were the rough edges that showed up once real people
started using it.

On the infrastructure side I unified the marketing site, the lead handling and
the assistant into a single atomic deploy, so the whole surface ships together
as one unit instead of three pieces that could drift out of step. Fewer moving
parts, fewer ways for a release to land half-applied.
