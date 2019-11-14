const axios = require('axios');
const mongoose = require('mongoose');
const Joi = require('joi');
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {Question} = require('../models/newQuestion');
const {Comment} = require('../models/newComment');
const {Answer} = require('../models/newAnswer');
const {User} = require('../models/user');
router.get('/', (req, res) => {
    res.status(200).send('Hello from newDelete Module......');
});
router.delete('/question', auth, async (req, res) => {
    let user = req.user;
    const {error} = validateQuestion(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    const question_id = req.body.question_id;
    const question = await Question.findOne({_id: question_id});
    if (!question) return res.status(404).send('Question Not Exits...');
    if (question.posted_by.toString() !== user._id.toString()) return res.status(401).send('Not authorized......');
    const answers = question.answers;
    for (const answerdata of answers) {
        const answer = await Answer.findOne({_id: answerdata});
        const comments = answer.comments;
        for (const commentdata of comments) {
            await Comment.findOneAndRemove({_id: commentdata});
        }
        await Answer.findOneAndRemove({_id: answerdata});
    }
    user = await User.findOne({_id: user._id});
    user.posted_questions.pull(question_id);
    await user.save();
    await Question.findOneAndRemove({_id: question_id});
    res.status(200).send('Successfully delete ............Question');

});
router.delete('/answer', auth, async (req, res) => {
    const user = req.user;
    const {error} = validateAnswer(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    const answer_id = req.body.answer_id;
    const answer = await Answer.findOne({_id: answer_id});
    if (!answer) return res.status(404).send('Answer Not Exits...');
    if (answer.posted_by.toString() !== user._id.toString()) return res.status(401).send('Not authorized......');
    const comments = answer.comments;
    for (const commentdata of comments) {
        await Comment.findOneAndRemove({_id: commentdata});
    }
    const question = await Question.findOne({_id: answer.question_id});
    question.answers.pull(answer_id);
    await question.save();
    await Answer.findOneAndRemove({_id: answer_id});
    res.status(200).send('Successfully deleted ............Answer');
});
router.delete('/comment', auth, async (req, res) => {
    const user = req.user;
    const {error} = validateComment(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    const comment_id = req.body.comment_id;
    const comment = await Comment.findOne({_id: comment_id});
    if (!comment) return res.status(404).send('Comment Not Exits...');
    if (comment.posted_by.toString() !== user._id.toString()) return res.status(401).send('Not authorized......');
    const answer = await Answer.findOne({_id: comment.answer_id});
    answer.comments.pull(comment_id);
    await answer.save();
    await Comment.findOneAndRemove({_id: comment_id});
    res.status(200).send('Successfully deleted ............ Comment');
});

function validateQuestion(req) {
    const schema = {
        question_id: Joi.objectId().required()
    };
    return Joi.validate(req, schema);
}

function validateAnswer(req) {
    const schema = {
        answer_id: Joi.objectId().required()
    };
    return Joi.validate(req, schema);
}

function validateComment(req) {
    const schema = {
        comment_id: Joi.objectId().required()
    };
    return Joi.validate(req, schema);
}

module.exports = router;