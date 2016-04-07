"use strict"
const resolve = require('eslint-module-utils/resolve').default
    , ModuleCache = require('eslint-module-utils/ModuleCache').default
    , moduleVisitor = require('eslint-module-utils/moduleVisitor')

const status = require('../core/status')


module.exports = function (context) {
  const cacheSettings = ModuleCache.getSettings(context.settings)

  const options = Object.assign(
    { esmodule: true, commonjs: true }, // defaults
    context.options[0])

  return moduleVisitor.default(function checkGitStatus(source) {
    const resolvedPath = resolve(source.value, context)
    if (!resolvedPath) return

    const gitRoot = status.findGitRoot(resolvedPath, cacheSettings)
    if (gitRoot == null) return

    const stati = status.getFileStatuses(gitRoot, cacheSettings)
    if (status.isUntracked(resolvedPath, stati)) {
      context.report(source, `Imported module is currently untracked by Git.`)
    }
  }, options)
}


module.exports.schema = [ moduleVisitor.optionsSchema ]
