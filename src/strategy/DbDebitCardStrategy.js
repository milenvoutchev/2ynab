const parse = require('csv-parse/lib/sync');
const transform = require('stream-transform');
const stringify = require('csv-stringify');
const { getInput, writeOut } = require('../lib/file.js');
const BaseStrategy = require('./BaseStrategy');
const { parseIntlNumber } = require('../lib/helper.js');

const SETTINGS = {
  delimiter: ';',
  skip_empty_lines: true,
  skip_lines_with_empty_values: true,
  columns: [
    'date_document',
    'date_receipt',
    'type',
    'beneficiary',
    'details',
    'iban',
    'bic',
    'customer_reference',
    'mandate_reference',
    'creditor_id',
    'compensation_amount',
    'original_amount',
    'ultimate_creditor',
    'number_transactions',
    'number_cheques',
    'debit',
    'credit',
    'currency'
  ],
  sliceBegin: 5,
  sliceEnd: -1,
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
    const debit = parseIntlNumber(data.debit);
    const credit = parseIntlNumber(data.credit);
    const result = [
      data.date_document,
      data.type,
      '',
      data.details,
      Math.abs(Math.min(debit, 0)),
      Math.abs(Math.max(credit, 0))
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
   * Transactions_123_123456789_12345678_123456.csv
   * Kontoumsaetze_123_123456789_12345678_123456.csv
   * @param inFile
   * @returns {boolean}
   */
  static isMatch(inFile) {
    return !!inFile.match(/Transactions_\d{3}_\d{9}_\d{8}_\d{6}.csv$/g)
      || !!inFile.match(/Kontoumsaetze_\d{3}_\d{9}_\d{8}_\d{6}.csv$/g)
  }
}

module.exports = DbCreditCardStrategy;
