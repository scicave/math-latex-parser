// TODO: parse comments such as % for commenting line  

{
  
  options = Object.assign({
    autoMult: true,
    functions: [],
    singleCharName: true,
    operatorNames: // this is for something like this: \operatorname{floor}
      [
        "floor", "ceil", "round", "random", "factorial",
        "sech", "csch", "coth", "abs", "arsinh", "arcosh",
        "artanh", "arasinh", "aracosh", "aratanh",
      ],
          
    builtInControlSeq: [
      "alpha", "Alpha", "beta", "Beta", "gamma", "Gamma", "pi", "Pi", "varpi", "phi", "Phi",
      "varphi", "mu", "theta", "vartheta", "epsilon", "varepsilon", "upsilon", "Upsilon",
      "zeta", "eta", "Lambda", "lambda", "kappa", "omega", "Omega", "psi", "Psi",
      "chi", "tau", "sigma", "Sigma", "varsigma", "rho", "varrho", "Xi", "xi", "nu",
      "imath", "jmath", "ell", "Re", "Im", "wp", "Nabla", "infty", "aleph", "beth",
      "gimel", "comicron", "iota", "delta", "thetasym", "omicron", "Delta", "Epsilon",
      "Zeta", "Eta", "Theta", "Iota", "Kappa", "Mu", "Nu", "Omicron", "Rho", "Tau", "Chi"
    ],

    builtInFunctions: [ // the same as the rul builtInFuncsTitles
      "sinh", "cosh", "tanh", 
      "sin", "cos", "tan", "sec", "csc", "cot",
      "arcsin", "arccos", "arctan", "arcsec", "arccsc", "arccot",
      "ln"
    ]

  }, options); /// override the default options

  // these are the latex control sequences used outside the
  // Factor rule,,, you can notice they are used as operators
  var ignoreSpacialSymbols = [
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
      return rule(value, location());
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
  head:Operation2 tail:(_ ("\\" title:texOperators1 !char { return title; }) _ Operation2)* _{
    return tail.reduce(function(result, element) {
      return createNode("operator" , [result, element[3]], { name: element[1], operatorType: 'infix' });
    }, head);
  }

/// the same as options.texOperators1
texOperators1 = "approx"/ "leq"/ "geq"/ "neq"/ "gg"/ "ll"/ "notin"/ "ni"/ "in"

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

operation4Simple "operation or factor" = // for builtInFunctionsArg
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
  base:factorWithoutNumber _ exp:SuperScript? _ fac:factorial? {
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
  = factorWithoutNumber / Number

factorWithoutNumber =
  Functions / BlockParentheses / Block_VBars /
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
  "\\" name:(
    n:builtInFuncsTitles !char {return n;} /
    "operatorname" _ n:("{" _ n:OperatorName "}" {return n;} / !char char){
      if(!options.operatorNames.indexOf(n)>-1)
        error("function name \"" + n + "\" is invalid!");
      return n;
    }
  ) _ exp:SuperScript? _ arg:builtInFunctionsArg {
    let func = new Node('function', [arg], {name, isBuiltIn:true});
    if(!exp) return func;
    else return createNode("operator", [func, exp], { name: '^', operatorType: 'infix' });
  }

builtInFunctionsArg = Functions / BlockParentheses / operation4Simple

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

SpecialTexRules = Sqrt / Integeral / Frac

Sqrt = "\\sqrt" !char _
        exp:SquareBrackets? _
        arg:Arg
  {
    // exp = exp || createNode("number", null, {value:2});
    return exp ? createNode("sqrt", [arg, exp]) : createNode("sqrt", [arg]);
  }

Integeral = "\\" n:("int" / "sum" / "prod") !char _
        subsup:(
          sub:SubScript? _ sup:SuperScript? { return [sub, sup]; } /
          sup:SuperScript? _ sub:SubScript? { return [sub, sup]; }
        ) _ arg:Expression
  {
    return createNode(n, [...subsup, arg]);
  }

Frac = "\\frac" !char _ 
  args:(frst:Arg _ scnd:Arg { return [frst, scnd]; })
  { return createNode("frac", args); }

///////////////////

SuperScript "superscript"= "^" _ arg:(Arg) {return arg;}

SubScript "subscript"= "_" _ arg:(Arg) {return arg;}

Arg "function argument"= CurlyBrackets / Frac / SpecialSymbols / oneCharArg

oneCharArg "digit or char" = [a-z0-9]i {
    let txt = text();
    if(isNaN(txt)){
      return createNode("id", null, { name: txt });
    } else {
      return createNode("number", null, {value:parseFloat(txt)});
    }
  } / SpecialSymbols;



//////      //////
//////        //////
//////           //////

Number "number"
  = sign:sign? _ $SimpleNumber {
    let value = parseFloat(text().replace(/[ \t\n\r]/g, ''));
    return createNode('number', null, {value});
  }

SimpleNumber "number"
  = (num:[0-9]([0-9]/s)* frac? / frac) {
    let value = parseFloat(text().replace(/[ \t\n\r]/g, ''));
    return createNode('number', null, {value});
  }

frac
  = "." _ [0-9]([0-9]/s)*

sign
  = '-' / '+'

//////      //////
//////        //////
//////           //////

Name "name" = (
    mini_name (_ "_" _ ("{" _ w(w/s)* _ "}" / w))?
  ) {
    let name = text().replace(/[\s\{\}]*/g, ''); 
    return createNode('id', null, {name})
  }

mini_name =
  &{ return options.singleCharName } char /
  char(char / s)*

OperatorName = 
  ( char(char / s)* _ "_" _ "{" sub:(_ w(w/s)*) "}"
  / char(char / s)* _ "_" _ sub:w
  / char(char / s)* ) {
    return text().replace(/[\s\{\}]*/g, ''); 
  }
  
SquareBrackets = "[" _ expr:Expression "]" { return expr; }
CurlyBrackets = "{" _ expr:Expression "}" { return expr; }

//////      //////
//////        //////
//////           //////
// primitives

w "letter or digit" = [a-zA-Z0-9]

char "letter"  = [a-zA-Z]

nl "newline" = "\n" / "\r\n" / "\r" / "\u2028" / "\u2029"

sp "space or tab"= [ \t]

s "whitespace" = nl / sp

escapedSpace = "\\ "

_ "whitespace"
  = (nl !nl / sp / escapedSpace)*

factorial = "!" 

//////      //////
//////        //////
//////           //////
// definitions

builtInFuncsTitles = // the same as builtInFunctions
  "sinh"      / "cosh"    / "tanh"    / 
  "sin"       / "cos"     / "tan"     / "sec"     / "csc"     / "cot"     /
  "arcsin"    / "arccos"  / "arctan"  / "arcsec"  / "arccsc"  / "arccot"  /
  "ln"

/// this may be operator, if so, don't consider as specialSymbol 
specialSymbolsTitles = a:[a-z]i+ &{ return !check(a.join(''), ignoreSpacialSymbols); }
  {
    let name = text();
    if(check(name, options.builtInControlSeq)) return name;
    if (check(name, [
        options.builtInFunctions,
        options.functions,
        ['sqrt', 'int', 'sum', 'prod']
    ])) {
      error(`"${name}" is used with no arguments arguments! it can't be used as variable!`);
    }
    error('undefined control sequence "' + name + '"');
  }
  

