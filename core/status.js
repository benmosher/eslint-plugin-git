"use strict"
exports.__esModule = true

const ModuleCache = require('eslint-module-utils/ModuleCache').default

const fs = require('fs')
    , path = require('path')
    , child = require('child_process')
    , os = require('os')

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
exports.findGitRoot = findGitRoot

const statiCache = new ModuleCache()
function getFileStatuses(gitRoot, cacheSettings) {
  let stati = statiCache.get(gitRoot, cacheSettings)
  if (stati !== undefined) return stati

  try {
    const results = child.execSync("git status --porcelain -uall", { cwd: gitRoot })

    stati = new Map(
      results.toString('utf8')
        .split(os.EOL)
        .map(l => [path.resolve(gitRoot, l.slice(3)), l.slice(0, 2)]))

  } catch (err) {
    // no untracked
    stati = new Map()
  }

  statiCache.set(gitRoot, stati)
  return stati
}
exports.getFileStatuses = getFileStatuses

function isUntracked(path, stati) {
  return stati.get(path) === '??'
}
exports.isUntracked = isUntracked

function hasUnstagedChanges(path, stati) {
  let status = stati.get(path)
  if (status === undefined) return false
  return status[1] === 'M'
}
exports.hasUnstagedChanges = hasUnstagedChanges
