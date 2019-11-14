const axios = require('axios');
const mongoose = require('mongoose');
const Joi = require('joi');
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {Question} = require('../models/newQuestion');
const {User} = require('../models/user');
router.get('/', (req, res) => {
    res.status(200).send('Hello from Upvote Module......');
});
router.put('/', auth, async (req, res) => {
    let user = req.user;
    const {error} = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    const question_id = req.body.question_id;
    const question = await Question.findOne({_id: question_id});
    if (!question) return res.status(404).send('Question Not Exits...');
    const checksameUser = await User.findById(user._id, {posted_questions: {$elemMatch: {$eq: question_id}}});
    if (checksameUser.posted_questions.length !== 0) return res.status(200).send(`Sorry you can't upvote to your own question....`);
    const checkAlreadyVoted = await Question.findById(question_id, {voted_by: {$elemMatch: {$eq: user._id}}});
    if (checkAlreadyVoted.voted_by.length !== 0) return res.status(200).send('Your vote is already noted........ Thank You');
    if (user.role == 'F') {
        question.voted_by.push(user._id);
        await question.save();
        await Question.updateOne({_id: question_id}, {
            $inc: {upvote_points: 2}
        });
    } else {
        question.voted_by.push(user._id);
        await question.save();
        await Question.updateOne({_id: question_id}, {
            $inc: {upvote_points: 1}
        });
    }
    res.status(200).send('Successfully Upvoted......');

});

function validate(req) {
    const schema = {
        question_id: Joi.objectId().required()
    };
    return Joi.validate(req, schema);
}

module.exports = router;