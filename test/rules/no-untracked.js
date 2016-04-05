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

  const cacheTestFile = path.resolve('./test/files/cache-correctness.js')

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
      // out of scope`
      test({ code: 'import "/some/root/fake/thing"' }),
      // this doesn't exist (yet)
      test({ code: `import "${cacheTestFile}"`}),
    ],

    invalid: [
      test({
        code: 'import "./untracked"',
        errors: ['Imported module is currently untracked by Git.'],
      }),
    ],
  })

  describe("cache correctness", function () {

    const testDesc = test({
      code: `import "${cacheTestFile}"`,
      settings: { 'import/cache': { lifetime: 1 } },
    })

    before("touch file", () => touch.sync(cacheTestFile))
    before("wait for cache lifetime to expire", done => setTimeout(done, 1100))

    after("rm file", () => fs.unlinkSync(cacheTestFile))

    // actual test
    ruleTester.run('tests', rule,
      { valid: [], invalid: [ Object.assign({ errors: 1}, testDesc) ] })

  })
})
