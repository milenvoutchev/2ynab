const { PDFParse } = require('pdf-parse');
const { parseIntlNumber } = require('../lib/helper.js');

const TABLE_HEADER = 'Datum Erläuterung Betrag Soll EUR Betrag Haben EUR';
const FOOTER_MARKER = 'Deutsche Kreditbank AG\nTaubenstraße';
const NOTES_MARKER = 'Hinweise zum Kontoauszug';

const DATE_LINE_RE = /^(\d{2}\.\d{2}\.\d{4})\s+(.*)$/;
const AMOUNT_LINE_RE = /^-?[\d.]+,\d{2}$/;

class DkbGirokontoPdfStrategy {

  /**
   * Strips page header/footer boilerplate from a single page's text, leaving
   * only the transaction table body for that page.
   * @param {string} pageText
   * @returns {string}
   */
  static extractPageBody(pageText) {
    const headerIdx = pageText.indexOf(TABLE_HEADER);
    let body = headerIdx >= 0 ? pageText.slice(headerIdx + TABLE_HEADER.length) : pageText;

    const footerIdx = body.indexOf(FOOTER_MARKER);
    if (footerIdx >= 0) body = body.slice(0, footerIdx);

    const notesIdx = body.indexOf(NOTES_MARKER);
    if (notesIdx >= 0) body = body.slice(0, notesIdx);

    return body;
  }

  /**
   * Extracts opening ("Kontostand am ..., Auszug Nr. N") and closing
   * ("Kontostand am ... um HH:MM Uhr") balances from the statement's raw text.
   * @param {string} text - full text of the statement PDF (via getText())
   * @returns {{openingDate: string, openingBalance: number, closingDate: string, closingBalance: number}}
   */
  static extractSaldi(text) {
    const openingMatch = text.match(/Kontostand am (\d{2}\.\d{2}\.\d{4}), Auszug Nr\. \d+\s+(-?[\d.,]+)/);
    const closingMatch = text.match(/Kontostand am (\d{2}\.\d{2}\.\d{4}) um \d{2}:\d{2} Uhr\s+(-?[\d.,]+)/);

    if (!openingMatch || !closingMatch) {
      throw new Error('Could not find opening/closing Kontostand in statement text');
    }

    return {
      openingDate: openingMatch[1],
      openingBalance: parseIntlNumber(openingMatch[2]),
      closingDate: closingMatch[1],
      closingBalance: parseIntlNumber(closingMatch[2]),
    };
  }

  /**
   * Extracts the statement's own control totals ("Gesamtumsatzsummen"):
   * total debit/credit amounts and transaction counts, as printed on the
   * statement itself. Used as an independent cross-check on parseTransactions.
   * @param {string} text - full text of the statement PDF (via getText())
   * @returns {{debitTotal: number, debitCount: number, creditTotal: number, creditCount: number}|null}
   */
  static extractControlTotals(text) {
    const match = text.match(/Gesamtumsatzsummen[\s\S]*?\n\.\s+(-?[\d.,]+)\s+(\d+)\s+(-?[\d.,]+)\s+(\d+)/);
    if (!match) return null;

    return {
      debitTotal: parseIntlNumber(match[1]),
      debitCount: parseInt(match[2], 10),
      creditTotal: parseIntlNumber(match[3]),
      creditCount: parseInt(match[4], 10),
    };
  }

  /**
   * Parses transaction rows out of the (already page-boundary-stripped) table
   * body text spanning all pages. Each transaction starts with a line
   * beginning "DD.MM.YYYY <type ...>", continues over any number of
   * free-text description lines, and ends with a line containing only the
   * amount (Soll negative, Haben positive).
   *
   * @param {string[]} pageTexts - raw text of each page (via getText())
   * @returns {object[]}
   */
  static parseTransactions(pageTexts) {
    const combined = pageTexts.map(DkbGirokontoPdfStrategy.extractPageBody).join('\n');
    const lines = combined.split('\n').map(line => line.trimEnd());

    const chunks = [];
    let current = null;

    for (const line of lines) {
      const dateMatch = line.match(DATE_LINE_RE);
      if (dateMatch) {
        if (current) chunks.push(current);
        current = { date: dateMatch[1], lines: [dateMatch[2]] };
      } else if (current) {
        current.lines.push(line);
      }
    }
    if (current) chunks.push(current);

    return chunks.map(({ date, lines: chunkLines }) => {
      let amount = null;
      const descLines = [];

      for (const line of chunkLines) {
        const trimmed = line.trim();
        if (!trimmed) continue;

        if (amount === null && AMOUNT_LINE_RE.test(trimmed)) {
          amount = parseIntlNumber(trimmed);
        } else {
          descLines.push(trimmed);
        }
      }

      return {
        date,
        type: descLines[0] || '',
        description: descLines.slice(1).join(' '),
        amount,
      };
    });
  }

  /**
   * Reconciles a single statement PDF: parses its transactions, computes a
   * running balance starting from the opening Kontostand, and checks it
   * lands on the closing Kontostand. Also cross-checks the parsed
   * transactions against the statement's own printed control totals.
   *
   * @param {string} inFile - absolute or relative path to the PDF
   * @returns {Promise<object>} - { file, openingDate, openingBalance, closingDate, closingBalance, reconciled, controlTotalsMatch, transactions }
   */
  static async reconcile(inFile) {
    const parser = new PDFParse({ url: inFile });
    const { text, pages } = await parser.getText();

    const { openingDate, openingBalance, closingDate, closingBalance } = DkbGirokontoPdfStrategy.extractSaldi(text);
    const controlTotals = DkbGirokontoPdfStrategy.extractControlTotals(text);

    const transactions = DkbGirokontoPdfStrategy.parseTransactions(pages.map(page => page.text));

    let running = openingBalance;
    const withRunningBalance = transactions.map(transaction => {
      running += transaction.amount;
      return { ...transaction, runningBalance: Math.round(running * 100) / 100 };
    });

    const reconciled = Math.abs(running - closingBalance) < 0.005;

    let controlTotalsMatch = null;
    if (controlTotals) {
      const debitTotal = transactions.filter(t => t.amount < 0).reduce((sum, t) => sum + t.amount, 0);
      const creditTotal = transactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
      const debitCount = transactions.filter(t => t.amount < 0).length;
      const creditCount = transactions.filter(t => t.amount > 0).length;

      controlTotalsMatch =
        Math.abs(debitTotal - controlTotals.debitTotal) < 0.005 &&
        Math.abs(creditTotal - controlTotals.creditTotal) < 0.005 &&
        debitCount === controlTotals.debitCount &&
        creditCount === controlTotals.creditCount;
    }

    return {
      file: inFile,
      openingDate,
      openingBalance,
      closingDate,
      closingBalance,
      reconciled,
      controlTotalsMatch,
      transactions: withRunningBalance,
    };
  }
}

module.exports = DkbGirokontoPdfStrategy;
