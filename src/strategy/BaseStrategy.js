const transform = require('stream-transform');
const stringify = require('csv-stringify');

const YNAB_STRINGIFIER = {
  header: true,
  delimiter: ',',
  columns: ['Date', 'Payee', 'Category', 'Memo', 'Outflow', 'Inflow'],
};

class BaseStrategy {
  /**
   * @param {Array} data
   * @param {Function} lineTransformer
   * @returns {Promise<string>}
   */
  transformAsync(data, lineTransformer = (row) => row) {
    return new Promise((resolve, reject) => {
      const results = [];
      const stringifier = stringify(YNAB_STRINGIFIER);
      transform(data, lineTransformer)
        .on('error', reject)
        .pipe(stringifier)
        .on('error', reject)
        .on('data', buffer => results.push(buffer.toString()))
        .on('end', () => resolve(results.join('')));
    });
  }
}

module.exports = BaseStrategy;
