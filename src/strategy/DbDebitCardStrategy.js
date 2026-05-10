const { parseIntlNumber } = require('../lib/helper.js');
const { loadCsvConfig, getBankConfig } = require('../lib/configLoader.js');
const CsvStrategy = require('./CsvStrategy');

const SETTINGS = loadCsvConfig('DE Deutsche Bank', getBankConfig);
// Override filename pattern to support both Transactions and Kontoumsaetze
SETTINGS.filenamePattern = '(Transactions|Kontoumsaetze)_\\d{3}_\\d{9}_\\d{8}_\\d{6}';
// Project-specific: Header Rows override
SETTINGS.headerRows = 5;

class DbDebitCardStrategy extends CsvStrategy {

  constructor() {
    super(SETTINGS);
    console.log('DbDebitCardStrategy');
  }

  /**
   * E.g. Transactions_123_123456789_12345678_123456.csv
   *      Kontoumsaetze_123_123456789_12345678_123456.csv
   */
  static get filenamePattern() {
    return SETTINGS.filenamePattern;
  }

  /**
   * @param {object} data - parsed CSV row keyed by semantic column names (Date, Payee, Memo, Outflow, Inflow)
   * @returns {Array} YNAB row: [Date, Payee, Category, Memo, Outflow, Inflow]
   */
  static lineTransform(data) {
    const outflow = parseIntlNumber(data.Outflow || 0);
    const inflow = parseIntlNumber(data.Inflow || 0);
    return [
      data.Date,
      data.Payee,
      '',
      data.Memo,
      Math.abs(Math.min(outflow, 0)),
      Math.abs(Math.max(inflow, 0))
    ];
  }
}

module.exports = DbDebitCardStrategy;
