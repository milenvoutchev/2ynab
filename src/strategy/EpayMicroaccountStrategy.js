const parse = require('csv-parse/lib/sync');
const { getFileContentsCsv} = require('../lib/file.js');
const BaseStrategy = require('./BaseStrategy');

const SETTINGS = {
  delimiter: ',',
  skip_empty_lines: true,
  skip_lines_with_empty_values: true,
  columns: [
    'dateTime',
    'account',
    'inBGN',
    'outBGN',
    'recipient',
    'systemCode',
    'comment',
    'longDescriptiom',
  ],
  sliceBegin: 1,
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

const RATE_EUR_BGN = 1.95583;

class EpayMicroaccountStrategy extends BaseStrategy {

  constructor() {
    super();
    console.log('EpayMicroaccountStrategy');
  }

  static toEUR(amount) {
    return amount * 1 / RATE_EUR_BGN;
  }

  static toDate(dateTime) {
    return String(dateTime).replace(/^(\d{2})\.(\d{2})\.(\d{4}).+/g,'$3-$2-$1');
  }

  /**
   *
   * @param data
   * @returns {*[]}
   */
  static lineTransform(data) {
    const amountOut = EpayMicroaccountStrategy.toEUR(data.outBGN);
    const amountIn = EpayMicroaccountStrategy.toEUR(data.inBGN);
    const date = EpayMicroaccountStrategy.toDate(data.dateTime);
    const result = [
      date,
      data.recipient,
      '',
      data.comment,
      Math.abs(amountOut),
      Math.abs(amountIn)
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

    return await super.transformAsync(data, EpayMicroaccountStrategy.lineTransform);
  }

  /**
   * E.g. epay_microaccount_2019-08-08_11-43-49.csv
   * @param inFile
   * @returns {boolean}
   */
  static isMatch(inFile) {
    const filePatterns = [
      /^epay_movements_\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2}.csv$/g,
      /^epay_microaccount_\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2}.csv$/g,
    ];
    return filePatterns.some(pattern => inFile.match(pattern));
  }
}

module.exports = EpayMicroaccountStrategy;
