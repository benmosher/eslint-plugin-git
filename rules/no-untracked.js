"use strict"
const resolve = require('eslint-module-utils/resolve').default
    , ModuleCache = require('eslint-module-utils/ModuleCache').default
    , moduleVisitor = require('eslint-module-utils/moduleVisitor')

const fs = require('fs')
    , path = require('path')
    , child = require('child_process')
    , os = require('os')

module.exports = function (context) {
  const cacheSettings = ModuleCache.getSettings(context.settings)

  return moduleVisitor.default(function checkGitStatus(source) {
    const resolvedPath = resolve(source.value, context)
    if (!resolvedPath) return

    const gitRoot = findGitRoot(resolvedPath, cacheSettings)
    if (gitRoot == null) return

    const untracked = getUntracked(gitRoot, cacheSettings)
    if (untracked.has(resolvedPath)) {
      context.report(source, `Imported module is currently untracked by Git.`)
    }
  })
}

const gitRootCache = new ModuleCache()
function findGitRoot(filepath, cacheSettings) {
  const ppath = path.parse(filepath)

  // base case: directory is its own root
  if (ppath.dir === ppath.root) return null

  let gitRoot = gitRootCache.get(ppath.dir, cacheSettings)
  if (gitRoot !== undefined) return gitRoot

  const siblings = fs.readdirSync(ppath.dir)

  if (siblings.indexOf('.git') >= 0) {
    gitRoot = ppath.dir
  } else {
    // and recurse
    gitRoot = findGitRoot(ppath.dir, cacheSettings)
  }

  gitRootCache.set(ppath.dir, gitRoot)
  return gitRoot
}


const untrackedCache = new ModuleCache()
function getUntracked(gitRoot, cacheSettings) {
  let untracked = untrackedCache.get(gitRoot, cacheSettings)
  if (untracked !== undefined) return untracked

  try {
    const results = child.execSync("git status --porcelain -uall | grep '^??'", { cwd: gitRoot })
    untracked = new Set(results.toString('utf8').split(os.EOL).map(l => path.resolve(gitRoot, l.slice(3))))
  } catch (err) {
    // no untracked
    untracked = new Set()
  }

  untrackedCache.set(gitRoot, untracked)
  return untracked
}

module.exports.schema = [ moduleVisitor.optionsSchema ]
