const DkbCreditCardStrategy = require('../src/strategy/DkbCreditCardStrategy');

describe('DkbCreditCardStrategy', () => {
  describe('isMatch', () => {
    test('should match DKB credit card format', () => {
      expect(DkbCreditCardStrategy.isMatch('1234________1234.csv')).toBe(true);
    });

    test('should not match other formats', () => {
      expect(DkbCreditCardStrategy.isMatch('1234567890.csv')).toBe(false);
      expect(DkbCreditCardStrategy.isMatch('file.csv')).toBe(false);
    });
  });

  describe('lineTransform', () => {
    const testCases = [
      {
        name: 'transactions with outflow amounts',
        data: { Date: '01.01.2018', Memo: 'Online purchase', Inflow: '-75,50' },
        expectations: { date: '01.01.2018', outflow: 75.50, inflow: 0 }
      },
      {
        name: 'transactions with inflow amounts',
        data: { Date: '01.01.2018', Memo: 'Refund', Inflow: '25,00' },
        expectations: { date: '01.01.2018', outflow: 0, inflow: 25.00 }
      }
    ];

    test.each(testCases)('should handle $name', ({ data, expectations }) => {
      const result = DkbCreditCardStrategy.lineTransform(data);
      expect(result[0]).toBe(expectations.date);
      expect(result[3]).toBe(data.Memo);
      expect(result[4]).toBe(expectations.outflow);
      expect(result[5]).toBe(expectations.inflow);
    });
  });
});

