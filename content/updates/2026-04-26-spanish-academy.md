---
title: "spanish-academy — week of 2026-04-20"
date: 2026-04-26
description: "Big content-and-imagery overhaul: real school photos everywhere, a homepage redesign, and redesigned course tiles."
project: "spanish-academy"
tags: [spanish-academy, design]
---

The biggest week so far. The site had been running on placeholder copy and stock
photography, and this was the push to make it feel like the actual school.

I did a full content audit and replaced stock imagery with real photos of the
school — its classrooms, teachers and students. To keep that sane at scale I
built a small media pipeline: gather the source images, normalize and convert
them to web-friendly formats, and give each a content-addressed name so
duplicates collapse and nothing gets re-processed. That fed a proper image
library the whole site draws from. I also swapped invented testimonials for real
reviews and trimmed courses that are no longer offered.

On top of the new imagery I redesigned the homepage around a banner and an
integrated slideshow plus course-category cards, and gave every interior page a
hero image. The course tiles got a from-scratch redesign — a branded header
strip, equal-height cards, real per-course photos — reused across the homepage
and course listings. Underneath, the inquiry form gained more fields and the
project got a Docker build for consistent deploys.
