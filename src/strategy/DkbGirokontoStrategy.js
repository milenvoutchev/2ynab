const parseDecimalNumber = require('parse-decimal-number');
const { loadCsvConfig, getBankConfig } = require('../lib/configLoader.js');
const CsvStrategy = require('./CsvStrategy');

const SETTINGS = loadCsvConfig('DE Deutsche Kreditbank checking', getBankConfig);
// Project-specific: More explicit filename pattern with explicit .csv extension
SETTINGS.filenamePattern = '^[0-9]{10}\\.csv$';

class DkbGirokontoStrategy extends CsvStrategy {

  constructor() {
    super(SETTINGS);
    console.log('DkbGirokontoStrategy');
  }

  /**
   * E.g. 1234567890.csv  (10-digit account number)
   */
  static get filenamePattern() {
    return SETTINGS.filenamePattern;
  }

  /**
   * @param {object} data - parsed CSV row keyed by semantic column names (Date, Payee, Memo, Inflow)
   * @returns {Array} YNAB row: [Date, Payee, Category, Memo, Outflow, Inflow]
   */
  static lineTransform(data) {
    const amount = parseDecimalNumber(data.Inflow, ".,");
    return [
      data.Date,
      data.Payee,
      '',
      data.Memo,
      Math.abs(Math.min(amount, 0)),
      Math.abs(Math.max(amount, 0))
    ];
  }
}

module.exports = DkbGirokontoStrategy;
