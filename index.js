const express = require('express');
const app = express();
const morgan = require('morgan');
const winston = require('winston');
require('./startup/db')();
require('./startup/routes')(app);
require('./startup/validation')();

if (app.get('env') === 'development') {
    app.use(morgan('tiny'));
    console.log('Morgan enabled...');
}
// const gC = new Storage({
//     projectId: 'asklpu',
//     keyFilename: path.join(__dirname,'./config/asklpu-2e0d442a244a.json')
// });
// gC.getBuckets()
//     .then(x=>console.log(x));

const port = process.env.PORT || 3000;
app.listen(port, () => winston.info(`Listening on port ${port}...`));
