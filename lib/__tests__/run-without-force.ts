jest.mock('../utils');
jest.mock('./main.js', () => {}, { virtual: true });

import * as mockFs from 'mock-fs';
import { resolve } from 'path';
import { init, parseArgs } from '../cli';
import { getScriptToExecute, setEnvironmentVariables } from '../utils';

const __setScriptToExecute = require('../utils').__setScriptToExecute;

const CMD = 'path/to/node node-env-run .'.split(' ');
const ENV_FILE_PATH = resolve(process.cwd(), '.env');
const FILES: { [key: string]: string } = {};
FILES[ENV_FILE_PATH] = `
TEST_STRING=hello
TEST_EMPTY=
TEST_NUMBER=42
# TEST_COMMENT=invisible
TEST_PREDEFINED=moin
`;
FILES['./main.js'] = '//foo';

describe('test command in force mode', () => {
  beforeAll(() => {
    mockFs(FILES);
    __setScriptToExecute('./main.js');

    process.env['TEST_PREDEFINED'] = 'servus';
  });

  afterAll(() => {
    mockFs.restore();
  });

  test('returns the right script to execute', () => {
    const cli = init(parseArgs(CMD));
    expect(cli.isRepl).toBeFalsy();
    if (cli.isRepl === false) {
      expect(cli.script).toBe('./main.js');
      expect(cli.error).toBeUndefined();
    }
  });

  test('has called the right functions', () => {
    expect(setEnvironmentVariables).toHaveBeenCalledWith(
      {
        TEST_STRING: 'hello',
        TEST_EMPTY: '',
        TEST_NUMBER: '42',
        TEST_PREDEFINED: 'moin',
      },
      undefined
    );
    expect(getScriptToExecute).toHaveBeenCalledWith('.', process.cwd());
  });

  afterAll(() => {
    (getScriptToExecute as jest.Mock<string>).mockClear();
    (setEnvironmentVariables as jest.Mock<string>).mockClear();
  });
});
