const axios = require('axios');
const mongoose = require('mongoose');
const Joi = require('joi');
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {Answer} = require('../models/newAnswer');
const {User} = require('../models/user');
router.get('/', (req, res) => {
    res.status(200).send('Hello from addRate Module......');
});
router.put('/', auth, async (req, res) => {
    let user = req.user;
    const {error} = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    const answer_id = req.body.answer_id;
    const answer = await Answer.findById(answer_id);
    if (!answer) return res.status(404).send('Answer Not Exits...');
    const checksameUser = await Answer.findById(answer_id, {posted_by: {$elemMatch: {$eq: user._id}}});
    if (checksameUser.posted_by == user._id) return res.status(200).send(`Sorry you can't rate to your own question....`);
    const checkAlreadyRated = await Answer.findById(answer_id, {rated_by: {$elemMatch: {$eq: user._id}}});
    if (checkAlreadyRated.rated_by.length !== 0) return res.status(200).send('Your have already Rated this post.......');
    answer.sum_rate += Number(req.body.rating);
    answer.user_rated += 1;
    answer.rated_by.push(user._id);
    await answer.save();
    res.status(200).send('Successfully rated......  :)');
});

function validate(req) {
    const schema = {
        answer_id: Joi.objectId().required(),
        rating: Joi.number().min(0).max(5).required()
    };
    return Joi.validate(req, schema);
}

module.exports = router;