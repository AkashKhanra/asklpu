const express = require('express');
const config=require('config');
const app = express();
const morgan = require('morgan');
const winston = require('winston');
require('./startup/db')();
require('./startup/routes')(app);
require('./startup/validation')();

if(!config.get('jwtPrivateKey'))
{
    console.log('Fatal: Error: jwtPrivateKey is not defined');
    process.exit(1);
}
if (app.get('env') === 'development') {
    app.use(morgan('tiny'));
    console.log('Morgan enabled...');
}
const port = process.env.PORT || 3000;
app.listen(port, () => winston.info(`Listening on port ${port}...`));
