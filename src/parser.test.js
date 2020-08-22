let mathParser = require('./math.js');
let texParser = require('./tex.js');

function testMath(){
    console.log('testing math parser >>>>>>>>>>>>>>');
    let math = 
    `\\frac {\\cos x} a`;
    console.log("parsing:", math);
    try{
        let tree = mathParser.parse(math);
        console.log(JSON.stringify(tree, null, 2));
        console.log('math parser test done!');
        console.log(''); console.log('');
    } catch (e){
        if(e instanceof mathParser.SyntaxError){
            console.log("SyntaxError:", e.message);
            console.log(tex);
            console.log((new Array(e.location.start.column-1)).fill(" ").join('') + "^");
        } else {
            throw e;
        }
    }
}


function testTex(){
    console.log('testing tex parser >>>>>>>>>>>>>>');
    let tex = 
    `x^ \\frac 1 2`;
    console.log("parsing:", tex);
    try{
        let tree = texParser.parse(tex);
        console.log(JSON.stringify(tree, null, 2));
        console.log('tex parser test done!');
        console.log(''); console.log('');
    } catch (e){
        if(e instanceof texParser.SyntaxError){
            console.log("SyntaxError:", e.message);
            
            let i = e.location.start.line-1;
            let lines = tex.split('\n');

            if(i-2>-1)              console.log(lines[i-2]);
            if(i-1>-1)              console.log(lines[i-1]);
                                    console.log();
                                    console.log(lines[i]);
                                    console.log((new Array(e.location.start.column-1)).fill("_").join('') + "^");
                                    console.log();
            if(i+1<lines.length)    console.log(lines[i+1]);
            if(i+2<lines.length)    console.log(lines[i+2]);

        
        } else {
            throw e;
        }
    }
}

// testMath();
testTex();


// module.exports = {
//     testMath, testTex
// }
