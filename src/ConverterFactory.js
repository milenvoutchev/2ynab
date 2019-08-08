const DbCreditCardStrategy = require(`./strategy/DbCreditCardStrategy.js`);
const DbDebitCardStrategy = require(`./strategy/DbDebitCardStrategy.js`);
const DkbCreditCardStrategy = require(`./strategy/DkbCreditCardStrategy.js`);
const DkbGirokontoStrategy = require(`./strategy/DkbGirokontoStrategy.js`);

const strategies = {
  DbCreditCardStrategy,
  DbDebitCardStrategy,
  DkbCreditCardStrategy,
  DkbGirokontoStrategy,
};

class ConverterFactory {

  constructor(strategy) {
    let StrategyClass = ConverterFactory.getStrategy(strategy);

    return new StrategyClass();
  }

  /**
   *
   * @returns {string[]}
   */
  static getStrategies() {
    return Object.keys(strategies);
  }

  /**
   *
   * @returns {string[]}
   */
  static getStrategy(strategy) {
    const strategyFilename = strategy.indexOf('Strategy') < 0 ? `${strategy}Strategy` : strategy;
    const StrategyClass = strategies[strategyFilename];

    if (!StrategyClass) {
        throw new Error(`Unknown strategy: ${strategyFilename}`);
    }

    return StrategyClass;
  }
}

module.exports = ConverterFactory;
