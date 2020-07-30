#!/usr/bin/env node

import { spawn } from 'cross-spawn';
import * as Debug from 'debug';
import { start } from 'repl';
import { init, parseArgs } from '../lib/cli';
import { escapeArguments } from '../lib/utils';

const debug = Debug('node-env-run');

/**
 * Spawns a new shell with the given command and inherits I/O
 * IMPORTANT: By default it will exit the process when child process exits
 * @param  {string} cmd The command to execute
 * @param  {string[]} cmdArgs An array of arguments to pass to the command
 * @returns {void}
 */
function runCommand(cmd: string, cmdArgs: string[]): void {
  const shell: string | boolean = process.env.SHELL || true;

  debug(`Execute command: "${cmd}"`);
  debug(`Using arguments: "%o"`, cmdArgs);
  debug(`Using shell: "${shell}"`);
  const child = spawn(cmd, cmdArgs, {
    shell,
    stdio: 'inherit',
    env: process.env,
  });
  child.on('exit', (code: number) => {
    debug(`Child process exit with code ${code}`);
    process.exit(code);
  });
}

debug(`Raw args: %o`, process.argv);
const args = parseArgs(process.argv);
debug(`Parsed args: %o`, args.program._);
debug(`Parsed script: "${args.script}"`);
const cli = init(args);
if (cli.isRepl) {
  if (cli.node && args.program.newArguments.length === 0) {
    start({});
  } else {
    const cmdArgs = escapeArguments(args.program.newArguments);
    runCommand(args.program.exec, cmdArgs);
  }
} else if (cli.script !== undefined) {
  const cmd = args.program.exec;
  const cmdArgs = escapeArguments([cli.script, ...args.program.newArguments]);
  runCommand(cmd, cmdArgs);
} else {
  console.error(cli.error);
  process.exit(1);
}
