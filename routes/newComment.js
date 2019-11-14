const axios = require('axios');
const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {Answer} = require('../models/newAnswer');
const {Comment, validate} = require('../models/newComment');
router.get('/', auth, (req, res) => {
    res.status(200).send('Hi from newComment.........');
});
router.put('/', auth, async (req, res) => {
    const user = req.user;
    const {error} = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    const answer_id = req.body.answer_id;
    const answer = await Answer.findOne({_id: answer_id});
    if (!answer) return res.status(404).send('Sorry  answer  Not Exist.....');
    const comment = new Comment({
        comment: req.body.comment,
        posted_by: user._id,
        answer_id: answer_id
    });
    await comment.save(function (error) {
        if (!error) {
            Comment.find({})
                .populate('posted_by')
                .exec(async function (error, posts) {
                    answer.comments.push(comment._id);
                    await answer.save();
                    res.status(200).send(JSON.stringify(comment, null, "\t"))
                });

        }
    });
});

module.exports = router;