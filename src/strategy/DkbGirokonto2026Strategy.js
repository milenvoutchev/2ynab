const parseDecimalNumber = require('parse-decimal-number');
const { loadCsvConfig, getBankConfig } = require('../lib/configLoader.js');
const CsvStrategy = require('./CsvStrategy');

const CONFIG = loadCsvConfig('DE Deutsche Kreditbank checking new', getBankConfig);

// Add row filter to exclude zero-amount transactions
CONFIG.rowFilter = (row) => {
  const amount = parseDecimalNumber(row.Inflow, ".,");
  return amount !== 0;
};

class DkbGirokonto2026Strategy extends CsvStrategy {

  constructor() {
    super(CONFIG);
    console.log('DkbGirokonto2026Strategy');
  }

  /**
   * E.g. 05-05-2026_Umsatzliste_Girokonto_DE88120300001056358037.csv
   */
  static get filenamePattern() {
    return CONFIG.filenamePattern;
  }

  /**
   * Convert German dot-separated date to slash-separated.
   * @param {string} dateStr
   * @returns {string}
   */
  static convertDate(dateStr) {
    return dateStr.replace(/\./g, '/');
  }

  /**
   * @param {object} data - parsed CSV row keyed by column names (Date, Payee, Memo, Inflow)
   * @returns {Array} YNAB row: [Date, Payee, Category, Memo, Outflow, Inflow]
   */
  static lineTransform(data) {
    const amount  = parseDecimalNumber(data.Inflow, ".,");
    const date    = DkbGirokonto2026Strategy.convertDate(data.Date);
    const outflow = Math.abs(Math.min(amount, 0));
    const inflow  = Math.abs(Math.max(amount, 0));

    return [date, data.Payee, '', data.Memo, outflow > 0 ? outflow : '', inflow > 0 ? inflow : ''];
  }
}

module.exports = DkbGirokonto2026Strategy;
