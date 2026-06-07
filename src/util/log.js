import chalk from 'chalk';

export function info(message) {
  console.log(chalk.blue('ℹ'), message);
}

export function success(message) {
  console.log(chalk.green('✔'), message);
}

export function warn(message) {
  console.log(chalk.yellow('⚠'), message);
}

export function error(message) {
  console.error(chalk.red('✖'), message);
}

export function highlight(message) {
  return chalk.cyan(message);
}

export function dim(message) {
  return chalk.dim(message);
}
