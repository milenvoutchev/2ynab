const argv = require('yargs').argv;
const fs = require('fs');
const ConverterFactory = require('./src/ConverterFactory');
const { getOutFromInfile } = require('./src/lib/helper');

// Check input
const inFile = argv['in'] || argv['_'][0];

let errorMessages = [];
if (!fs.existsSync(inFile)) {
  errorMessages.push('Input file is required: [--in=]FILE');
}

const strategy = argv['type'] || argv['_'][1];
if (!strategy) {
  errorMessages.push('File type is required: [--type=]' + ConverterFactory.getStrategies().join('|'));
}

if (errorMessages) {
  console.error(errorMessages.join("\r\n"));
  return 0;
}

const outFile = argv['out'] || argv['_'][2] || getOutFromInfile(inFile);

const converter = new ConverterFactory(strategy);
converter.convert(inFile, outFile);
