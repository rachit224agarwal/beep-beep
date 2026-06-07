import { loadConfig, resolveSoundPath, isValidEvent } from '../config.js';
import { play, initPlayer } from '../player.js';

/**
 * Fire a sound for a given event. Used internally by git hooks.
 * This is intentionally silent — no logging to stdout.
 * @param {string} event - event name (commit, push, success, fail)
 */
export async function fireCommand(event) {
  if (!isValidEvent(event)) {
    return;
  }

  initPlayer();

  const config = await loadConfig();
  const soundValue = config.sounds[event] || 'default';
  const path = resolveSoundPath(soundValue, config);

  await play(path, config.volume);
}
