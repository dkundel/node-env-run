jest.mock('../utils');
jest.mock('./main.js', () => {}, { virtual: true });

// turn off error logs
console.error = jest.fn();

import * as mockFs from 'mock-fs';
import { resolve } from 'path';
import { init, parseArgs } from '../cli';
import { getScriptToExecute, setEnvironmentVariables } from '../utils';

const __setScriptToExecute = require('../utils').__setScriptToExecute;

const ENV_FILE_PATH = resolve(process.cwd(), '.env');
const FILES: { [key: string]: string } = {};
FILES[ENV_FILE_PATH] = '#SOMETHING';

const CMD = 'path/to/node node-env-run --force'.split(' ');

describe('test command without script parameter', () => {
  beforeAll(() => {
    mockFs(FILES);
    __setScriptToExecute('./main.js');

    process.env['TEST_PREDEFINED'] = 'servus';
  });

  afterAll(() => {
    mockFs.restore();
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
