const csv = require('csv')
const transform = csv.transform
const stringify = csv.stringify

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
     * @param parser
     * @param lineTransformer
     * @returns {Promise<any>}
     */
    transformAsync(parser, lineTransformer = (data) => data) {
        return new Promise(function (resolve, reject) {
            const results = [];
            const stringifier = stringify(SETTINGS.stringifier);

            parser
                .pipe(transform(lineTransformer))
                .pipe(stringifier)
                .on('data', (data) => {
                    results.push(data.toString());
                })
                .on('error', (error) => {
                    reject(error);
                })
                .on('end', () => {
                    const result = results.join('');
                    resolve(result);
                });
        });
    }
}

module.exports = BaseStrategy;
