const getOutFromInfile = filename => {
  const basename = filename.slice(0, (filename.lastIndexOf('.') >>> 0));
  const ext = filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);

  return `${basename}-YNAB.${ext}`;
};

const parseIntlNumber = (strToParse) => {
  if (!strToParse) {
    return 0;
  }
  strToParse = strToParse.replace(' ', '');
  if ( strToParse.match(/\.\d{2}$/) ) {
    // decimal symbol is "." ("1,000.12")
    return parseFloat(strToParse.replace(',', '')) * 1;
  }
  // decimal symbol is "," ("1.000,12")
  return parseFloat(strToParse.replace('.', '').replace(',','.')) * 1;
}

module.exports = {
  getOutFromInfile,
  parseIntlNumber
};
