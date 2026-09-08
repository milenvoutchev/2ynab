jest.mock('pdf-parse');
const { PDFParse } = require('pdf-parse');
const DkbGirokontoPdfStrategy = require('../src/strategy/DkbGirokontoPdfStrategy');

const PAGE_1 = `Deutsche Kreditbank AG
Kontoauszug 1/2026
Girokonto 1234567890, DE00 1203 0000 1234 5678 90, DKB-Cash
6. Januar 2026
Seite 1 von 2
Herrn
Max Mustermann
Musterstraße 1
12345 Musterstadt
Internes Zeichen:
180 42 00
Datum Erläuterung Betrag Soll EUR Betrag Haben EUR
Kontostand am 03.12.2025, Auszug Nr. 12 1.000,00
08.12.2025 Überweisung
Vermieter GmbH Miete Januar DATUM 08.12.2025, 09.23
UHR
-500,00
15.12.2025 Zahlungseingang
Arbeitgeber AG Gehalt Dezember 2025
-200,50
Deutsche Kreditbank AG
Taubenstraße 7 - 9
10117 Berlin
`;

const PAGE_2 = `Kontoauszug 1/2026
Girokonto 1234567890, DE00 1203 0000 1234 5678 90,
DKB-Cash, Max Mustermann
Seite 2 von 2
Datum Erläuterung Betrag Soll EUR Betrag Haben EUR
20.12.2025 Zahlungseingang
Arbeitgeber AG Gehalt Dezember 2025
1.700,50
Kontostand am 31.12.2025 um 18:06 Uhr 2.000,00
Ihr Dispositionskredit EUR: 100,00
Gesamtumsatzsummen Summe Soll EUR Anzahl Summe Haben EUR Anzahl
. -700,50 2 1.700,50 1
Deutsche Kreditbank AG
Taubenstraße 7 - 9
10117 Berlin
`;

const FULL_TEXT = `${PAGE_1}\n-- 1 of 2 --\n${PAGE_2}`;

describe('DkbGirokontoPdfStrategy', () => {

  describe('extractSaldi', () => {
    test('should extract opening and closing Kontostand', () => {
      expect(DkbGirokontoPdfStrategy.extractSaldi(FULL_TEXT)).toEqual({
        openingDate: '03.12.2025',
        openingBalance: 1000.00,
        closingDate: '31.12.2025',
        closingBalance: 2000.00,
      });
    });

    test('should throw when opening/closing Kontostand is missing', () => {
      expect(() => DkbGirokontoPdfStrategy.extractSaldi('no balances here')).toThrow();
    });
  });

  describe('extractControlTotals', () => {
    test('should extract the Gesamtumsatzsummen control totals', () => {
      expect(DkbGirokontoPdfStrategy.extractControlTotals(FULL_TEXT)).toEqual({
        debitTotal: -700.50,
        debitCount: 2,
        creditTotal: 1700.50,
        creditCount: 1,
      });
    });

    test('should return null when Gesamtumsatzsummen is missing', () => {
      expect(DkbGirokontoPdfStrategy.extractControlTotals('no totals here')).toBeNull();
    });
  });

  describe('extractPageBody', () => {
    test('should strip header boilerplate up to the table header', () => {
      const body = DkbGirokontoPdfStrategy.extractPageBody(PAGE_1);
      expect(body).not.toContain('Herrn');
      expect(body).not.toContain('Internes Zeichen');
      expect(body).toContain('Kontostand am 03.12.2025');
    });

    test('should strip trailing footer boilerplate', () => {
      const body = DkbGirokontoPdfStrategy.extractPageBody(PAGE_1);
      expect(body).not.toContain('Taubenstraße');
    });

    test('should strip the closing notes section', () => {
      const body = DkbGirokontoPdfStrategy.extractPageBody(PAGE_2);
      expect(body).not.toContain('Hinweise zum Kontoauszug');
    });
  });

  describe('parseTransactions', () => {
    test('should parse transactions across page boundaries', () => {
      const transactions = DkbGirokontoPdfStrategy.parseTransactions([PAGE_1, PAGE_2]);

      expect(transactions).toHaveLength(3);

      expect(transactions[0].date).toBe('08.12.2025');
      expect(transactions[0].type).toBe('Überweisung');
      expect(transactions[0].description).toBe('Vermieter GmbH Miete Januar DATUM 08.12.2025, 09.23 UHR');
      expect(transactions[0].amount).toBe(-500.00);

      expect(transactions[1].date).toBe('15.12.2025');
      expect(transactions[1].type).toBe('Zahlungseingang');
      expect(transactions[1].description).toBe('Arbeitgeber AG Gehalt Dezember 2025');
      expect(transactions[1].amount).toBe(-200.50);

      expect(transactions[2].date).toBe('20.12.2025');
      expect(transactions[2].amount).toBe(1700.50);
    });

    test('should not treat the opening Kontostand line as a transaction', () => {
      const transactions = DkbGirokontoPdfStrategy.parseTransactions([PAGE_1, PAGE_2]);
      expect(transactions.some(t => t.type.includes('Kontostand'))).toBe(false);
    });

    test('should not treat the closing Kontostand line as a transaction', () => {
      const transactions = DkbGirokontoPdfStrategy.parseTransactions([PAGE_1, PAGE_2]);
      expect(transactions).toHaveLength(3);
      expect(transactions.every(t => t.amount !== 2000.00)).toBe(true);
    });
  });

  describe('reconcile', () => {
    const SAMPLE_PDF = 'statements/sample.pdf';

    beforeEach(() => {
      PDFParse.mockImplementation(() => ({
        getText: jest.fn().mockResolvedValue({
          text: FULL_TEXT,
          pages: [{ text: PAGE_1 }, { text: PAGE_2 }],
        }),
      }));
    });

    test('should reconcile transactions against the closing Kontostand and control totals', async () => {
      const result = await DkbGirokontoPdfStrategy.reconcile(SAMPLE_PDF);

      expect(result.file).toBe(SAMPLE_PDF);
      expect(result.openingBalance).toBe(1000.00);
      expect(result.closingBalance).toBe(2000.00);
      expect(result.reconciled).toBe(true);
      expect(result.controlTotalsMatch).toBe(true);
      expect(result.transactions).toHaveLength(3);
      expect(result.transactions[2].runningBalance).toBe(2000.00);
    });
  });
});
