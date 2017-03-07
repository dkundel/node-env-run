const assert = require('assert');

assert.equal(process.env.NODE_ENV, 'debug');
assert.equal(process.env.FOO_BAR, 'SomeValue');
console.log('PASSED');