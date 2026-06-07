import { readFile, writeFile } from 'fs/promises';
import { existsSync } from 'fs';
import { resolve, basename, dirname } from 'path';
import { fileURLToPath } from 'url';
import { findGitDir } from '../util/paths.js';
import { success, error, info, warn } from '../util/log.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * @typedef {'install' | 'uninstall' | 'status'} HookAction
 */

/**
 * Install, uninstall, or check status of git hooks.
 * @param {HookAction} action
 * @param {boolean} [globalFlag] - install globally (not yet implemented in v1)
 */
export async function hookCommand(action, globalFlag) {
  if (globalFlag) {
    warn('--global is not yet supported in v1');
    return;
  }

  if (action === 'install') {
    await installHooks();
  } else if (action === 'uninstall') {
    await uninstallHooks();
  } else if (action === 'status') {
    await hookStatus();
  } else {
    error(`unknown hook action "${action}". use install, uninstall, or status`);
    process.exit(1);
  }
}

/**
 * Hook template names and their corresponding git hook names.
 */
const HOOK_MAP = {
  'post-commit.sh': 'post-commit',
  'post-push.sh': 'post-push',
  'pre-push.sh': 'pre-push',
};

/**
 * Install hook scripts into .git/hooks/.
 */
async function installHooks() {
  const gitDir = findGitDir();
  if (!gitDir) {
    error('not in a git repository');
    process.exit(1);
  }

  const hooksDir = resolve(gitDir, 'hooks');
  const templatesDir = resolve(__dirname, '..', 'hooks');

  for (const [templateFile, hookName] of Object.entries(HOOK_MAP)) {
    const templatePath = resolve(templatesDir, templateFile);
    const hookPath = resolve(hooksDir, hookName);

    if (!existsSync(templatePath)) {
      warn(`hook template not found: ${templatePath}`);
      continue;
    }

    const templateContent = await readFile(templatePath, 'utf-8');

    if (existsSync(hookPath)) {
      const existingContent = await readFile(hookPath, 'utf-8');
      if (existingContent === templateContent) {
        info(`hook "${hookName}" already up to date`);
        continue;
      }
      // Backup existing hook
      const backupPath = `${hookPath}.beep-beep.bak`;
      await writeFile(backupPath, existingContent, 'utf-8');
      warn(`existing hook "${hookName}" backed up to "${basename(backupPath)}"`);
    }

    await writeFile(hookPath, templateContent, 'utf-8');

    // Make executable
    try {
      const { chmod } = await import('fs/promises');
      await chmod(hookPath, 0o755);
    } catch {
      // ignore on Windows
    }

    success(`hook "${hookName}" installed`);
  }
}

/**
 * Uninstall beep-beep hooks from .git/hooks/.
 */
async function uninstallHooks() {
  const gitDir = findGitDir();
  if (!gitDir) {
    error('not in a git repository');
    process.exit(1);
  }

  const hooksDir = resolve(gitDir, 'hooks');

  for (const hookName of Object.values(HOOK_MAP)) {
    const hookPath = resolve(hooksDir, hookName);

    if (!existsSync(hookPath)) {
      info(`hook "${hookName}" not installed`);
      continue;
    }

    const content = await readFile(hookPath, 'utf-8');
    if (!content.includes('beep-beep')) {
      info(`hook "${hookName}" is not a beep-beep hook, skipping`);
      continue;
    }

    // Check for backup
    const backupPath = `${hookPath}.beep-beep.bak`;
    if (existsSync(backupPath)) {
      const backupContent = await readFile(backupPath, 'utf-8');
      await writeFile(hookPath, backupContent, 'utf-8');
      success(`hook "${hookName}" restored from backup`);
      try {
        const { unlink } = await import('fs/promises');
        await unlink(backupPath);
      } catch {
        // ignore
      }
    } else {
      try {
        const { unlink } = await import('fs/promises');
        await unlink(hookPath);
      } catch {
        // ignore
      }
      success(`hook "${hookName}" removed`);
    }
  }
}

/**
 * Show the status of beep-beep hooks.
 */
async function hookStatus() {
  const gitDir = findGitDir();
  if (!gitDir) {
    info('not in a git repository');
    return;
  }

  const hooksDir = resolve(gitDir, 'hooks');

  for (const hookName of Object.values(HOOK_MAP)) {
    const hookPath = resolve(hooksDir, hookName);

    if (!existsSync(hookPath)) {
      info(`  ${hookName}: not installed`);
      continue;
    }

    const content = await readFile(hookPath, 'utf-8');
    if (content.includes('beep-beep')) {
      success(`  ${hookName}: installed (beep-beep)`);
    } else {
      info(`  ${hookName}: installed (non-beep-beep hook)`);
    }

    const backupPath = `${hookPath}.beep-beep.bak`;
    if (existsSync(backupPath)) {
      info(`    backup: ${basename(backupPath)}`);
    }
  }
}
