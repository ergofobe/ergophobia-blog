# Weekly project-update-log — scheduler prompt

This is the prompt the weekly cron routine fires. It is a thin trigger; all the
procedure lives in the `project-update-log` skill.

---

Run the weekly project update log for the ergophobia blog.

Invoke the **project-update-log** skill and follow it end to end:

- Cover every project whose card `status` is `active` or `wip`.
- For each, summarize the changes since that project's last update post
  (past ~7 days if it has none). Skip any project with no substantive changes —
  do not write filler.
- Write the update posts, bump each changed project's card date, and run the full
  validation gate (`npm run check`, `npm test`, `hugo --gc`).
- Ship by opening a PR and auto-merging it (`gh pr merge --auto --squash`).
  Merging to `main` auto-deploys.

If nothing changed across all projects this week, write nothing, open no PR, and
report "no project updates this week." Otherwise report which projects got a post
and which you skipped, with one line each on why.
