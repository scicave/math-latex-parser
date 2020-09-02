const texParser = require('./lib/');
const prepareInput = require('./src/prepareInput.js');
let tex = "1  \n+2\\frac {1} \n {2 \n}";
// tex = "1\t\n+2*x_{1}\\sqrt[someting^here] {1 } ^ {2}";
tex = "1*2!-5^3 \cdot\frac{1}2!";

function parse() {
  console.log('parsing:', tex);
  try {
    return texParser.parse(tex);
  } catch (e) {
    if (e instanceof texParser.SyntaxError) {
      console.log('SyntaxError:', e.message);

      const i = e.location.start.line - 1;
      const lines = tex.split('\n');

      if (i - 2 > -1) console.log(lines[i - 2]);
      if (i - 1 > -1) console.log(lines[i - 1]);
      console.log();
      console.log(lines[i]);
      console.log((new Array(e.location.start.column - 1)).fill('_').join('') + '^');
      console.log();
      if (i + 1 < lines.length) console.log(lines[i + 1]);
      if (i + 2 < lines.length) console.log(lines[i + 2]);
    } else {
      throw e;
    }
  }
}

function log(fn, ...args){
  console.log('start >>>>>>>>>>>>>>');
  console.log('===============');
  console.log(tex);
  console.log('===============');
  console.time(prepareInput.name + ' is done after');
  console.log(fn(...args));
  console.log('===============');
  console.timeEnd(prepareInput.name + ' is done after');
}

log(prepareInput, tex);

// log();
