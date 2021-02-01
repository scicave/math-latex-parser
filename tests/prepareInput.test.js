
const oldPrepare = require("prepareInput");
const pegjsPolyFill = require('./pegjsPolyFill');

const prepare = (tex) => {
  pegjsPolyFill.input.value = tex;
  return oldPrepare(
    tex,
    pegjsPolyFill.peg$computeLocation,
    pegjsPolyFill.error
  );
};

let tests = {

  "should return the same input when no braces found": [[
    "1  \n+2",
    "1\t\n+2\\sqrt 1",
    "1\t\n+2\\frac 1 2\n",
    "1\t\n+2_1\\frac 1 2\n",
    "1  \n+2^5 / \\theta",
    "\\{{ 1 \\}}",
  ]],

  "should return the input trimed when braces are not important": [[
    [`asasdg{hg}hj_{d}`, "asasdg hg hj_{d}"],
    [`asas^dg{hg}hj_{d}`, "asas^dg hg hj_{d}"],
    [`asas^{d}g{hg}hj_{d}`, "asas^{d}g hg hj_{d}"],
    [`a\\frac sas^{d}g{hg}hj_{d}`, "a\\frac sas^{d}g hg hj_{d}"],
    [`a\\frac {s}as^{d}g{hg}hj_{d}`, "a\\frac {s}as^{d}g hg hj_{d}"],
    [`a\\frac {s}{a}s^{d}g{hg}hj_{d}`, "a\\frac {s}{a}s^{d}g hg hj_{d}"],
    [`{a\\frac {s}{a}s^{d}g{hg}hj_{d}}`, " a\\frac {s}{a}s^{d}g hg hj_{d} "],
    [`\\int {a}\\frac {s}{a}s^{d}g{hg}hj_{d}`, "\\int  a \\frac {s}{a}s^{d}g hg hj_{d}"],
  ]],

  "tests \\frac, \\sum, _, ^": [[
    "1  \n+2\\frac {  1} \t2",
    "1  \n+2\\frac 1 \n {2}",
    "1  \n+2\\frac {  1} \n {2}",
    "1\t\n+2\\sqrt {1 }",
    " \\sqrt\\frac{1}{2}!",
    "1\t\n+2\\sqrt[someting^here] {1 }",
    "1\t\n+2*x_{1}\\sqrt[someting^here] {1 } ^ {2}",
    "1\t\n+2*x^{1}\\sqrt[someting^here] {1 } _ {2}",
  ]],

  "test some special inputs to be prepared": [[],[
    "\\frac\\sqrt{1}{2 +x}!",
    "\\sqrt\\frac{1}_{2}!",
    "\\sqrt\\frac{1}^{2}!",
  ]],

  "should prepare begin-end block": [[
    "\\begin{12} \\end{12}",
    "\\begin{12} asd && 123 // qwe && 456 \\end{12}",
  ], [
    "\\begin a asd && 123 // qwe && 456 \\end a",
    "\\begin{asd} "
  ]],

  'should prepare with prefixes for block, "\\left, \\Bigg", ...': [[
    " \\left{ \\right}",
    " \\sqrt\\left{ 1\\right}",
    // braces will be remove, \\Bug will throw inside the parser itsolf
    [" \\Bug{ \\Bug}", " \\Bug  \\Bug "],
    "\\Big{ 123 \\Big}",
    "\\big{ 123 \\big}",
    "\\Bigg{ 123 \\Bigg}",
    "\\bigg{ 123 \\bigg}",
  ], [
    "\\left\\{ \\right\\}",
    "\\right{ \\right}",
    "\\left{ \\left}",
    "\\left{ }",
    "\\left }",
    "\\Big{ \\big}",
  ]]

};

function doTests(value) {
  if (Array.isArray(value)) {
    // test
    if(value.length === 0 ||
      !Array.isArray(value[0]) ||
      value[1] && !Array.isArray(value[1]))
    { throw new Error(`tests array should be 2d array`); }

    let [toStayTheSame, toThrow = []] = value;

    toStayTheSame.forEach(tex_tex => {
      let tex = tex_tex, _tex = tex_tex;
      if (Array.isArray(tex)) [tex, _tex] = tex_tex;
      test("Should prepare: " + JSON.stringify(tex), () => {
        expect(prepare(tex)).toBe(_tex);
      });
    });
    
    toThrow.forEach(tex=>{
      test("Should throw: " + JSON.stringify(tex), () => {
        expect(()=> prepare(tex)).toThrow(pegjsPolyFill.SyntaxError);
      });
    });
  } else {
    // describe
    for (let p in value) {
      describe(p, ()=>{
        doTests(value[p]);
      });
    }
  }
}

doTests(tests);
