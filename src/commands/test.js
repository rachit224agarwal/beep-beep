import { loadConfig, resolveSoundPath, isValidEvent, validEvents } from '../config.js';
import { play, initPlayer } from '../player.js';
import { info, error } from '../util/log.js';

/**
 * Play a sound for a given event (or "default") without firing a real git event.
 * @param {string} [event] - event name (commit, push, success, fail)
 */
export async function testCommand(event) {
  initPlayer();

  const config = await loadConfig();

  if (!event) {
    // Play the "default" alias sound
    const path = resolveSoundPath('default', config);
    info(`playing default sound: ${path}`);
    await play(path, config.volume);
    return;
  }

  if (!isValidEvent(event)) {
    error(`invalid event "${event}". valid events: ${validEvents().join(', ')}`);
    process.exit(1);
  }

  const soundValue = config.sounds[event] || 'default';
  const path = resolveSoundPath(soundValue, config);
  info(`playing sound for "${event}": ${path}`);
  await play(path, config.volume);
}
