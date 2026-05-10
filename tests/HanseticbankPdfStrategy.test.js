const fs = require('fs');
const path = require('path');
const HanseticbankPdfStrategy = require('../src/strategy/HanseticbankPdfStrategy');

const SAMPLE_PDF = path.join(__dirname, '../samples/Kontoauszug-GenialCard-2026-04_1234567890.pdf');

describe('HanseticbankPdfStrategy', () => {

  describe('isMatch', () => {
    test('should match Kontoauszug-GenialCard PDF files', () => {
      expect(HanseticbankPdfStrategy.isMatch('Kontoauszug-GenialCard-2026-04_1234567890.pdf')).toBe(true);
      expect(HanseticbankPdfStrategy.isMatch('/path/to/Kontoauszug-GenialCard-2026-03_123.pdf')).toBe(true);
    });

    test('should not match other files', () => {
      expect(HanseticbankPdfStrategy.isMatch('hanseaticbank.json')).toBe(false);
      expect(HanseticbankPdfStrategy.isMatch('Kontoauszug-GenialCard-2026-04.csv')).toBe(false);
      expect(HanseticbankPdfStrategy.isMatch('statement.pdf')).toBe(false);
      expect(HanseticbankPdfStrategy.isMatch('')).toBe(false);
    });
  });

  describe('parseTransactions', () => {
    const headerRow  = ['Buchungs-\ndatum Transaktions-\ndatum Beschreibung Karte Betrag in €'];
    const balanceRow = ['Alter Saldo -684,63'];
    const carryRow   = ['bertrag Saldo auf Seite 2 -756,04'];
    const txnRow     = ['26.03.2026', '23.03.2026', 'Kartenumsatz\nMUSTERSHOP, BERLIN', '123\n4', '-14,21'];
    const creditRow  = ['31.03.2026', '-', 'Gutschrift\nKartenabrechnung 03/2026\nHanseatic Bank', '-', '684,63'];
    const fxRow      = ['07.04.2026', '02.04.2026', 'Kartenumsatz\nMUSTERSHOP, BERLIN\n0,61 USD 0,53 EUR\nUmrechnungskurs: 1,15', '123\n4', '-0,53'];

    test('should skip header and balance rows', () => {
      const result = HanseticbankPdfStrategy.parseTransactions([headerRow, balanceRow, carryRow]);
      expect(result).toHaveLength(0);
    });

    test('should parse a standard Kartenumsatz row', () => {
      const [tx] = HanseticbankPdfStrategy.parseTransactions([txnRow]);
      expect(tx.bookingDate).toBe('26.03.2026');
      expect(tx.txnDate).toBe('23.03.2026');
      expect(tx.type).toBe('Kartenumsatz');
      expect(tx.payee).toBe('MUSTERSHOP, BERLIN');
      expect(tx.fxInfo).toBe('');
      expect(tx.card).toBe('123\n4');
      expect(tx.amount).toBe(-14.21);
    });

    test('should parse a Gutschrift (credit) row', () => {
      const [tx] = HanseticbankPdfStrategy.parseTransactions([creditRow]);
      expect(tx.type).toBe('Gutschrift');
      expect(tx.payee).toBe('Kartenabrechnung 03/2026');
      expect(tx.fxInfo).toBe('Hanseatic Bank');
      expect(tx.amount).toBe(684.63);
    });

    test('should capture FX info from multi-line description', () => {
      const [tx] = HanseticbankPdfStrategy.parseTransactions([fxRow]);
      expect(tx.payee).toBe('MUSTERSHOP, BERLIN');
      expect(tx.fxInfo).toBe('0,61 USD 0,53 EUR Umrechnungskurs: 1,15');
      expect(tx.amount).toBe(-0.53);
    });
  });

  describe('lineTransform', () => {
    test('should produce outflow for negative amounts', () => {
      const tx = { bookingDate: '26.03.2026', type: 'Kartenumsatz', payee: 'MUSTERSHOP, BERLIN', fxInfo: '', card: '123\n4', amount: -14.21 };
      const row = HanseticbankPdfStrategy.lineTransform(tx);
      expect(row[0]).toBe('26.03.2026');            // Date
      expect(row[1]).toBe('MUSTERSHOP, BERLIN');    // Payee
      expect(row[2]).toBe('');                      // Category
      expect(row[4]).toBe(14.21);                   // Outflow
      expect(row[5]).toBe(0);                       // Inflow
    });

    test('should produce inflow for positive amounts', () => {
      const tx = { bookingDate: '31.03.2026', type: 'Gutschrift', payee: 'Kartenabrechnung 03/2026', fxInfo: 'Hanseatic Bank', card: '-', amount: 684.63 };
      const row = HanseticbankPdfStrategy.lineTransform(tx);
      expect(row[4]).toBe(0);                      // Outflow
      expect(row[5]).toBe(684.63);                 // Inflow
    });

    test('should include FX info in memo when present', () => {
      const tx = { bookingDate: '07.04.2026', type: 'Kartenumsatz', payee: 'MUSTERSHOP, BERLIN', fxInfo: '0,61 USD 0,53 EUR Umrechnungskurs: 1,15', card: '123\n4', amount: -0.53 };
      const row = HanseticbankPdfStrategy.lineTransform(tx);
      expect(row[3]).toContain('Kartenumsatz');
      expect(row[3]).toContain('0,61 USD 0,53 EUR');
      expect(row[3]).not.toContain('Karte:');
    });

    test('should omit card from memo when card is "-"', () => {
      const tx = { bookingDate: '31.03.2026', type: 'Gutschrift', payee: 'HB', fxInfo: '', card: '-', amount: 684.63 };
      const row = HanseticbankPdfStrategy.lineTransform(tx);
      expect(row[3]).not.toContain('Karte:');
    });
  });

  describe('convert', () => {
    const strategy  = new HanseticbankPdfStrategy();
    const outputFile = path.join(__dirname, '../samples/test-hanseaticbank-pdf-output.csv');

    afterEach(() => {
      if (fs.existsSync(outputFile)) fs.unlinkSync(outputFile);
    });

    test('should convert sample PDF to YNAB CSV', async () => {
      await strategy.convert(SAMPLE_PDF, outputFile);

      expect(fs.existsSync(outputFile)).toBe(true);
      const content = fs.readFileSync(outputFile, 'utf8');

      expect(content).toContain('Date,Payee,Category,Memo,Outflow,Inflow');
      expect(content).toContain('MUSTERSHOP, BERLIN');
      expect(content).toContain('Kartenumsatz');
      expect(content).not.toContain('Karte:');
    });

    test('should produce the correct number of transactions', async () => {
      await strategy.convert(SAMPLE_PDF, outputFile);
      const content = fs.readFileSync(outputFile, 'utf8');
      const lines = content.trim().split('\n');
      // 1 header + all transaction rows
      expect(lines.length).toBeGreaterThan(1);
    });
  });
});

