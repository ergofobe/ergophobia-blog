---
title: "spanish-academy — week of 2026-06-15"
date: 2026-06-20
description: "The big one: an AI live-chat assistant that answers questions, captures leads, and books demo classes on its own."
project: "spanish-academy"
tags: [spanish-academy, ai]
---

The biggest engineering week of the project. The goal was an AI chat assistant
that does more than answer FAQs — one that can actually move a prospect toward
enrolling.

I built the assistant on a small AI brain that, in a single turn, can answer
from a curated knowledge base, check real class availability, book a demo class,
or hand off to a human advisor. It collects the visitor's name, email and phone
before booking, splits availability into clean date options, resolves relative
dates like "tomorrow" itself, and creates the booking and the lead record in the
school's CRM. It's deliberately brief and WhatsApp-friendly, replies in the
visitor's language (English, Spanish or Chinese), and keeps each conversation's
state isolated so nothing leaks between chats. It's verified, tested, and
gracefully handles the awkward cases — no availability on a given day, an advisor
who's offline, a contact detail that needs correcting.

Alongside the bot I finished bringing the remaining lead forms in-house — a
self-hosted placement-exam lead-and-certificate flow and a children's-program
signup wizard — and redesigned the notification emails to render reliably across
phones and mail clients.
