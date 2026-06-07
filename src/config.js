import { readFile, writeFile } from 'fs/promises';
import { homedir } from 'os';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { expandTilde, findConfigInParents } from './util/paths.js';
import { warn } from './util/log.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * @typedef {Object} BeepBeepConfig
 * @property {Object<string, string>} sounds - Event-to-file/alias mappings
 * @property {Object<string, string>} aliases - Custom alias definitions
 * @property {number} volume - Volume level 0-1
 */

/**
 * Built-in default configuration.
 * @returns {BeepBeepConfig}
 */
export function getDefaults() {
  return {
    sounds: {
      commit: 'default',
      push: 'default',
      success: 'success',
      fail: 'error',
    },
    aliases: {
      default: resolvePackageSound('default.wav'),
      success: resolvePackageSound('success.wav'),
      error: resolvePackageSound('error.wav'),
    },
    volume: 0.8,
  };
}

/**
 * Resolve a bundled sound file path.
 * @param {string} filename
 * @returns {string}
 */
function resolvePackageSound(filename) {
  return resolve(__dirname, '..', 'sounds', filename);
}

/**
 * Get the global config path.
 * @returns {string}
 */
export function getGlobalConfigPath() {
  return resolve(homedir(), '.beepbeep.json');
}

/**
 * Get the per-repo config path.
 * @returns {string|null}
 */
export function getRepoConfigPath() {
  return findConfigInParents('.beepbeeprc.json');
}

/**
 * Load configuration from a file path.
 * @param {string} configPath
 * @returns {Promise<BeepBeepConfig|null>}
 */
export async function loadConfigFile(configPath) {
  if (!configPath) return null;
  try {
    const data = await readFile(configPath, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    if (err.code === 'ENOENT') return null;
    warn(`could not parse config at ${configPath}`);
    return null;
  }
}

/**
 * Save configuration to a file path.
 * @param {string} configPath
 * @param {BeepBeepConfig} config
 */
export async function saveConfigFile(configPath, config) {
  await writeFile(configPath, JSON.stringify(config, null, 2) + '\n', 'utf-8');
}

/**
 * Load merged configuration: defaults → global → per-repo.
 * @returns {Promise<BeepBeepConfig>}
 */
export async function loadConfig() {
  const defaults = getDefaults();

  const globalPath = getGlobalConfigPath();
  const globalConfig = await loadConfigFile(globalPath);

  const repoPath = getRepoConfigPath();
  const repoConfig = await loadConfigFile(repoPath);

  const merged = mergeConfigs(defaults, globalConfig || {}, repoConfig || {});
  merged.volume = clampVolume(merged.volume);
  return merged;
}

/**
 * Deep-merge config objects. Later sources override earlier ones.
 * @param {...BeepBeepConfig} sources
 * @returns {BeepBeepConfig}
 */
export function mergeConfigs(...sources) {
  const result = {
    sounds: {},
    aliases: {},
    volume: 0.8,
  };

  for (const source of sources) {
    if (!source) continue;
    if (source.sounds) {
      Object.assign(result.sounds, source.sounds);
    }
    if (source.aliases) {
      Object.assign(result.aliases, source.aliases);
    }
    if (source.volume !== undefined) {
      result.volume = source.volume;
    }
  }

  return result;
}

/**
 * Resolve a sound value to an absolute file path.
 * Looks up aliases first, then tries as a raw path.
 * @param {string} value - alias name or file path
 * @param {BeepBeepConfig} config
 * @returns {string}
 */
export function resolveSoundPath(value, config) {
  if (config.aliases && config.aliases[value]) {
    return expandTilde(config.aliases[value]);
  }
  return expandTilde(value);
}

/**
 * Clamp volume to [0, 1].
 * @param {number} vol
 * @returns {number}
 */
function clampVolume(vol) {
  return Math.max(0, Math.min(1, typeof vol === 'number' ? vol : 0.8));
}

/**
 * Validate that an event name is recognized.
 * @param {string} event
 * @returns {boolean}
 */
export function isValidEvent(event) {
  return ['commit', 'push', 'success', 'fail'].includes(event);
}

/**
 * List of valid events.
 * @returns {string[]}
 */
export function validEvents() {
  return ['commit', 'push', 'success', 'fail'];
}
