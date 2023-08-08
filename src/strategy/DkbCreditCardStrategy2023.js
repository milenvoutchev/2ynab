const csv = require('csv')
const parse = csv.parse
const parseDecimalNumber = require('parse-decimal-number');
const {getFileContentsCsv} = require('../lib/file.js');
const BaseStrategy = require('./BaseStrategy');
const os = require("os");
const { DateTime } = require("luxon");

const SETTINGS = {
    delimiter: ';',
    skip_empty_lines: true,
    skip_lines_with_empty_values: true,
    columns: [
        'belegdatum',
        'wertstellung',
        'status',
        'beschreibung',
        'umsatztyp',
        'betrag_eur',
        'betrag_fremdwaehrung',
    ],
    sliceBegin: 5,
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
    },
    on_record: (record, ) => record.status !== 'Gebucht' ? null: record
};

class DkbCreditCardStrategy2023 extends BaseStrategy {

    constructor() {
        super();
        console.log('DkbGirokontoStrategy2023');
    }

    /**
     *
     * @param data
     * @returns {*[]}
     */
    static lineTransform(data) {
        const betrag_eur = data.betrag_eur.replace("\u00A0€", "");
        const amount = parseDecimalNumber(betrag_eur, ".,");
        const date = DateTime.fromFormat(data.belegdatum, "dd.MM.yy");
        const memo = data.betrag_fremdwaehrung;
        return [
            date.toISODate(),
            data.beschreibung,
            '',
            memo,
            Math.abs(Math.min(amount, 0)),
            Math.abs(Math.max(amount, 0))
        ];
    }

    /**
     *
     * @param inFile
     * @returns {Promise<void>}
     */
    async convert(inFile) {
        console.log(`In: ${inFile}`);

        const input = getFileContentsCsv(inFile, SETTINGS.sliceBegin, SETTINGS.sliceEnd, 'utf-8');

        const data = parse(input, SETTINGS);

        return await super.transformAsync(data, DkbCreditCardStrategy2023.lineTransform);
    }

    /**
     *
     * @param inFile
     * @returns {boolean}
     */
    static isMatch(inFile) {
        // Read the first few lines of the file
        const fileContent = getFileContentsCsv(inFile, 0, 10, 'utf-8');

        // Check if the file content matches the expected header pattern
        const headerPattern = [
            /^"Karte";/,
            /^""$/,
            /^"Saldo vom \d{2}\.\d{2}\.\d{4}:";/,
            /^""$/,
            /^"Belegdatum";"Wertstellung";"Status";"Beschreibung";"Umsatztyp";"Betrag";"Fremdwährungsbetrag"$/,
        ];

        // Split the lines and filter out empty lines
        const lines = fileContent.split(os.EOL).map(line => line.trim()).filter(line => line !== "");

        // Check the header pattern against non-empty lines
        for (let i = 0; i < headerPattern.length; i++) {
            if (!headerPattern[i].test(lines[i])) {
                return false;
            }
        }
        return true;
    }
}

module.exports = DkbCreditCardStrategy2023;
