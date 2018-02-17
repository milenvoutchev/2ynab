const fs = require('fs');
const parse = require('csv-parse/lib/sync');
const transform = require('stream-transform');
const stringify = require('csv-stringify');

const getSlicedInput = input => input.split('\n').slice(5, -2).join('\n');

const getInput = function (inFile, encoding = 'latin1') {
  const options = {
    encoding: encoding
  };
  const getLines = data => (data.match(/\r?\n/g) || '').length + 1;

  const data = fs.readFileSync(inFile, options);
  console.log(`Lines: ${getLines(data)}`);

  return getSlicedInput(data);
};

class DbCreditCardStrategy {

  constructor() {
    console.log('CreditCardStrategy:constructor');
  }

  convert(inFile, outFile) {
    console.log(`In: ${inFile}`);

    const settings = {
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
      ]
    };
    const input = getInput(inFile);

    const data = parse(input, settings);

    console.log(`Transform: ${data.length}`);

    const transformAsync = (data) => new Promise(function (resolve, reject) {
      const stringifierSettings = {
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
      };
      const results = [];
      const stringifier = stringify(stringifierSettings);
      transform(data, function (data) {
        const amount = data.amount.replace(' ', '').replace(',', '.') * 1;
        const result = [
          data.date_document,
          data.comment,
          '',
          '',
          Math.abs(Math.min(amount, 0)),
          Math.abs(Math.max(amount, 0))
        ];
        return result;
      })
        .pipe(stringifier)
        .on('data', buffer => results.push(buffer.toString()))
        .on('end', () => {
          const result = results.join('');
          resolve(result);
        });
    });

    transformAsync(data)
      .then(result => {
        fs.writeFileSync(outFile, result);
        console.log(`Written: ${outFile}`);
      })

  };

}

module.exports = DbCreditCardStrategy;
