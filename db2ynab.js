#!/usr/bin/env node
const argv = require('yargs').argv;
const csv = require('csv');
const fs = require('fs');
const util = require('util');
const parse = require('csv-parse/lib/sync');
const transform = require('stream-transform');
const stringify = require('csv-stringify');

// Check input
const inFile = argv['in'] || argv['_'][0];
if (!fs.existsSync(inFile)) {
  console.error('--in=FILE is required.');
  return 0;
}

// convert methods
const getSlicedInput = input => input.split('\n').slice(5, -2).join('\n');

const getInput = function (inFile) {
  const options = {
    encoding: 'latin1',
    skip_empty_lines: true,
    skip_lines_with_empty_values: true
  };
  const data = fs.readFileSync(inFile, options);
  return getSlicedInput(data);
};

const convert = function (inFile) {
  const input = getInput(inFile);

  const settings = {
    delimiter: ';',
    columns: [
      'date_document',
      'date_receipt',
      'comment',
      'foreign_currency',
      'amount_foreign_currency',
      'exchange_rate',
      'amount',
      'currency'
    ]
  };
  const data = parse(input, settings);

  // console.log('data', data);

  const stringifierSettings = {
    header: true,
    delimiter: ',',
    columns: [
      'Date',
      'Payee',
      'Category',
      'Memo',
      'Outflow',
      'Inflow'
    ],
  };
  const stringifier = stringify(stringifierSettings)

  const results = [];

  transform(data, function (data) {
    const amount = data.amount.replace(' ', '').replace(',', '.') * 1;
    const result = [
      data.date_document,
      data.comment,
      '',
      '',
      Math.min(amount, 0),
      Math.max(amount, 0)
    ];
    // console.log(result);
    return result;
  }).pipe(stringifier)
    .on('data', buf => results.push(buf.toString()))
    .on('end', () => {

      console.log(results.join(''));
    })


};

convert(inFile);
