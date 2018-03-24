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

const ENV_FILE_PATH = resolve(process.cwd(), '.env');
const FILES: { [key: string]: string } = {};
FILES[ENV_FILE_PATH] = '#SOMETHING';

const CMD = 'path/to/node node-env-run --force'.split(' ');

describe('test command without script parameter', () => {
  beforeAll(() => {
    __setMockFiles(FILES);
    __setScriptToExecute('./main.js');

    process.env['TEST_PREDEFINED'] = 'servus';
  });

  test('returns null', () => {
    const cli = init(parseArgs(CMD));
    expect(cli.isRepl).toBeTruthy();
  });

  test('has called the right functions', () => {
    expect(setEnvironmentVariables).toHaveBeenCalledTimes(1);
    expect(getScriptToExecute).toHaveBeenCalledTimes(0);
  });

  afterAll(() => {
    (getScriptToExecute as jest.Mock<string>).mockClear();
    (setEnvironmentVariables as jest.Mock<string>).mockClear();
  });
});
