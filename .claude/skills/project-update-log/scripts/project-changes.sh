#!/usr/bin/env bash
# Usage: project-changes.sh <owner/repo> <since-YYYY-MM-DD>
# Prints repo visibility, commit first-lines since the date, and recent tags.
# Requires an authenticated `gh`.
set -euo pipefail

if [ "$#" -ne 2 ]; then
  echo "usage: project-changes.sh <owner/repo> <since-YYYY-MM-DD>" >&2
  exit 2
fi

repo="$1"
since="$2"

echo "## repo: $repo"

echo "## visibility"
gh repo view "$repo" --json isPrivate,visibility \
  --jq '.visibility + (if .isPrivate then "  (PRIVATE — redact detail)" else "  (public)" end)'

echo "## commits since ${since}"
commits=$(gh api --paginate "repos/${repo}/commits?since=${since}T00:00:00Z&per_page=100" \
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
