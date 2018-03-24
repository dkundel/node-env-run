#!/usr/bin/env node

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
  const argv = constructNewArgv(
    process.argv,
    cli.script,
    args.program.newArguments
  );
  debug(`Overriding process.argv with the following arguments: [${argv}]`);
  process.argv = argv;
  debug(`Execute script: ${cli.script}`);
  require(cli.script);
} else {
  console.error(cli.error);
  process.exit(1);
}
