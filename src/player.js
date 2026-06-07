import { spawn } from 'child_process';
import { existsSync } from 'fs';
import { detectBackend, detectOS } from './util/platform.js';
import { expandTilde } from './util/paths.js';
import { warn } from './util/log.js';

let backend = null;
let volumeWarningLogged = false;

/**
 * Initialize the audio backend (called once at startup).
 */
export function initPlayer() {
  backend = detectBackend();
  if (!backend) {
    warn('no audio backend found on this system');
  }
}

/**
 * Play a sound file.
 * Never throws — logs and exits cleanly on failure.
 * @param {string} filePath - absolute or tilde path to audio file
 * @param {number} [volume=0.8] - volume 0-1
 * @returns {Promise<void>}
 */
export async function play(filePath, volume = 0.8) {
  const resolvedPath = expandTilde(filePath);

  if (!existsSync(resolvedPath)) {
    warn(`sound file not found: ${resolvedPath}`);
    trySystemBeep();
    return;
  }

  if (!backend) {
    initPlayer();
    if (!backend) {
      warn('no audio backend available');
      return;
    }
  }

  const clampedVolume = Math.max(0, Math.min(1, typeof volume === 'number' ? volume : 0.8));

  const os = detectOS();

  return new Promise((resolvePromise) => {
    let proc;

    try {
      if (os === 'macos') {
        const args = [...backend.args, resolvedPath];
        if (backend.supportsVolume) {
          args.unshift(backend.volumeFlag, String(clampedVolume * 100));
        }
        proc = spawn(backend.binary, args, { stdio: 'ignore', detached: true });
      } else if (os === 'linux') {
        const args = [...backend.args, resolvedPath];
        if (backend.supportsVolume && !volumeWarningLogged) {
          if (!backend.volumeFlag) {
            warn('volume control not supported by this Linux backend');
            volumeWarningLogged = true;
          } else {
            args.unshift(backend.volumeFlag, String(Math.round(clampedVolume * 100)));
          }
        }
        proc = spawn(backend.binary, args, { stdio: 'ignore', detached: true });
      } else if (os === 'windows') {
        const psScript = `
$player = New-Object Media.SoundPlayer([IO.File]::ReadAllBytes('${resolvedPath.replace(/'/g, "''")}'));
$player.PlaySync();
`;
        proc = spawn('powershell', ['-NoProfile', '-NonInteractive', '-Command', psScript], {
          stdio: 'ignore',
          detached: true,
        });
      } else {
        warn(`unsupported platform: ${os}`);
        trySystemBeep();
        resolvePromise();
        return;
      }
    } catch (err) {
      warn(`could not start audio player: ${err.message}`);
      trySystemBeep();
      resolvePromise();
      return;
    }

    if (!proc) {
      trySystemBeep();
      resolvePromise();
      return;
    }

    const timeout = setTimeout(() => {
      try {
        proc.kill();
      } catch {
        // ignore
      }
      resolvePromise();
    }, 5000);

    proc.on('error', (err) => {
      clearTimeout(timeout);
      warn(`audio player error: ${err.message}`);
      trySystemBeep();
      resolvePromise();
    });

    proc.on('exit', () => {
      clearTimeout(timeout);
      resolvePromise();
    });
  });
}

/**
 * Fall back to the system beep.
 */
function trySystemBeep() {
  try {
    process.stdout.write('\x07');
  } catch {
    // ignore
  }
}
