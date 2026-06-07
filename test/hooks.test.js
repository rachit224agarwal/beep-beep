import { describe, it, expect } from 'vitest';
import { readFile } from 'fs/promises';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe('hook templates', () => {
  it('post-commit.sh should contain beep-beep fire', async () => {
    const content = await readFile(
      resolve(__dirname, '..', 'src', 'hooks', 'post-commit.sh'),
      'utf-8',
    );
    expect(content).toContain('beep-beep fire commit');
    expect(content).toContain('#!/usr/bin/env sh');
  });

  it('post-push.sh should contain beep-beep fire', async () => {
    const content = await readFile(
      resolve(__dirname, '..', 'src', 'hooks', 'post-push.sh'),
      'utf-8',
    );
    expect(content).toContain('beep-beep fire push');
    expect(content).toContain('#!/usr/bin/env sh');
  });

  it('pre-push.sh should contain beep-beep fire with success/fail', async () => {
    const content = await readFile(
      resolve(__dirname, '..', 'src', 'hooks', 'pre-push.sh'),
      'utf-8',
    );
    expect(content).toContain('beep-beep fire');
    expect(content).toContain('success');
    expect(content).toContain('fail');
    expect(content).toContain('#!/usr/bin/env sh');
  });

  it('all hooks should have LF line endings', async () => {
    const hooks = ['post-commit.sh', 'post-push.sh', 'pre-push.sh'];
    for (const hook of hooks) {
      const content = await readFile(
        resolve(__dirname, '..', 'src', 'hooks', hook),
        'utf-8',
      );
      expect(content).not.toContain('\r\n');
    }
  });

  it('all hooks should exit 0', async () => {
    const hooks = ['post-commit.sh', 'post-push.sh', 'pre-push.sh'];
    for (const hook of hooks) {
      const content = await readFile(
        resolve(__dirname, '..', 'src', 'hooks', hook),
        'utf-8',
      );
      expect(content).toContain('exit 0');
    }
  });
});
