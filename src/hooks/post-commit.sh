#!/usr/bin/env sh
set -e
REPO_ROOT="$(git rev-parse --show-toplevel)"
(npx --no-install git-beep-beep fire commit >>"$REPO_ROOT/.git/hooks/.beep-beep.log" 2>&1 &) || true
exit 0
