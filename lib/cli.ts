import * as fs from 'fs';
import * as path from 'path';
import * as program from 'commander';
import { CommanderStatic } from 'commander';
import * as dotenv from 'dotenv';
import * as Debug from 'debug';

import {
  getScriptToExecute,
  EnvironmentDictionary,
  setEnvironmentVariables,
} from './utils';

export interface CliOptions extends CommanderStatic {
  force: boolean;
  env: string;
  verbose: boolean;
  encoding: string;
  newArguments: string;
}

export type CliArgs = {
  program: CliOptions;
  script: string | undefined;
};

export type Cli =
  | { isRepl: true }
  | { isRepl: false; error?: Error; script?: string };

const debug = Debug('node-env-run');
const cwd = process.cwd();

/**
 * Parses a list of arguments and turns them into an object using Commander
 * @param  {string[]} argv Array of arguments like process.argv
 * @returns {CliArgs} The parsed configuration
 */
export function parseArgs(argv: string[]): CliArgs {
  let script: string | undefined;

  program
    .version('2.0.1')
    .arguments('<file>')
    .action((file: string) => {
      script = file;
    })
    .option(
      '-f, --force',
      'Temporarily overrides existing env variables with the ones in the .env file'
    )
    .option(
      '-E, --env [filePath]',
      'Location of .env file relative from the current working directory',
      '.env'
    )
    .option('--verbose', 'Enable verbose logging')
    .option('--encoding [encoding]', 'Encoding of the .env file', 'utf8')
    .option(
      '-a, --newArguments [args]',
      'Arguments that should be passed to the script. Wrap in quotes.',
      ''
    );

  const result = program.parse(argv) as CliOptions;

  return { program: result, script };
}

/**
 * Reads .env file, sets the environment variables and dtermines the script to execute
 * @param  {CliArgs} args The arguments as parsed by parseArgs
 * @returns {Cli} An object specifying if it should execute the REPL or execute a script
 */
export function init(args: CliArgs): Cli {
  const { program, script } = args;
  const envFilePath = path.resolve(cwd, program.env);
  if (!fs.existsSync(envFilePath)) {
    const error = new Error(
      `Could not find the .env file under: "${envFilePath}"`
    );
    return { isRepl: false, error };
  }

  debug('Reading .env file');
  const envContent = fs.readFileSync(
    path.resolve(cwd, program.env),
    program.encoding
  );
  const envValues: EnvironmentDictionary = dotenv.parse(envContent);

  setEnvironmentVariables(envValues, program.force);

  if (program.args.length === 0 || !script) {
    return { isRepl: true };
  }

  const scriptToExecute = getScriptToExecute(script, cwd);
  if (scriptToExecute === null || !fs.existsSync(scriptToExecute)) {
    const error = new Error('Failed to determine script to execute');
    return { isRepl: false, error };
  }

  return { isRepl: false, script: scriptToExecute };
}
