const parseDecimalNumber = require('parse-decimal-number');
const { loadCsvConfig, getBankConfig } = require('../lib/configLoader.js');
const CsvStrategy = require('./CsvStrategy');

const SETTINGS = loadCsvConfig('DE Deutsche Kreditbank credit card', getBankConfig);

class DkbCreditCardStrategy extends CsvStrategy {

  constructor() {
    super(SETTINGS);
    console.log('DkbCreditCardStrategy');
  }

  /**
   * E.g. 1234________1234.csv
   */
  static get filenamePattern() {
    return SETTINGS.filenamePattern;
  }

  /**
   * @param {object} data - parsed CSV row keyed by semantic column names (Date, Memo, Inflow)
   * @returns {Array} YNAB row: [Date, Payee, Category, Memo, Outflow, Inflow]
   */
  static lineTransform(data) {
    const amount = parseDecimalNumber(data.Inflow, ".,");
    return [
      data.Date,
      '',
      '',
      data.Memo,
      Math.abs(Math.min(amount, 0)),
      Math.abs(Math.max(amount, 0))
    ];
  }
}

module.exports = DkbCreditCardStrategy;
