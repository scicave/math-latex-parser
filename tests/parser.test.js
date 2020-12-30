// TODO: add more tests

const parser = require('parser');
const quite = 0; // no struct or node logged when a test fails
const map = require("./maps");

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

      if (!(s instanceof Object)) {
        return failed(`"struct" is type of ${typeof s}, toHaveStructure checks the match between parser.Node and object.`, node);
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

function tAsTitle(t) {
  // return tex.replace(/\n/g, '\\n');
  return (t.error ? "should throw: " : "should parse: ") + JSON.stringify(t.tex);
}

// our tests js object, stored in `map`
// if the property is array, then this 
// is array of tests to do using `jest.test`
// otherwise this is a group to do to pack
// insige `jest.describe` 
function doTest(on, title) {
  describe(title, ()=>{
    if (on instanceof Array) {
      on.forEach((t) => {
        let title = t.title || tAsTitle(t);
        let fn = () => {
          if (t.error) 
            expect(()=>parser.parse(t.tex, t.parseOptions)).toThrow(t.errorType);
          else
            expect(parser.parse(t.tex, t.parseOptions)).toHaveStructure(t.struct);
        };
        if (t.only) 
          test.only(title, fn);
        else if(!t.skip)
          test(title, fn);
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
