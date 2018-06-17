const argv = require('yargs').argv;
const fs = require('fs');
const ConverterFactory = require('./src/ConverterFactory');
const { getOutFromInfile } = require('./src/lib/helper');

// Check input
const inFile = argv['in'] || argv['_'][0];

let errorMessage;
if (!fs.existsSync(inFile)) {
  errorMessage = 'Input file is required: [--in=]FILE';
}

const strategy = argv['type'] || argv['_'][1];
if (!strategy) {
  errorMessage = 'File type is required: [--type=]' + ConverterFactory.getStrategies().join('|');
}

if (errorMessage) {
  console.error(errorMessage);
  return 0;
}

const outFile = argv['out'] || argv['_'][2] || getOutFromInfile(inFile);

const converter = new ConverterFactory(strategy);
converter.convert(inFile, outFile);
