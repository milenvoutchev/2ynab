const express = require('express');
const path = require('path');
const ConverterFactory = require("../ConverterFactory");
const formidable = require("formidable");
const {getOutFromInfile} = require("../lib/helper");
const fs = require("fs");
const os = require("os");

const app = express();
app.use(express.static(path.join(__dirname, 'public')));
// app.use((req, res) => {
//     res.status(404).redirect('/');
// })

const converter = new ConverterFactory('DkbGirokonto');

app.post('/file', async (req, res) => {
    const form = formidable({});
    console.log("POST file");

    form.parse(req, async (err, fields, files) => {
        if (err) {
            // eslint-disable-next-line no-console
            console.error(err);
            res.sendStatus(404);
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

app.get('/file', async (req, res) => {
    const fileId = req.query.filepond;
    const path = `${os.tmpdir()}/${fileId}-YNAB.csv`
    if (fileId && fs.existsSync(path)) {
        res.download(path, 'YNAB.csv');
    } else {
        res.sendStatus(404);
    }
});

module.exports = app;