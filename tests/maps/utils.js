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
      !Array.isArray(args)
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

  paren(args) {
    // frac
    if (!Array.isArray(args))
      this.invalidArgs("parenthese");
    return { type: "parenthese", args };
  }

  abs(args) {
    if (!Array.isArray(args) || args.length !== 1) this.invalidArgs("abs");
    return { type: "abs", args };
  }

  tuple(args) {
    if (!Array.isArray(args)) this.invalidArgs("tuple");
    return { type: "tuple", args };
  }

  set(args) {
    if (!Array.isArray(args)) this.invalidArgs("set");
    return { type: "set", args };
  }

  interval(args, extra = {}) {
    if (
      !Array.isArray(args) ||
      args.length !== 2 ||
      typeof extra !== "object"
    ) { this.invalidArgs("interval") }
    return { type: "interval", args, ...extra };
  }

  matrix(args, extra = {}) {
    if (
      !Array.isArray(args) ||
      args.find((i) => !Array.isArray(i)) ||
      typeof extra !== "object"
    ) { this.invalidArgs("matrix") }
    return { type: "matrix", args, ...extra };
  }
}

exports.node = new NodeCreator();
