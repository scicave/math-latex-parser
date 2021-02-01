const { node } = require('./utils');

module.exports = [
  {
    title: "should throw: when { extra: { memberExpressions:false } }",
    tex: `a.x`,
    parserOptions: { extra: { memberExpressions:false } },
    error: true, errorType: "syntax"
  },

  {
    tex: `a.x`,
    struct: node.mem(["a", "x"])
  },

  {
    tex: `a.x.p`,
    struct: node.mem([node.mem(["a", "x"]), "p"])
  },
  
  {
    tex: "\\sin x.a",
    struct: node.BIF("sin", [node.mem(["x", "a"])])
  },
 
  {
    tex: "(\\sin x).a",
    struct: node.mem([node.BIF("sin", ["x"]), "a"])
  },
 
  {
    tex: "\\left  (\\sin x \\right).a",
    struct: node.mem([node.BIF("sin", ["x"]), "a"])
  },
 
  {
    tex: "\\left  {\\sin x \\right}.a",
    struct: node.mem([
      node.set([node.BIF("sin", ["x"])]),
      "a"
    ])
  },

  {
    tex: "\\frac 1 2 .s()",
    error: true, errorType: "syntax"
  },
];
