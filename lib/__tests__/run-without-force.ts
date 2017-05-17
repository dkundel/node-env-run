jest.mock('fs');
jest.mock('../utils');
jest.mock('./main.js', () => {}, { virtual: true });

import { resolve } from 'path';

import { getScriptToExecute, setEnvironmentVariables } from '../utils';

const cli = require('../cli');

const __setScriptToExecute = require('../utils').__setScriptToExecute;
const __setMockFiles = require('fs').__setMockFiles;

const CMD = 'path/to/node node-env-run .';
const ENV_FILE_PATH = resolve(process.cwd(), '.env');
const FILES: { [key: string]: string } = {};
FILES[ENV_FILE_PATH] = `
TEST_STRING=hello
TEST_EMPTY=
TEST_NUMBER=42
# TEST_COMMENT=invisible
TEST_PREDEFINED=moin
`;

describe('test command in force mode', () => {
  beforeAll(() => {
    __setMockFiles(FILES);
    __setScriptToExecute('./main.js');

    process.argv = CMD.split(' ');
    process.env['TEST_PREDEFINED']='servus';
  });

  test('returns the right script to execute', () => {
    const scriptToExecute = cli();
    expect(scriptToExecute).toBe('./main.js');
  })

  test('has called the right functions', () => {
    expect(setEnvironmentVariables).toHaveBeenCalledWith({
      TEST_STRING: 'hello',
      TEST_EMPTY: '',
      TEST_NUMBER: '42',
      TEST_PREDEFINED: 'moin'
    }, undefined);
    expect(getScriptToExecute).toHaveBeenCalledWith('.', process.cwd());
  });

  afterAll(() => {
    (getScriptToExecute as jest.Mock<string>).mockClear();
    (setEnvironmentVariables as jest.Mock<string>).mockClear();
  });
});
