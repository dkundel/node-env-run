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

const CMD = 'path/to/node node-env-run foo-bar-bla.js --force'.split(' ');

const ENV_FILE_PATH = resolve(process.cwd(), '.env');
const FILES: { [key: string]: string } = {};
FILES[ENV_FILE_PATH] = `
TEST_STRING=hello
TEST_EMPTY=
TEST_NUMBER=42
# TEST_COMMENT=invisible
TEST_PREDEFINED=moin
`;

describe('test command without necessary parameters', () => {
  beforeAll(() => {
    __setScriptToExecute(null);
    __setMockFiles(FILES);
    process.env['TEST_PREDEFINED']='servus';
  });

  test('returns null', () => {
    const cli = init(parseArgs(CMD));
    expect(cli.isRepl).toBeFalsy();
    if (cli.isRepl === false) {
      expect(cli.error.message).toBe('Failed to determine script to execute');
    }
  })

  test('has called the right functions', () => {
    expect(setEnvironmentVariables).toHaveBeenCalledTimes(1);
    expect(getScriptToExecute).toHaveBeenCalledTimes(1);
    expect(getScriptToExecute).toHaveBeenCalledWith('foo-bar-bla.js', process.cwd());
  });

  afterAll(() => {
    (getScriptToExecute as jest.Mock<string>).mockClear();
    (setEnvironmentVariables as jest.Mock<string>).mockClear();
  });
});
