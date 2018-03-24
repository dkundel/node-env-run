jest.mock('fs');
jest.mock('../utils');
jest.mock('./main.js', () => {}, { virtual: true });

// turn off error logs
console.error = jest.fn();

import { resolve } from 'path';

import { getScriptToExecute, setEnvironmentVariables } from '../utils';
import { init, parseArgs } from '../cli';

const __setScriptToExecute = require('../utils').__setScriptToExecute;
const __setMockFiles = require('fs').__setMockFiles;

const CMD = 'path/to/node node-env-run . --force'.split(' ');

describe('test command with missing env file', () => {
  beforeAll(() => {
    __setMockFiles({});
    __setScriptToExecute('./main.js');

    process.env['TEST_PREDEFINED'] = 'servus';
  });

  test('returns null', () => {
    const cli = init(parseArgs(CMD));
    expect(cli.isRepl).toBeFalsy();
    if (cli.isRepl === false) {
      expect(cli.error).not.toBeUndefined();
      expect(cli.script).toBeUndefined();
    }
  });

  test('has called the right functions', () => {
    expect(setEnvironmentVariables).toHaveBeenCalledTimes(0);
    expect(getScriptToExecute).toHaveBeenCalledTimes(0);
  });

  afterAll(() => {
    (getScriptToExecute as jest.Mock<string>).mockClear();
    (setEnvironmentVariables as jest.Mock<string>).mockClear();
  });
});
