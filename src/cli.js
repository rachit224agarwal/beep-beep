#!/usr/bin/env node

import { Command } from 'commander';
import { setCommand } from './commands/set.js';
import { addCommand } from './commands/add.js';
import { removeCommand } from './commands/remove.js';
import { listCommand } from './commands/list.js';
import { testCommand } from './commands/test.js';
import { initCommand } from './commands/init.js';
import { hookCommand } from './commands/hook.js';
import { fireCommand } from './commands/fire.js';

const program = new Command();

program
  .name('git-beep-beep')
  .version('1.0.0')
  .description('Plays user-configurable sounds on git push and commit events');

program
  .command('init')
  .description('interactive configuration wizard')
  .action(() => {
    initCommand().catch((err) => {
      console.error(err.message);
      process.exit(1);
    });
  });

program
  .command('set')
  .description('set a sound for an event')
  .argument('<event>', 'event name (commit, push, success, fail)')
  .argument('<file-or-alias>', 'path to sound file or alias name')
  .action((event, fileOrAlias) => {
    setCommand(event, fileOrAlias).catch((err) => {
      console.error(err.message);
      process.exit(1);
    });
  });

program
  .command('add')
  .description('register a custom alias')
  .argument('<alias>', 'alias name')
  .argument('<file>', 'path to sound file')
  .action((alias, file) => {
    addCommand(alias, file).catch((err) => {
      console.error(err.message);
      process.exit(1);
    });
  });

program
  .command('remove')
  .description('remove a custom alias')
  .argument('<alias>', 'alias name')
  .action((alias) => {
    removeCommand(alias).catch((err) => {
      console.error(err.message);
      process.exit(1);
    });
  });

program
  .command('list')
  .description('list all configured sounds and aliases')
  .action(() => {
    listCommand().catch((err) => {
      console.error(err.message);
      process.exit(1);
    });
  });

program
  .command('test')
  .description('play a sound without firing a real event')
  .argument('[event]', 'event name (commit, push, success, fail)')
  .action((event) => {
    testCommand(event).catch((err) => {
      console.error(err.message);
      process.exit(1);
    });
  });

program
  .command('hook')
  .description('manage git hooks')
  .argument('<action>', 'install, uninstall, or status')
  .option('--global', 'install globally (not yet supported)')
  .action((action, options) => {
    hookCommand(action, options.global).catch((err) => {
      console.error(err.message);
      process.exit(1);
    });
  });

program
  .command('fire')
  .description('(internal) play sound for a git event')
  .argument('<event>', 'event name')
  .action((event) => {
    fireCommand(event).catch(() => {
      // Always exit cleanly from hook context
      process.exit(0);
    });
  });

program.parse(process.argv);
