#!/usr/bin/env bash
# From a machine with ssh Host huginn: pull origin/main on the VPS and build.
set -euo pipefail
ssh huginn /usr/local/sbin/ergophobia-deploy
