---
title: "spanish-academy — week of 2026-08-31"
date: 2026-09-07
description: "Every new lead now lands in the CRM with a follow-up status, and the reason the assistant was switched off is finally written down."
project: "spanish-academy"
tags: [spanish-academy, crm, reliability]
---

Three fixes, all landed Sunday night.

The one that matters most is on the lead side. Of the several paths that create
a lead in the CRM, the placement flow was the only one setting a follow-up
status. Everything else, the web forms and the assistant's handoff, was dropping
leads in with no status at all. That meant nobody could tell from the CRM what
had been contacted and what hadn't. Every path now stamps the same default
status, and the value lives in one place because the CRM rejects the whole
record on a typo, and I'd rather not lose a lead over one.

The second is a decision record. A couple of weeks ago the assistant got
switched into a mode where everything goes to a human. The reason never got
captured, and the log said so in plain words. I asked. The answer was a general
lack of confidence in its answers, built up over time, not a single bad
incident. That's worth writing down because it sets the bar for turning it back
on. Fixing one bug won't be enough.

The third was self-inflicted. A newer Hugo on my machine refused to run the CSS
step under its security policy, so the pre-merge build check quietly couldn't
run locally. It's allowed now, and the check says which Hugo version it means.
