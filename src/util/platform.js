import { platform } from 'os';
import { execSync } from 'child_process';

/**
 * @typedef {'macos' | 'linux' | 'windows' | 'unknown'} OSType
 */

/**
 * Detect the current operating system.
 * @returns {OSType}
 */
export function detectOS() {
  const p = platform();
  if (p === 'darwin') return 'macos';
  if (p === 'linux') return 'linux';
  if (p === 'win32') return 'windows';
  return 'unknown';
}

/**
 * @typedef {Object} AudioBackend
 * @property {string} binary - The command to run
 * @property {string[]} args - Arguments passed before the file path
 * @property {boolean} supportsVolume - Whether this backend supports volume control
 * @property {string} volumeFlag - The flag to pass volume value
 * @property {'wav' | 'mp3' | 'any'} formats - Supported file formats
 */

/**
 * Detect available audio backends for the current platform.
 * @returns {AudioBackend|null} the chosen backend, or null if none found
 */
let cachedBackend = null;

export function detectBackend() {
  if (cachedBackend) return cachedBackend;

  const os = detectOS();

  if (os === 'macos') {
    cachedBackend = {
      binary: 'afplay',
      args: [],
      supportsVolume: true,
      volumeFlag: '--volume',
      formats: 'any',
    };
    return cachedBackend;
  }

  if (os === 'linux') {
    const candidates = [
      { binary: 'paplay', args: [], supportsVolume: false, volumeFlag: null, formats: 'wav' },
      { binary: 'aplay', args: [], supportsVolume: false, volumeFlag: null, formats: 'wav' },
      { binary: 'mpg123', args: [], supportsVolume: true, volumeFlag: '--scale', formats: 'mp3' },
      { binary: 'ffplay', args: ['-nodisp', '-autoexit'], supportsVolume: false, volumeFlag: null, formats: 'any' },
    ];

    for (const backend of candidates) {
      try {
        execSync(`which ${backend.binary} 2>/dev/null`, { stdio: 'ignore' });
        cachedBackend = backend;
        return cachedBackend;
      } catch {
        continue;
      }
    }

    cachedBackend = null;
    return null;
  }

  if (os === 'windows') {
    cachedBackend = {
      binary: 'powershell',
      args: [],
      supportsVolume: false,
      volumeFlag: null,
      formats: 'any',
    };
    return cachedBackend;
  }

  cachedBackend = null;
  return null;
}

/**
 * Check if a given binary is available on PATH.
 * @param {string} binary
 * @returns {boolean}
 */
export function isBinaryAvailable(binary) {
  try {
    execSync(`which ${binary} 2>/dev/null || where ${binary} 2>nul`, { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}
