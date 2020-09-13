# math-latex-parser
A mathematical parser for latex in math mode. We mean by mathematical that, arithmetic operations are considered. For example, if you pass "1+2", the result would by a (add node "+") with two children nodes of type number.

# Install

```
npm i @scicave/math-latex-parser
```

# Usage

```js
const {parse} = require('@scicave/math-latex-parser'); 

console.log(parse('12+3^6x \\frac 1 {5+3}'));
/*
You ge some thing like this

      (+)
      /\
     /  \
    12  (automult)
           /\
          /  \
         /    \
        /      \
(automult)     (frac)
    /\            /\
   /  \          /  \
 (^)   x         1  (+)
  /\                 /\ 
 /  \               /  \
3    6             5    3
    
*/
```

You can also pass options to the parse function:

```js
console.log(parse(tex, options));
```

# Options

## autoMult: boolean
> Default: `true`

You can parse some thing like this `3^6cd\\sqrt af`, if false, the previous latex expression will throw an error while being parsed.

## singleCharName: boolean
> Default: `true`

if you want to use `asdas{d  }  _ {asdasd123}` as id for variable of function (see options.functions here below), you have to set options.singleCharName to false.

## functions: string []
> Default: []

Acceptable values: Array of checkers, which are functions or regex or another checker[].

this is useful in some cases like, `f(x)`, or `f\left(x\right)`, the function id here is `f`, you can use `blablabla` when singleCharName is `false`.

## operatorNames: checker[]
> Default: [
        "floor", "ceil", "round", "random", "factorial",
        "sech", "csch", "coth", "abs", "arsinh", "arcosh",
        "artanh", "arasinh", "aracosh", "aratanh",
      ]

Acceptable values: Array of checkers, which are functions or regex or another checker[]

Some expressions such as `\operatorname{floor}` are valid, when one of the checkers processes `floor` and return `true`.

## builtInControlSeq: checker[]
> Default: [
      "alpha", "Alpha", "beta", "Beta", "gamma", "Gamma", "pi", "Pi", "varpi", "phi", "Phi",
      "varphi", "mu", "theta", "vartheta", "epsilon", "varepsilon", "upsilon", "Upsilon",
      "zeta", "eta", "Lambda", "lambda", "kappa", "omega", "Omega", "psi", "Psi",
      "chi", "tau", "sigma", "Sigma", "varsigma", "rho", "varrho", "Xi", "xi", "nu",
      "imath", "jmath", "ell", "Re", "Im", "wp", "Nabla", "infty", "aleph", "beth",
      "gimel", "comicron", "iota", "delta", "thetasym", "omicron", "Delta", "Epsilon",
      "Zeta", "Eta", "Theta", "Iota", "Kappa", "Mu", "Nu", "Omicron", "Rho", "Tau", "Chi"
    ]

Acceptable values: Array of checkers, which are functions or regex or another checker[]

## builtInFunctions: checker[]
> Default: [
      "sinh", "cosh", "tanh", 
      "sin", "cos", "tan", "sec", "csc", "cot",
      "arcsin", "arccos", "arctan", "arcsec", "arccsc", "arccot",
      "ln"
    ]

Acceptable values: Array of checkers, which are functions or regex or another checker[]


# License

MIT
