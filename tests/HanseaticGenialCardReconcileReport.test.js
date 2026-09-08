const path = require('path');
const { buildReport } = require('../src/report/HanseaticReconcileReport');

const SAMPLE_PDF = path.join(__dirname, '../samples/Kontoauszug-GenialCard-2026-04_1234567890.pdf');

describe('HanseaticReconcileReport', () => {
  describe('buildReport', () => {
    test('should build a reconciliation report for each file', async () => {
      const results = await buildReport([SAMPLE_PDF]);

      expect(results).toHaveLength(1);
      expect(results[0].file).toBe(SAMPLE_PDF);
      expect(results[0].reconciled).toBe(true);
      expect(Array.isArray(results[0].transactions)).toBe(true);
    });
  });
});
