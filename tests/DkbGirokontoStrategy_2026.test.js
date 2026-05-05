const fs = require('fs');
const path = require('path');
const DkbGirokontoStrategy_2026 = require('../src/strategy/DkbGirokontoStrategy_2026');
const DkbGirokontoStrategy = require('../src/strategy/DkbGirokontoStrategy');

describe('DkbGirokontoStrategy_2026', () => {
  const strategy = new DkbGirokontoStrategy_2026();
  const sampleFile = path.join(__dirname, '../samples/DkbGirokonto_2026__05-05-2026_Umsatzliste_Girokonto_DE88120300001056358037.csv');
  const outputFile = path.join(__dirname, '../samples/test-output.csv');

  afterEach(() => {
    if (fs.existsSync(outputFile)) {
      fs.unlinkSync(outputFile);
    }
  });

  describe('isMatch', () => {
    test('should match 2026 format filenames', () => {
      const filename = 'DkbGirokonto_2026__05-05-2026_Umsatzliste_Girokonto_DE88120300001056358037.csv';
      expect(DkbGirokontoStrategy_2026.isMatch(filename)).toBe(true);
    });

    test('should match pattern with different dates and account numbers', () => {
      const filename = '01-01-2026_Umsatzliste_Girokonto_DE12345678901234567890.csv';
      expect(DkbGirokontoStrategy_2026.isMatch(filename)).toBe(true);
    });

    test('should not match legacy format (10 digits)', () => {
      const filename = '1234567890.csv';
      expect(DkbGirokontoStrategy_2026.isMatch(filename)).toBe(false);
    });

    test('should not match files missing date part', () => {
      const filename = 'Umsatzliste_Girokonto_DE88120300001056358037.csv';
      expect(DkbGirokontoStrategy_2026.isMatch(filename)).toBe(false);
    });

    test('should not match files with wrong IBAN format', () => {
      const filename = '05-05-2026_Umsatzliste_Girokonto_12345678901234567890.csv';
      expect(DkbGirokontoStrategy_2026.isMatch(filename)).toBe(false);
    });
  });

  describe('lineTransform', () => {
    test('should convert date from DD.MM.YY to DD/MM/YY', () => {
      const data = {
        wertstellung: '30.04.26',
        zahlungsempfaenger: 'Test Payee',
        verwendungszweck: 'Test Memo',
        betrag_eur: '-123,45'
      };

      const result = DkbGirokontoStrategy_2026.lineTransform(data);
      expect(result[0]).toBe('30/04/26');
    });

    test('should handle outflow (negative amounts)', () => {
      const data = {
        wertstellung: '30.04.26',
        zahlungsempfaenger: 'Payee',
        verwendungszweck: 'Memo',
        betrag_eur: '-123,45'
      };

      const result = DkbGirokontoStrategy_2026.lineTransform(data);
      expect(result[4]).toBe(123.45); // Outflow
      expect(result[5]).toBe(''); // Empty inflow
    });

    test('should handle inflow (positive amounts)', () => {
      const data = {
        wertstellung: '28.04.26',
        zahlungsempfaenger: 'Payee',
        verwendungszweck: 'Memo',
        betrag_eur: '1234,56'
      };

      const result = DkbGirokontoStrategy_2026.lineTransform(data);
      expect(result[4]).toBe(''); // Empty outflow
      expect(result[5]).toBe(1234.56); // Inflow
    });

    test('should use zahlungsempfaenger as payee', () => {
      const data = {
        wertstellung: '30.04.26',
        zahlungsempfaenger: 'Jane Doe',
        verwendungszweck: 'Memo',
        betrag_eur: '-100,00'
      };

      const result = DkbGirokontoStrategy_2026.lineTransform(data);
      expect(result[1]).toBe('Jane Doe');
    });

    test('should use verwendungszweck as memo', () => {
      const data = {
        wertstellung: '30.04.26',
        zahlungsempfaenger: 'Payee',
        verwendungszweck: 'Payment for invoice #123',
        betrag_eur: '-50,00'
      };

      const result = DkbGirokontoStrategy_2026.lineTransform(data);
      expect(result[3]).toBe('Payment for invoice #123');
    });

    test('should have empty category field', () => {
      const data = {
        wertstellung: '30.04.26',
        zahlungsempfaenger: 'Payee',
        verwendungszweck: 'Memo',
        betrag_eur: '-100,00'
      };

      const result = DkbGirokontoStrategy_2026.lineTransform(data);
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
      const filename = 'DkbGirokonto_2026__05-05-2026_Umsatzliste_Girokonto_DE88120300001056358037.csv';
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
    const newFile = 'DkbGirokonto_2026__05-05-2026_Umsatzliste_Girokonto_DE88120300001056358037.csv';

    const legacyMatches = DkbGirokontoStrategy.isMatch(legacyFile);
    const newMatches = DkbGirokontoStrategy_2026.isMatch(legacyFile);

    expect(legacyMatches && newMatches).toBe(false);
    expect(legacyMatches || newMatches).toBe(true);
  });

  test('strategies correctly identify their target files', () => {
    const files = [
      { name: '1234567890.csv', expected: 'legacy' },
      { name: 'DkbGirokonto_2026__05-05-2026_Umsatzliste_Girokonto_DE88120300001056358037.csv', expected: 'new' },
      { name: 'random_file.csv', expected: 'none' }
    ];

    files.forEach(file => {
      const isLegacy = DkbGirokontoStrategy.isMatch(file.name);
      const isNew = DkbGirokontoStrategy_2026.isMatch(file.name);

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

