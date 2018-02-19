const getOutFromInfile = filename => {
  const basename = filename.slice(0, (filename.lastIndexOf('.') >>> 0));
  const ext = filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);

  return `${basename}-YNAB.${ext}`;
};

module.exports = { getOutFromInfile };
