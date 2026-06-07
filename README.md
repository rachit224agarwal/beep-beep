<p align="center">
  <img src="https://img.shields.io/npm/v/git-beep-beep" alt="npm version">
  <img src="https://img.shields.io/npm/l/git-beep-beep" alt="license">
  <img src="https://img.shields.io/badge/node-%3E%3D18-brightgreen" alt="node version">
  <img src="https://img.shields.io/github/last-commit/rachit224agarwal/git-beep-beep" alt="last commit">
</p>

# git-beep-beep

> *beep boop* — hear your commits. Sound effects for your Git workflow.

`git-beep-beep` (CLI: `beep-beep`) plays configurable sound effects when you commit and push to Git. No daemons, no background services — just plain shell hooks that fire and forget.

## Features

- Plays sounds on `git commit` and `git push`
- Works on macOS, Linux, and Windows
- Zero setup — `npx git-beep-beep init` in any repo
- Bring your own sounds or use the built-in defaults
- Per-repo configuration via `.beepbeeprc.json`
- Non-blocking hooks — a broken sound never fails your Git command

## Quick start

### Mac / Linux (Terminal)

```bash
# 1. One-time init
npx git-beep-beep init

# 2. Install git hooks in your project
cd my-project
npx git-beep-beep hook install

# 3. Test the sound
npx git-beep-beep test commit

# 4. Use git normally — sounds play automatically
git commit -m "hello"
git push
```

### Windows (PowerShell)

```powershell
# 1. One-time init
npx git-beep-beep init

# 2. Install git hooks in your project
cd my-project
npx git-beep-beep hook install

# 3. Test the sound
npx git-beep-beep test commit

# 4. Use git normally — sounds play automatically
git commit -m "hello"
git push
```

## Install

### One-time setup

```bash
npx git-beep-beep init
```

This creates `~/.beepbeep.json` with default sound mappings shared across all your repositories.

### Per-repo setup

```bash
cd my-project
beep-beep hook install
```

Hooks are plain POSIX shell scripts placed in `.git/hooks/`. They run `beep-beep fire <event>` in the background so your Git commands are never blocked.

## Commands

After global install (`npm install -g git-beep-beep`), use `beep-beep <command>`. Via `npx`, use `npx git-beep-beep <command>`.

| Command | Description |
|---|---|
| `init` | Interactive configuration wizard |
| `set <event> <file-or-alias>` | Assign a sound to an event |
| `add <alias> <file>` | Register a custom alias for a sound file |
| `remove <alias>` | Remove a custom alias |
| `list` | Show all configured sounds and aliases |
| `test [event]` | Play a sound without triggering a real Git event |
| `hook install` | Install hooks into `.git/hooks/` |
| `hook uninstall` | Remove hooks and restore backups |
| `hook status` | Check which hooks are installed |

## Events

| Event | Hook | When it fires |
|---|---|---|
| `commit` | `post-commit` | After a successful local commit |
| `push` | `post-push` | After a successful push |
| `success` | `pre-push` (exit 0) | Before push, when it's expected to succeed |
| `fail` | `pre-push` (exit non-zero) | Before push, when it's expected to fail |

## Configuration

### Global config

`~/.beepbeep.json` is shared across all your repositories.

### Per-repo override

Add a `.beepbeeprc.json` file in your repository root to override global settings.

**Merge order** (later wins): built-in defaults → `~/.beepbeep.json` → `.beepbeeprc.json`

```json
{
  "sounds": {
    "commit": "default",
    "push": "~/sounds/tada.mp3",
    "success": "success",
    "fail": "error"
  },
  "aliases": {
    "tada": "~/sounds/tada.mp3",
    "error": "~/sounds/fail-horn.wav"
  },
  "volume": 0.8
}
```

- **`sounds`** — Maps events to sound file paths or alias names
- **`aliases`** — Shortcuts for commonly used sound files
- **`volume`** — Float between `0` and `1`

## Built-in sounds

| File | Description |
|---|---|
| `default.wav` | Soft two-tone chime — used for commits and generic events |
| `success.wav` | Ascending two-tone notification — used for push success |
| `error.wav` | Descending wah-wah — used for push failures |

Each file is approximately 34 KB. You can override any event with your own sounds:

```bash
beep-beep set push ~/Music/custom-fanfare.mp3
beep-beep add victory ~/Music/ta-da.wav
beep-beep set success victory
```

## Audio backends

`git-beep-beep` auto-detects your platform and picks the best available player:

- **macOS** — `afplay` (supports volume control)
- **Linux** — Tries `paplay`, `aplay`, `mpg123`, `ffplay` in order
- **Windows** — PowerShell `MediaPlayer` COM object

If no audio backend is found, it logs a warning and exits cleanly — never throws.

## How it works

1. `beep-beep hook install` writes shell scripts to `.git/hooks/`
2. On `git commit` or `git push`, Git runs the hook
3. The hook spawns `beep-beep fire <event>` in the background
4. `beep-beep` looks up the configured sound, resolves aliases, and plays the file
5. Hook output goes to `.git/hooks/.beep-beep.log` — your terminal stays clean

## Development

```bash
git clone https://github.com/rachit224agarwal/git-beep-beep.git
cd git-beep-beep
npm install

npm test
npm run lint
npm run format:check

npm link  # for local testing
```

### Requirements

- Node.js >= 18
- npm

## Release

```bash
npm run release -- --release-as patch  # or minor / major
git push --follow-tags
npm publish --access public
```

## License

MIT
