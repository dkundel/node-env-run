export type EnvironmentDictionary = { [key: string]: any };

import * as fs from 'fs';
import { resolve } from 'path';
import * as Debug from 'debug';

const debug = Debug('node-env-run');

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

export function setEnvironmentVariables(readValues: EnvironmentDictionary, force: boolean = false) {
  if (force) {
    debug('Force overriding enabled');
  }

  const envKeysToSet = Object.keys(readValues).filter(key => {
    if (force && typeof readValues[key] !== 'undefined') {
      if (typeof readValues[key] === 'string' && readValues[key].length === 0) {
        debug(`Not overriding ${key}`);
        return false;
      }

      debug(`Overriding ${key}`);
      return true;
    }

    return !process.env[key];
  });

  envKeysToSet.forEach(key => {
    process.env[key] = readValues[key];
  });

  debug(`Set the env variables: ${envKeysToSet.map(k => `"${k}"`).join(',')}`);
}