const DkbGirokontoPdfStrategy = require('../strategy/DkbGirokontoPdfStrategy');

/**
 * Builds a reconciliation report across one or more DKB Girokonto Kontoauszug
 * statement PDFs: opening/closing balance plus a running balance per
 * transaction, cross-checked against each statement's own control totals.
 *
 * @param {string[]} files - paths to statement PDFs
 * @returns {Promise<object[]>} - one entry per file, see DkbGirokontoPdfStrategy.reconcile
 */
const buildReport = async (files) => {
  const results = [];

  for (const file of files) {
    const result = await DkbGirokontoPdfStrategy.reconcile(file);
    if (!result.reconciled) {
      console.error(`WARNING: ${file} did not reconcile (expected Kontostand ${result.closingBalance})`);
    }
    if (result.controlTotalsMatch === false) {
      console.error(`WARNING: ${file} transactions do not match the statement's Gesamtumsatzsummen`);
    }
    results.push(result);
  }

  return results;
};

module.exports = { buildReport };
