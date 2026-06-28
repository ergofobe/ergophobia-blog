#!/usr/bin/env bash
# Usage: project-changes.sh <owner/repo> <since-YYYY-MM-DD> [author]
# Prints repo visibility, commit first-lines since the date, and recent tags.
# Commits are filtered to [author] — the work YOU did, not every contributor or
# bot — defaulting to the authenticated `gh` user's login. Pass "*" (or "") to
# include all authors. Requires an authenticated `gh`.
set -euo pipefail

if [ "$#" -lt 2 ] || [ "$#" -gt 3 ]; then
  echo "usage: project-changes.sh <owner/repo> <since-YYYY-MM-DD> [author]" >&2
  exit 2
fi

repo="$1"
since="$2"
author="${3-__DEFAULT__}"
if [ "$author" = "__DEFAULT__" ]; then
  author="$(gh api user --jq .login)"
fi

author_q=""
author_label="all authors"
if [ -n "$author" ] && [ "$author" != "*" ]; then
  author_q="&author=${author}"
  author_label="author=${author}"
fi

echo "## repo: $repo"

echo "## visibility"
gh repo view "$repo" --json isPrivate,visibility \
  --jq '.visibility + (if .isPrivate then "  (PRIVATE — redact detail)" else "  (public)" end)'

echo "## commits since ${since} (${author_label})"
commits=$(gh api --paginate "repos/${repo}/commits?since=${since}T00:00:00Z&per_page=100${author_q}" \
  --jq '.[] | .commit.committer.date[0:10] + "  " + (.commit.message | split("\n")[0])')
if [ -n "$commits" ]; then
  printf '%s\n' "$commits"
  printf '## commit count: %s\n' "$(printf '%s\n' "$commits" | wc -l | tr -d ' ')"
else
  echo "(none — skip this project)"
  echo "## commit count: 0"
fi

echo "## recent tags"
gh api "repos/${repo}/tags" --jq '.[].name' | head -40

echo "## end"
