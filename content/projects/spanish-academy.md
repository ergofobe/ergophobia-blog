---
title: "spanish-academy"
date: 2026-06-20
summary: "A bilingual marketing site for a Panama City Spanish school — courses, online booking, lead capture, and an AI chat assistant."
status: "active"
repo: "https://github.com/spanishacademylive/spanishacademylive-web"
repo_private: true
demo: "https://spanishacademylive.com"
tags: [hugo, i18n, marketing]
---

## Overview

Spanish Academy Live is the marketing website for a Spanish-language school in
Panama City. It's a bilingual (English/Spanish, with a Simplified Chinese
edition) site that has to do real work: explain the courses, build trust with
foreign professionals and parents, and turn visitors into enrolled students.

What started as a static brochure has grown into a living lead-generation
surface — placement testing, online class booking, multilingual inquiry forms,
and an AI chat assistant — all built on a fast, statically generated site.

## How it works

**Content model.** Every page exists per language, driven by a shared set of
translation strings so copy is never hard-coded. Courses, about, contact,
translation services, webinars and pricing are all content-driven page types,
with a brand system (Montserrat, deep brick red, warm photography) applied
consistently across them.

**Capture and convert.** Inquiry, newsletter and translation forms feed a CRM;
a native CEFR placement quiz scores visitors and captures leads; class booking
runs through an embedded scheduler; and a live-chat assistant answers questions
and books demos.

**Delivery.** The site builds statically and deploys on Cloudflare, with the
site, lead handling and chat bot rolled into one deploy.

**Stack:** Hugo · Tailwind CSS · multilingual i18n · Cloudflare · Zoho.

The running log below is the week-by-week build history.
