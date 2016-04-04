"use strict"
const moduleUtils = require('eslint-module-utils')
    , moduleVisitor = require('eslint-module-utils/moduleVisitor')

const fs = require('fs')
    , path = require('path')
    , child = require('child_process')
    , os = require('os')

// todo:
// 1. find ancestral .git folder, cache
// 2. git status --porcelain -uall | grep '^??' (once per .git container? cache?)
// 3. check for resolved path in untracked set for relevant repo
//
// note: will return a non-zero exit code for files outside the repo

module.exports = function (context) {
  return moduleVisitor.default(function checkGitStatus(source) {
    const resolvedPath = moduleUtils.resolve(source.value, context)
    if (!resolvedPath) return

    const gitRoot = findGitRoot(path.dirname(resolvedPath))
    if (gitRoot == null) return

    const untracked = getUntracked(gitRoot)
    if (untracked.has(resolvedPath)) {
      context.report(source, `Imported module is currently untracked by Git.`)
    }
  })
}

// todo: cache
function findGitRoot(dirpath) {
  const siblings = fs.readdirSync(dirpath)

  if (siblings.indexOf('.git') >= 0) return dirpath

  if (isRootPath(dirpath)) return null
  else return findGitRoot(path.dirname(dirpath))
}

// todo: replace with a dependency
function isRootPath(path) {
  return (path === '/')
}

// todo: cache per gitRoot
function getUntracked(gitRoot) {
  // todo: handle error
  const results = child.execSync("git status --porcelain -uall | grep '^??'", { cwd: gitRoot })
  return new Set(results.toString('utf8').split(os.EOL).map(l => path.resolve(gitRoot, l.slice(3))))
}

module.exports.schema = [ moduleVisitor.optionsSchema ]
