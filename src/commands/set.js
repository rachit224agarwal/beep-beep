import { loadConfig, saveConfigFile, getGlobalConfigPath, isValidEvent } from '../config.js';
import { success, error } from '../util/log.js';

/**
 * Set a sound for an event.
 * @param {string} event - commit, push, success, or fail
 * @param {string} fileOrAlias - path to sound file or alias name
 */
export async function setCommand(event, fileOrAlias) {
  if (!isValidEvent(event)) {
    error(`invalid event "${event}". valid events: commit, push, success, fail`);
    process.exit(1);
  }

  const config = await loadConfig();
  config.sounds[event] = fileOrAlias;

  const globalPath = getGlobalConfigPath();
  await saveConfigFile(globalPath, config);
  success(`sound for "${event}" set to "${fileOrAlias}"`);
}
