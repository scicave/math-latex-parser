const { node } = require('./utils');

module.exports = [
  {
    tex: "1+2",
    struct: node.op('+', [1, 2]),
  },

  {
    tex: "1*2!-5^3",
    struct: node.op('-', [
      node.op('*', [ 1, node.pOP('!', [2]) ]),
      node.op("^", [ 5, 3 ]),
    ]),
  },

  {
    tex: "- .123*  \n2!+-5.1^.3",
    error: true, // it sould be ^{.3}
  },

  {
    tex: "- .123*  \n2!+-5.1^{.3} \\cdot\\frac{x}2!",
    struct: node.op('+', [
      node.op("*", [
        -0.123,
        node.pOP('!', [2])
      ]),
      node.op('cdot', [
        node.op('^', [ -5.100, 0.3 ]),
        node.pOP('!', [ node.frac(['x', 2]) ]),
      ])
    ]),
  },

];

