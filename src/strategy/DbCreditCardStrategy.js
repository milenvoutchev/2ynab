const parseDecimalNumber = require('parse-decimal-number');
const { loadCsvConfig, getBankConfig } = require('../lib/configLoader.js');
const CsvStrategy = require('./CsvStrategy');

const SETTINGS = loadCsvConfig('DE Deutsche Bank Credit Card', getBankConfig);

class DbCreditCardStrategy extends CsvStrategy {

  constructor() {
    super(SETTINGS);
    console.log('DbCreditCardStrategy');
  }

  /**
   * E.g. CreditCardTransactions5232123412341234_2018_05.csv
   */
  static get filenamePattern() {
    return SETTINGS.filenamePattern;
  }

  /**
   * @param {object} data - parsed CSV row keyed by semantic column names (Date, Payee, Inflow)
   * @returns {Array} YNAB row: [Date, Payee, Category, Memo, Outflow, Inflow]
   */
  static lineTransform(data) {
    const amount = parseDecimalNumber(data.Inflow, ".,");
    return [
      data.Date,
      data.Payee,
      '',
      '',
      Math.abs(Math.min(amount, 0)),
      Math.abs(Math.max(amount, 0))
    ];
  }
}

module.exports = DbCreditCardStrategy;
