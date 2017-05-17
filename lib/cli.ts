type Optional<T> = T | undefined;

import * as fs from 'fs';
import * as path from 'path';
import * as program from 'commander';
import * as dotenv from 'dotenv';
import * as Debug from 'debug';

import { getScriptToExecute, EnvironmentDictionary, setEnvironmentVariables } from './utils';

const debug = Debug('node-env-run');
const cwd = process.cwd();

module.exports = function (): string | null {
  let passedScript: Optional<string> = '';

  program
    .version('1.0.0')
    .arguments('<file>')
    .action((file: string) => {
      passedScript = file;
    })
    .option('-f, --force', 'Temporarily overrides existing env variables with the ones in the .env file')
    .option('-E, --env [filePath]', 'Location of .env file relative from the current working directory', '.env')
    .option('--verbose', 'Enable verbose logging')
    .option('--encoding [encoding]', 'Encoding of the .env file', 'utf8');

  program.parse(process.argv);

  if (program.args.length === 0 || !passedScript) {
    console.error('You need to specify a script to run or alternatively "." to run the script specified in "main" in your "package.json"');
    return null;
  }

  let scriptToExecute = getScriptToExecute(passedScript, cwd);
  if (scriptToExecute === null) {
    console.error('Failed to determine script to execute');
    return null;
  }

  const envFilePath = path.resolve(cwd, program.env);
  if (!fs.existsSync(envFilePath)) {
    console.error(`Could not find the .env file under: "${envFilePath}"`);
    return null;
  }

  debug('Reading .env file');
  const envContent = fs.readFileSync(path.resolve(cwd, program.env), program.encoding);
  const envValues: EnvironmentDictionary = dotenv.parse(envContent);

  setEnvironmentVariables(envValues, program.force);

  return scriptToExecute;
}