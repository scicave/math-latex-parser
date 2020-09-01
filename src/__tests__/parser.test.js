const path = require('path');
let pkg = require(path.resolve(process.cwd(), './package.json'));
let parser = require(path.resolve(process.cwd(), pkg.main));


