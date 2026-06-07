import { loadConfig, saveConfigFile, getGlobalConfigPath } from '../config.js';
import { success, warn } from '../util/log.js';

/**
 * Remove a custom alias.
 * @param {string} alias - alias name to remove
 */
export async function removeCommand(alias) {
  const config = await loadConfig();

  if (!config.aliases[alias]) {
    warn(`alias "${alias}" not found`);
    return;
  }

  delete config.aliases[alias];

  const globalPath = getGlobalConfigPath();
  await saveConfigFile(globalPath, config);
  success(`alias "${alias}" removed`);
}
