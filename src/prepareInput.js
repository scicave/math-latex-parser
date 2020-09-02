/* eslint-disable no-undef */

module.exports = function checkBlocks (input, deletes) {
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

  function closeBLock () {

  }

  Object.defineProperty(i, 'value', {
    get () {
      return this.__value;
    },
    set (v) {
      this.__value = v;
      this.__changed = true;
    }
  });
  i.__value = 0;

  for (; i.value < input.length;) {
    if (braceImportant) braceImportant--;

    // ignore whitespaces
    input.slice(i, -1).replace(ignore, (m) => {
      i += m.length;
    });
    input.slice(i, -1).replace(braceEffect, (m) => {
      if (braceImportant) {
        // such as the frac and the sum, braceImportant is one after
        // the sum or the square brackets, if we find another bracket
        // important that mean that there is as error
        const location = peg$computeLocation(last.i, i);
        error(`${m} is unexpected after `, location);
      }
      braceImportant = 1;
      braceEffectOn = m;
      i += m.length;
    });

    for (const b of blocks) {
      let last;
      if (stats.length) last = stats[stats.length - 1];

      if (b.opening === b.closing) {
        // this is true for opening and closing the block
        if (input.slice(i, i + b.opening.length) === b.opening /* || b.closing */) {
          if (last && last.b === b) {
            closeBLock();
          } else {
            stats.push({
              b, i, braceImportant, braceEffectOn
            });
          }
          i += b.opening.length; break;
        }
      } else if (input.slice(i, i + b.opening.length) === b.opening) {
        stats.push({
          b, i, braceImportant, braceEffectOn
        });
        i += b.opening.length; break;
      } else if (input.slice(i, i + b.closing.length) === b.closing) {
        const last = stats[stats.length - 1];
        if (last.b !== b) {
          const location = peg$computeLocation(last.i, i);
          error(`"${last.b.opening}" found but the block is not closed, hint: add "${last.b.closing}"`, location);
        }
        if (last.b.opening === '{') {
          /// it has effect with frac sqrt ^ _
          if (!last.braceImportant) {

          }
        } else if (last.b.opening === '[') {
          if (last.braceImportant && last.braceEffectOn === '\\sqrt') {
            braceImportant = 2;
          }
        }
        stats.pop();
        i += b.closing.length; break;
      }
    }

    if (!i.__changed) {
      i.value++;
    }
    i.__changed = false;
  }

  if (stats.length > 0) {
    const location = peg$computeLocation(last.i, i - 1);
    error(`"${last.b.opening}" found but the block is not closed, hint: add "${last.b.closing}"`, location);
  }

  return input;
};
