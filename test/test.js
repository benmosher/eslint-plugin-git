exports.__esModule = true

const path = require('path')

function test(t) {
  return Object.assign({
    filename: path.resolve('./test/files/index.js'),
    parserOptions: {
      sourceType: 'module',
      ecmaVersion: 6,
    },
    settings: { 'import/cache': { lifetime: 0 } },
  }, t)
}

exports.default = test
