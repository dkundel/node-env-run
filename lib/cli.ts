import { stripIndent } from 'common-tags';
import * as Debug from 'debug';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import * as yargs from 'yargs';
import {
  EnvironmentDictionary,
  getScriptToExecute,
  setEnvironmentVariables,
} from './utils';

export interface CliOptions extends yargs.Arguments {
  force: boolean;
  env: string;
  verbose: boolean;
  encoding: string;
  exec: string;
  script: string;
  newArguments: string[];
}

export type CliArgs = {
  program: CliOptions;
  script: string | undefined;
};

export type Cli =
  | { isRepl: true; node: boolean }
  | { isRepl: false; error?: Error; script?: string };

const debug = Debug('node-env-run');
const cwd = process.cwd();

const usageDescription = stripIndent`
  Runs the given script with set environment variables. 
  * If no script is passed it will run the REPL instead.
  * If '.' is passed it will read the package.json and execute the 'main' file.

  Pass additional arguments to the script after the "--"
`;

/**
 * Parses a list of arguments and turns them into an object using Commander
 * @param  {string[]} argv Array of arguments like process.argv
 * @returns {CliArgs} The parsed configuration
 */
export function parseArgs(argv: string[]): CliArgs {
  const result = yargs
    .usage('$0 [script]', usageDescription, (yargs) => {
      yargs.positional('script', {
        describe: 'the file that should be executed',
        type: 'string',
      });
      yargs.example('$0 --exec "python"', 'Runs the Python REPL instead');
      yargs.example(
        '$0 server.js --exec "nodemon"',
        'Runs "nodemon server.js"'
      );
      yargs.example(
        '$0 someScript.js -- --inspect',
        'Run script with --inspect'
      );
      return yargs;
    })
    .option('force', {
      alias: 'f',
      demandOption: false,
      describe:
        'temporarily overrides existing env variables with the ones in the .env file',
    })
    .option('env', {
      alias: 'E',
      demandOption: false,
      describe:
        'location of .env file relative from the current working directory',
      default: '.env',
      type: 'string',
    })
    .option('verbose', {
      demandOption: false,
      describe: 'enable verbose logging',
      type: 'boolean',
    })
    .option('encoding', {
      demandOption: false,
      describe: 'encoding of the .env file',
      default: 'utf8',
      type: 'string',
    })
    .option('exec', {
      alias: 'e',
      demandOption: false,
      describe: 'the command to execute the script with',
      default: 'node',
    })
    .showHelpOnFail(true)
    .help('help')
    .strict()
    .version()
    .parse(argv.slice(2)) as CliOptions;

  const script: string | undefined = result.script;
  result.newArguments = result._;

  debug('Yargs Result %o', result);

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

  if (!script || script === 'REPL') {
    const node = args.program.exec === undefined;
    return { isRepl: true, node };
  }

  const scriptToExecute = getScriptToExecute(script, cwd);
  if (scriptToExecute === null || !fs.existsSync(scriptToExecute)) {
    const error = new Error('Failed to determine script to execute');
    return { isRepl: false, error };
  }

  return { isRepl: false, script: scriptToExecute };
}
