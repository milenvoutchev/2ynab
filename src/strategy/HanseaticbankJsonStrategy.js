const { getFileContentsJson, writeOut } = require('../lib/file.js');
const BaseStrategy = require('./BaseStrategy');

class HanseaticbankJsonStrategy extends BaseStrategy {

  constructor() {
    super();
    console.log('HanseaticbankJsonStrategy');
  }

  /**
   *
   * @param data
   * @returns {*[]}
   */
  static lineTransform(transaction) {
    if (!transaction.booked)
    {
      return;
    }
    const date = transaction.transactionDate || transaction.date;
    const payee = HanseaticbankJsonStrategy.getPayee(transaction);
    const category = transaction.merchantData.category || "";
    const memo = HanseaticbankJsonStrategy.getMemo(transaction);
    // Date,Payee,Category,Memo,Outflow,Inflow
    const result = [
      date,
      payee,
      category,
      memo,
      Math.abs(Math.min(transaction.amount, 0)),
      Math.abs(Math.max(transaction.amount, 0))
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
    const transactions = data.transactions;

    console.log(`Transform: ${transactions.length}`);

    const result = await super.transformAsync(transactions, HanseaticbankJsonStrategy.lineTransform);

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

  static getPayee({ merchantName, merchantData, description }) {
    if (merchantName)
    {
      return merchantName;
    }

    if (merchantData && merchantData.name)
    {
        return merchantData.name;
    }

    // @comment merchantData.name already is Hanseatic Bank for Kartenabrechnung
    // if (description.match(/Kartenabrechnung \d{2}\/\d{4} Hanseatic Bank/)) {
    //   return "Hanseatic Bank";
    // }

    return description;
  }

  static getMemo({ description }) {
    return description;

    // @comment description already contains foreignCurrency when foreign
    // const matchForeignCurrency = description.match(/(.*) (\d+,\d{2} \w{3})/)
    // if (matchForeignCurrency) {
    //   return matchForeignCurrency[2];
    // }
    //
    // return "";
  }
}

module.exports = HanseaticbankJsonStrategy;
