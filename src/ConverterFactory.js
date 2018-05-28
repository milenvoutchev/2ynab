class ConverterFactory {

  constructor(strategy) {
    const strategyFilename = strategy.indexOf('Strategy') < 0 ? `${strategy}Strategy` : strategy;
    let Strategy;

    switch (strategy) {
      case 'DbCreditCard':
      case 'DkbCreditCard':
      case 'DkbGirokonto':
        Strategy = require(`./strategy/${strategyFilename}.js`);
        break;
      default:
        throw new Error('Unknown strategy');
    }

    return new Strategy();
  }
}

module.exports = ConverterFactory;
