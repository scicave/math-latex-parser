const basic = require('./basic');
const functions = require('./functions');
const autoMult = require('./autoMult');
const memExpr = require('./memExpr');

let tests = {
  basic,
  autoMult,
  functions,
  "member expression": memExpr,
};

module.exports = tests;
