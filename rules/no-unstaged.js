"use strict"
const status = require('../core/status')
    , visitor = require('../core/visitor')

module.exports = function (context) {
  return visitor.default(context, function (source, path, stati) {
    if (status.hasUnstagedChanges(path, stati)) {
      context.report(source, `Imported module has unstaged changes.`)
    }
  })
}

module.exports.schema = visitor.schema
