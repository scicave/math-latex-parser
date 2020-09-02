const texParser = require('./lib/');
const checkBlock = require('./src/prepareInput.js');
let tex = process.argv[process.argv.indexOf('--tex') + 1];


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

function logCheckBlock(){
  console.log('testing check block function >>>>>>>>>>>>>>');
  console.log('===============');
  console.log(checkBlock(tex));
  console.log('===============');
  console.log('done: testing check block function !');
}

function log() {
  console.log('testing tex parser >>>>>>>>>>>>>>');
  console.log('===============');
  console.log(JSON.stringify(parse(tex), null, 2));
  console.log('===============');
  console.log('tex parser test done!');
}

logCheckBlock(tex);
// log();
