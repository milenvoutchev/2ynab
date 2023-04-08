const fs = require('fs');

const getFileContentsCsv = function (inFile, sliceStart = 1, sliceEnd = null, encoding = 'utf8') {
  const end = sliceEnd ? sliceEnd : undefined;
  const getLines = data => (data.match(/\r?\n/g) || '').length + 1;
  const getSlicedInput = input => input.split('\n').slice(sliceStart, end).join('\n');

  const data = fs.readFileSync(inFile, {
    encoding: encoding
  });

  return getSlicedInput(data);
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

module.exports = { getFileContentsCsv, writeOut, getFileContentsJson };
