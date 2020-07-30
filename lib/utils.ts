import * as Debug from 'debug';
import * as fs from 'fs';
import { resolve } from 'path';

export type EnvironmentDictionary = {
  [key: string]: string | undefined;
};

const debug = Debug('node-env-run');

/**
 * Determines the full path of the script to execute.
 * If the script path is "." it will read the package.json to determine the path
 * @param  {string} script A relative path to the script to execute
 * @param  {string} cwd The current working directory
 * @returns {string | null} A full path to the script or null if it could not be determined
 */
export function getScriptToExecute(script: string, cwd: string): string | null {
  if (script === '.') {
    debug('Evalute package.json to determine script to execute.');
    const pathToPkg = resolve(cwd, 'package.json');
    if (!fs.existsSync(pathToPkg)) {
      debug('could not find package.json');
      return null;
    }

    const pkg = require(pathToPkg);

    if (!pkg.main) {
      console.error('Could not find a "main" entry in the package.json');
      return null;
    }

    script = resolve(cwd, pkg.main);
  } else {
    script = resolve(cwd, script);
  }

  return script;
}

/**
 * Sets the values passed as environment variables if they don't exist already
 * In force mode it will override existing ones
 * @param  {EnvironmentDictionary} readValues A dictionary of values to be set
 * @param  {boolean} force Forces the override of existing variables
 * @returns {void}
 */
export function setEnvironmentVariables(
  readValues: EnvironmentDictionary,
  force = false
): void {
  if (force) {
    debug('Force overriding enabled');
  }

  const envKeysToSet = Object.keys(readValues).filter((key) => {
    if (force && typeof readValues[key] !== 'undefined') {
      const val = readValues[key];
      if (typeof val === 'string' && val.length === 0) {
        debug(`Not overriding ${key}`);
        return false;
      }

      debug(`Overriding ${key}`);
      return true;
    }

    return !process.env[key];
  });

  envKeysToSet.forEach((key) => {
    process.env[key] = readValues[key];
  });

  debug(
    `Set the env variables: ${envKeysToSet.map((k) => `"${k}"`).join(',')}`
  );
}

/**
 * Constructs the new argv to override process.argv to simulate the script being executed directly
 * @param  {string[]} currentArgv The current list of argv (like process.argv)
 * @param  {string} script The path to the script that should be executed
 * @param  {string} newArguments The arguments that are passed to the script
 * @returns {string[]} The new value to be set as process.argv
 */
export function constructNewArgv(
  currentArgv: string[],
  script: string,
  newArguments: string
): string[] {
  const [node] = currentArgv;
  return [node, script, ...newArguments.split(' ')];
}

const REGULAR_SHELL_CHARACTERS = ['a-z', 'A-Z', '1-9', '-', '_', '/', ':', '='];
const REGEX_NOT_REGULAR_CHARACTER = new RegExp(
  `[^${REGULAR_SHELL_CHARACTERS.join('')}]`
);

/**
 * Wraps arguments that contain characters that need to be escaped into quotes
 * That way they will be passed correctly to the spawn command
 *
 * @param args list of arguments to pass to spawn
 */
export function escapeArguments(args: string[]): string[] {
  const escapedArguments = args.map((arg) => {
    if (arg.match(REGEX_NOT_REGULAR_CHARACTER)) {
      return `"${arg}"`;
    }
    return arg;
  });
  return escapedArguments;
}
