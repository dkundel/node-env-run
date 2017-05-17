let scriptToExecute = './main.js';

export function __setScriptToExecute(script: string) {
  scriptToExecute = script;
}

export const getScriptToExecute = jest.fn(() =>  scriptToExecute );

export const setEnvironmentVariables = jest.fn();