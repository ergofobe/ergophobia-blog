---
title: "ergophobia — week of 2026-07-13"
date: 2026-07-13
description: "Hardened the agent workflow with a git sync guardrail and kept the weekly project logs flowing."
project: "ergophobia"
tags: [ergophobia, workflow]
---

Most of the week went into tightening how agent sessions interact with git. I added a "sync with origin — before and after every task" rule to both CLAUDE.md and AGENTS.md, so every session starts from an up-to-date local main instead of drifting off a stale checkout. The gist: fetch first, refuse to switch branches on a dirty tree, and only fast-forward main when it's clean. The failure it guards against is subtle — a checkout from a dirty branch can quietly drag uncommitted edits onto main — so it felt worth writing down as an explicit guardrail rather than trusting habit.

The rule lives in two places on purpose: CLAUDE.md carries the session-level directive, and AGENTS.md gets both the full section and a pointer in its rules list, so whichever file an agent reads first, the expectation is the same.

Alongside that, the weekly project logs kept publishing on schedule. Nothing dramatic there, just the routine doing its job and the living project pages staying current week over week.
