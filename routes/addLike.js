const axios = require('axios');
const mongoose = require('mongoose');
const Joi = require('joi');
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {Answer} = require('../models/newAnswer');
const {User} = require('../models/user');
router.get('/', (req, res) => {
    res.status(200).send('Hello from addLike Module......');
});
router.put('/like', auth, async (req, res) => {
    let user = req.user;
    const {error} = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    const answer_id = req.body.answer_id;
    const answer = await Answer.findById(answer_id);
    if (!answer) return res.status(404).send('Answer Not Exits...');
    const checksameUser = await Answer.findById(answer_id, {posted_by: {$elemMatch: {$eq: user._id}}});
    if (checksameUser.posted_by == user._id) return res.status(200).send(`Sorry you can't like to your own question....`);
    const checkAlreadyLiked = await Answer.findById(answer_id, {liked_by: {$elemMatch: {$eq: user._id}}});
    if (checkAlreadyLiked.liked_by.length !== 0) return res.status(200).send('Your have already liked this post.......');
    answer.liked_by.push(user._id);
    await answer.save();
    res.status(200).send('Successfully Liked...... :)');

});
router.delete('/like', auth, async (req, res) => {
    let user = req.user;
    const {error} = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    const answer_id = req.body.answer_id;
    const answer = await Answer.findById(answer_id);
    if (!answer) return res.status(404).send('Answer Not Exits...');
    const checksameUser = await Answer.findById(answer_id, {posted_by: {$elemMatch: {$eq: user._id}}});
    if (checksameUser.posted_by == user._id) return res.status(200).send(`Sorry you can't  delete like to your own question....`);
    const checkAlreadyLiked = await Answer.findById(answer_id, {liked_by: {$elemMatch: {$eq: user._id}}});
    if (checkAlreadyLiked.liked_by.length == 0) return res.status(200).send('Your have not liked it yet.......');
    answer.liked_by.pull(user._id);
    await answer.save();
    res.status(200).send('Successfully  unLiked......  :)');
});
router.delete('/dislike', auth, async (req, res) => {
    let user = req.user;
    const {error} = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    const answer_id = req.body.answer_id;
    const answer = await Answer.findById(answer_id);
    if (!answer) return res.status(404).send('Answer Not Exits...');
    const checksameUser = await Answer.findById(answer_id, {posted_by: {$elemMatch: {$eq: user._id}}});
    if (checksameUser.posted_by == user._id) return res.status(200).send(`Sorry you can't dislike to your own question....`);
    const checkAlreadydisLiked = await Answer.findById(answer_id, {disliked_by: {$elemMatch: {$eq: user._id}}});
    if (checkAlreadydisLiked.disliked_by.length == 0) return res.status(200).send('Your have not disliked it yet.......');
    answer.disliked_by.pull(user._id);
    await answer.save();
    res.status(200).send('Successfully  not disLiked......  :)');
});
router.put('/dislike', auth, async (req, res) => {
    let user = req.user;
    const {error} = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    const answer_id = req.body.answer_id;
    const answer = await Answer.findById(answer_id);
    if (!answer) return res.status(404).send('Answer Not Exits...');
    const checksameUser = await Answer.findById(answer_id, {posted_by: {$elemMatch: {$eq: user._id}}});
    if (checksameUser.posted_by == user._id) return res.status(200).send(`Sorry you can't like to your own question....`);
    const checkAlreadydisLiked = await Answer.findById(answer_id, {disliked_by: {$elemMatch: {$eq: user._id}}});
    if (checkAlreadydisLiked.disliked_by.length !== 0) return res.status(200).send('Your have already disliked this post.......');
    answer.disliked_by.push(user._id);
    await answer.save();
    res.status(200).send('Successfully disLiked...... :(');
});

function validate(req) {
    const schema = {
        answer_id: Joi.objectId().required()
    };
    return Joi.validate(req, schema);
}

module.exports = router;