const path = require('path')
    , touch = require('touch')
    , fs = require('fs')
    , execSync = require('child_process').execSync

const RuleTester = require('eslint').RuleTester

const ruleTester = new RuleTester()
    , rule = require('../../rules/no-unstaged')

const test = require('../test').default

const cacheTestFile = path.resolve('./test/files/cache-correctness.js')

describe("no-unstaged (untracked + unmodified)", function () {
  const untrackedFiles = [
    path.resolve('./test/files/ignored.js'),
    path.resolve('./test/files/untracked.js'),
  ]

  before("create untracked files", function () {
    untrackedFiles.forEach(f => touch.sync(f))
  })

  after("remove untracked files", function () {
    untrackedFiles.forEach(f => fs.unlinkSync(f))
  })

  ruleTester.run(`test`, rule, {
    valid: [
      // this exists and is tracked
      test({ code: 'import "./tracked"' }),
      // this exists and is gitignore'd
      test({ code: 'import "./ignored"' }),
      // core modules are fine
      test({ code: 'import "fs"' }),
      // out of scope`
      test({ code: 'import "/bin/sh"' }),
      // this doesn't exist (yet)
      test({ code: `import "${cacheTestFile}"`}),

      // disabled esmodule
      test({
        code: 'import "./untracked"',
        options: [{ esmodule: false }],
      }),

      // ignores untracked
      test({ code: 'import "./untracked"' }),
    ],

    invalid: [],
  })
})


describe("modifying tracked file", function () {
  const tracked = path.resolve('./test/files/tracked.js')

  before("modify tracked file",
    () => fs.writeFileSync(tracked, "shoop"))

  after("reset", () => execSync(`git checkout -- ${tracked}`))

  ruleTester.run(`test`, rule, {
    valid: [
      // disabled esmodule
      test({
        code: 'import "./tracked"',
        options: [{ esmodule: false }],
      }),
      // disabled commonjs
      test({
        code: 'require("./tracked")',
        options: [{ commonjs: false }],
      }),
    ],

    invalid: [
      // this exists and is tracked
      test({
        code: 'import "./tracked"',
        errors: 1,
      }),
      test({
        code: 'require("./tracked")',
        errors: 1,
      }),
    ],
  })
})
