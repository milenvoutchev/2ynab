const argv = require('yargs').argv;
const fs = require('fs');
const ConverterFactory = require('./src/ConverterFactory');
// Check input
const inFile = argv['in'] || argv['_'][0];

let errorMessages = [];
if (!fs.existsSync(inFile)) {
    errorMessages.push('Input file is required: [--in=]FILE');
}

let strategy = argv['type'] || argv['_'][1];
if (!strategy) {
    ConverterFactory.getStrategies().some(strategyToCheck => {
        if (ConverterFactory.getStrategy(strategyToCheck).isMatch(inFile)) {
            strategy = strategyToCheck;

            return true;
        }
    });
}
if (!strategy) {
    errorMessages.push('Could not match convert strategy by file name. Please specify it manually: [--type=]' + ConverterFactory.getStrategies().join('|'));
}

if (errorMessages.length) {
    // eslint-disable-next-line no-console
    console.error(errorMessages.join("\r\n"));
    return 0;
}

// (async () => {
//     const outFile = argv['out'] || argv['_'][2] || getOutFromInfile(inFile);
//     const converter = new ConverterFactory(strategy);
//     const result = await converter.convert(inFile);
//     fs.writeFileSync(outFile, result);
//     console.log(`Written: ${outFile}`);
// })();

const app = require('./src/server');
const port = 3000;
app.listen(port, () => {
    // eslint-disable-next-line no-console
  console.log(`Example app listening on port ${port}`)
})