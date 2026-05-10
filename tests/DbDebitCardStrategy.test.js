const DbDebitCardStrategy = require('../src/strategy/DbDebitCardStrategy');

describe('DbDebitCardStrategy', () => {
  describe('isMatch', () => {
    const matchingFormats = [
      'Transactions_123_123456789_12345678_123456.csv',
      'Kontoumsaetze_123_123456789_12345678_123456.csv',
    ];

    test.each(matchingFormats)('should match %s format', (filename) => {
      expect(DbDebitCardStrategy.isMatch(filename)).toBe(true);
    });

    test('should not match other formats', () => {
      expect(DbDebitCardStrategy.isMatch('other.csv')).toBe(false);
    });
  });

  describe('lineTransform', () => {
    const testCases = [
      {
        name: 'debit amounts (negative)',
        data: {
          Date: '01.01.2018',
          Payee: 'Recipient',
          Memo: 'Transfer',
          Outflow: '-50.25',
          Inflow: ''
        },
        expectations: { date: '01.01.2018', payee: 'Recipient', outflow: 50.25, inflow: 0 }
      },
      {
        name: 'credit amounts (positive)',
        data: {
          Date: '01.01.2018',
          Payee: 'Sender',
          Memo: 'Incoming',
          Outflow: '',
          Inflow: '100.50'
        },
        expectations: { date: '01.01.2018', payee: 'Sender', inflow: 100.50, outflow: 0 }
      }
    ];

    test.each(testCases)('should handle $name', ({ data, expectations }) => {
      const result = DbDebitCardStrategy.lineTransform(data);
      expect(result[0]).toBe(expectations.date);
      expect(result[1]).toBe(expectations.payee);
      if (expectations.outflow !== undefined) expect(result[4]).toBe(expectations.outflow);
      if (expectations.inflow !== undefined) expect(result[5]).toBe(expectations.inflow);
    });
  });
});

