const DbCreditCardStrategy = require(`./DbCreditCardStrategy.js`);
const DbDebitCardStrategy = require(`./DbDebitCardStrategy.js`);
const DkbCreditCardStrategy = require(`./DkbCreditCardStrategy.js`);
const DkbGirokontoStrategy = require(`./DkbGirokontoStrategy.js`);
const EpayMicroaccountStrategy = require(`./EpayMicroaccountStrategy.js`);

module.exports = {
  DbCreditCardStrategy,
  DbDebitCardStrategy,
  DkbCreditCardStrategy,
  DkbGirokontoStrategy,
  EpayMicroaccountStrategy,
};
