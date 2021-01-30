class NodeCreator {
  // take a look at the valid Node types at src/Node.js
  constructor() {
    this.ellipsis = { type: "ellipsis" };
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
    return { type: "function", name, isBuiltin: true, args };
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

  paren(args) {
    // frac
    if (!Array.isArray(args))
      this.invalidArgs("parenthese");
    return { type: "parenthese", args };
  }

  op(name, args) {
    // operator
    if (
      typeof name !== "string" ||
      !Array.isArray(args)
    )
      this.invalidArgs("operator");
    return { type: "operator", name, args };
  }

  pOP(name, args) {
    // postfix operator
    if (
      typeof name !== "string" ||
      !Array.isArray(args)
    )
      this.invalidArgs("postfix operator");
    return { type: "operator", name, args, operatorType: "postfix" };
  }

  am(args) {
    if (!Array.isArray(args)) this.invalidArgs("automult");
    return { type: "automult", args };
  }

  mem(args) {
    if (!Array.isArray(args)) this.invalidArgs("member expression");
    return { type: "member expression", args };
  }
}

exports.node = new NodeCreator();
