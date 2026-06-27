#!/usr/bin/env sh
# Absolute baseURL only for the real production deploy (main on Workers Builds);
# preview branches and local builds use host-relative "/".
set -eu
if [ "${WORKERS_CI:-}" = "1" ] && [ "${WORKERS_CI_BRANCH:-}" = "main" ]; then
  hugo --gc --minify
else
  hugo --gc --minify --baseURL "/"
fi
pagefind --site public
