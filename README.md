# `node-env-run`
## Load env variables from `.env` and run Node

[![npm](https://img.shields.io/npm/v/node-env-run.svg?style=flat-square)](https://npmjs.com/packages/node-env-run) [![npm](https://img.shields.io/npm/dt/node-env-run.svg?style=flat-square)](https://npmjs.com/packages/node-env-run) [![npm](https://img.shields.io/npm/l/node-env-run.svg?style=flat-square)](/LICENSE) [![Build Status](https://travis-ci.org/dkundel/node-env-run.svg?branch=master)](https://travis-ci.org/dkundel/node-env-run)

---

## Installation

### Per Module:

I recommend installing this module as a `devDependency` for the respective project.

#### `yarn`:

```bash
yarn add node-env-run --dev
```

#### `npm`:

```bash
npm install node-env-run --save-dev
```

### Global:

You can alternatively install the module globally if you want to:

```bash
npm install node-env-run --global 
```

## Usage 

Add a new scripts entry to your `package.json`. Example:

```json
{
  "scripts": {
    "dev": "nodenv .",
    "test": "nodenv -E test/.env test/test.js" 
  }
}
```

The arguments are the following:

```bash
Usage: nodenv [options] <file>

Options:

  -h, --help             output usage information
  -V, --version          output the version number
  -f, --force            Temporarily overrides existing env variables with the ones in the .env file
  -E, --env [filePath]   Location of .env file relative from the current working directory
  --verbose              Enable verbose logging
  --encoding [encoding]  Encoding of the .env file
```

This module uses under the hood the [`dotenv` module](https://www.npmjs.com/package/dotenv) to parse the `.env` file. For more information about how to structure your `.env` file, please refer to its [documentation](https://www.npmjs.com/package/dotenv#rules).

# Contributors

- Dominik Kundel <dominik.kundel@gmail.com>

# License

MIT