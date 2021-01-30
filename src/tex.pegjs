// TODO: parse comments such as % for commenting line  
// TODO: Parse MemberExpression
// TODO: sets, { 1,2, ...,3 }
// TODO: tuples, ( 1,2, , , ...,3 )
// TODO: intervals, [1, 2)
// TODO: matrices, \begin{bmatrix} 1 & 2 & 3 \end{bmatrix}

{
  {
    let defaultConSeq = [
      "alpha", "Alpha", "beta", "Beta", "gamma", "Gamma", "pi", "Pi", "varpi", "phi", "Phi",
      "varphi", "mu", "theta", "vartheta", "epsilon", "varepsilon", "upsilon", "Upsilon",
      "zeta", "eta", "Lambda", "lambda", "kappa", "omega", "Omega", "psi", "Psi",
      "chi", "tau", "sigma", "Sigma", "varsigma", "rho", "varrho", "Xi", "xi", "nu",
      "imath", "jmath", "ell", "Re", "Im", "wp", "Nabla", "infty", "aleph", "beth",
      "gimel", "comicron", "iota", "delta", "thetasym", "omicron", "Delta", "Epsilon",
      "Zeta", "Eta", "Theta", "Iota", "Kappa", "Mu", "Nu", "Omicron", "Rho", "Tau", "Chi"
    ];

    // default builtin functions
    let defaultBIFs = [
      "sinh", "cosh", "tanh", 
      "sin", "cos", "tan", "sec", "csc", "cot",
      "arcsin", "arccos", "arctan", "arcsec", "arccsc", "arccot",
      "ln"
    ];

    // don't import defaults from a module, because we should clone it deeply
    // so let's create new defaults object every time parse is invoked
    let defaultOptions = {
      // singleCharName: true, // obselete
      /* operatorNames: // this is for something like this: \operatorname{floor} */
      /*   [ */
      /*     "floor", "ceil", "round", "random", "factorial", */
      /*     "sech", "csch", "coth", "abs", "arsinh", "arcosh", */
      /*     "artanh", "arasinh", "aracosh", "aratanh", */
      /*   ], */
      autoMult: true,
      functions: [],
      keepParen: false,
      builtinControlSeq: defaultConSeq,
      builtinFunctions: defaultBIFs,
    };

    options = merge(defaultOptions, options); /// override the default options

    if (options.builtinFunctions[0] === '...')
      // replace the three dots with the default things.
      options.builtinFunctions.splice(0, 1, ...defaultBIFs);

    if (options.builtinControlSeq[0] === '...')
      // replace the three dots with the default things.
      options.builtinControlSeq.splice(0, 1, ...defaultConSeq);
  }

  // they are static, shouldn't be controlled by options
  var infixOperatorsConSeq = [
    "approx", "leq", "geq", "neq", "gg", "ll",
    "notin", "ni", "in", "cdot", "right"
  ];

  let rawInput = input; 

  text = function() {
    return rawInput.substring(peg$savedPos, peg$currPos);
  }

  input = prepareInput(input, peg$computeLocation, error);

  function createNode(...args){
    let n = new Node(...args);
    n.match = {
      text: text(),
      location: location()
    }
    return n;
  }

  function check(value, rule) {
    if (rule instanceof Array) {
      for (let i=0; i<rule.length; i++) {
        if (check(value, rule[i])) return true;  
      }
    } else if (rule instanceof Function) {
      return rule(value);
    } else if (rule instanceof RegExp) {
      return rule.test(value);
    } else {
      return value === rule;
    }
  }
}

Expression "expression" = _ expr:Operation0 _ { return expr; }

Operation0 "operation or factor" = 
  head:Operation1 tail:(_ "=" _ Operation1)* _{
    return tail.reduce(function(result, element) {
      return createNode("operator" , [result, element[3]], { name: element[1], operatorType: 'infix' });
    }, head);
  }

Operation1 "operation or factor" = 
  head:Operation2 tail:(_ ("\\" title:texOperators1 !char { return title }) _ Operation2)* _{
    return tail.reduce(function(result, element) {
      return createNode("operator" , [result, element[3]], { name: element[1], operatorType: 'infix' });
    }, head);
  }

/// the same as options.texOperators1
texOperators1 = w:word &{ return w in infixOperatorsConSeq } { return w }

Operation2 "operation or factor" =
  head:Operation3 tail:(_ ("+" / "-") _ Operation3)* {
    return tail.reduce(function(result, element) {
      return createNode("operator" , [result, element[3]], { name: element[1], operatorType: 'infix' });
    }, head);
  }

Operation3 "operation or factor" =
  head:Operation4 tail:(_ ("*" / "/" / "\\cdot" !char { return "cdot"; }) _ Operation4)* {
    return tail.reduce(function(result, element) {
      return createNode("operator" , [result, element[3]], { name: element[1], operatorType: 'infix' });
    }, head);
  }

Operation4 "operation or factor" =
  head:(Operation5) tail:(_ operation5WithoutNumber)* {
    if(options.autoMult){
      return tail.reduce(function(result, element) {
        return createNode("automult" , [result, element[1]]);
      }, head);
    } else {
      error('invalid syntax, hint: missing * sign');
    }
  }

operation4Simple "operation or factor" = // for builtinFunctionsArg
  head:(operation5Simple) tail:(_ operation5Simple)* {
    if(options.autoMult){
      return tail.reduce(function(result, element) {
        return createNode("automult" , [result, element[1]]);
      }, head);
    } else {
      error('invalid syntax, hint: missing * sign');
    }
  }
  
Operation5 "operation or factor" =
  base:Factor _ exp:SuperScript? _ fac:factorial? {
    if (exp) base = new Node("operator", [base, exp], { name: '^', operatorType: 'infix' });
    if (fac) base = new Node("operator", [base], { name: '!', operatorType: 'postfix' });
    return base;
  }

operation5WithoutNumber "operation or factor" =
  base:factorNotNumber _ exp:SuperScript? _ fac:factorial? {
    if (exp) base = new Node("operator", [base, exp], { name: '^', operatorType: 'infix' });
    if (fac) base = new Node("operator", [base], { name: '!', operatorType: 'postfix' });
    return base;
  }

operation5Simple = // for operation4Simple
  base:simpleFactor _ exp:SuperScript? _ fac:factorial? {
    if (exp) base = new Node("operator", [base, exp], { name: '^', operatorType: 'infix' });
    if (fac) base = new Node("operator", [base], { name: '!', operatorType: 'postfix' });
    return base;
  }

Factor
  = factorNotNumber / Number

factorNotNumber =
  MemberExpression / Functions / BlockParentheses / Block_VBars /
  Name / TexEntities

simpleFactor = // for operation5Simple
  Number/ Block_VBars /* || === abs() */ /
  Name / TexEntities /* \theta, \sqrt{x}, \int, ... */

Delimiter
  = head:Expression tail:(_ "," _ Expression)* {
      if (tail.length){
        return createNode("delimiter", [head].concat(tail.map(a => a[3])), { name: ',' });
      }
      return head;
    }

Functions "functions" =
  BuiltInFunctions / Function

BuiltInFunctions =
  "\\" name:builtinFuncsTitles
  _ exp:SuperScript? _ args:builtinFunctionsArgs
  {
    if (!Array.isArray(args)) args =
    let func = new Node('function', args, {name, isBuiltIn:true});
    if(!exp) return func;
    else return createNode("operator", [func, exp], { name: '^', operatorType: 'infix' });
  } /
  "\\operatorname" _ n:$("{" _ $Name _ "}" / ws char) _ arg:functionParentheses {
    let opname = n.replace(/\s*/g, '');
    return createNode("operatorname", [arg])
  }

builtinFuncsTitles =
  name:word
  &{ return check(name, options.builtinFunctions) } {
    return name;
  }

builtinFunctionsArgs = Functions / Block_VBars / functionParentheses / operation4Simple

Function = 
  name:$Name &{ return check(name, options.functions); } _ parentheses:BlockParentheses 
  { return createNode('function', [parentheses], { name }); }

BlockParentheses =
  data:(
    "(" s:Delimiter ")" {return ["()", s];} /
    "\\left"_"(" s:Delimiter "\\right"_")" {return ["\\left(\\right)", s];}
  ) { return createNode('block', [data[1]], { name: data[0] }); }

Block_VBars =
  data:(
    "|" e:Expression "|" {return ["||", e];} /
    "\\left"_"|" e:Expression "\\right"_"|" {return ["\\left|\\right|", e];}
  ) { return createNode('block', [data[1]], { name: data[0] }); }

////// main factor, tokens

TexEntities =
    SpecialTexRules / SpecialSymbols  

SpecialSymbols = "\\" name:specialSymbolsTitles !char {
  return createNode('id', null, {name, isBuiltIn:true})
}

/// this may be operator, if so, don't consider as specialSymbol 
specialSymbolsTitles =
  a:word
  &{ return !(a in infixOperatorsConSeq) }
  {
    let name = text();
    if(check(name, options.builtinControlSeq)) return name;
    if (check(name, [
        options.builtinFunctions,
        options.functions,
        ['sqrt', 'int', 'sum', 'prod']
    ])) {
      error(`"${name}" is used with no arguments arguments! it can't be used as variable!`);
    }
    error('undefined control sequence "' + name + '"');
  }
  
SpecialTexRules = Sqrt / IntSumProd / Frac

Sqrt =
  "\\sqrt" !char _
  exp:SquareBrackets? _
  arg:Arg
  {
    // exp = exp || createNode("number", null, {value:2});
    return exp ? createNode("sqrt", [arg, exp]) : createNode("sqrt", [arg]);
  }

IntSumProd = "\\" n:("int" / "sum" / "prod") !char _
        subsup:(
          &(_ "_") sub:SubScript? _ sup:SuperScript? { return [sub, sup]; } /
          sup:SuperScript? _ sub:SubScript? { return [sub, sup]; }
        ) _ arg:Expression
  {
    subsup.push(arg);
    return createNode(n, subsup);
  }

Frac = "\\frac" !char _ 
  args:(first:Arg _ second:Arg { return [first, second]; })
  { return createNode("frac", args); }

oneCharArg "digit or char" = w {
    let txt = text();
    if(isNaN(txt)){
      return createNode("id", null, { name: txt });
    } else {
      return createNode("number", null, {value:parseFloat(txt)});
    }
  } / SpecialSymbols;

// -----------------------------------
//         member expressions
// -----------------------------------

MemberExpression =
  // left to right
  head:memberArg tail:(_ "."  _ memberArg)* {
    // reduce from left to right, ltr
    return tail.reduce(function(result, element) {
      return createNode("member expression" , [result, element[3]]);
    }, head);
  }

// not member expression
memberArg = Function / Name

// -----------------------------------
//             names
// -----------------------------------

Name "name" =
  name:char sub:subName?
  {
    let n = createNode('id', null, {name})
    if (sub) n.sub = sub;
    return n;
  }

subName =
  _ "_" _ w:w { return w } /
  _ "_" _ "{" _ n:name _ "}" { return n }

w "letter or number"  = [a-zA-Z0-9]

char "letter"  = [a-zA-Z]

word = [a-zA-Z]+ { return text() }

// -----------------------------------
//             numbers
// -----------------------------------

Number "number"
  = sign:sign? _ $simpleNumber {
    let value = parseFloat(text().replace(/[ \t\n\r]/g, ''));
    return createNode('number', null, {value});
  }

simpleNumber "number"
  = (num:[0-9]([0-9]/s)* frac? / frac)

frac
  = "." _ [0-9]([0-9]/s)*

sign
  = '-' / '+'

// -----------------------------------
//              atoms
// -----------------------------------
  
SquareBrackets = "[" _ expr:Expression "]" { return expr; }
CurlyBrackets = "{" _ expr:Expression "}" { return expr; }

SuperScript "superscript" = "^" _ arg:(Arg) {return arg;}
SubScript "subscript" = "_" _ arg:(Arg) {return arg;}

Arg "function argument" = CurlyBrackets / Frac / SpecialSymbols / oneCharArg

// -----------------------------------
//            primitives
// -----------------------------------

factorial = "!" 

nl "newline" = "\n" / "\r\n"
sp "space or tab"= [ \t]
ws "whitespace" = nl / sp
escapedSpace = "\\ "
_ "whitespace"
  = ws*
