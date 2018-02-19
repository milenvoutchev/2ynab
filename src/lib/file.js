const fs = require('fs');

const getInput = function (inFile, sliceStart = 1, sliceEnd = null, encoding = 'latin1') {
  const end = sliceEnd ? sliceEnd : undefined;
  const getLines = data => (data.match(/\r?\n/g) || '').length + 1;
  const getSlicedInput = input => input.split('\n').slice(sliceStart, end).join('\n');

  const data = fs.readFileSync(inFile, {
    encoding: encoding
  });
  console.log(`Lines: (${sliceStart}, ${end}) ${getLines(data)}`);

  return getSlicedInput(data);
};

const writeOut = (outFile, result) => fs.writeFileSync(outFile, result);

module.exports = { getInput, writeOut };
