// const texParser = require('./lib/');
const prepareInput = require('./src/prepareInput.js');
let tex = process.env.tex || `a+ \\left {5+3} `;

function parse() {
  console.log('parsing:', tex);
  return texParser.parse(tex);
}

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

// ---------------------------------
//         PEGjs polyfill
// ---------------------------------

let peg$posDetailsCache  = [{ line: 1, column: 1 }];

function peg$computePosDetails(pos) {
  var details = peg$posDetailsCache[pos], p;

  if (details) {
    return details;
  } else {
    p = pos - 1;
    while (!peg$posDetailsCache[p]) {
      p--;
    }

    details = peg$posDetailsCache[p];
    details = {
      line:   details.line,
      column: details.column
    };

    while (p < pos) {
      if (tex.charCodeAt(p) === 10) {
        details.line++;
        details.column = 1;
      } else {
        details.column++;
      }

      p++;
    }

    peg$posDetailsCache[pos] = details;
    return details;
  }
}

function peg$computeLocation(startPos, endPos) {
  var startPosDetails = peg$computePosDetails(startPos),
      endPosDetails   = peg$computePosDetails(endPos);

  return {
    start: {
      offset: startPos,
      line:   startPosDetails.line,
      column: startPosDetails.column
    },
    end: {
      offset: endPos,
      line:   endPosDetails.line,
      column: endPosDetails.column
    }
  };
}

function error(message, location) {
  location = location !== void 0 ? location : peg$computeLocation(peg$savedPos, peg$currPos)
  throw new SyntaxError(message, location);
}

class SyntaxError extends Error {
  constructor (msg, location) {
    super(msg);
    this.location = location;
  }
}

// -----------------------------------
//   finnally excute the desire
//   function with the desired args
// -----------------------------------

log(prepareInput, tex, peg$computeLocation, error);
