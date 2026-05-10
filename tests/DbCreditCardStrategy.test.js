const DbCreditCardStrategy = require('../src/strategy/DbCreditCardStrategy');

describe('DbCreditCardStrategy', () => {
  describe('isMatch', () => {
    test('should match DB credit card format', () => {
      expect(DbCreditCardStrategy.isMatch('CreditCardTransactions5232123412341234_2018_05.csv')).toBe(true);
    });

    test('should not match other formats', () => {
      expect(DbCreditCardStrategy.isMatch('debits.csv')).toBe(false);
      expect(DbCreditCardStrategy.isMatch('file.csv')).toBe(false);
    });
  });

  describe('lineTransform', () => {
    const testCases = [
      {
        name: 'outflow transactions',
        data: { Date: '01.01.2018', Payee: 'Store purchase', Inflow: '-50,25' },
        expectations: { date: '01.01.2018', outflow: 50.25, inflow: 0 }
      },
      {
        name: 'inflow transactions',
        data: { Date: '01.01.2018', Payee: 'Refund', Inflow: '100,50' },
        expectations: { date: '01.01.2018', outflow: 0, inflow: 100.50 }
      }
    ];

    test.each(testCases)('should handle $name', ({ data, expectations }) => {
      const result = DbCreditCardStrategy.lineTransform(data);
      expect(result[0]).toBe(expectations.date);
      expect(result[4]).toBe(expectations.outflow);
      expect(result[5]).toBe(expectations.inflow);
    });
  });
});

