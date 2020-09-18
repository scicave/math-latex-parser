// TODO: add more tests

const path = require("path");
const pkg = require(path.resolve(process.cwd(), "package.json"));
const parser = require(path.resolve(process.cwd(), pkg.main));
const prepareInput = require("../prepareInput.js");
const quite = 0; // no struct or node logged when a test fails
const map = require("./map.js");

expect.extend({
  /**
   * @param {parser.Node} node
   * @param {Obj} struct
   */
  toHaveStructure(node, struct) {
    function failed(msg) {
      if (quite) {
        return {
          message: () => msg,
          pass: false,
        };
      }

      function simplify(o) {
        JSON.stringify(o);
        if (typeof o !== "object") return o;
        if (!o /** === null */) return o;
        if (o.type === "number") return o.value;
        else if (o.type === "id") return o.name;
        const r = o instanceof Array ? [] : {};
        const ignore = ["match", "operatorType"];
        for (const p in o) {
          if (ignore.indexOf(p) === -1 && o.hasOwnProperty(p)) {
            r[p] = simplify(o[p]);
          }
        }
        return r;
      }
      const simple_node = simplify(node);
      const simple_struct = simplify(struct);
      return {
        message: () =>
          `${msg}\n====================== node ======================\n${JSON.stringify(
            simple_node,
            null,
            2
          )}\n====================== expected ======================\n${JSON.stringify(simple_struct, null, 2)}`,
        pass: false,
      };
    }

    if (!(node instanceof parser.Node)) {
      return failed("Received value has to be instance of parser.Node", node);
    }

    function _check(n, s, nPath, sPath) {
      if (!(n && s)) return;
      if (!isNaN(s)) {
        s = { type: "number", value: s };
      } else if (typeof s === "string") {
        s = { type: "id", name: s };
      }

      if (!(struct instanceof Object)) {
        return failed(`"struct" is type of ${typeof struct}, toHaveStructure checks the match between parser.Node and object.`, node);
      }

      nPath = (nPath ? nPath + "." : "") + n.type;
      sPath = (sPath ? sPath + "." : "") + s.type;

      if (!n.check(s)) {
        let _n = { ...n };
        let _s = { ...s };
        delete _n.args;
        delete _s.args;
        _n = JSON.stringify(_n);
        _s = JSON.stringify(_s);
        return failed(`properties of ${nPath} in node, don't match these of ${sPath} of struct`, node);
      }

      if (s.args && n.args) {
        if (s.args.length !== n.args.length) {
          return failed(`${sPath} in struct and ${nPath} in node args has different lengths`, node);
        }
        for (let i = 0; i < s.args.length; i++) {
          const c = _check(n.args[i], s.args[i], nPath, sPath);
          if (c) return c; // here a problem is found
        }
      } else if (s.args || n.args) {
        if (s.args) {
          return failed(`${sPath} in struct has args but ${nPath} in node doesn't`, node);
        } else {
          return failed(`${nPath} in node has args but ${sPath} in struct doesn't`, node);
        }
      }
    }

    return _check(node, struct) || { message: () => "Parse-tree matches the structure object!", pass: true };
  },
});

function prepare(tex) {
  return prepareInput(tex);
}

function parse(tex, options = {}) {
  return parser.parse(tex, options);
  // try {
  // } catch (e) {
  //   if (e instanceof parser.SyntaxError) {
  //     console.log("SyntaxError:", e.message);

  //     let i = e.location.start.line - 1;
  //     let lines = math.split('\n');

  //     let log = function () {
  //       if (i - 2 > -1)
  //         console.log(lines[i - 2]);
  //       if (i - 1 > -1)
  //         console.log(lines[i - 1]);
  //       console.log();
  //       console.log(lines[i]);
  //       console.log((new Array(e.location.start.column - 1)).fill("_").join('') + "^");
  //       console.log();
  //       if (i + 1 < lines.length)
  //         console.log(lines[i + 1]);
  //       if (i + 2 < lines.length)
  //         console.log(lines[i + 2]);
  //     };

  //     // log();

  //   } else {
  //     throw e;
  //   }
  // }
}

describe("test prepareInput function", () => {
  it("should return the same input when no braces found", () => {
    let tex;
    tex = "1  \n+2";
    expect(prepare(tex)).toBe(tex);
    tex = "1\t\n+2\\sqrt 1";
    expect(prepare(tex)).toBe(tex);
    tex = "1\t\n+2\\frac 1 2\n";
    expect(prepare(tex)).toBe(tex);
    tex = "1\t\n+2_1\\frac 1 2\n";
    expect(prepare(tex)).toBe(tex);
    tex = "1  \n+2^5 / \\theta";
    expect(prepare(tex)).toBe(tex);
  });

  describe("should return the same input when braces are important", () => {
    it("tests \\frac", () => {
      let tex;
      tex = "1  \n+2\\frac {  1} \t2"; // \frac {} -
      expect(prepare(tex)).toBe(tex);
      tex = "1  \n+2\\frac 1 \n {2}"; // \frac - {}
      expect(prepare(tex)).toBe(tex);
      tex = "1  \n+2\\frac {  1} \n {2}"; // \frac {} {}
      expect(prepare(tex)).toBe(tex);
    });

    it("tests \\sum", () => {
      let tex;
      tex = "1\t\n+2\\sqrt {1 }"; // \sqrt {}
      expect(prepare(tex)).toBe(tex);
      tex = "1\t\n+2\\sqrt[someting^here] {1 }"; // \sqrt[] {}
      expect(prepare(tex)).toBe(tex);
    });

    it("tests suBsuP", () => {
      let tex;
      tex = "1\t\n+2*x_{1}\\sqrt[someting^here] {1 } ^ {2}";
      expect(prepare(tex)).toBe(tex);
      tex = "1\t\n+2*x^{1}\\sqrt[someting^here] {1 } _ {2}";
      expect(prepare(tex)).toBe(tex);
    });
  });

  test("should return the input trimed when braces are not important", () => {
    let tex;
    
    tex = `asasdg{hg}hj_{d}`;
    expect(prepare(tex)).toBe("asasdg hg hj_{d}");
    
    tex = `asas^dg{hg}hj_{d}`;
    expect(prepare(tex)).toBe("asas^dg hg hj_{d}");
    
    tex = `asas^{d}g{hg}hj_{d}`;
    expect(prepare(tex)).toBe("asas^{d}g hg hj_{d}");
    
    tex = `a\\frac sas^{d}g{hg}hj_{d}`;
    expect(prepare(tex)).toBe("a\\frac sas^{d}g hg hj_{d}");
    
    tex = `a\\frac {s}as^{d}g{hg}hj_{d}`;
    expect(prepare(tex)).toBe("a\\frac {s}as^{d}g hg hj_{d}");
    
    tex = `a\\frac {s}{a}s^{d}g{hg}hj_{d}`;
    expect(prepare(tex)).toBe("a\\frac {s}{a}s^{d}g hg hj_{d}");
    
    tex = `{a\\frac {s}{a}s^{d}g{hg}hj_{d}}`;
    expect(prepare(tex)).toBe(" a\\frac {s}{a}s^{d}g hg hj_{d} ");
    
    tex = `\\int {a}\\frac {s}{a}s^{d}g{hg}hj_{d}`;
    expect(prepare(tex)).toBe("\\int  a \\frac {s}{a}s^{d}g hg hj_{d}");

  });

  describe("test some special inputs to be prepared", () => {
    let tex;

    tex = "\\frac\\sqrt{1}{2 +x}!";
    test("Throw an error: " + tex, () => {
      // ReferenceError not SyntaxError as we don't pass pegjs special function to prepareInput
      try {
        prepare(tex);
      } catch (e) {
        expect(e).toBe(expect.any(ReferenceError));
        expect(e.message).stringContaining("peg$computeLocation");
      }
    });

    tex = "\\sqrt\\frac{1}_{2}!";
    test("Throw an error: " + tex, () => {
      // ReferenceError not SyntaxError as we don't pass pegjs special function to prepareInput
      try {
        prepare(tex);
      } catch (e) {
        expect(e).toBe(expect.any(ReferenceError));
        expect(e.message).stringContaining("peg$computeLocation");
      }
    });

    tex = "\\sqrt\\frac{1}^{2}!";
    test("Throw an error: " + tex, () => {
      // ReferenceError not SyntaxError as we don't pass pegjs special function to prepareInput
      try {
        prepare(tex);
      } catch (e) {
        expect(e).toBe(expect.any(ReferenceError));
        expect(e.message).stringContaining("peg$computeLocation");
      }
    });

    tex = " \\sqrt\\frac{1}{2}!";
    test("Stay the same" + tex, () => {
      expect(prepare(tex)).toBe(tex);
    });
  });
});

function doTest(on, title) {
  describe(title, ()=>{
    if (on instanceof Array) {
      on.forEach((t) => {
        test(t.tex, () => {
          expect(parse(t.tex, t.parseOptions)).toHaveStructure(t.struct);
        });
      });
    } else if (typeof on === 'object') {
      for (let p in on) {
        doTest(on[p], p);
      }
    } else { 
      throw new Error('can\'t do tests on ' + typeof on);
    }
  });
}

doTest(map, "test parse function");
