// turn off error logs
console.error = jest.fn();

import * as mockFs from 'mock-fs';
import * as upath from 'upath';
import {
  escapeArguments,
  getScriptToExecute,
  setEnvironmentVariables,
} from '../utils';

function normalizePath(path: string | null): string | null {
  if (typeof path !== 'string') {
    return path;
  }

  let normalized = upath.toUnix(path);
  if (normalized.includes(':')) {
    normalized = normalized.substr(normalized.indexOf(':') + 1);
  }
  return normalized;
}

describe('test getScriptExecuted', () => {
  afterEach(() => {
    mockFs.restore();
  });

  test('returns null for missing package.json', () => {
    const returnVal = getScriptToExecute('.', '/fake/path/to/');
    expect(returnVal).toBeNull();
  });

  test('returns null for missing main entry', () => {
    mockFs({ '/fake/path/to/package.json': '{}' });
    const returnVal = getScriptToExecute('.', '/fake/path/to/');
    expect(returnVal).toBeNull();
  });

  test('returns correct path derived from main', () => {
    mockFs({
      '/fake/path/to/package.json': `{"main": "./lib/foo.js"}`,
    });
    const returnVal = getScriptToExecute('.', '/fake/path/to/');
    expect(normalizePath(returnVal)).toBe('/fake/path/to/lib/foo.js');
  });

  test('returns correct path manually entered', () => {
    mockFs({ '/fake/path/to/package.json': '{}' });
    const returnVal = getScriptToExecute('../bar.js', '/fake/path/to/');
    expect(normalizePath(returnVal)).toBe('/fake/path/bar.js');
  });
});

describe('test setEnvironmentVariables', () => {
  test('overrides all values when forced', () => {
    const toOverride = {
      TEST_ONE: 'moin',
      TEST_TWO: 'bar',
    };
    process.env.TEST_ONE = 'hello';
    process.env.TEST_TWO = 'foo';
    setEnvironmentVariables(toOverride, true);
    expect(process.env.TEST_ONE).toBe('moin');
    expect(process.env.TEST_TWO).toBe('bar');
  });

  test('does not override empty values', () => {
    const toOverride = {
      TEST_ONE: 'moin',
      TEST_TWO: '',
    };
    process.env.TEST_ONE = 'hello';
    process.env.TEST_TWO = 'foo';
    setEnvironmentVariables(toOverride, true);
    expect(process.env.TEST_ONE).toBe('moin');
    expect(process.env.TEST_TWO).toBe('foo');
  });

  test('does not override without force', () => {
    const toOverride = {
      TEST_ONE: 'moin',
      TEST_TWO: 'bar',
    };
    process.env.TEST_ONE = 'hello';
    process.env.TEST_TWO = 'foo';
    setEnvironmentVariables(toOverride, undefined);
    expect(process.env.TEST_ONE).toBe('hello');
    expect(process.env.TEST_TWO).toBe('foo');
  });
});

describe('escapeArguments', () => {
  test('keeps regular arguments untouched', () => {
    const result = escapeArguments(['--verbose', '-l', 'debug']);
    expect(result).toEqual(['--verbose', '-l', 'debug']);
  });

  test('keeps regular assignments', () => {
    const result = escapeArguments(['--greeting=hello', '-l=debug']);
    expect(result).toEqual([`--greeting=hello`, `-l=debug`]);
  });

  test('wraps arguments containing spaces', () => {
    const result = escapeArguments(['--greeting', 'Hey how is it going?']);
    expect(result).toEqual(['--greeting', `"Hey how is it going?"`]);
  });

  test('handles single quotes', () => {
    const result = escapeArguments(['--greeting', `Hey what's up?`]);
    expect(result).toEqual(['--greeting', `"Hey what's up?"`]);
  });

  test('does not touch existing double quotes', () => {
    const result = escapeArguments(['--greeting', `Hey "Dominik"!`]);
    expect(result).toEqual(['--greeting', `"Hey "Dominik"!"`]);
  });
});
