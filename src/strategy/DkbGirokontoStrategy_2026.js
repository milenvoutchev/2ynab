const parse = require('csv-parse/lib/sync');
const parseDecimalNumber = require('parse-decimal-number');
const { getFileContentsCsv, writeOut } = require('../lib/file.js');
const BaseStrategy = require('./BaseStrategy');

const SETTINGS = {
  delimiter: ';',
  skip_empty_lines: true,
  skip_lines_with_empty_values: true,
  columns: [
    'buchungsdatum',
    'wertstellung',
    'status',
    'zahlungspflichtiger',
    'zahlungsempfaenger',
    'verwendungszweck',
    'umsatztyp',
    'iban',
    'betrag_eur',
    'glaeubiger_id',
    'mandatsreferenz',
    'kundenreferenz',
  ],
  sliceBegin: 5,
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

class DkbGirokontoStrategy extends BaseStrategy {

  constructor() {
    super();
    console.log('DkbGirokontoStrategy');
  }

  /**
   *
   * @param data
   * @returns {*[]}
   */
  static lineTransform(data) {
    const amount = parseDecimalNumber(data.betrag_eur, ".,");
    const memo = data.verwendungszweck;
    const payee = data.zahlungsempfaenger;

    // Convert date format from DD.MM.YY to DD/MM/YY (YNAB compatible)
    const date = data.wertstellung.replace(/\./g, '/');

    const outflow = Math.abs(Math.min(amount, 0));
    const inflow = Math.abs(Math.max(amount, 0));

    const result = [
      date,
      payee,
      '',
      memo,
      outflow > 0 ? outflow : '',
      inflow > 0 ? inflow : ''
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

    const input = getFileContentsCsv(inFile, SETTINGS.sliceBegin, SETTINGS.sliceEnd);

    const data = parse(input, SETTINGS);

    console.log(`Transform: ${data.length}`);

    // Filter out zero-amount rows (opening balance)
    const filteredData = data.filter(row => {
      const amount = parseDecimalNumber(row.betrag_eur, ".,");
      return amount !== 0;
    });

    console.log(`After filtering: ${filteredData.length}`);

    const result = await super.transformAsync(filteredData, DkbGirokontoStrategy.lineTransform);

    writeOut(outFile, result);
    console.log(`Written: ${outFile}`);
  }

  /**
   *
   * @param inFile
   * @returns {boolean}
   */
  static isMatch(inFile) {
    // Match pattern: DD-MM-YYYY_Umsatzliste_*_DE<20 digits>.csv
    return !!inFile.match(/[0-9]{2}-[0-9]{2}-[0-9]{4}_Umsatzliste_[\S]*_DE[0-9]{20}.*\.csv$/);
  }
}

module.exports = DkbGirokontoStrategy;
