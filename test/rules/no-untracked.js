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

describe("main tests", function () {
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

  ruleTester.run(`no-untracked`, rule, {
    valid: [
      // this exists and is tracked
      test({ code: 'import "./tracked"' }),
      // this exists and is gitignore'd
      test({ code: 'import "./ignored"' }),
      // core modules are fine
      test({ code: 'import "fs"' }),
      // out of scope
      test({ code: 'import "/some/root/fake/thing"' }),
    ],

    invalid: [
      test({
        code: 'import "./untracked"',
        errors: ['Imported module is currently untracked by Git.'],
      }),
    ],
  })
})
