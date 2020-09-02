
class Node {
  constructor (type, args, props) {
    Object.assign(this, props);

    if (this.types.values.indexOf(type) === -1) {
      throw new Error('invalid type for the node, "' + type + '"');
    }

    this.type = type;
    this.args = args;
  }

  check (t) {
    if (this.types.values.indexOf(t) > -1) {
      if (this.type === t) {
        return true;
      }
    } else {
      throw new Error('invalid type, can\'t check for "' + this.type + '"');
    }
  }
}

Node.prototype.types = {

  NUMBER: 'number',
  ID: 'id',
  FUNCTION: 'function',

  OPERATOR: 'operator',
  AUTO_MULT: 'automult',
  BLOCK: 'block',

  FRAC: 'frac',
  INT: 'int',
  SUM: 'sum',
  OPERATORNAME: 'operatorname'

};

Node.prototype.types.values = Object.values(Node.prototype.types);
Node.prototype.types.operators = [
  '*', '/', '+', '-', '!', '^', '=', 'cdot'
];
Node.types.blocks = [
  '()','{}','[]','()','{}','[]','||',
];

module.exports = Node;
