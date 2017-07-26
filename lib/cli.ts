import * as fs from 'fs';
import * as path from 'path';
import * as program from 'commander';
import * as dotenv from 'dotenv';
import * as Debug from 'debug';

import { getScriptToExecute, EnvironmentDictionary, setEnvironmentVariables } from './utils';

export type CommanderProgram = typeof program;
export type CliArgs = {
  program: CommanderProgram;
  script: string | undefined;
}

export type Cli = 
  | { isRepl: true }
  | { isRepl: false, error?: Error, script?: string };

const debug = Debug('node-env-run');
const cwd = process.cwd();

export function parseArgs(argv: string[]): CliArgs {
  let script: string | undefined;
  
  program
    .version('2.0.1')
    .arguments('<file>')
    .action((file: string) => {
      script = file;
    })
    .option('-f, --force', 'Temporarily overrides existing env variables with the ones in the .env file')
    .option('-E, --env [filePath]', 'Location of .env file relative from the current working directory', '.env')
    .option('--verbose', 'Enable verbose logging')
    .option('--encoding [encoding]', 'Encoding of the .env file', 'utf8')
    .option('-a, --newArguments [args]', 'Arguments that should be passed to the script. Wrap in quotes.', '');

  program.parse(argv);

  return { program, script };
}

export function init({ program, script }: CliArgs): Cli {
  const envFilePath = path.resolve(cwd, program.env);
  if (!fs.existsSync(envFilePath)) {
    const error = new Error(`Could not find the .env file under: "${envFilePath}"`);
    return { isRepl: false, error };
  }

  debug('Reading .env file');
  const envContent = fs.readFileSync(path.resolve(cwd, program.env), program.encoding);
  const envValues: EnvironmentDictionary = dotenv.parse(envContent);

  setEnvironmentVariables(envValues, program.force);

  if (program.args.length === 0 || !script) {
    return { isRepl: true };
  }

  let scriptToExecute = getScriptToExecute(script, cwd);
  if (scriptToExecute === null || !fs.existsSync(scriptToExecute)) {
    const error = new Error('Failed to determine script to execute');
    return { isRepl: false, error };
  }

  return { isRepl: false, script: scriptToExecute };
}
