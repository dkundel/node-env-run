#!/usr/bin/env node

import * as Debug from 'debug';
import { init, parseArgs } from '../lib/cli';
import { start } from 'repl';

const debug = Debug('node-env-run');

const args = parseArgs(process.argv);
debug(`Parsed args: [${args.program.args.join(', ')}]`);
debug(`Parsed script: "${args.script}"`);
const cli = init(args);
if (cli.isRepl) {
  start({});
} else if (cli.script !== undefined) {
  debug(`Execute script: ${cli.script}`);
  require(cli.script);
} else {
  console.error(cli.error);
  process.exit(1);
}