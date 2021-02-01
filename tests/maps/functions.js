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

  {
    tex: '\\operatorname \\theta(1)',
    struct: node.opname(
      node.id("theta", { isBuiltin: true }),
      [1]  
    )
  },

  {
    tex: '\\operatorname {\\theta} (1)',
    struct: node.opname(
      node.id("theta", { isBuiltin: true }),
      [1]  
    )
  },

  {
    tex: '\\operatorname a(1)',
    struct: node.opname("a", [1])
  },

  {
    tex: '\\operatorname { a }(1)',
    struct: node.opname("a", [1])
  },

  {
    tex: '\\operatorname { 1 }(1)',
    error: true, errorType: "syntax"
  },

  {
    tex: '\\operatorname . (1)',
    error: true, errorType: "syntax"
  },

];
