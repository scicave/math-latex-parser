/* eslint-disable no-undef, no-unused-vars */

/**
 * the main purpose of this function is to remove some brace "{}" that has np effect on the parse process
 */

module.exports = function prepareInput(input, peg$computeLocation, error) {
  // #region vars
  var
    // the same as the pegjs rule "_" in ./tex.pegjs
    ignore = /^(?:\s|\\ )+/;
    // when we remove the {...} block after one of these,
    // the parsing expression will result in wrong tree
  var argsNeededTest = /^(\^|_|\\frac|\\sqrt)/;
  var argsNeeded = false;
  var argsFor = '';
  // it is used when we already consumed to stop he auto increament i.value++
  var skipConsuming = false;
  var i = { };
  var blocks = [
    { opening: '{', closing: '}' },
    { opening: '(', closing: ')' },
    { opening: '[', closing: ']' },
    { opening: '|', closing: '|' },
    { opening: '\\{', closing: '\\}' },
    { opening: '\\|', closing: '\\|' },
    { opening: '\\left{', closing: '\\right}' },
    { opening: '\\left(', closing: '\\right)' },
    { opening: '\\left[', closing: '\\right]' },
    { opening: '\\left|', closing: '\\right|' }
  ];
  var stats = [];

  // #endregion

  function closeBLock (b) {
    let last = stats.pop();

    // on some cases like: 1+2 \\sqrt{\\farc{1}}
    if (argsNeeded) {
      let location = peg$computeLocation(i.value, i.value);
      error(`${argsFor} needs ${ argsNeeded === 1 ? "an argument" : argsNeeded + " argumets" }`, location);
    }

    // we are exiting independent expression in side a block
    // continuting in another independent block or the originame input
    // in both cases, here below may be assigning for argsFor and argsNeeded
    // just reset them here
    argsFor ="";
    argsNeeded = 0;

    if (last.b.opening === '{') {
      /// it has effect with frac sqrt ^ _
      if (!last.argsNeeded) {
        // handling the unimportant braces or throw error if
        // contains some invalid expression
        input =
          input.substring(0, last.i) + ' ' +
          input.substring(last.i + 1, i.value) + ' ' +
          input.substring(i.value + 1)
        ;
      } else if (last.argsNeeded === 2 && last.argsFor === '\\frac') {
        argsFor ="\\frac";
        argsNeeded = 1; skipConsuming = true;
      }
    } else if (last.b.opening === '[') {
      if (last.argsNeeded && last.argsFor === '\\sqrt') {
        argsFor ="\\sqrt";
        argsNeeded = 1; skipConsuming = true;
      }
    }
    
    i.value += b.closing.length; // consume the closing char
    skipConsuming = true;
  }

  function openBLock(b) {
    stats.push({
      b, i: i.value, argsNeeded, argsFor
    });
    // these values has been stored,,, reset them, we are about
    // to enter new independent expression in side a block
    argsFor ="";
    argsNeeded = 0;
    i.value += b.opening.length; // consume the closing char
    skipConsuming = true;
  }

  Object.defineProperty(i, 'value', {
    get () {
      return this.__value;
    },
    set (v) {
      input.slice(v, -1).replace(ignore, m => {
        v += m.length; // consume ignored letters, such as white spaces
      });
      this.__value = v;
    }
  });
  i.value = 0;

  for (; i.value < input.length;) {

    input.slice(i.value, -1).replace(argsNeededTest, m => {

      // tex = " \\frac\\sqrt{1}{2}!"; in such a tex input, there would be error, but 
      // tex = " \\sqrt\\frac{1}{2}!"; will still the same and will be parsed
      // tex = " \\sqrt\\frac{1}_{2}!"; 
      // tex = " \\sqrt\\frac{1}^{2}!"; 
      // in the previous two cases, an error must be thrown

      let a = argsNeeded === 2 ? "a" : "another";
      let location;
      if (
        (argsNeeded && argsFor === '\\frac' && (m === '^' || m === '_')) ||
        (argsNeeded && argsFor === '\\frac' && m === '\\sqrt')
      ) { location = peg$computeLocation(i.value, i.value); }
      if (location) error(`expected ${a} group after \\frac, but found "${m}"`, location);

      argsNeeded = m === '\\frac' ? 2 : 1;
      argsFor = m;
      i.value += m.length; // consume the matched text
      skipConsuming = true;

    });

    // loop through the input, open and close blocks using hereinabove functions
    for (const b of blocks) {
      let last;
      if (stats.length) last = stats[stats.length - 1];

      if (b.opening === b.closing) {
        // this is true for opening and closing the block
        if (input.slice(i.value, i.value + b.opening.length) === b.opening /* || b.closing */) {
          if (last && last.b === b) { closeBLock(b); } else { openBLock(b); }
          break; // stop the blocks for loop
        }
      } else if (input.slice(i.value, i.value + b.opening.length) === b.opening) {
        openBLock(b); break; // stop blocks the for loop
      } else if (input.slice(i.value, i.value + b.closing.length) === b.closing) {
        if (!last || last.b !== b) {
          const location = peg$computeLocation(i.value, i.value);
          error(`"${last.b.opening}" found but the block is not closed, hint: add "${last.b.closing}"`, location);
        }
        closeBLock(b);
        break; // stop the blocks for loop
      }
    }

    // consume arg if it needed and decrease argsNeeded by one
    // if it is not needed consume and don't decrease
    if(!skipConsuming) { i.value++; if(argsNeeded) argsNeeded--; }
    skipConsuming = false;
  }

  if (stats.length > 0) {
    let last = stats.pop();
    // this will throw reference error if the module used standalone
    const location = peg$computeLocation(i.value, i.value);
    // this will throw syntax error in the built commonjs module
    error(`"${last.b.opening}" found but the block is not closed, hint: add "${last.b.closing}"`, location);
  }

  return input;
};
