const argv = require('yargs').argv;
const fs = require('fs');
const ConverterFactory = require('./src/ConverterFactory');
const { getOutFromInfile } = require('./src/lib/helper');

// Check input
const inFile = argv['in'] || argv['_'][0];
if (!fs.existsSync(inFile)) {
  console.error('--in=FILE is required.');
  return 0;
}

const strategy = argv['type'] || argv['_'][1];
if (!strategy) {
  console.error('--type={DbCreditCard|...} is required.');
  return 0;
}

const outFile = argv['out'] || argv['_'][1] || getOutFromInfile(inFile);

const converter = new ConverterFactory(strategy);
converter.convert(inFile, outFile);
