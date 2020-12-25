
const prepare = require("prepareInput");

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
      tex = "1  \n+2\\frac {  1} \t2"; // \frac {} ---
      expect(prepare(tex)).toBe(tex);
      tex = "1  \n+2\\frac 1 \n {2}"; // \frac --- {}
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
      // ReferenceError not SyntaxError as we don't pass 
      // `peg$computeLocation`, and `error` functions to prepare
      // in actual parsing process, they are passed
      try {
        prepare(tex);
      } catch (e) {
        expect(e).toBe(expect.any(ReferenceError));
        expect(e.message).stringContaining("peg$computeLocation");
      }
    });

    tex = "\\sqrt\\frac{1}_{2}!";
    test("Throw an error: " + tex, () => {
      try {
        prepare(tex);
      } catch (e) {
        expect(e).toBe(expect.any(ReferenceError));
        expect(e.message).stringContaining("peg$computeLocation");
      }
    });

    tex = "\\sqrt\\frac{1}^{2}!";
    test("Throw an error: " + tex, () => {
      try {
        prepare(tex);
      } catch (e) {
        expect(e).toBe(expect.any(ReferenceError));
        expect(e.message).stringContaining("peg$computeLocation");
      }
    });

    tex = " \\sqrt\\frac{1}{2}!";
    test("Stay the same: " + tex, () => {
      expect(prepare(tex)).toBe(tex);
    });
  });
});

