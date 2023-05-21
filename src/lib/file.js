const fs = require('fs');
const os = require('os');

const getFileContentsCsv = function (inFile, sliceStart = 1, sliceEnd = null, encoding = 'utf8') {
    const data = fs.readFileSync(inFile, { encoding });
    const lines = data.split(os.EOL);

    return lines.slice(sliceStart, sliceEnd).join(os.EOL);
};

const findHeaderInCsv = function (inFile, pattern, encoding = 'utf8') {
    const data = fs.readFileSync(inFile, { encoding });
    const lines = data.split(os.EOL);

    return lines.findIndex(line => pattern.test(line));
};

const getFileContentsJson = function (inFile, encoding = 'utf8') {
    const data = fs.readFileSync(inFile, {
        encoding: encoding
    });
    return JSON.parse(data);
};

const writeOut = (outFile, result) => {
    fs.writeFileSync(outFile, result);
};

module.exports = {getFileContentsCsv, writeOut, getFileContentsJson, findHeaderInCsv};
