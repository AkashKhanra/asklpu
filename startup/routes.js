const express = require('express');
const authUser = require('../routes/authUser');
const newQuestion = require('../routes/newQuestion');
const newAnswer = require('../routes/newAnswer');
const newComment = require('../routes/newComment');
const addLike = require('../routes/addLike');
const newDelete = require('../routes/newDelete');
const addRate = require('../routes/addRating');
const reqDeleteQuestion = require('../routes/requestDeleteQuestion');
const upvoteQuestion = require('../routes/upvoteQuestion');
const guestQuestion = require('../routes/guestQuestion');
const error = require('../middleware/error');
module.exports = function (app) {
    app.use(express.json());
    app.use('/api/auth', authUser);
    app.use('/api/postquestion', newQuestion);
    app.use('/api/postanswer', newAnswer);
    app.use('/api/postcomment', newComment);
    app.use('/api/upvotequestion', upvoteQuestion);
    app.use('/api/add', addLike);
    app.use('/api/reqdeletequestion', reqDeleteQuestion);
    app.use('/api/delete', newDelete);
    app.use('/api/rate', addRate);
    app.use('/api/guest', guestQuestion);
    app.use(error);
}
