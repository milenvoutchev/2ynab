const { loadCsvConfig } = require('../lib/configLoader.js');
const CsvStrategy = require('./CsvStrategy');

const SETTINGS = loadCsvConfig('ePay microaccount');

const RATE_EUR_BGN = 1.95583;

class EpayMicroaccountStrategy extends CsvStrategy {

  constructor() {
    super(SETTINGS);
    console.log('EpayMicroaccountStrategy');
  }

  /**
   * E.g. epay_microaccount_2019-08-08_11-43-49.csv
   *      epay_movements_2019-08-08_11-43-49.csv
   */
  static get filenamePattern() {
    return SETTINGS.filenamePattern;
  }

  static toEUR(amount) {
    return amount * 1 / RATE_EUR_BGN;
  }

  static toDate(dateTime) {
    return String(dateTime).replace(/^(\d{2})\.(\d{2})\.(\d{4}).+/g, '$3-$2-$1');
  }

  /**
   * @param {object} data - parsed CSV row keyed by Input Columns
   * @returns {Array} YNAB row: [Date, Payee, Category, Memo, Outflow, Inflow]
   */
  static lineTransform(data) {
    const amountOut = EpayMicroaccountStrategy.toEUR(data.outBGN);
    const amountIn  = EpayMicroaccountStrategy.toEUR(data.inBGN);
    const date      = EpayMicroaccountStrategy.toDate(data.dateTime);
    return [date, data.recipient, '', data.comment, Math.abs(amountOut), Math.abs(amountIn)];
  }
}

module.exports = EpayMicroaccountStrategy;
