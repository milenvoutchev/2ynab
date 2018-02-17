class ConverterFactory {

  constructor(strategy) {
    console.log('Converter:constructor');

    let Strategy;

    switch (strategy) {
      case 'DbCreditCard':
      default:
        Strategy = require(`./${strategy}Strategy.js`);
        break;
    }

    return new Strategy();
  }
}

module.exports = ConverterFactory;
