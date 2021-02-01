// TODO: unmatched brackets are valid incase of intervals
/**
 * the main purpose of this function is to remove some brace "{}" that has np effect on the parse process
 */

module.exports = function prepareInput(input, peg$computeLocation, error) {
  
  // #region vars
  let // the same as the pegjs rule "_" in ./tex.pegjs
    ignore = /^(?:\s|\\ )+/;
  // when we remove the {...} block after one of these,
  // the parsing expression will result in wrong tree
  let needsArgRegExp = /^(\^|_|\\frac|\\sqrt)/;
  let defaultState = {
    neededArgsCount: 0,
    argsFor: "",
    prefix: ""
  };
  let state = Object.assign({}, defaultState);
  // it is used when we already consumed to stop he auto increament i.value++
  let skipConsuming = false;
  let i = {};
  let blockStack = [];

  let blocks = [
    { opening: "{", closing: "}", prefixed: true },
    { opening: "(", closing: ")", prefixed: true },
    { opening: "[", closing: "]", prefixed: true },
    { opening: "|", closing: "|", prefixed: true },
    { opening: "\\{{", closing: "\\}}" },
    { opening: "\\{", closing: "\\}" },
    { opening: "\\|", closing: "\\|" },
  ];

  let blockPrefixesReg = /^(\\operatorname|\\left|\\right|\\begin|\\end|\\bigg|\\Bigg|\\big|\\Big)/;

  // #endregion

  function closeBLock(b) {
    let last = blockStack.pop();

    // on some cases like: 1+2 \\sqrt{\\farc{1}}
    if (state.neededArgsCount) {
      let location = peg$computeLocation(i.value, i.value);
      error(
        `${state.argsFor} needs ${state.neededArgsCount === 1
          ? "an argument"
          : state.neededArgsCount + " argumets"
        }`,
        location
      );
    }

    // -------------------
    //      CASE 1
    // -------------------


    if (last.state.prefix === "\\begin") {
      let braces = input.slice(last.i, i.value+1);
      blockStack.push({
        isBegin: true,
        i: i.value,
        // for throwing when \end is not found 
        b: { opening: "\\begin" + braces, closing: "\\end" + braces }
      });
      Object.assign(state, defaultState);
      i.value += b.closing.length; // consume the closing char
      return;
    } else if (last.state.prefix === "\\end") {
      if (state.prefix) {
        let location = peg$computeLocation(last.value, last.value);
        error(`\\end found but can't find \\begin`, location);
      }
      let begin = blockStack.pop(); // pop another block
      // we expect to find the one we push earlier
      if (!begin.isBegin) {
        let location = peg$computeLocation(last.value, last.value);
        error(`\\end found but can't find \\begin`, location);
      }
      Object.assign(state, defaultState);
      i.value += b.closing.length; // consume the closing char
      return;
      // new we habe begin-end block
    }


    // -------------------
    //      CASE 2
    // -------------------

    if (last.state.prefix === "\\operatorname") {
      // just end here
      Object.assign(state, defaultState);
      i.value += b.closing.length; // consume the closing char
      return;
    }

    // -------------------
    //      CASE 3
    // -------------------

    let msg;
    
    // un matched prefixes, `\\left {  \\right}`
    if (state.prefix && !b.prefixed)
      msg = `unexpected "${b.closing}" after "${state.prefix}"`;
    else if (last.state.prefix === "\\left") {
      if (state.prefix !== "\\right") {
        msg = `expected "\\right"${state.prefix ? ` but "${state.prefix}" found` : ""}`;
        let location = peg$computeLocation(i.value, i.value);
        error(msg, location);
      }
      Object.assign(state, defaultState);
      i.value += b.closing.length; // consume the closing char
      return;
    }
    else if (state.prefix !== last.state.prefix)
      msg = `expected "${last.state.prefix}"${state.prefix ? ` but "${state.prefix}" found` : ""}`;
    else if (state.prefix) {
      Object.assign(state, defaultState);
      i.value += b.closing.length; // consume the closing char
      return;
    }

    if (msg) {
      let location = peg$computeLocation(i.value, i.value);
      error(msg, location);
    }

    // -------------------
    //      CASE 4
    // -------------------

    // we are exiting to the parent block
    // we have to restore defaults
    Object.assign(state, defaultState);

    if (last.b.opening === "{") {
      /// it has effect with frac sqrt ^ _
      if (!last.state.neededArgsCount) {
        // handling the unimportant braces or throw error if
        // contains some invalid expression
        input =
          input.slice(0, last.i) +
          " " +
          input.slice(last.i + 1, i.value) +
          " " +
          input.slice(i.value + 1);
      } else if (last.state.neededArgsCount === 2 && last.state.argsFor === "\\frac") {
        // upate the current state
        state.argsFor = "\\frac";
        state.neededArgsCount = 1;
      }
    } else if (last.b.opening === "[") {
      if (last.state.neededArgsCount && last.state.argsFor === "\\sqrt") {
        // upate the current state
        state.argsFor = "\\sqrt";
        state.neededArgsCount = 1;
      }
    }

    i.value += b.closing.length; // consume the closing char
  }

  function openBLock(b) {
    let msg;

    // validations
    if (state.prefix === "\\right")
      msg = `unexpected \\right at the block opening "${b.opening}"`;

    else if (
      b.opening !== "{" &&
      (
        state.prefix === "\\begin" ||
        state.prefix === "\\end" ||
        state.prefix === "\\operatorname"
      )
    )
      // such as: `\\begin [something] asd \\end [something]`
      msg = `expected block "{ ... }" but ${b.opening} found`;

    else if (state.prefix && !b.prefixed)
      msg = `unexpected "${b.closing}" after "${state.prefix}"`;

    if (msg) {
      let location = peg$computeLocation(i.value, i.value);
      error(msg, location);
    }

    // push to the block stack, clone the state
    blockStack.push({
      b,
      i: i.value,
      state: Object.assign({}, state), // clone
    });
    Object.assign(state, defaultState); // restore defaults
    i.value += b.opening.length; // consume the closing char
  }

  Object.defineProperty(i, "value", {
    get() {
      return this.__value;
    },
    set(v) {
      input.slice(v, -1).replace(ignore, (m) => {
        v += m.length; // consume ignored letters, such as white spaces
      });
      this.__value = v;
      // stop consuming at the end of the for loop
      // if we are changing i.value nomally, it won't effect any thing
      // skipConsuming is set to false then for loop `continue;`
      skipConsuming = true;
    },
  });
  i.value = 0;

  while (i.value < input.length) {

    // validation and determine the current state
    if (state.prefix === "\\operatorname") {
      if (!/^([a-z]|\\[a-z])/i.test(input.slice(i.value))) {
        const location = peg$computeLocation(i.value, i.value);
        error(`unexpected "${state.prefix}" before "${input[i.value]}"`, location);  
      }
      state.prefix = "";
    } else if (state.prefix) {
      const location = peg$computeLocation(i.value, i.value);
      error(`unexpected "${state.prefix}" before "${input[i.value]}"`, location);
    }

    input.slice(i.value).replace(needsArgRegExp, (m) => {
      // tex = "\\frac\\sqrt{1}{2}!"; in such a tex input, there would be error, but
      // tex = "\\sqrt\\frac{1}{2}!"; will still the same and will be parsed
      // tex = "\\sqrt\\frac{1}_{2}!";
      // tex = "\\sqrt\\frac{1}^{2}!";
      // tex = "a_a_1"; is NOT valid
      // tex = "a_{a_1}"; is VALID
      // in the previous last two cases, an error must be thrown

      let a = state.neededArgsCount === 2 ? "a" : "another"; // for semantic purpose
      let location;
      if (
        (
          state.neededArgsCount &&
          state.argsFor === "\\frac" &&
          (m === "^" || m === "_")
        ) || (
          state.neededArgsCount &&
          state.argsFor === "\\frac" &&
          m === "\\sqrt"
        )
      ) {
        location = peg$computeLocation(i.value, i.value);
      }

      if (location)
        error(`expected ${a} group after \\frac, but found "${m}"`, location);

      state.neededArgsCount = m === "\\frac" ? 2 : 1;
      state.argsFor = m;
      i.value += m.length; // consume the matched text
    });

    input.slice(i.value).replace(blockPrefixesReg, (pref) => {
      state.prefix = pref;
      i.value += pref.length; // consume the matched text
    });

    // loop through the input, open and close blocks using hereinabove functions
    for (const b of blocks) {
      let last;
      if (blockStack.length) last = blockStack[blockStack.length - 1];

      if (b.opening === b.closing) {
        // this is true for opening and closing the block
        if (
          input.slice(i.value, i.value + b.opening.length) ===
          b.opening /* || b.closing */
        ) {
          if (last && last.b === b) {
            closeBLock(b);
          } else {
            openBLock(b);
          }
          break; // stop the blocks for-loop
        }
      } else if (
        input.slice(i.value, i.value + b.opening.length) === b.opening
      ) {
        openBLock(b);
        break; // stop blocks the for-loop
      } else if (
        input.slice(i.value, i.value + b.closing.length) === b.closing
      ) {
        if (last && last.b !== b) {
          const location = peg$computeLocation(i.value, i.value);
          error(
            `"${last.b.opening}" found but the block is not closed, hint: add "${last.b.closing}"`,
            location
          );
        } else if (!last || blockStack.filter((_) => _.b === b).length === 0) {
          const location = peg$computeLocation(i.value, i.value);
          // closing with out opening
          error(`block "${b.opening}" is not found before!`, location);
        }
        closeBLock(b);
        break; // stop the blocks for-loop
      }
    }

    if (state.prefix === "begin" || state.prefix === "end") {
      // such as: `\\begin 1 asd \\end 1`
      let location = peg$computeLocation(i.value, i.value);
      error(`expected block "{something}" but "${input[i.value]}" found`, location);
    }

    if (!skipConsuming) {
      i.value++;
      if (state.neededArgsCount) state.neededArgsCount--;
    }
    skipConsuming = false; // reset it
  }

  if (blockStack.length > 0) {
    let last = blockStack.pop();
    // this will throw reference error if the module used standalone
    const location = peg$computeLocation(i.value, i.value);
    // this will throw syntax error in the built commonjs module
    error(
      `"${last.b.opening}" found but the block is not closed, hint: add "${last.b.closing}"`,
      location
    );
  }

  return input;
};
