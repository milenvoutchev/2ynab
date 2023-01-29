const express = require('express');
const path = require('path');
const ConverterFactory = require("../ConverterFactory");
const formidable = require("formidable");
const {getOutFromInfile} = require("../lib/helper");
const fs = require("fs");
const os = require("os");

const app = express();
app.use(express.static(path.join(__dirname, 'public')));

const converter = new ConverterFactory('DkbGirokonto');

app.post('/file', async (req, res) => {
    const form = formidable({});

    form.parse(req, async (err, fields, files) => {
        if (err) {
            // eslint-disable-next-line no-console
            console.error(err);
            return;
        }
        const inFile = files.filepond.filepath;
        const fileId = files.filepond.newFilename;
        const result = await converter.convert(inFile);
        const outFile = getOutFromInfile(inFile);
        fs.writeFileSync(outFile, result);
        // eslint-disable-next-line no-console
        console.log(`Written: ${outFile}`);
        res.type('text/plain');
        res.end(fileId);
    });
})

app.get('/file', async (req, res, next) => {
    const fileId = req.query.filepond;
    res.download(`${os.tmpdir()}/${fileId}-YNAB.csv`, 'YNAB.csv');
});

module.exports = app;