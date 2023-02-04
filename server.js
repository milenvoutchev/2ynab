const argv = require('yargs').argv;
const ConverterFactory = require('./src/ConverterFactory');

let errorMessages = [];


let strategy = argv['type'] || argv['_'][0];

if (!strategy) {
    errorMessages.push('Could not match convert strategy by file name. Please specify it manually: [--type=]' + ConverterFactory.getStrategies().join('|'));
}

if (errorMessages.length) {
    // eslint-disable-next-line no-console
    console.error(errorMessages.join("\r\n"));
    return 0;
}

const app = require('./src/server');
const port = 3000;
app.listen(port, () => {
    // eslint-disable-next-line no-console
  console.log(`Example app listening on port ${port}`)
})