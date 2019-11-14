const axios = require('axios');
const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {Question, validate} = require('../models/newQuestion');
const {User} = require('../models/user');
router.get('/', auth, (req, res) => {
    res.status(200).send('Hi from newQuestion.........');
});

router.post('/', auth, async (req, res) => {
    let user = req.user;
    const {error} = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    const question = new Question({
        title: req.body.title,
        details: req.body.details,
        posted_by: user._id,
    });
    await question.save(function (error) {
        if (!error) {
            Question.find({})
                .populate('posted_by')
                .exec(async function (error, posts) {
                     user = await User.findOne({_id: user._id});
                    user.posted_questions.push(question._id);
                    await user.save();
                    res.status(200).send(JSON.stringify(question, null, "\t"))
                })
        }
    });

});

module.exports = router;