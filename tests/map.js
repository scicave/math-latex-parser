const basic = require('./basic');

let tests = {
  basic,

  // TODO: to make like basic
  singleChar: {
    basic: [
      {
        tex: `\\sum _ 1 ^\nx -5.6a+ b`,
        struct: {
          type: "sum",
          args: [
            1,
            "x",
            {
              name: "+",
              type: "operator",
              args: [
                {
                  type: "automult",
                  args: [-5.6, "a"],
                },
                "b",
              ],
            },
          ],
        },
      },
      {
        tex: `\\sum ^\tx _ 1 -5.6a+ b`,
        struct: {
          type: "sum",
          args: [
            1,
            "x",
            {
              name: "+",
              type: "operator",
              args: [
                {
                  type: "automult",
                  args: [-5.6, "a"],
                },
                "b",
              ],
            },
          ],
        },
      },
    ],
    autoMult: [
      {
        tex: "3^6cd\\sqrt af",
        struct: {
          type: "automult",
          args: [
            {
              type: "automult",
              args: [
                {
                  type: "automult",
                  args: [
                    {
                      type: "automult",
                      args: [
                        {
                          type: "operator",
                          name: "^",
                          args: [3, 6],
                        },
                        "c",
                      ],
                    },
                    "d",
                  ],
                },
                { type: "sqrt", args: ["a"] },
              ],
            },
            "f",
          ],
        },
      },
      {
        tex: "12+3^6x \\frac 1 {5+3}",
        struct: {
          name: "+",
          type: "operator",
          args: [
            12,
            {
              type: "automult",
              args: [
                {
                  type: "automult",
                  args: [
                    {
                      name: "^",
                      type: "operator",
                      args: [3, 6],
                    },
                    "x",
                  ],
                },
                {
                  type: "frac",
                  args: [
                    1,
                    {
                      name: "+",
                      type: "operator",
                      args: [5, 3],
                    },
                  ],
                },
              ],
            },
          ],
        },
      },
      {
        tex: "a+ \\frac 1 {5+3} \\int 12",
        struct: {
          name: "+",
          type: "operator",
          args: [
            "a",
            {
              type: "automult",
              args: [
                {
                  type: "frac",
                  args: [
                    1,
                    {
                      name: "+",
                      type: "operator",
                      args: [5, 3],
                    },
                  ],
                },
                {
                  type: "int",
                  args: [null, null, 12],
                },
              ],
            },
          ],
        },
      },
      {
        tex: "a+  \\int 12 \\frac 1 {5+3}",
        struct: {
          name: "+",
          type: "operator",
          args: [
            "a",
            {
              type: "int",
              args: [
                null,
                null,
                {
                  type: "automult",
                  args: [
                    12,
                    {
                      type: "frac",
                      args: [1, { name: "+", type: "operator", args: [5, 3] }],
                    },
                  ],
                },
              ],
            },
          ],
        },
      },
    ],
  },

  multiChar: {
    autoMult: [],
  },

  options: {
    functions: [
      {
        tex: `f(x)`,
        parseOptions: { functions: "f" },
        struct: {
          type: "function",
          name: "f",
          args: [
            {
              type: "block",
              name: "()",
              args: ["x"],
            },
          ],
        },
      },
      {
        tex: `f\\left(x\\right)`,
        parseOptions: { functions: "f" },
        struct: {
          type: "function",
          name: "f",
          args: [
            {
              type: "block",
              name: "\\left(\\right)",
              args: ["x"],
            },
          ],
        },
      },
    ],
  },
};

module.exports = tests;
