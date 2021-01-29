const pkg = require('../package.json')
const filePath = '../src/version.js'
const version = pkg.version
const path = require('path')
const fs = require('fs')

const code = `
// this file is auto generated
// the current version is:
module.exports = "${version}";
`

fs.writeFileSync(path.resolve(__dirname, filePath), code)
