// TODO: add more tests

const cp = require('child_process');
const path = require('path');
const pkg = require(path.resolve(process.cwd(), 'package.json'));
const parser = require(path.resolve(process.cwd(), pkg.main));
const quite = 0; // no struct or node logged when a test fails

expect.extend({
  /**
   * @param {parser.Node} node
   * @param {Obj} struct
   */
  toHaveStructure (node, struct) {
    function failed (msg) {
      if (quite) {
        return {
          message: () => msg,
          pass: false
        };
      }

      function simplify (o) {
        JSON.stringify(o);
        if (typeof o !== 'object') return o;
        const r = {};
        const ignore = ['match', 'operatorType'];
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
        message: () => `${msg}\n====================== node ======================\n${JSON.stringify(simple_node, null, 2)}\n====================== expected ======================\n${JSON.stringify(simple_struct, null, 2)}`,
        pass: false
      };
    }

    if (!(node instanceof parser.Node)) {
      return failed('Received value has to be instance of parser.Node', node);
    }

    if (!(struct instanceof Object)) {
      return failed(`"struct" is type of ${typeof struct}, toHaveStructure checks the match between parser.Node and object.`, node);
    }

    function _check (n, s, nPath, sPath) {
      nPath = (nPath ? nPath + '.' : '') + n.type;
      sPath = (sPath ? sPath + '.' : '') + s.type;

      if (!n.check(s)) {
        let _n = { ...n }; let _s = { ...s };
        delete _n.args; delete _s.args;
        _n = JSON.stringify(_n); _s = JSON.stringify(_s);
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

    return (
      _check(node, struct) ||
      { message: () => 'Parse-tree matches the structure object!', pass: true }
    );
  }
});

beforeAll(() => {
  cp.execSync('npm run build');
});

function parse (math, options = {}) {
  return parser.parse(math, options);
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

describe('parse basic arithmetics', () => {
  test('1+2^1.2 / x ! * -5.236 --2', () => {
    expect(parse('1+2^1.2 / x ! * -5.236 --2')).toHaveStructure({
      type: 'operator',
      name: '-',
      args: [
        {
          type: 'operator',
          name: '+',
          args: [
            { value: 1, type: 'number' },
            {
              type: 'operator',
              name: '*',
              args: [
                {
                  type: 'operator',
                  name: '/',
                  args: [
                    {
                      type: 'operator',
                      name: '^',
                      args: [
                        { value: 2, type: 'number' },
                        { value: 1.2, type: 'number' }
                      ]
                    },
                    {
                      type: 'operator',
                      operatorType: 'postfix',
                      args: [
                        { name: 'x', type: 'id' }
                      ]
                    }
                  ]
                },
                { value: -5.236, type: 'number' }
              ]
            }
          ]
        },
        { value: -2, type: 'number' }
      ]
    });
  });

  test('5^2x!', () => {
    expect(parse('5^2x!')).toHaveStructure({
      type: 'automult',
      args: [
        {
          type: 'operator',
          name: '^',
          args: [
            { value: 5, type: 'number' },
            { value: 2, type: 'number' }
          ]
        },
        {
          type: 'operator',
          name: '!',
          args: [
            { name: 'x', type: 'id' }
          ]
        }
      ]
    });
  });
});

describe('parse singleCharName=true', () => {
  describe('member expression', () => {
    test('p1.x', () => {
      expect(parse('p1.x')).toHaveStructure({
        type: 'member expression',
        args: [
          { type: 'id', name: 'p1' },
          { type: 'id', name: 'x' }
        ]
      });
    });

    test('1+ p1.x^2!', () => {
      expect(parse('1+ p1.x^2!')).toHaveStructure({
        type: 'operator',
        operatorType: 'infix',
        name: '+',
        args: [
          { type: 'number', value: 1 },
          {
            type: 'operator',
            operatorType: 'infix',
            name: '^',
            args: [
              {
                type: 'member expression',
                args: [
                  { type: 'id', name: 'p1' },
                  { type: 'id', name: 'x' }
                ]
              },
              {
                type: 'operator',
                operatorType: 'postfix',
                name: '!',
                args: [
                  { type: 'number', value: 2 }
                ]
              }
            ]
          }
        ]
      });
    });

    test('p1.s(x).c + 1^2!', () => {
      expect(parse('p1.s(x).c + 1^2!', { functions: ['p1.f'] })).toHaveStructure({
        type: 'operator',
        name: '+',
        args: [
          {
            type: 'member expression',
            args: [
              {
                type: 'member expression',
                args: [
                  { type: 'id', name: 'p1' },
                  {
                    type: 'function',
                    name: 's',
                    args: [{
                      type: 'block',
                      name: '()',
                      args: [
                        { type: 'id', name: 'x' }
                      ]
                    }]
                  }
                ]
              },
              { type: 'id', name: 'c' }
            ]
          },
          {
            type: 'operator',
            name: '^',
            args: [
              { type: 'number', value: 1 },
              {
                type: 'operator',
                name: '!',
                args: [
                  { type: 'number', value: 2 }
                ]
              }
            ]
          }
        ]
      });
    });

    test('1 + p1.fn()', () => {
      expect(parse('1 + p1.fn()')).toHaveStructure({
        type: 'operator',
        name: '+',
        args: [
          { type: 'number', value: 1 },
          {
            type: 'member expression',
            args: [
              { type: 'id', name: 'p1' },
              {
                type: 'function',
                name: 'fn',
                args: [{
                  type: 'block',
                  name: '()',
                  args: null
                }]
              }
            ]
          }
        ]
      });
    });

    test('1 + p1.fn()!^2', () => {
      expect(parse('1 + p1.fn()!^2', { functions: ['n'] })).toHaveStructure({
        type: 'operator',
        name: '+',
        args: [
          { type: 'number', value: 1 },
          {
            type: 'operator',
            name: '^',
            args: [
              {
                type: 'operator',
                name: '!',
                args: [
                  {
                    type: 'member expression',
                    args: [
                      { type: 'id', name: 'p1' },
                      {
                        type: 'function',
                        name: 'fn',
                        args: [{
                          type: 'block',
                          name: '()',
                          args: null
                        }]
                      }
                    ]
                  }
                ]
              },
              { type: 'number', value: 2 }
            ]
          }
        ]
      });
    });

    test('1 + p1.f(1.2+x)', () => {
      expect(parse('1 + p1.f(1.2+x)')).toHaveStructure({
        type: 'operator',
        name: '+',
        args: [
          { type: 'number', value: 1 },
          {
            type: 'member expression',
            args: [
              { type: 'id', name: 'p1' },
              {
                type: 'function',
                name: 'f',
                args: [{
                  type: 'block',
                  name: '()',
                  args: [{
                    type: 'operator',
                    name: '+',
                    args: [
                      { type: 'number', value: 1.2 },
                      { type: 'id', name: 'x' }
                    ]
                  }]
                }]
              }
            ]
          }
        ]
      });
    });

    test('1 + p1.f(1.2+x)!^2', () => {
      expect(parse('1 + p1.f(1.2+x)!^2', { functions: ['p1.f'] })).toHaveStructure({
        type: 'operator',
        name: '+',
        args: [
          { type: 'number', value: 1 },
          {
            type: 'operator',
            name: '^',
            args: [
              {
                type: 'operator',
                name: '!',
                args: [
                  {
                    type: 'member expression',
                    args: [
                      { type: 'id', name: 'p1' },
                      {
                        type: 'function',
                        name: 'f',
                        args: [{
                          type: 'block',
                          name: '()',
                          args: [{
                            type: 'operator',
                            name: '+',
                            args: [
                              { type: 'number', value: 1.2 },
                              { type: 'id', name: 'x' }
                            ]
                          }]
                        }]
                      }
                    ]
                  }
                ]
              },
              { type: 'number', value: 2 }
            ]
          }
        ]
      });
    });
  });

  describe('options.functions', () => {
    test('f(x)', () => {
      expect(parse('f(x)', { functions: ['f'] })).toHaveStructure({
        type: 'function',
        name: 'f',
        args: [{
          type: 'block',
          name: '()',
          args: [
            { type: 'id', name: 'x' }
          ]
        }]
      });
    });

    test('strict=flase, options.function=[]: should parse f() as function', () => {
      expect(parse('f()')).toHaveStructure({
        type: 'function',
        name: 'f',
        args: [{
          type: 'block',
          name: '()',
          args: null
        }]
      });
    });

    test('strict=true, options.function=[]: should throw error f()', () => {
      expect(() => parse('f()', { strict: true })).toThrow(parser.SyntaxError);
    });

    test('f(v +2 )(3/2)', () => {
      expect(parse('f(v +2 )(3/2)', { functions: ['f'] })).toHaveStructure({
        type: 'automult',
        args: [
          {
            type: 'function',
            name: 'f',
            args: [{
              type: 'block',
              name: '()',
              args: [{
                type: 'operator',
                name: '+',
                args: [
                  { type: 'id', name: 'v' },
                  { type: 'number', value: 2 }
                ]
              }]
            }]
          },
          {
            type: 'block',
            name: '()',
            args: [{
              type: 'operator',
              name: '/',
              args: [
                { type: 'number', value: 3 },
                { type: 'number', value: 2 }
              ]
            }]
          }
        ]
      });
    });

    test('2f(x)!', () => {
      expect(parse('2f(x)!', { functions: ['f'] })).toHaveStructure({
        type: 'automult',
        args: [
          { type: 'number', value: 2 },
          {
            type: 'operator',
            operatorType: 'postfix',
            name: '!',
            args: [
              {
                type: 'function',
                name: 'f',
                args: [{
                  type: 'block',
                  name: '()',
                  args: [
                    { type: 'id', name: 'x' }
                  ]
                }]
              }
            ]
          }

        ]
      });
    });

    test('function with no arguments, 2f()!', () => {
      expect(parse('2f()!', { singleCharName: false, functions: ['f'] })).toHaveStructure({
        type: 'automult',
        args: [
          { type: 'number', value: 2 },
          {
            type: 'operator',
            operatorType: 'postfix',
            name: '!',
            args: [
              {
                type: 'function',
                name: 'f',
                args: [{
                  type: 'block',
                  name: '()',
                  args: null
                }]
              }
            ]
          }
        ]
      });
    });
  });

  describe('tests intellicense, automult', () => {
    test('tests: 2xsiny', () => {
      expect(parse('2xsiny')).toHaveStructure({
        type: 'automult',
        args: [
          {
            type: 'automult',
            args: [
              {
                value: 2,
                type: 'number'
              }, {
                type: 'id',
                name: 'x'
              }
            ]
          },
          {
            type: 'function',
            name: 'sin',
            isBuiltIn: true,
            args: [
              {
                type: 'id',
                name: 'y'
              }
            ]
          }
        ]
      });
    });

    test('tests: sinxcosx', () => {
      expect(parse('sinxcosx')).toHaveStructure({
        type: 'automult',
        args: [
          {
            type: 'function',
            name: 'sin',
            isBuiltIn: true,
            args: [
              { type: 'id', name: 'x' }
            ]
          },
          {
            type: 'function',
            name: 'cos',
            isBuiltIn: true,
            args: [
              { type: 'id', name: 'x' }
            ]
          }
        ]
      });
    });
  });
});

describe('tests singleCharName=false', () => {
  const parserOptions = { singleCharName: false };

  describe('member expression', () => {
    test('point.x', () => {
      expect(parse('point.x', { singleCharName: false })).toHaveStructure({
        type: 'member expression',
        args: [
          { type: 'id', name: 'point' },
          { type: 'id', name: 'x' }
        ]
      });
    });

    test('1+ point.component_1^2!', () => {
      expect(parse('1+ point.component_1^2!', { singleCharName: false })).toHaveStructure({
        type: 'operator',
        operatorType: 'infix',
        name: '+',
        args: [
          { type: 'number', value: 1 },
          {
            type: 'operator',
            operatorType: 'infix',
            name: '^',
            args: [
              {
                type: 'member expression',
                args: [
                  { type: 'id', name: 'point' },
                  { type: 'id', name: 'component_1' }
                ]
              },
              {
                type: 'operator',
                operatorType: 'postfix',
                name: '!',
                args: [
                  { type: 'number', value: 2 }
                ]
              }
            ]
          }
        ]
      });
    });

    test('1 + point1.  func()', () => {
      expect(parse('1 + point1.  func()', { singleCharName: false, functions: ['p1.func'] })).toHaveStructure({
        type: 'operator',
        name: '+',
        args: [
          { type: 'number', value: 1 },
          {
            type: 'member expression',
            args: [
              { type: 'id', name: 'point1' },
              {
                type: 'function',
                name: 'func',
                args: [{
                  type: 'block',
                  name: '()',
                  args: null
                }]
              }
            ]
          }
        ]
      });
    });

    test('1 + point1  .\\n func(1.2+x)', () => {
      expect(parse('1 + point1.\n func(1.2+x)', { singleCharName: false })).toHaveStructure({
        type: 'operator',
        name: '+',
        args: [
          { type: 'number', value: 1 },
          {
            type: 'member expression',
            args: [
              { type: 'id', name: 'point1' },
              {
                type: 'function',
                name: 'func',
                args: [{
                  type: 'block',
                  name: '()',
                  args: [{
                    type: 'operator',
                    name: '+',
                    args: [
                      { type: 'number', value: 1.2 },
                      { type: 'id', name: 'x' }
                    ]
                  }]
                }]
              }
            ]
          }
        ]
      });
    });

    test('1 + p_1.func(1.2+x)!^2', () => {
      expect(parse('1 + p_1.func(1.2+x)!^2', { singleCharName: false })).toHaveStructure({
        type: 'operator',
        name: '+',
        args: [
          { type: 'number', value: 1 },
          {
            type: 'operator',
            name: '^',
            args: [
              {
                type: 'operator',
                name: '!',
                args: [{
                  type: 'member expression',
                  args: [
                    { type: 'id', name: 'p_1' },
                    {
                      type: 'function',
                      name: 'func',
                      args: [{
                        type: 'block',
                        name: '()',
                        args: [{
                          type: 'operator',
                          name: '+',
                          args: [
                            { type: 'number', value: 1.2 },
                            { type: 'id', name: 'x' }
                          ]
                        }]
                      }]
                    }
                  ]
                }]
              },
              { type: 'number', value: 2 }
            ]
          }
        ]
      });
    });

    test('1 + p.func(1.2+x)^2!', () => {
      expect(parse('1 + p.func(1.2+x)^2!', { singleCharName: false })).toHaveStructure({
        type: 'operator',
        name: '+',
        args: [
          { type: 'number', value: 1 },
          {
            type: 'operator',
            name: '^',
            args: [
              {
                type: 'member expression',
                args: [
                  { type: 'id', name: 'p' },
                  {
                    type: 'function',
                    name: 'func',
                    args: [{
                      type: 'block',
                      name: '()',
                      args: [{
                        type: 'operator',
                        name: '+',
                        args: [
                          { type: 'number', value: 1.2 },
                          { type: 'id', name: 'x' }
                        ]
                      }]
                    }]
                  }
                ]
              },
              {
                type: 'operator',
                name: '!',
                args: [
                  { type: 'number', value: 2 }
                ]
              }
            ]
          }
        ]
      });
    });
  });

  describe('options.functions', () => {
    test('fn(variable_name +2 )(3/2)', () => {
      expect(parse('fn(variable_name +2 )(3/2)', { singleCharName: false, functions: ['fn'] })).toHaveStructure({
        type: 'automult',
        args: [
          {
            type: 'function',
            name: 'fn',
            args: [{
              type: 'block',
              name: '()',
              args: [{
                type: 'operator',
                name: '+',
                args: [
                  { type: 'id', name: 'variable_name' },
                  { type: 'number', value: 2 }
                ]
              }]
            }]
          },
          {
            type: 'block',
            name: '()',
            args: [{
              type: 'operator',
              name: '/',
              args: [
                { type: 'number', value: 3 },
                { type: 'number', value: 2 }
              ]
            }]
          }
        ]
      });
    });

    test('(2longFuncName + x) should use function id as reference (or variable) when strict=false', () => {
      expect(() => {
        parse('2longFuncName + x', { singleCharName: false, functions: ['longFuncName'] });
      }).not.toThrow(parser.SyntaxError);
    });

    test('(2longFuncName + x) sould throw error when strict=true', () => {
      expect(() => {
        parse('2longFuncName + x', { singleCharName: false, strict: true, functions: ['longFuncName'] });
      }).toThrow(parser.SyntaxError);
    });

    test('function with no arguments, 2longFuncName()!', () => {
      expect(parse('2longFuncName()!', { singleCharName: false, functions: ['longFuncName'] })).toHaveStructure({
        type: 'automult',
        args: [
          { type: 'number', value: 2 },
          {
            type: 'operator',
            operatorType: 'postfix',
            name: '!',
            args: [
              {
                type: 'function',
                name: 'longFuncName',
                args: [{
                  type: 'block',
                  name: '()',
                  args: null
                }]
              }
            ]
          }
        ]
      });
    });
  });

  describe('tests intellicense, automult', () => {
    test('tests: 2axsiny', () => {
      expect(parse('2axsiny', parserOptions)).toHaveStructure({
        type: 'automult',
        args: [
          { value: 2, type: 'number' },
          { type: 'id', name: 'axsiny' }
        ]
      });
    });

    test('tests: sinxcosx', () => {
      expect(parse('sinxcosx', parserOptions)).toHaveStructure({
        type: 'id', name: 'sinxcosx'
      });
    });

    // #region TODO: next release

    // test('tests: 2 ax   sin3y', () => {
    //   expect(parse('2 ax   sin3y', parserOptions)).toHaveStructure({
    //     type: 'automult',
    //     args: [
    //       {
    //         type: 'automult',
    //         args: [
    //           { value: 2, type: 'number', },
    //           { name: 'ax', type: 'id', },
    //         ]
    //       },
    //       {
    //         type: 'function',
    //         isBuiltIn: true,
    //         name: 'sin',
    //         args: [
    //           {
    //             type: 'automult',
    //             args: [
    //               { value: 3, type: 'number', },
    //               { name: 'y', type: 'id', },
    //             ]
    //           }
    //         ]
    //       }
    //     ]
    //   });
    // });

    // test('tests: xsin2z', () => {
    //   expect(parse('xsin2z', parserOptions)).toHaveStructure({
    //     type: 'automult',
    //     args: [
    //       { type: 'id', name: 'x' },
    //       {
    //         type: 'function',
    //         isBuiltIn: true,
    //         name: 'sin',
    //         args: [
    //           {
    //             type: 'automult',
    //             args: [
    //               { type: 'number', value: 2 },
    //               { type: 'id', name: 'z' },
    //             ]
    //           }
    //         ]
    //       }
    //     ]
    //   });
    // });

    // test('tests: 2axsin3y', () => {
    //   expect(parse('2axsin3y', parserOptions)).toHaveStructure({
    //     type: 'automult',
    //     args: [
    //       {
    //         type: 'automult',
    //         args: [
    //           { value: 2, type: 'number', },
    //           { name: 'ax', type: 'id', },
    //         ]
    //       }, {
    //         type: 'function',
    //         isBuiltIn: true,
    //         name: 'sin',
    //         args: [
    //           {
    //             type: 'automult',
    //             args: [
    //               { value: 3, type: 'number', },
    //               { name: 'y', type: 'id', },
    //             ]
    //           }
    //         ]
    //       }
    //     ]
    //   });
    // });

    // test('tests: sin 2 xa sd cos3x', () => {
    //   expect(()=>parse('sin 2 xa sd cos3x', parserOptions)).toThrow(parser.SyntaxError);
    // });

    // test('tests: sin 2 xasdcos3x + 1', () => {
    //   expect(()=>parse('sin 2 xasdcos3x + 1', parserOptions)).toThrow(parser.SyntaxError);
    // });

    // #endregion
  });
});
