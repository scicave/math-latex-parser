const { node } = require('./utils');

module.exports = [

  {
    tex: "\\sin x",
    struct: node.BIF("sin", ['x']),
  },

  {
    tex: "\\sin(x)",
    struct: node.BIF("sin", [node.block("()", ['x'])]),
  },

  {
    tex: `f(x)`,
    parseOptions: { functions: "f" },
    struct: node.F("f",[
      node.block("()", ["x"]),
    ]),
  },

  {
    tex: `f\\left(x\\right)`,
    parseOptions: { functions: "f" },
    struct: node.F("f",[
      node.block("\\left(\\right)", ["x"]),
    ]),
  },

];
