jest.mock('fs');
jest.mock('../utils');
jest.mock('./main.js', () => {}, { virtual: true });

// turn off error logs
console.error = jest.fn();

import { resolve } from 'path';

import { getScriptToExecute, setEnvironmentVariables } from '../utils';

const cli = require('../cli');

const __setScriptToExecute = require('../utils').__setScriptToExecute;
const __setMockFiles = require('fs').__setMockFiles;

const CMD = 'path/to/node node-env-run --force';

describe('test command without necessary parameters', () => {
  beforeAll(() => {
    __setScriptToExecute('./main.js');

    process.argv = CMD.split(' ');
    process.env['TEST_PREDEFINED']='servus';
  });

  test('returns null', () => {
    const scriptToExecute = cli();
    expect(scriptToExecute).toBeNull();
    expect(console.error).toHaveBeenCalledWith('You need to specify a script to run or alternatively "." to run the script specified in "main" in your "package.json"');
  })

  test('has called the right functions', () => {
    expect(setEnvironmentVariables).toHaveBeenCalledTimes(0);
    expect(getScriptToExecute).toHaveBeenCalledTimes(0);
  });

  afterAll(() => {
    (getScriptToExecute as jest.Mock<string>).mockClear();
    (setEnvironmentVariables as jest.Mock<string>).mockClear();
  });
});
