"use strict"

const assert = require('assert')

const fs = require('fs')
    , path = require('path')

describe("package", function () {
  let rules, packageObj
  before("load the rules", function () {
    rules = fs.readdirSync('rules').map(f => path.parse(f).name)
    packageObj = require(path.resolve('.'))
  })

  it("has all the rules", function () {
    rules.forEach(r => assert(r in packageObj.rules, `${r} in packageObj`))
    rules.forEach(r => assert(typeof packageObj.rules[r] === 'function', `${r} is function`))
  })

})
