/* eslint-disable no-undef, no-unused-vars */

/**
 * the main purpose of this function is to remove some brace "{}" that has np effect on the parse process
 */

function prepareInput(input) {
  // #region vars
  var
    // the same as the pegjs rule "_" in ./tex.pegjs
    ignore = /^(\s|\\ )+/;
    // when we remove the {...} block after one of these,
    // the parsing expression will result in wrong tree
  var braceEffect = /^(\^|_|\\frac|\\sqrt)/;
  var braceImportant = false;
  var braceEffectOn = '';
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
    if (last.b.opening === '{') {
      /// it has effect with frac sqrt ^ _
      if (!last.braceImportant) {
        // handling the unimportant braces or throw error if
        // contains some invalid expression
        console.log('handling unimportant braces');
        input = input.substring(0, last.i) + ' ' + input.substring(last.i + 1);
        input = input.substring(0, i.value) + ' ' + input.substring(i.value + 1);
      } else if (last.braceImportant === 2 && last.braceEffectOn === '\\frac') {
        // in the next iteration through input, it will be decreased by 1,
        // so let it be 2. braceImportant is truely value in that next iteration,,,
        // beacause our location now is after "\frac"
        braceImportant = 2;
      }
    } else if (last.b.opening === '[') {
      if (last.braceImportant && last.braceEffectOn === '\\sqrt') {
        // see the above comment
        braceImportant = 2;
      }
    }
    
    i.value += b.closing.length; // consume the closing char
  }

  function openBLock(b) {
    stats.push({
      b, i: i.value, braceImportant, braceEffectOn
    });
    if(b.opening === "{"){
      // these values has been stored
      braceEffectOn ="";
      braceImportant = 0;
    }
    i.value += b.opening.length; // consume the closing char
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
      this.__changed = true;
    }
  });
  i.value = 0;
  this.__changed = false;

  for (; i.value < input.length;) {
    if (braceImportant) braceImportant--;

    // at this line, braceImportant has to be 0 or 1 only

    input.slice(i.value, -1).replace(ignore, m => {
      i.value += m.length; // consume ignored letters, such as white spaces
    });

    input.slice(i.value, -1).replace(braceEffect, m => {
      braceImportant = m === '\\frac' ? 2 : 1;
      braceEffectOn = m;
      i.value += m.length; // consume the matched text
    });

    // loop through the input, open and close blocks using hereinabove functions
    for (const b of blocks) {
      let last;
      if (stats.length) last = stats[stats.length - 1];

      if (b.opening === b.closing) {
        // this is true for opening and closing the block
        if (input.slice(i.value, i.value + b.opening.length) === b.opening /* || b.closing */) {
          if (last && last.b === b) { closeBLock(b); } else { openBLock(b); }
          break; // stop the for loop
        }
      } else if (input.slice(i.value, i.value + b.opening.length) === b.opening) {
        openBLock(b); break; // stop the for loop
      } else if (input.slice(i.value, i.value + b.closing.length) === b.closing) {
        if (last.b !== b) {
          const location = peg$computeLocation(last.i, i.value);
          error(`"${last.b.opening}" found but the block is not closed, hint: add "${last.b.closing}"`, location);
        }
        closeBLock(b);
        break; // stop the for loop
      }
    }

    if (!i.__changed) {
      i.value++;
    }
    i.__changed = false;
  }

  if (stats.length > 0) {
    let last = stats.pop();
    // this will throw reference error if the module used standalone
    const location = peg$computeLocation(last.i, i.value - 1);
    // this will throw syntax error
    error(`"${last.b.opening}" found but the block is not closed, hint: add "${last.b.closing}"`, location);
  }

  return input;
}
