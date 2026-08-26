#!/usr/bin/env bash
# Run on huginn from a checkout already at origin/main.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

npm ci
(cd "$ROOT/contact" && bun install --frozen-lockfile)
hugo --gc --minify
./node_modules/.bin/pagefind --site public

install -d /var/www/ergophobia
rsync -a --delete public/ /var/www/ergophobia/
systemctl restart ergophobia-contact
echo "deployed $(git rev-parse --short HEAD) to /var/www/ergophobia"
