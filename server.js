const app = require('./src/server');
const port = 3000;
app.listen(port, () => {
    // eslint-disable-next-line no-console
  console.log(`Example app listening on port ${port}`)
})