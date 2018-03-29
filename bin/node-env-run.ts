#!/usr/bin/env node

import { spawn } from 'child_process';
import * as Debug from 'debug';
import { start } from 'repl';

import { init, parseArgs } from '../lib/cli';
import { constructNewArgv } from '../lib/utils';

const debug = Debug('node-env-run');

/**
 * Spawns a new shell with the given command and inherits I/O
 * IMPORTANT: By default it will exit the process when child process exits
 * @param  {string} cmd The command to execute
 * @param  {string[]} cmdArgs An array of arguments to pass to the command
 * @param  {boolean} shouldExit Whether the parent process should finish when child finishes
 * @returns {void}
 */
function runCommand(
  cmd: string,
  cmdArgs: string[],
  shouldExit: boolean = true
): void {
  const shell: string | boolean = process.env.SHELL || true;

  debug(`Execute command: ${cmd}`);
  debug(`Using arguments: ${cmdArgs}`);
  debug(`Using shell: ${shell}`);
  const child = spawn(cmd, cmdArgs, {
    shell,
    stdio: 'inherit',
    env: process.env,
  });
  child.on('close', code => {
    debug(`Child process exit with code ${code}`);
    process.exit(code);
  });
}

const args = parseArgs(process.argv);
debug(`Parsed args: [${args.program._.join(', ')}]`);
debug(`Parsed script: "${args.script}"`);
const cli = init(args);
if (cli.isRepl) {
  if (cli.node) {
    start({});
  } else {
    runCommand(args.program.exec, []);
  }
} else if (cli.script !== undefined) {
  const cmd = args.program.exec;
  const cmdArgs = [cli.script, ...args.program.newArguments];
  runCommand(args.program.exec, cmdArgs);
} else {
  console.error(cli.error);
  process.exit(1);
}
