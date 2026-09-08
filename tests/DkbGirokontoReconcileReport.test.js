jest.mock('../src/strategy/DkbGirokontoPdfStrategy');
const DkbGirokontoPdfStrategy = require('../src/strategy/DkbGirokontoPdfStrategy');
const { buildReport } = require('../src/report/DkbGirokontoReconcileReport');

describe('DkbGirokontoReconcileReport', () => {
  describe('buildReport', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    test('should build a reconciliation report for each file', async () => {
      DkbGirokontoPdfStrategy.reconcile.mockResolvedValue({
        file: 'a.pdf', openingBalance: 100, closingBalance: 200, reconciled: true, controlTotalsMatch: true, transactions: [],
      });

      const results = await buildReport(['a.pdf']);

      expect(results).toHaveLength(1);
      expect(results[0].file).toBe('a.pdf');
      expect(results[0].reconciled).toBe(true);
    });

    test('should warn when a statement does not reconcile', async () => {
      const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      DkbGirokontoPdfStrategy.reconcile.mockResolvedValue({
        file: 'b.pdf', openingBalance: 100, closingBalance: 200, reconciled: false, controlTotalsMatch: true, transactions: [],
      });

      await buildReport(['b.pdf']);

      expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining('did not reconcile'));
      errorSpy.mockRestore();
    });

    test('should warn when transactions do not match the control totals', async () => {
      const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      DkbGirokontoPdfStrategy.reconcile.mockResolvedValue({
        file: 'c.pdf', openingBalance: 100, closingBalance: 200, reconciled: true, controlTotalsMatch: false, transactions: [],
      });

      await buildReport(['c.pdf']);

      expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining('Gesamtumsatzsummen'));
      errorSpy.mockRestore();
    });
  });
});
