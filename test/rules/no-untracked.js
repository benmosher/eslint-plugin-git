const path = require('path')
    , touch = require('touch')
    , fs = require('fs')

const RuleTester = require('eslint').RuleTester

var ruleTester = new RuleTester()
  , rule = require('../../rules/no-untracked')

function test(t) {
  return Object.assign({
    filename: path.resolve('./test/files/index.js'),
    parserOptions: {
      sourceType: 'module',
      ecmaVersion: 6,
    },
  }, t)
}

ruleTester.run(`no-untracked`, rule, {
  valid: [
    test({ code: 'import "./tracked"' }),
    // todo: test something not under source control
  ],

  invalid: [],
})

describe('untracked', function () {
  const files = [
    path.resolve('./test/files/ignored.js'),
    path.resolve('./test/files/untracked.js'),
  ]

  before("create untracked files", function () {
    files.forEach(f => touch.sync(f))
  })

  after("remove untracked files", function () {
    files.forEach(f => fs.unlinkSync(f))
  })

  ruleTester.run(`no-untracked (untracked files)`, rule, {
    valid: [
      // this is gitignore'd
      test({ code: 'import "./ignored"' }),
    ],

    invalid: [
      test({
        code: 'import "./untracked"',
        errors: ['Imported module is currently untracked by Git.'],
      }),
    ],
  })
})

