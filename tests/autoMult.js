const { node } = require('./utils');

module.exports = [

  {
    tex: "-.123^6cd\\sqrt af",
    struct: node.am([
      node.am([
        node.am([
          node.am([
            node.op("^", [-.123,6]),
            "c"
          ]),
          "d"
        ]),
        node.sqrt(['a'])
      ]), 
      "f"
    ]),
  },

  {
    tex: "12+.3^{6}x \\frac 1 {5+3}",
    struct: node.op("+",[
      12,
      node.am([
        node.am([
          node.op("^", [0.3,6]),
          "x"
        ]),
        node.frac([1, node.op("+", [5,3])])
      ])
    ]),
  },

  {
    tex: "12+.3^{6}x \\frac 1 {5+3}{y}",
    struct: node.op("+",[
      12,
      node.am([
        node.am([
          node.am([
            node.op("^", [0.3,6]),
            "x"
          ]),
          node.frac([1, node.op("+", [5,3])])
        ]),
        "y"
      ])
    ]),
  },

  {
    tex: "a+ \\frac 1 {5+3} \\int 12",
    struct: node.op("+",[
      "a",
      node.am([
        node.frac([1, node.op("+", [5,3])]),
        node.int([null, null, 12]),
      ]),
    ]),
  },

  {
    tex: "a+  \\int 12 \\frac 1 {5+3}",
    struct: node.op("+",[
      "a",
      node.int([null,null,
        node.am([
          12,
          node.frac([1, node.op("+", [5,3])]),
        ]),
      ]),
    ]),
  },
]
