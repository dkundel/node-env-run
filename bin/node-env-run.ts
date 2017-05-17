#!/usr/bin/env node

import * as Debug from 'debug';

const debug = Debug('node-env-run');
const scriptToExecute = require('../lib/cli')();

debug(`Execute script: ${scriptToExecute}`);
require(scriptToExecute);