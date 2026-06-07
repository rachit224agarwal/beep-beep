import { createInterface } from 'readline';
import { existsSync } from 'fs';
import { saveConfigFile, getGlobalConfigPath, validEvents, getDefaults } from '../config.js';
import { info, success, warn } from '../util/log.js';

/**
 * Run the interactive initialization wizard.
 */
export async function initCommand() {
  const configPath = getGlobalConfigPath();

  if (existsSync(configPath)) {
    warn(`config already exists at ${configPath}`);
    const answer = await ask('overwrite? (y/N): ');
    if (answer.toLowerCase() !== 'y') {
      info('init cancelled');
      return;
    }
  }

  const config = getDefaults();

  info('git-beep-beep init wizard');
  console.log();

  for (const event of validEvents()) {
    const answer = await ask(`sound path or alias for "${event}" (default: "${config.sounds[event]}"): `);
    if (answer.trim()) {
      config.sounds[event] = answer.trim();
    }
  }

  const volAnswer = await ask(`volume 0-1 (default: ${config.volume}): `);
  if (volAnswer.trim()) {
    const vol = parseFloat(volAnswer.trim());
    if (!isNaN(vol) && vol >= 0 && vol <= 1) {
      config.volume = vol;
    }
  }

  await saveConfigFile(configPath, config);
  success(`config saved to ${configPath}`);
}

/**
 * Prompt the user for input.
 * @param {string} question
 * @returns {Promise<string>}
 */
function ask(question) {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}
