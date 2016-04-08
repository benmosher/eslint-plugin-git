"use strict"
exports.__esModule = true

const resolve = require('eslint-module-utils/resolve').default
    , ModuleCache = require('eslint-module-utils/ModuleCache').default
    , moduleVisitor = require('eslint-module-utils/moduleVisitor')

const status = require('./status')

exports.schema = [ moduleVisitor.optionsSchema ]

function gitVisitor(context, visitor) {
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
    visitor(source, resolvedPath, stati)
  }, options)
}
exports.default = gitVisitor

