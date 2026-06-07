import { loadConfig, resolveSoundPath } from '../config.js';
import { info, dim, highlight } from '../util/log.js';

/**
 * List all configured sounds and aliases.
 */
export async function listCommand() {
  const config = await loadConfig();

  info('sound mappings:');
  for (const [event, sound] of Object.entries(config.sounds)) {
    const resolved = resolveSoundPath(sound, config);
    console.log(`  ${highlight(event)} -> ${sound} ${dim(`(${resolved})`)}`);
  }

  if (Object.keys(config.aliases).length > 0) {
    console.log();
    info('aliases:');
    for (const [alias, filePath] of Object.entries(config.aliases)) {
      console.log(`  ${highlight(alias)} -> ${filePath}`);
    }
  }

  console.log();
  info(`volume: ${config.volume}`);
}
