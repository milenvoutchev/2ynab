const { PDFParse } = require('pdf-parse');
const { writeOut } = require('../lib/file.js');
const { parseIntlNumber } = require('../lib/helper.js');
const BaseStrategy = require('./BaseStrategy');

class HanseticbankPdfStrategy extends BaseStrategy {

  constructor() {
    super();
    console.log('HanseticbankPdfStrategy');
  }

  /**
   * Returns true when inFile matches the HanseaticBank Kontoauszug PDF naming convention.
   * @param {string} inFile
   * @returns {boolean}
   */
  static isMatch(inFile) {
    return !!inFile.match(/Kontoauszug-GenialCard.*\.pdf$/);
  }

  /**
   * Extracts all table rows from every page of the PDF.
   * @param {string} inFile - absolute or relative path to the PDF
   * @returns {Promise<string[][]>} - flat array of raw table rows
   */
  static async parsePdf(inFile) {
    const parser = new PDFParse({ url: inFile });
    const { pages } = await parser.getTable();

    return pages.flatMap(page =>
      page.tables.flatMap(table => table)
    );
  }

  /**
   * Filters raw table rows down to valid transaction rows (exactly 5 columns)
   * and maps each to a plain transaction object.
   *
   * PDF columns: bookingDate | txnDate | description | card | amount
   * Description is newline-separated: line 0 = type, line 1 = payee, lines 2+ = FX info
   *
   * @param {string[][]} rows
   * @returns {object[]}
   */
  static parseTransactions(rows) {
    return rows
      .filter(row => row.length === 5)
      .map(([bookingDate, txnDate, description, card, amountStr]) => {
        const descLines = description.split('\n');
        const type     = descLines[0] || '';
        const payee    = descLines[1] || '';
        const fxInfo   = descLines.slice(2).join(' ').trim();

        const amount = parseIntlNumber(amountStr);

        return { bookingDate, txnDate, type, payee, fxInfo, card, amount };
      });
  }

  /**
   * Maps a parsed transaction object to a YNAB CSV row.
   * [Date, Payee, Category, Memo, Outflow, Inflow]
   *
   * @param {object} transaction
   * @returns {Array}
   */
  static lineTransform({ bookingDate, type, payee, fxInfo, card, amount }) {
    const date     = bookingDate;
    const memo     = [type, fxInfo]
                       .filter(Boolean)
                       .join(' | ');
    const outflow  = Math.abs(Math.min(amount, 0));
    const inflow   = Math.abs(Math.max(amount, 0));

    // Date, Payee, Category, Memo, Outflow, Inflow
    return [date, payee, '', memo, outflow, inflow];
  }

  /**
   * @param {string} inFile
   * @param {string} outFile
   * @returns {Promise<void>}
   */
  async convert(inFile, outFile) {
    console.log(`In: ${inFile}`);

    const rows         = await HanseticbankPdfStrategy.parsePdf(inFile);
    const transactions = HanseticbankPdfStrategy.parseTransactions(rows);

    console.log(`Transform: ${transactions.length}`);

    const result = await super.transformAsync(transactions, HanseticbankPdfStrategy.lineTransform);

    writeOut(outFile, result);
    console.log(`Written: ${outFile}`);
  }
}

module.exports = HanseticbankPdfStrategy;

