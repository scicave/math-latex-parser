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
    },
  ],
};

module.exports = tests;