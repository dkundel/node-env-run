const chalk = require('chalk');

const levels = {
  debug: {
    emoji: '🐛',
    prefix: chalk.bold.cyan('DEBUG'),
  },
  error: {
    emoji: '🚨',
    prefix: chalk.bold.red('ERROR'),
  }
}

function logFactory(condition, level) {
  return (msg) => {
    if (condition) {
      let logFn = console.log;
      if (level === 'error') {
        logFn = console.error;
      }

      const lvl = levels[level];
      logFn(`${lvl.emoji} ${lvl.prefix} ${msg}`);
    }
  }
}

function logger(verbose) {
  return {
    error: logFactory(true, 'error'),
    debug: logFactory(verbose, 'debug')
  }
}

module.exports = { logger };