# beep-beep

Plays user-configurable sounds when you push commits to GitHub (and optionally on local commit). v1 ships with local git hooks only.

## Install

```bash
npx beep-beep init
```

## CLI

```
beep-beep init                              interactive wizard
beep-beep set <event> <file-or-alias>       set sound for an event
beep-beep add <alias> <file>                register a custom alias
beep-beep remove <alias>                    remove an alias
beep-beep list                              list configured sounds
beep-beep test [event]                      play a sound
beep-beep hook install                      install git hooks
beep-beep hook uninstall                    remove git hooks
beep-beep hook status                       check hook installation
```

## Events

| Event | Hook | When it fires |
|-------|------|---------------|
| `commit` | `post-commit` | After a local commit |
| `push` | `post-push` | After a successful push |
| `success` | `pre-push` (exit 0) | After push succeeds |
| `fail` | `pre-push` (exit non-zero) | After push fails |

## Configuration

Global: `~/.beepbeep.json`  
Per-repo: `.beepbeeprc.json` (looked up from cwd upwards)

```json
{
  "sounds": {
    "commit":  "default",
    "push":    "~/sounds/tada.mp3",
    "success": "default",
    "fail":    "error"
  },
  "aliases": {
    "tada": "~/sounds/tada.mp3"
  },
  "volume": 0.8
}
```

## License

MIT
