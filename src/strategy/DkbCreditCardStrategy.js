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
    'im_saldo',
    'date_document',
    'date_receipt',
    'description',
    'amount_eur',
    'amount_foreign_currency_text',
    'empty',
  ],
  sliceBegin: 8,
  sliceEnd: null,
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

class DkbCreditCardStrategy extends BaseStrategy {

  constructor() {
    super();
    console.log('DkbCreditCardStrategy:constructor');
  }

  lineTransform(data) {
    const amount = parseFloat(data.amount_eur.replace(' ', '').replace(',', '.'));
    const memo = data.amount_foreign_currency_text;
    const result = [
      data.date_receipt,
      data.description,
      '',
      memo,
      Math.abs(Math.min(amount, 0)),
      Math.abs(Math.max(amount, 0))
    ];
    return result;
  }

  async convert(inFile, outFile) {
    console.log(`In: ${inFile}`);

    const input = getInput(inFile, SETTINGS.sliceBegin, SETTINGS.sliceEnd);

    console.log(`input: ${input}`);

    const data = parse(input, SETTINGS);

    console.log(`Transform: ${data.length}`);

    const result = await super.transformAsync(data, this.lineTransform);

    writeOut(outFile, result);
    console.log(`Written: ${outFile}`);
  }
}

module.exports = DkbCreditCardStrategy;
