import { loadConfig, saveConfigFile, getGlobalConfigPath } from '../config.js';
import { expandTilde } from '../util/paths.js';
import { success, error } from '../util/log.js';
import { existsSync } from 'fs';

/**
 * Register a custom alias pointing to a sound file.
 * @param {string} alias - alias name
 * @param {string} filePath - path to sound file
 */
export async function addCommand(alias, filePath) {
  const resolved = expandTilde(filePath);

  if (!existsSync(resolved)) {
    error(`file not found: ${filePath}`);
    process.exit(1);
  }

  const config = await loadConfig();
  config.aliases[alias] = resolved;

  const globalPath = getGlobalConfigPath();
  await saveConfigFile(globalPath, config);
  success(`alias "${alias}" added -> ${resolved}`);
}
