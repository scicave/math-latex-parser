const basic = require('./basic');
const functions = require('./functions');
const autoMult = require('./autoMult');
const memExpr = require('./memExpr');
const extra = require('./extra');

let tests = {
  basic,
  autoMult,
  functions,
  "member expression": memExpr,
  "extra feature": extra,
};

module.exports = tests;
