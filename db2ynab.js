const argv = require('yargs').argv;
const fs = require('fs');
const parse = require('csv-parse/lib/sync');
const transform = require('stream-transform');
const stringify = require('csv-stringify');

const defaultSettings = {
  outFile: 'converted.csv',
};

// Check input
const inFile = argv['in'] || argv['_'][0];
if (!fs.existsSync(inFile)) {
  console.error('--in=FILE is required.');
  return 0;
}

const getOutFromInfile = filename => {
  const basename = filename.slice(0, (filename.lastIndexOf('.') >>> 0));
  const ext = filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);

  return `${basename}-YNAB.${ext}`;
};

const outFile = argv['out'] || argv['_'][1] || getOutFromInfile(inFile);

const getLines = data => (data.match(/\r?\n/g) || '').length + 1;

// convert methods
const getSlicedInput = input => input.split('\n').slice(5, -2).join('\n');

const getInput = function (inFile) {
  const options = {
    encoding: 'latin1'
  };

  const data = fs.readFileSync(inFile, options);
  console.log(`Lines: ${getLines(data)}`);

  return getSlicedInput(data);
};

const convert = function (inFile) {
  console.log(`In: ${inFile}`);

  const input = getInput(inFile);

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
        Math.min(amount, 0),
        Math.max(amount, 0)
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

convert(inFile, outFile);
