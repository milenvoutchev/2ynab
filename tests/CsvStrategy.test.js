const CsvStrategy = require('../src/strategy/CsvStrategy');
const DbCreditCardStrategy = require('../src/strategy/DbCreditCardStrategy');
const DbDebitCardStrategy = require('../src/strategy/DbDebitCardStrategy');
const DkbCreditCardStrategy = require('../src/strategy/DkbCreditCardStrategy');
const DkbGirokontoStrategy = require('../src/strategy/DkbGirokontoStrategy');
const DkbGirokonto2026Strategy = require('../src/strategy/DkbGirokonto2026Strategy');
const EpayMicroaccountStrategy = require('../src/strategy/EpayMicroaccountStrategy');

describe('CsvStrategy', () => {
  test('all CSV strategies are instances of CsvStrategy', () => {
    expect(new DbCreditCardStrategy()).toBeInstanceOf(CsvStrategy);
    expect(new DbDebitCardStrategy()).toBeInstanceOf(CsvStrategy);
    expect(new DkbCreditCardStrategy()).toBeInstanceOf(CsvStrategy);
    expect(new DkbGirokontoStrategy()).toBeInstanceOf(CsvStrategy);
    expect(new DkbGirokonto2026Strategy()).toBeInstanceOf(CsvStrategy);
    expect(new EpayMicroaccountStrategy()).toBeInstanceOf(CsvStrategy);
  });

  test('CsvStrategy.isMatch returns false by default', () => {
    expect(CsvStrategy.isMatch('any_file.csv')).toBe(false);
  });

  test('CsvStrategy.lineTransform throws when not overridden', () => {
    expect(() => CsvStrategy.lineTransform()).toThrow();
  });

  test('DbDebitCardStrategy has correct class name (bug fix verification)', () => {
    const strategy = new DbDebitCardStrategy();
    expect(strategy.constructor.name).toBe('DbDebitCardStrategy');
  });
});

describe('Config Loading', () => {
  const strategyClasses = [
    { name: 'DbCreditCardStrategy', Class: DbCreditCardStrategy },
    { name: 'DbDebitCardStrategy', Class: DbDebitCardStrategy },
    { name: 'DkbCreditCardStrategy', Class: DkbCreditCardStrategy },
    { name: 'EpayMicroaccountStrategy', Class: EpayMicroaccountStrategy },
  ];

  test.each(strategyClasses)('$name loads config correctly', ({ Class }) => {
    const strategy = new Class();
    expect(strategy).toBeDefined();
  });
});

