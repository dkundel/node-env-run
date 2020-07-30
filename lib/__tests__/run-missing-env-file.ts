jest.mock('../utils');
jest.mock('./main.js', () => {}, { virtual: true });

// turn off error logs
console.error = jest.fn();

import * as mockFs from 'mock-fs';
import { init, parseArgs } from '../cli';
import { getScriptToExecute, setEnvironmentVariables } from '../utils';

const __setScriptToExecute = require('../utils').__setScriptToExecute;

const CMD = 'path/to/node node-env-run . --force'.split(' ');

describe('test command with missing env file', () => {
  beforeAll(() => {
    mockFs({});
    __setScriptToExecute('./main.js');

    process.env['TEST_PREDEFINED'] = 'servus';
  });

  afterAll(() => {
    mockFs.restore();
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
