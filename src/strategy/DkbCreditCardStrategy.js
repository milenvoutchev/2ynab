const csv = require('csv')
const parse = csv.parse
const parseDecimalNumber = require('parse-decimal-number');
const {getFileContentsCsv} = require('../lib/file.js');
const BaseStrategy = require('./BaseStrategy');

const SETTINGS = {
    delimiter: ';',
    skip_empty_lines: true,
    skip_lines_with_empty_values: true,
    columns: [
        'im_saldo',
        'date_document',
        'date_receipt',
        'description',
        'amount_eur',
        'amount_foreign_currency_text',
        'empty',
    ],
    sliceBegin: 8,
    sliceEnd: Infinity,
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

class DkbCreditCardStrategy extends BaseStrategy {

    constructor() {
        super();
        console.log('DkbCreditCardStrategy');
    }

    /**
     *
     * @param data
     * @returns {*[]}
     */
    static lineTransform(data) {
        const amount = parseDecimalNumber(data.amount_eur, ".,");
        const memo = data.amount_foreign_currency_text;
        const result = [
            data.date_receipt,
            data.description,
            '',
            memo,
            Math.abs(Math.min(amount, 0)),
            Math.abs(Math.max(amount, 0))
        ];
        return result;
    }

    /**
     *
     * @param inFile
     * @returns {Promise<void>}
     */
    async convert(inFile) {
        console.log(`In: ${inFile}`);

        const input = getFileContentsCsv(inFile, SETTINGS.sliceBegin, SETTINGS.sliceEnd, 'latin1');
        console.log(input);

        const parser = parse(input, SETTINGS);

        console.log(`Transform: ${parser}`);

        return await super.transformAsync(parser, DkbCreditCardStrategy.lineTransform);
    }

    /**
     *
     * @param inFile
     * @returns {boolean}
     */
    static isMatch(inFile) {
        // Read the first few lines of the file
        const fileContent = getFileContentsCsv(inFile, 0, 10, 'latin1');

        // Check if the file content matches the expected header pattern
        const headerPatterns = [
            /^"Kreditkarte:";/,
            /^"Von:";/,
            /^"Bis:";/,
            /^"Saldo:";/,
            /^"Datum:";/,
            /^"Umsatz abgerechnet und nicht im Saldo enthalten";"Wertstellung";"Belegdatum";"Beschreibung";"Betrag \(EUR\)";"Ursprünglicher Betrag";/
        ];

        // Split the lines and filter out empty lines
        const lines = fileContent.split("\n").filter(line => line.trim() !== "");

        // Check the header pattern against non-empty lines
        for (let i = 0; i < headerPatterns.length; i++) {
            if (!headerPatterns[i].test(lines[i])) {
                return false;
            }
        }
        return true;
    }
}

module.exports = DkbCreditCardStrategy;
