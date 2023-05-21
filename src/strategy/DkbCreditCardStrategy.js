const csv = require('csv');
const os = require('os');
const parse = csv.parse
const parseDecimalNumber = require('parse-decimal-number');
const {getFileContentsCsv, findHeaderInCsv} = require('../lib/file.js');
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
        console.log(result);
        return result;
    }

    /**
     *
     * @param inFile
     * @returns {Promise<void>}
     */
    async convert(inFile) {
        console.log(`In: ${inFile}`);

        const headerIndex = findHeaderInCsv(inFile,
            /^"Umsatz abgerechnet und nicht im Saldo enthalten";"Wertstellung";"Belegdatum";"Beschreibung";"Betrag \(EUR\)";"Ursprünglicher Betrag";/,
            'latin1'
        )
        const input = getFileContentsCsv(inFile, headerIndex + 1, SETTINGS.sliceEnd, 'latin1');

        const parser = parse(input, SETTINGS);

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

        // Check if the file content matches the expected header pattern
        const headerPatternsAlt = [
            /^"Kreditkarte:";/,
            /^"Zeitraum:";/,
            /^"Saldo:";/,
            /^"Datum:";/,
            /^"Umsatz abgerechnet und nicht im Saldo enthalten";"Wertstellung";"Belegdatum";"Beschreibung";"Betrag \(EUR\)";"Ursprünglicher Betrag";/
        ];

        // Split the lines and filter out empty lines
        const lines = fileContent.split(os.EOL).filter(line => line.trim() !== "");

        // Check the header pattern against non-empty lines
        const preambleMatch = !headerPatterns
            .map((pattern, index) => pattern.test(lines[index]))
            .includes(false);
        const preambleAltMatch = !headerPatternsAlt
            .map((pattern, index) => pattern.test(lines[index]))
            .includes(false);

        return preambleMatch || preambleAltMatch
    }
}

module.exports = DkbCreditCardStrategy;
