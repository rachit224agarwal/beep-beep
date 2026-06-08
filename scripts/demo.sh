#!/usr/bin/env bash
set -e

PROJECT_DIR="/Users/rachitagarwal/Desktop/Beep-Beep/beep-beep"
BEEP_CMD="node $PROJECT_DIR/bin/beep-beep.js"

DEMO_DIR=$(mktemp -d)
cd "$DEMO_DIR"
git init -q

echo ""
echo "  git-beep-beep — hear your commits"
echo "  =================================="
echo ""

sleep 0.3

echo "$ npx git-beep-beep hook install"
$BEEP_CMD hook install 2>&1 || true
echo ""
sleep 0.5

echo "$ npx git-beep-beep test commit"
$BEEP_CMD test commit 2>&1 || true
echo ""
sleep 1

echo "$ git commit --allow-empty -m \"feat: initial commit\""
git commit --allow-empty -m "feat: initial commit" 2>&1
echo ""
sleep 0.5

echo "$ git push origin main"
echo "  ✓ pushed successfully"
echo ""
sleep 0.3

echo ""
echo "  You're all set. Happy coding!"
echo ""

rm -rf "$DEMO_DIR"
