const { node } = require("./utils");

module.exports = [

  // ----------------------------------
  //              sets
  // ----------------------------------

  // ----------------------------------
  //             tuples
  // ----------------------------------

  // ----------------------------------
  //            matrices
  // ----------------------------------

  {
    tex: "\\begin{matrix}",
    error: true, errorType: "syntax"
  },

  {
    tex: "\\begin{matrix} 1 & 2 \\\\ a & b \\end{matrix}",
    parserOptions: { extra: { matrices: false } },
    error: true, errorType: "syntax"
  },

  {
    tex: "\\begin{asdmatrix} 1 & 2 \\\\ a & b \\end{asdmatrix}",
    error: true, errorType: "syntax"
  },

  {
    title: "should throw: different matrix type",
    tex: "\\begin{pmatrix} 1 & 2 \\\\ a & b \\end{bmatrix}",
    error: true, errorType: "syntax"
  },

  {
    tex: "\\begin{matrix} 1 & 2 \\\\ a & b \\end{matrix}",
    struct: node.matrix([[1,2], ["a", "b"]], { type: "matrix" })
  },

  {
    Title: "should parse: nested matrices",
    tex: String.raw`
      \begin{pmatrix}
        \begin{matrix}
          1 & 2 \\
          a & b
        \end{matrix} & 2 \\
        a & b
      \end{pmatrix}
    `,
    struct: node.matrix([
      [
        node.matrix([
          [1,2], ["a", "b"]
        ], { matrixType: "matrix" }),
        2
      ],
      ["a", "b"]
    ], { matrixType: "pmatrix" })
  },

  // ----------------------------------
  //            ellipsis
  // ----------------------------------

];