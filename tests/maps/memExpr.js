const { node } = require('./utils');

module.exports = [
  {
    tex: `a.x`,
    struct: node.mem(["a", "x"])
  },

  {
    tex: `a.x.p`,
    struct: node.mem([node.mem(["a", "x"]), "p"])
  },
];
