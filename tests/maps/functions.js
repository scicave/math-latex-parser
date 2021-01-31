const { node } = require('./utils');

module.exports = [

  {
    tex: "\\sin x",
    struct: node.BIF("sin", ['x']),
  },

  {
    tex: "\\sin(x)",
    struct: node.BIF("sin", ['x']),
  },

  {
    tex: `f(x)`,
    parserOptions: { functions: "f" },
    struct: node.F("f",["x"]),
  },

  {
    tex: `f\\left(x\\right)`,
    parserOptions: { functions: "f" },
    struct: node.F("f", ["x"]),
  },

];
