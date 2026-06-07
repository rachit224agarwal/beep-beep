import { homedir } from 'os';
import { resolve, sep } from 'path';
import { existsSync, accessSync, constants } from 'fs';
import { mkdir } from 'fs/promises';

/**
 * Expand a tilde path to the user's home directory.
 * @param {string} filePath
 * @returns {string}
 */
export function expandTilde(filePath) {
  if (!filePath || typeof filePath !== 'string') return filePath;
  if (filePath.startsWith('~/')) {
    return resolve(homedir(), filePath.slice(2));
  }
  if (filePath === '~') {
    return homedir();
  }
  return resolve(filePath);
}

/**
 * Find the closest .git directory by walking up from cwd.
 * @returns {string|null} absolute path to .git directory, or null
 */
export function findGitDir() {
  let current = process.cwd();
  const root = sep;

  while (true) {
    const candidate = resolve(current, '.git');
    if (existsSync(candidate)) {
      return candidate;
    }
    const parent = resolve(current, '..');
    if (parent === current || parent === root) break;
    current = parent;
  }

  return null;
}

/**
 * Find the repo root by walking up from cwd looking for .git.
 * @returns {string|null}
 */
export function findRepoRoot() {
  const gitDir = findGitDir();
  if (!gitDir) return null;
  return resolve(gitDir, '..');
}

/**
 * Locate a config file by walking up from cwd.
 * @param {string} filename
 * @returns {string|null}
 */
export function findConfigInParents(filename) {
  let current = process.cwd();
  const root = sep;

  while (true) {
    const candidate = resolve(current, filename);
    if (existsSync(candidate)) {
      return candidate;
    }
    const parent = resolve(current, '..');
    if (parent === current || parent === root) break;
    current = parent;
  }

  return null;
}

/**
 * Ensure a directory exists.
 * @param {string} dirPath
 */
export async function ensureDir(dirPath) {
  await mkdir(dirPath, { recursive: true });
}

/**
 * Check if a file exists and is readable.
 * @param {string} filePath
 * @returns {boolean}
 */
export function isReadable(filePath) {
  try {
    accessSync(filePath, constants.R_OK);
    return true;
  } catch {
    return false;
  }
}
