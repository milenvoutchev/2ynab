const parse = require('csv-parse/lib/sync');
const transform = require('stream-transform');
const stringify = require('csv-stringify');
const parseDecimalNumber = require('parse-decimal-number');
const { getInput, writeOut } = require('../lib/file.js');
const BaseStrategy = require('./BaseStrategy');

const SETTINGS = {
  delimiter: ';',
  skip_empty_lines: true,
  skip_lines_with_empty_values: true,
  columns: [
    'buchungstag',
    'wertstellung',
    'buchungstext',
    'auftraggeber_beguenstiger',
    'verwendungszweck',
    'kontonummer',
    'blz',
    'betrag_eur',
    'glaubiger_id',
    'mandatsreferenz',
    'kundenreferenz',
    'empty',
  ],
  sliceBegin: 7,
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

class DkbGirokontoStrategy extends BaseStrategy {

  constructor() {
    super();
    console.log('DkbGirokontoStrategy:constructor');
  }

  lineTransform(data) {
    const amount = parseDecimalNumber(data.betrag_eur, ".,");
    const memo = data.verwendungszweck;
    const result = [
      data.buchungstag,
      data.auftraggeber_beguenstiger,
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

    const data = parse(input, SETTINGS);

    console.log(`Transform: ${data.length}`);

    const result = await super.transformAsync(data, this.lineTransform);

    writeOut(outFile, result);
    console.log(`Written: ${outFile}`);
  }
}

module.exports = DkbGirokontoStrategy;
