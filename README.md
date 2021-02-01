# math-latex-parser
A mathematical parser for latex in math mode. We mean by mathematical that, arithmetic operations are considered. For example, if you pass "1+2", the result would by a (add node "+") with two children nodes of type number.

**See also:** [math-parser](https://github.com/scicave/math-parser).

## Install

```
npm i @scicave/math-latex-parser
```

## Usage

Browser

```html
<script src="https://cdn.jsdelivr.net/npm/@scicave/math-latex-parser/lib/bundle.js"></script>
<!-- or -->
<script src="https://cdn.jsdelivr.net/npm/@scicave/math-latex-parser/lib/bundle.min.js"></script>
```

-------------------

```js
console.log(parse(tex, options));
```

```js
const {parse} = require('@scicave/math-latex-parser'); 
console.log(parse('12+3^6x \\frac 1 {5+3}'));
```

![AST](./assets/AST.png)

## Contribute

Feel free to refactor code, enhance the performance,
suggest better AST structure. I love open-source stuff ❤️.

See `(package.json).scripts`.

```sh
❯ npm install
❯ npm start # watch and built
❯ # open another terminal:
❯ npm run test:watch # test after builing
```

## Operators Schema

<table>
  <thead>
    <tr>
      <td><strong>Operator</strong></td>
      <td><strong>Precedence</strong></td>
      <td><strong>Associativity</strong></td>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>!</code></td>
      <td>5</td>
      <td>N/A</td>
    </tr>
    <tr>
      <td><code>^</code></td>
      <td>4</td>
      <td>left-to-right</td>
    </tr>
    <tr>
      <td><code>*</code></td>
      <td rowspan="2">3</td>
      <td rowspan="2">left-to-right</td>
    </tr>
    <tr>
      <td><code>/</code></td>
    </tr>
    <tr>
      <td><code>+</code></td>
      <td rowspan="2">2</td>
      <td rowspan="2">left-to-right</td>
    </tr>
    <tr>
      <td><code>-</code></td>
    </tr>
    <tr>
      <td><code>=</code></td>
      <td rowspan="100">1</td>
      <td rowspan="100">left-to-right</td>
    </tr>
    <tr>
      <td><code>\neq</code></td>
    </tr>
    <tr>
      <td><code>\approx</code></td>
    </tr>
    <tr>
      <td><code>\eqsim</code></td>
    </tr>
    <tr>
      <td><code>\simeq</code></td>
    </tr>
    <tr>
      <td><code>\ge</code></td>
    </tr>
    <tr>
      <td><code>\geq</code></td>
    </tr>
    <tr>
      <td><code>\geqq</code></td>
    </tr>
    <tr>
      <td><code>\geqslant</code></td>
    </tr>
    <tr>
      <td><code>\gg</code></td>
    </tr>
    <tr>
      <td><code>\ggg</code></td>
    </tr>
    <tr>
      <td><code>\gggtr</code></td>
    </tr>
    <tr>
      <td><code>\le</code></td>
    </tr>
    <tr>
      <td><code>\leq</code></td>
    </tr>
    <tr>
      <td><code>\leqq</code></td>
    </tr>
    <tr>
      <td><code>\leqslant</code></td>
    </tr>
    <tr>
      <td><code>\ll</code></td>
    </tr>
    <tr>
      <td><code>\lll</code></td>
    </tr>
    <tr>
      <td><code>\llless</code></td>
    </tr>
    <tr>
      <td><code>\notin</code></td>
    </tr>
    <tr>
      <td><code>\ni</code></td>
    </tr>
    <tr>
      <td><code>\in</code></td>
    </tr>
    <tr>
      <td><code>\isin</code></td>
    </tr>
  </tbody>
</table>

## AST Node

The `parse` function returns a `Node`, which may have array of other `Node`s in its `args`.

### Node.prototype.type

The `Node` type, see the [available types](#nodetypes).

### Node.prototype.check(props: Object)

This method can check all properties except `args`, it will be ignored.

```js
let node = mathLatexParser.parse("\alpha!");
console.log(node.check({
  type: "operator",
  operatorType: "postfix",
  name: "!"
}));
// true
```

### Node.prototype.checkType(type: string)

You can check for `type` directly here, but why not `node.type === "the_type"`?
Because `"the_type"` is not a valid type, `.checkType` will throw if you passed invalid type.

```js
let node = mathLatexParser.parse("1");
console.log(node.checkType("member expression"));
// false
```

### Node.prototype.hasChild(props: Object)

This method can check for any of `args` with properties `props`. It doesn't check for`args`, it will be ignored.

```js
let node = mathLatexParser.parse("1+2");
// { type: "operator", args: [...], operatorType: "infix" }
console.log(node.hasChild({ type: "number", value: 1 }));
// true
```

### Node.prototype.hasChildR(props: Object)

The same as `hasChild`, but recursively.

```js
let node = mathLatexParser.parse("\sin(1+2)");
// { type: "function", name: "sin", args: [...], isBuiltin: true }
console.log(node.hasChildR({ type: "number", value: 1 }));
// true
```

### Node.types

Available values for `Node.prototype.type`.

Array of literal strings: `Node.types.values`.

All Valid operators: `Node.types.operators`.

## Options

### .autoMult

Type = `boolean`, default = `true`.

You can parse some thing like this `3^6cd\sqrt af`, if false, the previous latex expression will throw an error while being parsed.

### .functions
Type = `Array<`[Checker](#checker)`>`, default = `[]`.

This is useful in some cases like, `f(x)`, or `f\left(x\right)`, the function id here is `f`.

### .builtinLetters

Type = `Array<`[Checker](#checker)`>`, default:

```json
[
  "alpha", "Alpha", "beta", "Beta", "gamma",
  "Gamma", "pi", "Pi", "varpi", "phi", "Phi",
  "varphi", "mu", "theta", "vartheta", "epsilon",
  "varepsilon", "upsilon", "Upsilon", "zeta", "eta",
  "Lambda", "lambda", "kappa","omega", "Omega",
  "psi", "Psi", "chi", "tau", "sigma", "Sigma",
  "varsigma", "rho", "varrho", "Xi", "xi", "nu",
  "imath", "jmath", "ell", "Re", "Im", "wp", "Nabla",
  "infty", "aleph", "beth", "gimel", "comicron",
  "iota", "delta", "thetasym", "omicron", "Delta",
  "Epsilon", "Zeta", "Eta", "Theta", "Iota", "Kappa",
  "Mu", "Nu", "Omicron", "Rho", "Tau", "Chi", "infty",
  "infin", "nabla", "mho", "mathsterling", "surd",
  "diamonds", "Diamond", "hearts", "heartsuit", "spades",
  "spadesuit", "clubsuit", "clubs", "bigstar", "star",
  "blacklozenge", "lozenge", "sharp", "maltese", "blacksquare",
  "square", "triangle", "blacktriangle"
]
```

If you want to expand the defaults put `"..."` as the first item in the array, at index `0`.

### .builtinFunctions

Type = `Array<`[Checker](#checker)`>`, default:

```json
[
  "sinh", "cosh", "tanh", "sin", "cos", "tan", "sec",
  "csc", "cot", "arcsin", "arccos", "arctan", "arcsec",
  "arccsc", "arccot", "ln"
]
```

If you want to expand the defaults put `"..."` as the first item in the array, at index `0`.

### .extra

All extra features are enabled.

Example:

```js
let tex = String.raw`
  \begin{pmatrix}
    1 & 2 \\
    3 & 4
  \end{pmatrix}
`;
mathLatexParser.parse(tex, {
  extra: {
    matrices: true, // default
  }
});
```

- `memberExpressions`, for example:
  - `p.x`
  - `f(x).a(y).r`.
- `intervals`: true or false, will return node with properties `{ startInlusive: boolean, endInclusive: boolean }`.
  - `[1,2]`
  - `(-.5, \infin)`
  - `(-pi, 1]`
  - `[2,5)`
- `sets`: e.g., `\big{ 1, \sqrt \pi, ..., \left(\sqrt \pi\right)^10 \big}`
- `tuples`: e.g., `(1, 2, x, ...)`
- `matrices`: e.g., `\left[ \sin x, 1, 3; \cos y, \sqrt 3, 0 \right]`
- `ellipsis`: to allow the 3-dots "...", e.g., `\{{ 1, 3, 5, ... \}}`

----------------------

Notes

- You can use ellipsis as valid `Factor`, e.g., `1 + 2 + ... + 10`
- This expression will throw syntax error, `1 + 2 + (...) + 10`
- `extra.ellipsis` is more customizable:
  - `extra.ellipsis.matrices: boolean`
  - `extra.ellipsis.tuples: boolean`
  - `extra.ellipsis.sets: boolean`
  - `extra.ellipsis.funcArgs: boolean`, to be used as a function argument.
  
- Intervals, should have 2 terms as math expression:
  - `(..., a]`: throw syntax error.
  - `(..., a)`: is a tuple.


### Checker

```ts
type Checker = RegExp | ((...args:any[])=>boolean) | Checker[];
```

## License

MIT
