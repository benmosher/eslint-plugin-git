"use strict"
const status = require('../core/status')
    , visitor = require('../core/visitor')

module.exports = function (context) {
  return visitor.default(context, function checkGitStatus(source, resolvedPath, stati) {
    if (status.isUntracked(resolvedPath, stati)) {
      context.report(source, `Imported module is currently untracked by Git.`)
    }
  })
}

module.exports.schema = visitor.schema

