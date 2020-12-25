class NodeCreator {
  constructor(options) {
    this.setOptions(options);
  }

  setOptions(options = {}) {
    // the same exsits inside the parser `../tex.pegjs`
    this.options = Object.assign(
      {
        autoMult: true,
        functions: [],
        singleCharName: true,

        // prettier-ignore
        infixOperators: [
        '+', '-', '*', '^', '/', 'cdot', "approx", "leq", "geq",
        "neq", "gg", "ll", "notin", "ni", "in",
      ],

        postfixOperators: ["!"],

        // prettier-ignore
        // this is for something like this: \operatorname{floor}
        operatorNames: // this is for something like this: \operatorname{floor}
        [
          "floor", "ceil", "round", "random", "factorial",
          "sech", "csch", "coth", "abs", "arsinh", "arcosh",
          "artanh", "arasinh", "aracosh", "aratanh",
        ],

        // prettier-ignore
        builtInControlSeq: [
        "alpha", "Alpha", "beta", "Beta", "gamma", "Gamma", "pi", "Pi", "varpi", "phi", "Phi",
        "varphi", "mu", "theta", "vartheta", "epsilon", "varepsilon", "upsilon", "Upsilon",
        "zeta", "eta", "Lambda", "lambda", "kappa", "omega", "Omega", "psi", "Psi",
        "chi", "tau", "sigma", "Sigma", "varsigma", "rho", "varrho", "Xi", "xi", "nu",
        "imath", "jmath", "ell", "Re", "Im", "wp", "Nabla", "infty", "aleph", "beth",
        "gimel", "comicron", "iota", "delta", "thetasym", "omicron", "Delta", "Epsilon",
        "Zeta", "Eta", "Theta", "Iota", "Kappa", "Mu", "Nu", "Omicron", "Rho", "Tau", "Chi"
      ],

        // prettier-ignore
        builtInFunctions: [
        "sinh", "cosh", "tanh", 
        "sin", "cos", "tan", "sec", "csc", "cot",
        "arcsin", "arccos", "arctan", "arcsec", "arccsc", "arccot",
        "ln"
      ],
      },
      options
    ); /// override the default options
  }

  invalidArgs(fname) {
    throw new Error("Invalid argument passed to: ") + fname;
  }

  BIF(name, args) {
    // builtin function
    if (
      typeof name !== "string" ||
      !Array.isArray(args) ||
      this.options.builtInFunctions.indexOf(name) === -1
    )
      this.invalidArgs("builtin function");
    return { type: "function", name, isBuiltIn: true, args };
  }

  F(name, args) {
    // function
    if (typeof name !== "string" || !Array.isArray(args))
      this.invalidArgs("function");
    return { type: "function", name, args };
  }

  frac(args) {
    // frac
    if (!Array.isArray(args)) this.invalidArgs("frac");
    return { type: "frac", args };
  }

  sum(args) {
    if (!Array.isArray(args)) this.invalidArgs("sum");
    return { type: "sum", args };
  }

  int(args) {
    if (!Array.isArray(args)) this.invalidArgs("int");
    return { type: "int", args };
  }

  sqrt(args) {
    if (!Array.isArray(args)) this.invalidArgs("sqrt");
    return { type: "sqrt", args };
  }

  block(name, args) {
    // frac
    if (typeof name !== "string" || !Array.isArray(args))
      this.invalidArgs("block");
    return { type: "block", name, args };
  }

  op(name, args) {
    // operator
    if (
      typeof name !== "string" ||
      this.options[`infixOperators`].indexOf(name) === -1 ||
      !Array.isArray(args)
    )
      this.invalidArgs("operator");
    return { type: "operator", name, args };
  }

  pOP(name, args) {
    // postfix operator
    if (
      typeof name !== "string" ||
      this.options[`postfixOperators`].indexOf(name) === -1 ||
      !Array.isArray(args)
    )
      this.invalidArgs("postfix operator");
    return { type: "operator", name, args, operatorType: "postfix" };
  }

  am(args) {
    if (!Array.isArray(args)) this.invalidArgs("automult");
    return { type: "automult", args };
  }
}

exports.node = new NodeCreator();
