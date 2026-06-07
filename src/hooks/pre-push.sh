#!/usr/bin/env sh
set -e
REPO_ROOT="$(git rev-parse --show-toplevel)"
if [ $? -eq 0 ]; then
  EVENT="success"
else
  EVENT="fail"
fi
(npx --no-install git-beep-beep fire "$EVENT" >>"$REPO_ROOT/.git/hooks/.beep-beep.log" 2>&1 &) || true
exit 0
