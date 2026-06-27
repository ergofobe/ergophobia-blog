---
title: "ollie"
date: 2026-06-13
summary: "Self-hosted, AI-enabled freight TMS in Rust — loads, trips, drivers, and an MCP server built for agents."
status: "active"
repo: "https://github.com/olliefms/ollie"
demo: ""
tags: [rust, mcp, logistics]
---

## Overview

Ollie is a self-hosted freight **Transportation Management System** — the
operational core of a trucking dispatch desk: loads, trips, drivers, trucks,
trailers and facilities, in a single Rust service you run yourself.

The thing that makes it different is that it's **MCP-first**. Most software bolts
an AI assistant on at the end; Ollie was built so an agent can run the back
office through a [Model Context Protocol](https://modelcontextprotocol.io/)
server as a first-class surface, with the same auth and the same data the humans
use. Dispatch a load, answer a question over the fleet, ask a question about a
scanned document — all of it is callable by a tool-using agent.

## How it works

**Three API surfaces, one domain.** Pick the caller:

- **Fleet MCP** (`/fleet/mcp`) — for AI agents and tool-using assistants. The
  preferred surface.
- **Fleet REST** (`/fleet/api/v1`) — for the Fleet web app and programmatic
  integrations.
- **Driver portal** (`/driver/api/v1`) — for the driver mobile PWA only, with
  passkey or PIN auth.

**The domain.** Loads move through a lifecycle (`planned → assigned → dispatched
→ in_transit → delivered → invoiced → settled`) with stops, rate line items and
detention tracking. Trips are the driver-facing execution of those loads — stop
arrive/depart, check-calls, relay chaining, and deadhead/loaded mileage via
OpenRouteService HGV routing. Facilities are geocoded and de-duplicated. An
append-only event journal records what happened, and a set of *doctors*
diagnose-and-repair data integrity when something drifts.

**Documents that answer questions.** Rate cons, BOLs, PODs and photos are stored
content-addressed and deduplicated on disk, then processed in the background by
Ollama: text summaries and vector embeddings for semantic search, with images
and scanned PDFs routed through a vision model. Vector search runs on LanceDB, so
you can ask natural-language questions over a document.

**Stack:** Rust · Axum · LanceDB · Ollama · rmcp (MCP) · AGPL-3.0.

The running log below is the week-by-week build history.
