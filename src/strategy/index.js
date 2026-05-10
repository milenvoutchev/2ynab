const CsvStrategy = require(`./CsvStrategy.js`);
const DbCreditCardStrategy = require(`./DbCreditCardStrategy.js`);
const DbDebitCardStrategy = require(`./DbDebitCardStrategy.js`);
const DkbCreditCardStrategy = require(`./DkbCreditCardStrategy.js`);
const DkbGirokonto2026Strategy = require(`./DkbGirokonto2026Strategy.js`);
const DkbGirokontoStrategy = require(`./DkbGirokontoStrategy.js`);
const EpayMicroaccountStrategy = require(`./EpayMicroaccountStrategy.js`);
const HanseticbankStrategy = require(`./HanseticbankStrategy.js`);
const HanseticbankPdfStrategy = require(`./HanseticbankPdfStrategy.js`);

module.exports = {
  CsvStrategy,
  DbCreditCardStrategy,
  DbDebitCardStrategy,
  DkbCreditCardStrategy,
  DkbGirokonto2026Strategy,
  DkbGirokontoStrategy,
  EpayMicroaccountStrategy,
  HanseticbankStrategy,
  HanseticbankPdfStrategy,
};
