const argv = require('yargs').argv;
const fs = require('fs');
const glob = require('glob');
const { buildReport } = require('./src/report/DkbGirokontoReconcileReport');

// Args may be plain paths or glob patterns, shell-expanded or quoted either way:
//   node dkb-girokonto-reconcile-report.js statements/*.pdf
//   node dkb-girokonto-reconcile-report.js "statements/*.pdf"
const patterns = argv['_'].length ? argv['_'] : [argv['in']].filter(Boolean);
const files = [...new Set(patterns.flatMap(pattern => glob.sync(pattern)))]
  .filter(file => fs.statSync(file).isFile())
  .sort();

if (!files.length) {
  console.error('Reconciles DKB Girokonto Kontoauszug PDFs: extracts opening/closing Kontostand and a running balance per transaction.');
  console.error('Usage: node dkb-girokonto-reconcile-report.js FILE... [--out=dkb-girokonto-reconcile-report.json]');
  console.error('Example: node dkb-girokonto-reconcile-report.js "Kontoauszug/*.pdf"');
  process.exitCode = 1;
  return;
}

const outFile = argv['out'] || 'dkb-girokonto-reconcile-report.json';

buildReport(files).then(results => {
  fs.writeFileSync(outFile, JSON.stringify(results, null, 2));

  const failed = results.filter(result => !result.reconciled);
  console.log(`Reconciled ${results.length - failed.length}/${results.length} statement(s). Written: ${outFile}`);

  if (failed.length) {
    process.exitCode = 1;
  }
});
