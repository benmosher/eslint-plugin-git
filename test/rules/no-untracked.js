const path = require('path')
    , touch = require('touch')
    , fs = require('fs')

const RuleTester = require('eslint').RuleTester

const ruleTester = new RuleTester()
    , rule = require('../../rules/no-untracked')

const test = require('../test').default

const cacheTestFile = path.resolve('./test/files/cache-correctness.js')

describe("no-untracked", function () {
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

  ruleTester.run(`ES modules`, rule, {
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
    ],

    invalid: [
      test({
        code: 'import "./untracked"',
        errors: ['Imported module is currently untracked by Git.'],
      }),
    ],
  })

  ruleTester.run('non-ES modules', rule, {

    valid: [
      // amd ignored by default for sourceType === module
      test({ code: 'define(["./untracked"], function (u) {})' }),
      test({ code: 'require(["./untracked"], function (u) {})' }),

      // cjs respects explicit disable
      {
        code: 'var u = require("./untracked")',
        options: [{ commonjs: false }],
        filename: path.resolve('./test/files/index.js'),
      },
    ],

    invalid: [
      // commonjs is enabled by default
      test({ code: 'var u = require("./untracked")', errors: 1 }),
      test({ code: 'require("./untracked")', errors: 1 }),
      {
        code: 'var u = require("./untracked")',
        filename: path.resolve('./test/files/index.js'),
        errors: 1,
      },
      {
        code: 'require("./untracked")',
        filename: path.resolve('./test/files/index.js'),
        errors: 1,
      },
      // cjs
      test({
        code: 'var u = require("./untracked")',
        options: [{ commonjs: true }],
        errors: ['Imported module is currently untracked by Git.'],
      }),
      test({
        code: 'require("./untracked")',
        options: [{ commonjs: true }],
        errors: ['Imported module is currently untracked by Git.'],
      }),

      // amd
      test({
        code: 'define(["./untracked"], function (u) {})',
        options: [{ amd: true }],
        errors: ['Imported module is currently untracked by Git.'],
      }),
      test({
        code: 'require(["./untracked"], function (u) {})',
        options: [{ amd: true }],
        errors: ['Imported module is currently untracked by Git.'],
      }),
    ],

  })
})

describe("cache correctness", function () {
  before("touch file", () => touch.sync(cacheTestFile))

  after("rm file", () => fs.unlinkSync(cacheTestFile))

  // actual test
  ruleTester.run('tests', rule, {
    valid: [],
    invalid: [
      test({
        code: `import "${cacheTestFile}"`,
        settings: { 'import/cache': { lifetime: 0 } },
        errors: 1,
      }),
     ],
  })

})

describe("with no untracked files in scope", function () {

  ruleTester.run('tests', rule, {
    valid: [
      // this exists and is tracked
      test({ code: 'import "./tracked"' }),
      // this no longer exists
      test({ code: 'import "./untracked"' }),
      // this still exists and is gitignore'd
      test({ code: 'import "./ignored"' }),
    ],
    invalid: [],
  })
})
