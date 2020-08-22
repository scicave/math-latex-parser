const pegjs = require('pegjs');
const fs = require('fs');
const path = require('path');
const rimraf = require('rimraf');

let pegjsOptions = {
    output: 'source',
    format: 'commonjs',
};

let replacements = [
    {
        text: [
            "module.exports = {",
            "  SyntaxError: peg$SyntaxError,",
            "  parse:       peg$parse",
            "};",
        ].join('\n'),
    
        replacement: [
            "module.exports = {",
            "  SyntaxError: peg$SyntaxError,",
            "  parse:       peg$parse,",
            "  Node",
            "};",
        ].join('\n')

    }
];

let grammarFiles = [
    {
        input: './src/tex.pegjs',
        output: './dist/index.js',
        dependencies: {
            Node: './texParserNode.js'
        },
    },
]; 

grammarFiles.forEach(file=>{

    pegjsOptions.dependencies = file.dependencies;
    let inputPath = path.resolve(__dirname, file.input);
    let inputDir = path.dirname(inputPath);
    let outputPath = path.resolve(__dirname, file.output);
    let outputDir = path.dirname(outputPath);

    prepareOutputDir(outputDir);

    console.log('compiling>>>>>>>>>>>>>');
    console.log(inputPath);
    console.log();

    function getParserCode(){

        let grammar = fs.readFileSync(inputPath).toString('utf8');
        let code = pegjs.generate(grammar, pegjsOptions);
        
        /// some targeted replacments
        for(let r of replacements){
            code = code.replace(r.text, r.replacement);
        }
        
        /// here we want to replace comment with contents file
        code = code.replace(/\/\*\*#\s*require\s*\(\s*"(.*?)"\s*\)\s*\*\//gm, (m, g)=>{
            return fs.readFileSync(path.resolve(inputDir, g)).toString('utf8');
        });

        return code;
    }

    fs.writeFileSync(outputPath, getParserCode());

    // copy depedencies to the output directory
    for(let d of Object.values(file.dependencies)){

        let p1 = path.resolve(inputDir, d);
        let p2 = path.resolve(outputDir, d);
        let dist = path.dirname(p2);

        if(!fs.existsSync(dist)){
            fs.mkdirSync(dist, {recursive:true});
        }

        let readable = fs.createReadStream(p1, {encoding: 'utf-8'});
        let writable = fs.createWriteStream(p2);
        readable.pipe(writable);

    }

    console.log('js code:::::::::');
    console.log(outputPath);
    console.log();

});


function prepareOutputDir(outputDir){
    if(fs.existsSync(outputDir)){
        /// delete all the output dir content
        rimraf.sync(path.resolve(outputDir, '*'));
    } else {
        fs.mkdirSync(outputDir, { recursive: true });
    }
}
