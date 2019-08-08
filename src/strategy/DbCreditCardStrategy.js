const parse = require('csv-parse/lib/sync');
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

  /**
   *
   * @param data
   * @returns {*[]}
   */
  static lineTransform(data) {
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

  /**
   *
   * @param inFile
   * @param outFile
   * @returns {Promise<void>}
   */
  async convert(inFile, outFile) {
    console.log(`In: ${inFile}`);

    const input = getInput(inFile, SETTINGS.sliceBegin, SETTINGS.sliceEnd);

    const data = parse(input, SETTINGS);

    console.log(`Transform: ${data.length}`);

    const result = await super.transformAsync(data, DbCreditCardStrategy.lineTransform);

    writeOut(outFile, result);
    console.log(`Written: ${outFile}`);
  }

  /**
   *CreditCardTransactions5232123412341234_2018_05
   * @param inFile
   * @returns {boolean}
   */
  static isMatch(inFile) {
    return !!inFile.match(/CreditCardTransactions\d{16}_\d{4}_\d{2}.csv$/g);
  }
}

module.exports = DbCreditCardStrategy;
