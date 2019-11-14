const axios = require('axios');
const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {Answer, validate} = require('../models/newAnswer');
const {Question} = require('../models/newQuestion');
const {User} = require('../models/user');

router.get('/', auth, (req, res) => {
    res.status(200).send('Hi from newAnswer.........');
});
router.put('/', auth, async (req, res) => {
    const user = req.user;
    const {error} = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    const question_id = req.body.question_id;
    const question = await Question.findOne({_id: question_id});
    if (!question) return res.status(404).send('Question Not Exist.....');
    if (question.posted_by == user._id) return res.status(200).send('Sorry you cant answer to your own question.... Try Comment in it');
    const answer = new Answer({
        answer: req.body.answer,
        posted_by: user._id,
        question_id:question_id,
    });
    await answer.save(function (error) {
        if (!error) {
            Answer.find({})
                .populate('posted_by')
                .exec(async function (error, posts) {
                    question.answers.push(answer._id);
                    await question.save();
                    res.status(200).send(JSON.stringify(answer, null, "\t"))
                });
        }
    });
});




module.exports = router;