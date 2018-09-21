const parse = require('csv-parse/lib/sync');
const transform = require('stream-transform');
const stringify = require('csv-stringify');
const { getInput, writeOut } = require('../lib/file.js');

const SETTINGS = {
  delimiter: ';',
  skip_empty_lines: true,
  skip_lines_with_empty_values: true,
  columns: [
    'date_document',
    'date_receipt',
    'comment',
    'foreign_currency',
    'amount_foreign_currency',
    'exchange_rate',
    'amount',
    'currency'
  ],
  sliceBegin: 5,
  sliceEnd: -2,
  stringifier: {
    header: true,
    delimiter: ',',
    columns: [
      'Date',
      'Payee',
      'Category',
      'Memo',
      'Outflow',
      'Inflow'
    ],
  }
};

class BaseStrategy {
  /**
   *
   * @param data
   * @param lineTransformer
   * @returns {Promise<any>}
   */
  transformAsync(data, lineTransformer = (data) => data) {
    return new Promise(function (resolve, reject) {
      const results = [];
      const stringifier = stringify(SETTINGS.stringifier);
      transform(data, lineTransformer)
        .pipe(stringifier)
        .on('data', buffer => results.push(buffer.toString()))
        .on('end', () => {
          const result = results.join('');
          resolve(result);
        });
    });
  }
}

module.exports = BaseStrategy;
