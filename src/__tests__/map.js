
let tests = {
  basic: [
    {
      tex: "1+2",
      struct: {
        type: "operator", name: "+",
        args: [1, 2],
      },
    },
    {
      tex: "1*2!-5^3",
      struct: {
        type: "operator", name: "-",
        args: [
          {
            type: "operator", name: "*",
            args: [ 1, {
              type: "operator", operatorType: "postfix", name: "!",
              args: [2]
            }],
          },
          {
            type: "operator", operatorType: "infix", name: "^",
            args: [5, 3]
          },
        ],
      },
    },
    {
      tex: "1*2!-5^3 \\cdot\\frac{1}2!",
      struct: {
        type: "operator", name: "-",
        args: [
          {
            type: "operator", name: "*",
            args: [
              1,
              {
                type: "operator", operatorType: "postfix", name: "!",
                args: [2]
              }
            ],
          },
          {
            type: "operator", operatorType: "infix", name: "cdot",
            args: [
              {
                type: "operator", operatorType: "infix", name: "^",
                args: [5, 3]
              },
              {
                type: "operator", operatorType: "postfix", name: "!",
                args: [{
                  type: "frac",
                  args: [1, 2]
                }]
              }
            ]
          },
        ],
      },
    }
  ],
  singleChar: {
    autoMult: [
      {
        tex: '3^6cd\\sqrt af',
        struct: {
          "type": "automult",
          "args": [
            {
              "type": "automult",
              "args": [
                {
                  "type": "automult",
                  "args": [
                    {
                      "type": "automult",
                      "args": [
                        {
                          type: "operator", name: "^",
                          args: [ 3, 6 ]
                        },
                        "c"
                      ]
                    },
                    "d"
                  ]
                },
                { type: "sqrt", args: ["a"] }
              ]
            },
            "f"
          ]
        }
      },
      {
        tex: '12+3^6x \\frac 1 {5+3}',
        struct: {
          "name": "+", "type": "operator",
          "args": [
            12,
            {
              "type": "automult",
              "args": [
                {
                  "type": "automult",
                  "args": [
                    {
                      "name": "^", "type": "operator",
                      "args": [ 3, 6 ]
                    },
                    "x"
                  ]
                },
                {
                  "type": "frac",
                  "args": [
                    1,
                    {
                      "name": "+", "type": "operator",
                      "args": [ 5, 3 ]
                    }
                  ]
                }
              ]
            }
          ]
        }
      }
    ]
  },
  multiChar: {
    autoMult: [

    ],
  },

  options: {
    functions: [
      {
        tex: `f(x)`,
        parseOptions: { functions: 'f' },
        struct: {
          type: 'function', name: "f",
          args: [{
            type: 'block', name: "()",
            args: ["x"]
          }]
        },
      },
      {
        tex: `f\\left(x\\right)`,
        parseOptions: { functions: 'f' },
        struct: {
          type: 'function', name: "f",
          args: [{
            type: 'block', name: "\\left(\\right)",
            args: ["x"]
          }]
        }
      }
    ]
  }

};

module.exports = tests;