import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('child_process', () => {
  const mockSpawn = vi.fn();
  return { spawn: mockSpawn };
});

vi.mock('fs', () => {
  return {
    existsSync: vi.fn(() => true),
    accessSync: vi.fn(() => true),
    constants: { R_OK: 4 },
  };
});

vi.mock('fs/promises', () => ({}));

vi.mock('../src/util/platform.js', () => {
  let currentOS = 'macos';
  return {
    detectOS: vi.fn(() => currentOS),
    detectBackend: vi.fn(() => ({
      binary: 'afplay',
      args: [],
      supportsVolume: true,
      volumeFlag: '--volume',
      formats: 'any',
    })),
    setOS: (val) => { currentOS = val; },
    isBinaryAvailable: vi.fn(() => true),
  };
});

import { spawn } from 'child_process';
import { play } from '../src/player.js';

describe('player', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should use afplay on macOS', async () => {
    spawn.mockReturnValue({
      on: (event, handler) => {
        if (event === 'exit') setTimeout(handler, 10);
      },
      kill: vi.fn(),
    });

    await play('/path/to/test.mp3', 0.5);

    expect(spawn).toHaveBeenCalled();
    const [binary, args] = spawn.mock.calls[0];
    expect(binary).toBe('afplay');
    expect(args).toContain('/path/to/test.mp3');
  });

  it('should never throw on missing file', async () => {
    const { existsSync } = await import('fs');
    existsSync.mockReturnValue(false);

    await expect(play('/nonexistent/file.mp3', 0.5)).resolves.toBeUndefined();
  });

  it('should handle missing backend gracefully', async () => {
    const { detectBackend } = await import('../src/util/platform.js');
    detectBackend.mockReturnValue(null);

    await expect(play('/some/file.mp3', 0.5)).resolves.toBeUndefined();
  });
});
