const parse = require('csv-parse/lib/sync');
const transform = require('stream-transform');
const stringify = require('csv-stringify');
const { getInput, writeOut } = require('../lib/file.js');
const BaseStrategy = require('./BaseStrategy');

const SETTINGS = {
  delimiter: ';',
  skip_empty_lines: true,
  skip_lines_with_empty_values: true,
  columns: [
    'date_document',
    'date_receipt',
    'comment',
    'foreign_currency',
    'amount_foreign_currency',
    'exchange_rate',
    'amount',
    'currency'
  ],
  sliceBegin: 5,
  sliceEnd: -2,
  stringifier: {
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
  }
};

class DbCreditCardStrategy extends BaseStrategy {

  constructor() {
    super();
    console.log('DbCreditCardStrategy:constructor');
  }

  lineTransform(data) {
    const amount = data.amount.replace(' ', '').replace(',', '.') * 1;
    const result = [
      data.date_document,
      data.comment,
      '',
      '',
      Math.abs(Math.min(amount, 0)),
      Math.abs(Math.max(amount, 0))
    ];
    return result;
  }

  async convert(inFile, outFile) {
    console.log(`In: ${inFile}`);

    const input = getInput(inFile, SETTINGS.sliceBegin, SETTINGS.sliceEnd);

    const data = parse(input, SETTINGS);

    console.log(`Transform: ${data.length}`);

    const result = await super.transformAsync(data, this.lineTransform);

    writeOut(outFile, result);
    console.log(`Written: ${outFile}`);
  }
}

module.exports = DbCreditCardStrategy;
