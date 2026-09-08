const argv = require('yargs').argv;
const fs = require('fs');
const glob = require('glob');
const { buildReport } = require('./src/report/HanseaticGenialCardReconcileReport');

// Args may be plain paths or glob patterns, shell-expanded or quoted either way:
//   node hanseatic-genialcard-reconcile-report.js statements/*.pdf
//   node hanseatic-genialcard-reconcile-report.js "statements/*.pdf"
const patterns = argv['_'].length ? argv['_'] : [argv['in']].filter(Boolean);
const files = [...new Set(patterns.flatMap(pattern => glob.sync(pattern)))]
  .filter(file => fs.statSync(file).isFile())
  .sort();

if (!files.length) {
  console.error('Reconciles HanseaticBank GenialCard Kontoauszug PDFs: extracts Alter/Neuer Saldo and a running balance per transaction.');
  console.error('Usage: node hanseatic-genialcard-reconcile-report.js FILE... [--out=hanseatic-genialcard-reconcile-report.json]');
  console.error('Example: node hanseatic-genialcard-reconcile-report.js "statements/Kontoauszug-GenialCard-*.pdf"');
  process.exitCode = 1;
  return;
}

const outFile = argv['out'] || 'hanseatic-genialcard-reconcile-report.json';

buildReport(files).then(results => {
  fs.writeFileSync(outFile, JSON.stringify(results, null, 2));

  const failed = results.filter(result => !result.reconciled);
  console.log(`Reconciled ${results.length - failed.length}/${results.length} statement(s). Written: ${outFile}`);

  if (failed.length) {
    process.exitCode = 1;
  }
});
