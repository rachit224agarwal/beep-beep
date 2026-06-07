import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { unlink } from 'fs/promises';
import { resolve } from 'path';
import { homedir } from 'os';
import { tmpdir } from 'os';

import {
  getDefaults,
  mergeConfigs,
  resolveSoundPath,
  isValidEvent,
  validEvents,
  loadConfigFile,
  saveConfigFile,
} from '../src/config.js';

describe('config', () => {
  describe('getDefaults', () => {
    it('should return default configuration', () => {
      const defaults = getDefaults();
      expect(defaults).toHaveProperty('sounds');
      expect(defaults).toHaveProperty('aliases');
      expect(defaults).toHaveProperty('volume');
      expect(defaults.sounds.commit).toBe('default');
      expect(defaults.sounds.push).toBe('default');
      expect(defaults.sounds.success).toBe('success');
      expect(defaults.sounds.fail).toBe('error');
      expect(defaults.volume).toBe(0.8);
    });
  });

  describe('mergeConfigs', () => {
    it('should merge defaults with overrides', () => {
      const defaults = getDefaults();
      const override = {
        sounds: { commit: '~/my-sound.wav' },
        volume: 0.5,
      };
      const merged = mergeConfigs(defaults, override);
      expect(merged.sounds.commit).toBe('~/my-sound.wav');
      expect(merged.sounds.push).toBe('default');
      expect(merged.volume).toBe(0.5);
    });

    it('should handle empty overrides', () => {
      const defaults = getDefaults();
      const merged = mergeConfigs(defaults, {});
      expect(merged.sounds.commit).toBe('default');
      expect(merged.volume).toBe(0.8);
    });

    it('should handle null sources', () => {
      const defaults = getDefaults();
      const merged = mergeConfigs(defaults, null, undefined);
      expect(merged.sounds.commit).toBe('default');
    });
  });

  describe('resolveSoundPath', () => {
    it('should resolve an alias to its file path', () => {
      const config = {
        aliases: { tada: '/path/to/tada.mp3' },
        sounds: {},
        volume: 0.8,
      };
      const result = resolveSoundPath('tada', config);
      expect(result).toBe(resolve('/path/to/tada.mp3'));
    });

    it('should expand tilde in unresolved paths', () => {
      const config = { aliases: {}, sounds: {}, volume: 0.8 };
      const result = resolveSoundPath('~/test.wav', config);
      expect(result).toBe(resolve(homedir(), 'test.wav'));
    });

    it('should return path as-is for non-alias absolute paths', () => {
      const config = { aliases: {}, sounds: {}, volume: 0.8 };
      const result = resolveSoundPath('/absolute/path.wav', config);
      expect(result).toBe(resolve('/absolute/path.wav'));
    });
  });

  describe('isValidEvent', () => {
    it('should accept valid events', () => {
      expect(isValidEvent('commit')).toBe(true);
      expect(isValidEvent('push')).toBe(true);
      expect(isValidEvent('success')).toBe(true);
      expect(isValidEvent('fail')).toBe(true);
    });

    it('should reject invalid events', () => {
      expect(isValidEvent('invalid')).toBe(false);
      expect(isValidEvent('')).toBe(false);
    });
  });

  describe('validEvents', () => {
    it('should return the list of valid events', () => {
      expect(validEvents()).toEqual(['commit', 'push', 'success', 'fail']);
    });
  });

  describe('loadConfigFile / saveConfigFile', () => {
    let tmpFile;

    beforeEach(() => {
      tmpFile = resolve(tmpdir(), `.beepbeep-test-${Date.now()}.json`);
    });

    afterEach(async () => {
      try {
        await unlink(tmpFile);
      } catch {
        // ignore
      }
    });

    it('should save and load a config file', async () => {
      const config = { sounds: { commit: 'test' }, aliases: {}, volume: 0.5 };
      await saveConfigFile(tmpFile, config);
      const loaded = await loadConfigFile(tmpFile);
      expect(loaded).toEqual(config);
    });

    it('should return null for missing file', async () => {
      const result = await loadConfigFile('/nonexistent/path.json');
      expect(result).toBeNull();
    });
  });
});
