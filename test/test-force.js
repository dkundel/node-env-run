const assert = require('assert');

assert.equal(process.env.NODE_ENV, 'test');
assert.equal(process.env.FOO_BAR, 'SomeValue');
console.log('PASSED');