# TowerVerse.js

![npm](https://img.shields.io/npm/v/towerverse.js)
![npm](https://img.shields.io/npm/dw/towerverse.js)
![GitHub Repo stars](https://img.shields.io/github/stars/towerverse/towerverse.js?style=social)
![GitHub Sponsors](https://img.shields.io/github/sponsors/towerverse)
[![Mocha Tests](https://github.com/TowerVerse/towerverse.js/actions/workflows/test.yml/badge.svg)](https://github.com/TowerVerse/towerverse.js/actions/workflows/test.yml)
![GitHub](https://img.shields.io/github/license/towerverse/towerverse.js)

A TypeScript/JavaScript library for TowerVerse.
For full documentation, see https://towerverse.github.io/towerverse.js/

## Install

```bash
npm install towerverse.js
```

## Usage

See `./examples` for more.

```js
import { Client } from 'towerverse.js'
// or
const { Client } = require('towerverse.js')

// Create a client
const client = new Client()

// connect to the server
client.connect().then(async () => {
  console.log('Connected to server!')

  // Create an account
  client.createTraveller({
    travellerName: 'John Doe',
    travellerEmail: 'john.doe@example.com',
    // can someone teach john basic security practices?
    travellerPassword: 'password123'
  }).then(() => {
    // You have created an account, and will be sent an email with a code, use `client.traveller.verify('MY_CODE')` to claim your account.
    console.log(`Successfully created traveller '${client.traveller?.name}'`)
  }).catch(err => {
    console.log(err)
  })
})
```

## Tests

Install dependencies and run the mocha tests.

```bash
npm ci
npm run test
```

## Examples

Install dependencies, then use `ts-node` to try an example from the `./examples` directory.

```bash
npm i
ts-node examples/login.ts
```

## Support

*Coming soon*
