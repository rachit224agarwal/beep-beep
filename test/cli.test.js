import { describe, it, expect } from 'vitest';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const CLI = resolve(__dirname, '..', 'bin', 'beep-beep.js');

function runCLI(args = []) {
  try {
    const stdout = execSync(`node ${CLI} ${args.join(' ')}`, {
      encoding: 'utf-8',
      env: { ...process.env, NO_COLOR: '1' },
    });
    return { stdout, stderr: '', exitCode: 0 };
  } catch (err) {
    return {
      stdout: err.stdout?.toString() || '',
      stderr: err.stderr?.toString() || '',
      exitCode: err.status,
    };
  }
}

describe('CLI', () => {
  it('should print version with --version', () => {
    const { stdout, exitCode } = runCLI(['--version']);
    expect(exitCode).toBe(0);
    expect(stdout.trim()).toMatch(/^\d+\.\d+\.\d+/);
  });

  it('should print help with --help', () => {
    const { stdout, exitCode } = runCLI(['--help']);
    expect(exitCode).toBe(0);
    expect(stdout).toContain('beep-beep');
  });

  it('should print help for init subcommand', () => {
    const { stdout, exitCode } = runCLI(['init', '--help']);
    expect(exitCode).toBe(0);
    expect(stdout).toContain('init');
  });

  it('should print help for set subcommand', () => {
    const { stdout, exitCode } = runCLI(['set', '--help']);
    expect(exitCode).toBe(0);
    expect(stdout).toContain('set');
  });

  it('should print help for add subcommand', () => {
    const { stdout, exitCode } = runCLI(['add', '--help']);
    expect(exitCode).toBe(0);
    expect(stdout).toContain('add');
  });

  it('should print help for remove subcommand', () => {
    const { stdout, exitCode } = runCLI(['remove', '--help']);
    expect(exitCode).toBe(0);
    expect(stdout).toContain('remove');
  });

  it('should print help for list subcommand', () => {
    const { stdout, exitCode } = runCLI(['list', '--help']);
    expect(exitCode).toBe(0);
    expect(stdout).toContain('list');
  });

  it('should print help for test subcommand', () => {
    const { stdout, exitCode } = runCLI(['test', '--help']);
    expect(exitCode).toBe(0);
    expect(stdout).toContain('test');
  });

  it('should print help for hook subcommand', () => {
    const { stdout, exitCode } = runCLI(['hook', '--help']);
    expect(exitCode).toBe(0);
    expect(stdout).toContain('hook');
  });

  it('should exit non-zero for invalid event in set', () => {
    const { stderr, exitCode } = runCLI(['set', 'invalid', 'sound.mp3']);
    expect(exitCode).toBe(1);
    expect(stderr + '').toContain('invalid');
  });
});
