#!/usr/bin/env node
const argv = require('yargs').argv;
const csv = require('csv');
const fs = require('fs');
const util = require('util');
const parse = require('csv-parse/lib/sync');

// Check input
const inFile = argv['in'] || argv['_'][0];
if (!fs.existsSync(inFile)) {
  console.error('--in=FILE is required.');
  return 0;
}

// convert methods
const inputTransformCreditCard = input => input.split('\n').slice(4).join('\n');

const convert = function (inFile) {
  const options = {
    encoding: 'latin1',
  };
  let input = fs.readFileSync(inFile, options);
  input = inputTransformCreditCard(input);


  const settings = {
    delimiter: ';',
  };
  const output = parse(input, settings);

  console.log('output', output);

};

convert(inFile);
