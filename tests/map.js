const basic = require('./basic');
const autoMult = require('./autoMult');
const functions = require('./functions');
const { node } = require('./utils');

let tests = {
  basic,

  singleChar: {

    basic: [
      {
        tex: `\\sum _ 1 ^\nx -5.6a+ b`,
        struct: node.sum([1,'x',
          node.op('+', [ node.am([-5.6,'a']), 'b' ])
        ]),
      },
      {
        tex: `\\sum ^\tx _ 1 -5.6a+ b`,
        struct: node.sum([1,'x',
          node.op('+', [ node.am([-5.6,'a']), 'b' ])
        ]),
      },
    ],

    autoMult,
  },

  multiChar: {
    autoMult: [],
  },

  options: {
    functions,
  },
};

module.exports = tests;
