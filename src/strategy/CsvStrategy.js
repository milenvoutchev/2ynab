const parse = require('csv-parse/lib/sync');
const { getFileContentsCsv, writeOut } = require('../lib/file.js');
const BaseStrategy = require('./BaseStrategy');

/**
 * Template-Method base for all CSV-based strategies.
 *
 * Subclasses must implement:
 *   static lineTransform(rowObject) → [Date, Payee, Category, Memo, Outflow, Inflow]
 *   static filenamePattern      → regex string or empty string for no match
 *
 * Constructor receives settings produced by loadCsvConfig() (or equivalent).
 * Optional settings.rowFilter – a predicate applied to parsed rows before transform.
 */
class CsvStrategy extends BaseStrategy {
  constructor(settings) {
    super();
    this.settings = settings;
  }

  /**
   * Static filename pattern - subclasses should override this.
   * @returns {string} - regex pattern string
   */
  static get filenamePattern() {
    return '';
  }

  /**
   * Check if a filename matches this strategy's pattern.
   * @param {string} inFile
   * @returns {boolean}
   */
  static isMatch(inFile) {
    const pattern = this.filenamePattern;
    if (!pattern) {
      return false;
    }
    return !!inFile.match(new RegExp(pattern));
  }

  /**
   * @param {string} inFile
   * @param {string} outFile
   * @returns {Promise<void>}
   */
  async convert(inFile, outFile) {
    console.log(`In: ${inFile}`);

    const input = getFileContentsCsv(inFile, this.settings.headerRows, this.settings.sliceEnd);
    const data = parse(input, this.settings);

    console.log(`Transform: ${data.length}`);

    const filteredData = this.settings.rowFilter
      ? data.filter(this.settings.rowFilter)
      : data;

    if (filteredData.length !== data.length) {
      console.log(`After filtering: ${filteredData.length}`);
    }

    const result = await this.transformAsync(filteredData, this.constructor.lineTransform);

    writeOut(outFile, result);
    console.log(`Written: ${outFile}`);
  }

  /**
   * Default lineTransform — subclasses must override.
   */
  static lineTransform() {
    throw new Error(`${this.name} must implement static lineTransform()`);
  }
}

module.exports = CsvStrategy;

