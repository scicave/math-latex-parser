const pegjs = require('pegjs');
const fs = require('fs');
const path = require('path');
const rimraf = require('rimraf');

const dev = process.env.NODE_ENV !== 'production';

const pegjsOptions = {
  output: 'source',
  format: 'commonjs'
};

const replacements = [
  {
    text: [
      'module.exports = {',
      '  SyntaxError: peg$SyntaxError,',
      '  parse:       peg$parse',
      '};'
    ].join('\n'),

    replacement: [
      'module.exports = {',
      '  SyntaxError: peg$SyntaxError,',
      '  parse:       peg$parse,',
      '  version,',
      '  Node',
      '};'
    ].join('\n')

  }
];

const grammarFiles = [
  {
    input: './src/tex.pegjs',
    output: './lib/index.js',
    dependencies: {
      Node: './texParserNode.js',
      version: './version.js',
      prepareInput: './prepareInput.js',
    }
  }
];

grammarFiles.forEach(file => {
  pegjsOptions.dependencies = file.dependencies;
  const inputPath = path.resolve(__dirname, file.input);
  const inputDir = path.dirname(inputPath);
  const outputPath = path.resolve(__dirname, file.output);
  const outputDir = path.dirname(outputPath);

  if (outputDir !== inputDir) {
    prepareOutputDir(outputDir);
  }

  console.log('compiling>>>>>>>>>>>>>');
  console.log(inputPath);
  console.log();

  function getParserCode () {
    const grammar = fs.readFileSync(inputPath).toString('utf8');
    let code = pegjs.generate(grammar, pegjsOptions);

    /// some targeted replacments
    for (const r of replacements) {
      code = code.replace(r.text, r.replacement);
    }

    /// here we want to replace comment with contents file
    /** # require('./preParse.js'); */
    code = code.replace(/\/\*\*#\s*require\s*\(\s*(?:"|')(.*?)(?:"|')\s*\)\s*;?\s*\*\//gm, (m, g) => {
      return fs.readFileSync(path.resolve(inputDir, g)).toString('utf8');
    });

    return code;
  }

  fs.writeFileSync(outputPath, getParserCode());

  if (outputDir !== inputDir) {
    // copy depedencies to the output directory
    for (const d of Object.values(file.dependencies)) {
      const p1 = path.resolve(inputDir, d);
      const p2 = path.resolve(outputDir, d);
      const dist = path.dirname(p2);

      if (!fs.existsSync(dist)) {
        fs.mkdirSync(dist, { recursive: true });
      }

      const readable = fs.createReadStream(p1, { encoding: 'utf-8' });
      const writable = fs.createWriteStream(p2);
      readable.pipe(writable);
    }
  }

  console.log('js code:::::::::');
  console.log(outputPath);
  console.log();
});

function prepareOutputDir (outputDir) {
  if (fs.existsSync(outputDir)) {
    /// delete all the output dir content
    rimraf.sync(path.resolve(outputDir, '*'));
  } else {
    fs.mkdirSync(outputDir, { recursive: true });
  }
}
