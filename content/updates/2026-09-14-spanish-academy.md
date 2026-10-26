---
title: "spanish-academy — week of 2026-09-07"
date: 2026-09-14
description: "Rebuilt a seasonal course page that was wrong on nearly every detail, gave it a real sign-up path, and wrote down why its welcome email never sent."
project: "spanish-academy"
tags: [spanish-academy, content, crm]
---

This week started as a simple request to update one course page from the latest program sheet. It turned out the page was wrong on almost every point: the hours, the months, the price and the language of instruction. It also had a hand-written "enrolment open" badge naming the wrong month, left over from months ago. On top of that there was no way to sign up. Inquiries went through the generic course form, so the CRM couldn't tell they were about this course.

I corrected the content in every language. The page now has its own enrolment form, and those leads are tagged as coming from this course, which means we can finally see whether it brings anyone in.

Then the end-to-end test after merging failed silently. The CRM rule that sends a welcome email never fired, and nothing showed an error. The cause was punctuation. The rule's condition matched the picklist's display label, which uses an em dash, but lead records store the underlying value, which uses a plain hyphen. So the comparison could never be true. I wrote up the trap and the check that would have caught it, so the next rule doesn't fail the same way.
