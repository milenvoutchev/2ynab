const { getFileContentsJson, writeOut } = require('../lib/file.js');
const BaseStrategy = require('./BaseStrategy');

class HanseaticbankStrategy extends BaseStrategy {

  constructor() {
    super();
    console.log('HanseaticbankStrategy');
  }

  /**
   *
   * @param data
   * @returns {*[]}
   */
  static lineTransform(data) {
    const payee = HanseaticbankStrategy.getPayee(data.description)
    const memo = HanseaticbankStrategy.getMemo(data.description)
    const result = [
      data.transactiondate || data.bookingdate,
      payee,
      "",
      `${data.bookingdate} ${memo}`,
      Math.abs(Math.min(data.amount, 0)),
      Math.abs(Math.max(data.amount, 0))
    ];

    return result;
  }

  /**
   *
   * @param inFile
   * @param outFile
   * @returns {Promise<void>}
   */
  async convert(inFile, outFile) {
    console.log(`In: ${inFile}`);

    const data = getFileContentsJson(inFile);

    console.log(`Transform: ${data.length}`);

    const result = await super.transformAsync(data, HanseaticbankStrategy.lineTransform);

    writeOut(outFile, result);
    console.log(`Written: ${outFile}`);
  }

  /**
   *
   * @param inFile
   * @returns {boolean}
   */
  static isMatch(inFile) {
    return !!inFile.match(/hanseaticbank\.json$/g);
  }

  static getPayee(description) {
    const matchReconsciliation = description.match(/Kartenabrechnung \d{2}\/\d{4} Hanseatic Bank/)

    if (matchReconsciliation) {
      return "Hanseatic Bank";
    }

    const matchForeignCurrency = description.match(/(.*) \d+,\d{2} \w{3}/)
    if (matchForeignCurrency) {
      return matchForeignCurrency[1];
    }

    return description;
  }

  static getMemo(description) {
    const matchForeignCurrency = description.match(/(.*) (\d+,\d{2} \w{3})/)
    if (matchForeignCurrency) {
      return matchForeignCurrency[2];
    }

    return "";
  }
}

module.exports = HanseaticbankStrategy;
