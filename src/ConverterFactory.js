class ConverterFactory {

  constructor(strategy) {
    const strategyFilename = strategy.indexOf('Strategy') < 0 ? `${strategy}Strategy` : strategy;
    let StrategyClass;

    switch (strategyFilename) {
      case 'DbCreditCardStrategy':
      case 'DkbCreditCardStrategy':
      case 'DkbGirokontoStrategy':
        StrategyClass = require(`./strategy/${strategyFilename}.js`);
        break;
      default:
        throw new Error('Unknown strategy');
    }

    return new StrategyClass();
  }
}

module.exports = ConverterFactory;
