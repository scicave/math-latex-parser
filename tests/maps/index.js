const basic = require('./basic');
const options__functions = require('./functions');
const singleChar__autoMult = require('./singleChar/autoMult');
const singleChar__basic = require('./singleChar/basic');
const multiChar__autoMult = require("./multiChar/autoMult");

let tests = {
  basic,

  singleChar: {
    basic: singleChar__basic,
    autoMult: singleChar__autoMult,
  },

  multiChar: {
    autoMult: multiChar__autoMult,
  },

  options__functions,
};

module.exports = tests;
