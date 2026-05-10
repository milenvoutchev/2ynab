const fs = require('fs');
const path = require('path');
const HanseticbankStrategy = require('../src/strategy/HanseticbankStrategy');

describe('HanseticbankStrategy', () => {
  describe('isMatch', () => {
    test('should match hanseaticbank.json', () => {
      expect(HanseticbankStrategy.isMatch('hanseaticbank.json')).toBe(true);
    });

    test('should not match other files', () => {
      expect(HanseticbankStrategy.isMatch('hanseaticbank.csv')).toBe(false);
      expect(HanseticbankStrategy.isMatch('hanseatic.json')).toBe(false);
      expect(HanseticbankStrategy.isMatch('file.json')).toBe(false);
    });
  });

  describe('lineTransform', () => {
    test('should skip unbooked transactions', () => {
      const transaction = {
        booked: false,
        amount: -10.00
      };

      const result = HanseticbankStrategy.lineTransform(transaction);
      expect(result).toBeUndefined();
    });

    const transformTestCases = [
      {
        name: 'extract date from transactionDate',
        transaction: {
          booked: true,
          transactionDate: '10.04.2023',
          amount: -11.2,
          merchantData: { name: 'Store', category: 'Groceries' },
          merchantName: 'Store Name',
          description: 'Purchase'
        },
        expectations: { date: '10.04.2023' }
      },
      {
        name: 'use merchantData.name as payee',
        transaction: {
          booked: true,
          transactionDate: '10.04.2023',
          amount: -11.2,
          merchantData: { name: 'Supermarket', category: 'Groceries' },
          merchantName: 'Old Name',
          description: 'Purchase'
        },
        expectations: { payee: 'Supermarket' }
      },
      {
        name: 'fallback to merchantName when merchantData.name missing',
        transaction: {
          booked: true,
          transactionDate: '10.04.2023',
          amount: -11.2,
          merchantData: { category: 'Groceries' },
          merchantName: 'Fallback Name',
          description: 'Purchase'
        },
        expectations: { payee: 'Fallback Name' }
      },
      {
        name: 'use category from merchantData',
        transaction: {
          booked: true,
          transactionDate: '10.04.2023',
          amount: -11.2,
          merchantData: { name: 'Store', category: 'Mobility' },
          merchantName: 'Store',
          description: 'Purchase'
        },
        expectations: { category: 'Mobility' }
      },
      {
        name: 'handle outflow (negative amount)',
        transaction: {
          booked: true,
          transactionDate: '10.04.2023',
          amount: -11.2,
          merchantData: { name: 'Store', category: 'Groceries' },
          merchantName: 'Store',
          description: 'Purchase'
        },
        expectations: { outflow: 11.2, inflow: 0 }
      },
      {
        name: 'handle inflow (positive amount)',
        transaction: {
          booked: true,
          transactionDate: '10.04.2023',
          amount: 50.00,
          merchantData: { name: 'Employer', category: 'Income' },
          merchantName: 'Employer',
          description: 'Salary'
        },
        expectations: { outflow: 0, inflow: 50.00 }
      },
    ];

    test.each(transformTestCases)('should $name', ({ transaction, expectations }) => {
      const result = HanseticbankStrategy.lineTransform(transaction);
      if (expectations.date !== undefined) expect(result[0]).toBe(expectations.date);
      if (expectations.payee !== undefined) expect(result[1]).toBe(expectations.payee);
      if (expectations.category !== undefined) expect(result[2]).toBe(expectations.category);
      if (expectations.outflow !== undefined) expect(result[4]).toBe(expectations.outflow);
      if (expectations.inflow !== undefined) expect(result[5]).toBe(expectations.inflow);
    });
  });

  describe('convert', () => {
    const strategy = new HanseticbankStrategy();
    const sampleFile = path.join(__dirname, '../samples/hanseaticbank.json');
    const outputFile = path.join(__dirname, '../samples/test-hanseaticbank-output.csv');

    afterEach(() => {
      if (fs.existsSync(outputFile)) {
        fs.unlinkSync(outputFile);
      }
    });

    test('should convert booked transactions only', async () => {
      await strategy.convert(sampleFile, outputFile);

      expect(fs.existsSync(outputFile)).toBe(true);
      const content = fs.readFileSync(outputFile, 'utf8');

      expect(content).toContain('Date,Payee,Category,Memo,Outflow,Inflow');
      expect(content).toContain('Groceries');
      expect(content).toContain('Mobility');
    });
  });
});

