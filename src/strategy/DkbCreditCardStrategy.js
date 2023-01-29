const parse = require('csv-parse/lib/sync');
const parseDecimalNumber = require('parse-decimal-number');
const { getFileContentsCsv} = require('../lib/file.js');
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
  sliceBegin: 7,
  sliceEnd: Infinity,
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
    console.log('DkbCreditCardStrategy');
  }

  /**
   *
   * @param data
   * @returns {*[]}
   */
  static lineTransform(data) {
    const amount = parseDecimalNumber(data.amount_eur, ".,");
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

  /**
   *
   * @param inFile
   * @returns {Promise<void>}
   */
  async convert(inFile) {
    console.log(`In: ${inFile}`);

    const input = getFileContentsCsv(inFile, SETTINGS.sliceBegin, SETTINGS.sliceEnd);

    const data = parse(input, SETTINGS);

    console.log(`Transform: ${data.length}`);

    return await super.transformAsync(data, DkbCreditCardStrategy.lineTransform);
  }

  /**
   *
   * @param inFile
   * @returns {boolean}
   */
  static isMatch(inFile) {
    return !!inFile.match(/\d{4}________\d{4}.csv$/g);
  }
}

module.exports = DkbCreditCardStrategy;
