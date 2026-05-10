const fs = require('fs');
const path = require('path');
const DkbGirokonto2026Strategy = require('../src/strategy/DkbGirokonto2026Strategy');
const DkbGirokontoStrategy = require('../src/strategy/DkbGirokontoStrategy');

describe('DkbGirokonto2026Strategy', () => {
  const strategy = new DkbGirokonto2026Strategy();
  const sampleFile = path.join(__dirname, '../samples/DkbGirokonto2026.csv');
  const outputFile = path.join(__dirname, '../samples/test-output.csv');

  afterEach(() => {
    if (fs.existsSync(outputFile)) {
      fs.unlinkSync(outputFile);
    }
  });

  describe('isMatch', () => {
    const matchingCases = [
      { filename: 'DkbGirokonto2026_05-05-2026_Umsatzliste_Girokonto_DE88120300001056358037.csv', expected: true },
      { filename: '01-01-2026_Umsatzliste_Girokonto_DE12345678901234567890.csv', expected: true },
    ];

    const nonMatchingCases = [
      { filename: '1234567890.csv', reason: 'legacy format (10 digits)' },
      { filename: 'Umsatzliste_Girokonto_DE88120300001056358037.csv', reason: 'missing date part' },
      { filename: '05-05-2026_Umsatzliste_Girokonto_12345678901234567890.csv', reason: 'wrong IBAN format' },
    ];

    test.each(matchingCases)('should match 2026 format: $filename', ({ filename }) => {
      expect(DkbGirokonto2026Strategy.isMatch(filename)).toBe(true);
    });

    test.each(nonMatchingCases)('should not match files with $reason', ({ filename }) => {
      expect(DkbGirokonto2026Strategy.isMatch(filename)).toBe(false);
    });
  });

  describe('lineTransform', () => {
    test('should convert date from DD.MM.YY to DD/MM/YY', () => {
      // Config: Input Columns = skip,Date,skip,skip,Payee,Memo,skip,skip,Inflow,skip,skip,skip
      const data = {
        Date: '30.04.26',
        Payee: 'Test Payee',
        Memo: 'Test Memo',
        Inflow: '-123,45'
      };

       const result = DkbGirokonto2026Strategy.lineTransform(data);
       expect(result[0]).toBe('30/04/26');
     });

     test('should handle outflow (negative amounts)', () => {
       const data = {
         Date: '30.04.26',
         Payee: 'Payee',
         Memo: 'Memo',
         Inflow: '-123,45'
       };

       const result = DkbGirokonto2026Strategy.lineTransform(data);
       expect(result[4]).toBe(123.45); // Outflow
       expect(result[5]).toBe(''); // Empty inflow
     });

     test('should handle inflow (positive amounts)', () => {
       const data = {
         Date: '28.04.26',
         Payee: 'Payee',
         Memo: 'Memo',
         Inflow: '1234,56'
       };

       const result = DkbGirokonto2026Strategy.lineTransform(data);
       expect(result[4]).toBe(''); // Empty outflow
       expect(result[5]).toBe(1234.56); // Inflow
     });

     test('should use Payee field', () => {
       const data = {
         Date: '30.04.26',
         Payee: 'Jane Doe',
         Memo: 'Memo',
         Inflow: '-100,00'
       };

       const result = DkbGirokonto2026Strategy.lineTransform(data);
       expect(result[1]).toBe('Jane Doe');
     });

     test('should use Memo field', () => {
       const data = {
         Date: '30.04.26',
         Payee: 'Payee',
         Memo: 'Payment for invoice #123',
         Inflow: '-50,00'
       };

       const result = DkbGirokonto2026Strategy.lineTransform(data);
       expect(result[3]).toBe('Payment for invoice #123');
     });

     test('should have empty category field', () => {
       const data = {
         Date: '30.04.26',
         Payee: 'Payee',
         Memo: 'Memo',
         Inflow: '-100,00'
       };

       const result = DkbGirokonto2026Strategy.lineTransform(data);
      expect(result[2]).toBe('');
    });
  });

  describe('convert', () => {
    test('should produce YNAB-compatible CSV output', async () => {
      await strategy.convert(sampleFile, outputFile);

      expect(fs.existsSync(outputFile)).toBe(true);
      const content = fs.readFileSync(outputFile, 'utf8');

      // Check header
      expect(content).toContain('Date,Payee,Category,Memo,Outflow,Inflow');

      // Check date format
      expect(content).toContain('30/04/26');
      expect(content).toContain('28/04/26');
      expect(content).toContain('23/04/26');

      // Check amounts
      expect(content).toContain('123.12');
      expect(content).toContain('1234.12');
      expect(content).toContain('12.12');
    });

    test('should filter out zero-amount rows (opening balance)', async () => {
      await strategy.convert(sampleFile, outputFile);

      const content = fs.readFileSync(outputFile, 'utf8');
      const lines = content.trim().split('\n');

      // Header + 3 data rows (zero-amount row should be filtered)
      expect(lines.length).toBe(4);
    });

    test('should not include trailing commas for empty amounts', async () => {
      await strategy.convert(sampleFile, outputFile);

      const content = fs.readFileSync(outputFile, 'utf8');
      const lines = content.trim().split('\n');

      // Check that outflow-only row doesn't have trailing comma
      const outflowRow = lines.find(line => line.includes('123.12'));
      expect(outflowRow).toMatch(/123\.12,?$/);
    });
  });
});

describe('DkbGirokontoStrategy (legacy)', () => {
  describe('isMatch', () => {
    test('should match legacy 10-digit format', () => {
      const filename = '1234567890.csv';
      expect(DkbGirokontoStrategy.isMatch(filename)).toBe(true);
    });

    test('should not match 2026 format', () => {
      const filename = 'DkbGirokonto2026_05-05-2026_Umsatzliste_Girokonto_DE88120300001056358037.csv';
      expect(DkbGirokontoStrategy.isMatch(filename)).toBe(false);
    });

    test('should not match filenames with 10 digits not at the end', () => {
      const filename = '1234567890_extra.csv';
      expect(DkbGirokontoStrategy.isMatch(filename)).toBe(false);
    });

    test('should not match less than 10 digits', () => {
      const filename = '123456789.csv';
      expect(DkbGirokontoStrategy.isMatch(filename)).toBe(false);
    });
  });
});

describe('Strategy Pattern Separation', () => {
  test('should not have overlap between old and new patterns', () => {
    const legacyFile = '1234567890.csv';
    const newFile = 'DkbGirokonto2026_05-05-2026_Umsatzliste_Girokonto_DE88120300001056358037.csv';

    const legacyMatches = DkbGirokontoStrategy.isMatch(legacyFile);
    const newMatches = DkbGirokonto2026Strategy.isMatch(legacyFile);

    expect(legacyMatches && newMatches).toBe(false);
    expect(legacyMatches || newMatches).toBe(true);
  });

  test('strategies correctly identify their target files', () => {
    const files = [
      { name: '1234567890.csv', expected: 'legacy' },
      { name: 'DkbGirokonto2026_05-05-2026_Umsatzliste_Girokonto_DE88120300001056358037.csv', expected: 'new' },
      { name: 'random_file.csv', expected: 'none' }
    ];

    files.forEach(file => {
      const isLegacy = DkbGirokontoStrategy.isMatch(file.name);
      const isNew = DkbGirokonto2026Strategy.isMatch(file.name);

      if (file.expected === 'legacy') {
        expect(isLegacy).toBe(true);
        expect(isNew).toBe(false);
      } else if (file.expected === 'new') {
        expect(isLegacy).toBe(false);
        expect(isNew).toBe(true);
      } else {
        expect(isLegacy).toBe(false);
        expect(isNew).toBe(false);
      }
    });
  });
});

