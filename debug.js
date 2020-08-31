let texParser = require('./lib/');
let tex = process.argv[process.argv.indexOf('--tex')+1];

function logTex(tex){
    console.log("parsing:", tex);
    try{
        let tree = texParser.parse(tex);
        console.log(JSON.stringify(tree, null, 2));
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

function log(){
    console.log('testing tex parser >>>>>>>>>>>>>>');

    logTex(tex);
    console.log('===============');
    console.log();

    console.log('tex parser test done!');
}

log();