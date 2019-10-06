const express = require('express');
const authUser = require('../routes/authUser');
const error = require('../middleware/error');
module.exports = function(app) {
    app.use(express.json());
    app.use('/api/auth/', authUser);
    app.use(error);
}