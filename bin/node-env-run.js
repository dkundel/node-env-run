#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const args = require('args');
const dotenv = require('dotenv');

args
  .option(['f', 'force'], 'Temporarily overrides existing env variables with the ones in the .env file')
  .option(['E', 'env'], 'Location of .env file relative from the current working directory', '.env')
  .option('verbose', 'Enable verbose logging')
  .option('encoding', 'Encoding of the .env file', 'utf8');

args.config.value = '<script to execute>';

const flags = args.parse(process.argv);
const cwd = process.cwd();

let scriptToExecute = args.sub[0];

if (!scriptToExecute) {
  console.error('You need to specify a script to run or alternatively "." to run the script specified in "main" in your "package.json"');
  process.exit(1);
}


if (scriptToExecute === '.') {
  const pathToPkg = path.resolve(cwd, 'package.json');
  if (!fs.existsSync(pathToPkg)) {
    console.error('In order to use "." you need to have a package.json in the current working directory.');
    process.exit(1);
  } 

  const pkg = require(pathToPkg);
  
  if (!pkg.main) {
    console.error('Could not find a "main" entry in the package.json');
    process.exit(1);
  }

  scriptToExecute = path.resolve(cwd, pkg.main);
} else {
  scriptToExecute = path.resolve(cwd, scriptToExecute);
}

const envContent = fs.readFileSync(path.resolve(cwd, flags.env))
const envValues = dotenv.parse(envContent);

const envKeys = Object.keys(envValues).filter(key => {
  if (flags.force) {
    return true;
  }

  return !process.env[key];
});

envKeys.forEach(key => {
  process.env[key] = envValues[key];
});

if (flags.verbose) {
  console.log(`Set the env variables: ${envKeys.map(k => `"${k}"`).join(',')}`);
  console.log(`Execute script: ${scriptToExecute}`);
}

require(scriptToExecute);