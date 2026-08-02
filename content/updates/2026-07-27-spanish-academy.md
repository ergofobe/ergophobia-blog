---
title: "spanish-academy — week of 2026-07-20"
date: 2026-07-27
description: "Reply language moves out of the prompt and into code, stale conversation history gets dropped, and transcripts feed a knowledge pass."
project: "spanish-academy"
tags: [spanish-academy, assistant]
---

A short week, all of it on the conversational assistant.

The biggest fix was language handling. The assistant had been deciding what
language to answer in largely by inference inside the prompt, which drifted when
a customer switched mid-thread. I moved detection into code and run it on every
turn, so the reply follows the customer's most recent message rather than the
tone the conversation opened with.

Related: conversations re-opened after a long gap were dragging old history back
in, so someone asking about one course could get answers coloured by a different
course they'd asked about days earlier. A conversation now forgets its prior
history once it's been idle past a day.

I also spent time reading real transcripts and turning the gaps into a knowledge
update, and added a background pass that re-reads conversations with a stronger
model and flags the ones where the assistant answered badly. That gives me a
queue to work from instead of relying on spot checks.
