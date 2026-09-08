const HanseticbankPdfStrategy = require('../strategy/HanseticbankPdfStrategy');

/**
 * Builds a reconciliation report across one or more HanseaticBank GenialCard
 * statement PDFs: opening/closing balance plus a running balance per transaction.
 *
 * @param {string[]} files - paths to statement PDFs
 * @returns {Promise<object[]>} - one entry per file, see HanseticbankPdfStrategy.reconcile
 */
const buildReport = async (files) => {
  const results = [];

  for (const file of files) {
    const result = await HanseticbankPdfStrategy.reconcile(file);
    if (!result.reconciled) {
      console.error(`WARNING: ${file} did not reconcile (expected Neuer Saldo ${result.neuerSaldo})`);
    }
    results.push(result);
  }

  return results;
};

module.exports = { buildReport };
