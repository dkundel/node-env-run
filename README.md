:rotating_light: :rotating_light: :rotating_light: THIS IS CURRENTLY VERY MUCH ALPHA! USE AT OWN RISK :rotating_light: :rotating_light: :rotating_light:

---

# `node-env-run`
## Load env variables from `.env` and run Node

[![npm](https://img.shields.io/npm/v/node-env-run.svg?style=flat-square)](https://npmjs.com/packages/node-env-run) [![npm](https://img.shields.io/npm/dt/node-env-run.svg?style=flat-square)](https://npmjs.com/packages/node-env-run) [![npm](https://img.shields.io/npm/l/node-env-run.svg?style=flat-square)](/LICENSE)

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
npm install node-env-run --dev
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
    "dev": "node-env-run .",
    "test": "node-env-run -E test/.env test/test.js" 
  }
}
```

The arguments are the following:

```bash
Usage: node-env-run [options] [command] <script to execute>

Commands:

  help  Display help

Options:

  -e, --encoding [value]  Encoding of the .env file (defaults to "utf8")
  -E, --env [value]       Location of .env file relative from the current working directory (defaults to ".env")
  -f, --force             Temporarily overrides existing env variables with the ones in the .env file
  -h, --help              Output usage information
  -v, --verbose           Enable verbose logging
  -V, --version           Output the version number
```

This module uses under the hood the [`dotenv` module](https://www.npmjs.com/package/dotenv) to parse the `.env` file. For more information about how to structure your `.env` file, please refer to its [documentation](https://www.npmjs.com/package/dotenv#rules).

# Contributors

- Dominik Kundel <dominik.kundel@gmail.com>

# License

MIT