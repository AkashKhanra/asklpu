const axios = require('axios');
const mongoose = require('mongoose');
const Joi = require('joi');
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {Requestdeletequestion, validate} = require('../models/newRequestDelete');
const {Question} = require('../models/newQuestion');

router.get('/', (req, res) => {
    res.status(200).send('Hello from Upvote Module......');
});
router.post('/', auth, async (req, res) => {
    const user = req.user;
    const {error} = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    if (user.role !== 'F') return res.status(401).send('Unauthorized for putting delete Question request......');
    const question_id = req.body.question_id;
    const question = await Question.findOne({_id: question_id});
    if (!question) return res.status(404).send('Question Not Exits...');
    const requestdelete = new Requestdeletequestion({
        question_id: question._id,
        requested_by: user._id,
        explanation: req.body.explanation
    });
    await requestdelete
        .save()
        .then(result => {
            res.status(200).send('Successfully Placed Request....');
        })
        .catch(err => {
            res.status(400).send('Error.... Occour while placing request.');
        });
});

module.exports = router;