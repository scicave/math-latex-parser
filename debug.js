const texParser = require('./lib/');
const prepareInput = require('./src/prepareInput.js');
const { peg$computeLocation, error, SyntaxError, input } = require("./tests/pegjsPolyFill");
let tex =
  process.argv[process.argv.length-1]  ||
  process.argv[process.argv.length-1] ||
  `a+ \\left {5+3} `
;


input.value = tex;

// -----------------------------------
//     pretty verpose logging
// -----------------------------------

function log(fn, ...args){
  console.log('start >>>>>>>>>>>>>>');
  console.log('===============');
  console.log(tex);
  console.log('===============');
  console.time(fn.name + ' is done after');
  try {
    console.log(fn(...args));
  } catch (e) {
    if (e instanceof SyntaxError || e instanceof texParser.SyntaxError) {
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
  console.log('===============');
  console.timeEnd(fn.name + ' is done after');
}

// -----------------------------------
//   finnally excute the desire
//   function with the desired args
// -----------------------------------

process.argv.indexOf('--prepare') > -1
? log(prepareInput, tex, peg$computeLocation, error)
: log(texParser.parse, tex);
