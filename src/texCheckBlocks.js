
let deletes = [];
let rawInput = input; 

function checkBlocks(input) {

  //#region vars
  var
  ignore = /^(\s|\\ )+/, // the save as the pegjs rule "_" 
  braceEffect = /^(\^|_|\\frac|\\sqrt)/,
  braceImportant = false,
  braceEffectOn = "",
  i = { },
  blocks = [
    { opening: "{", closing: "}" },
    { opening: "(", closing: ")" },
    { opening: "[", closing: "]" },
    { opening: "|", closing: "|" },
    { opening: "\\{", closing: "\\}" },
    { opening: "\\|", closing: "\\|" },
    { opening: "\\left{", closing: "\\right}" },
    { opening: "\\left(", closing: "\\right)" },
    { opening: "\\left[", closing: "\\right]" },
    { opening: "\\left|", closing: "\\right|" },
  ],
  stats= [];
  //#endregion

  Object.defineProperty(i,"value", {
    get(){
      return this.__value;
    },
    set(v){
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
        let location = peg$computeLocation(last.i, i);
        error(`${m} is unexpected after `, location);
    }
      braceImportant = 1;
      braceEffectOn = m;
      i += m.length;
    });


    for (let b of blocks) {

      let last = stats[stats.length - 1];


      if (b.opening === b.closing) {
        // this is true for opening and closing the block
        if (input.slice(i, i + b.opening.length) === b.opening) {
          if (last.b === b) {
            stats.pop();
          } else {
            stats.push({
              b, i, braceImportant, braceEffectOn
            });
          }
          i += b.opening.length; break;
        }
      } 
      
      
      else if (input.slice(i, i + b.opening.length) === b.opening) {
        stats.push({
          b, i, braceImportant, braceEffectOn
        });
        i += b.opening.length; break;
      }
      
      
      else if (input.slice(i, i + b.closing.length) === b.closing) {
        let last = stats[stats.length - 1];
        if (last.b !== b) {
          let location = peg$computeLocation(last.i, i);
          error(`"${last.b.opening}" found but the block is not closed, hint: add "${last.b.closing}"`, location);
        }
        if (last.b.opening === "{") {
          /// it has effect with frac sqrt ^ _
          if (!last.braceImportant) {

          }
        } else if (last.b.opening === "[") {
          if (last.braceImportant && last.braceEffectOn === "\\sqrt") {
            braceImportant = 2;
          }
        }
        stats.pop();
        i += b.closing.length; break;
      }

    }

    if(!i.__changed){
      i.value++;
    }
    i.__changed = false;
  }

  if (stats.length > 0) {
    let location = peg$computeLocation(last.i, i - 1);
    error(`"${last.b.opening}" found but the block is not closed, hint: add "${last.b.closing}"`, location);
  }

  return input;

}

peg$computePosDetails = function (pos) {

  let incre = 0;
  for(let d of deletes){
    if(d.i <= pos){
      incre += d.value.length;
    }
  }

  pos += incre;

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
      if (rawInput.charCodeAt(p) === 10) { // new line
        details.line++;
        details.column = 1;
      } else {
        details.column++;
      }

      p++;
    }

    peg$posDetailsCache[pos] = Object.assign({}, details);

    return details;
  }
};
