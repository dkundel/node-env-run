#!/usr/bin/env node

import { spawn } from 'child_process';
import * as Debug from 'debug';
import { start } from 'repl';

import { init, parseArgs } from '../lib/cli';
import { constructNewArgv } from '../lib/utils';

const debug = Debug('node-env-run');

const args = parseArgs(process.argv);
debug(`Parsed args: [${args.program.args.join(', ')}]`);
debug(`Parsed script: "${args.script}"`);
const cli = init(args);
if (cli.isRepl) {
  start({});
} else if (cli.script !== undefined) {
  const shell: string | boolean = process.env.SHELL || true;
  const cmd = args.program.exec;
  const cmd_args = [cli.script, ...args.program.newArguments.split(' ')];
  debug(`Execute command: ${cmd}`);
  debug(`Using arguments: ${cmd_args}`);
  debug(`Using shell: ${shell}`);
  const child = spawn(cmd, cmd_args, {
    shell,
    stdio: 'inherit',
    env: process.env,
  });
  child.on('close', code => {
    process.exit(code);
  });
} else {
  console.error(cli.error);
  process.exit(1);
}
