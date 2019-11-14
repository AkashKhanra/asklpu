const axios = require('axios');
const mongoose = require('mongoose');
const Joi = require('joi');
const express = require('express');
const router = express.Router();
const nodemailer=require('nodemailer');
const auth = require('../middleware/auth');
const {Gquestion, validate} = require('../models/newGuestQuestion');
const {Ganswer} = require('../models/newGuestAnswer');
const {User} = require('../models/user');
router.get('/', auth, (req, res) => {
    res.status(200).send('Hi from newGuestQuestion.........');
});

router.post('/', async (req, res) => {
    const {error} = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    const question = new Gquestion({
        question: req.body.question,
        guest_email: req.body.guest_email,
        guest_mobile: req.body.guest_mobile,
    });
    await question.save();
    res.status(200).send('Please check you emails for future messages........');

});
router.put('/solved', auth, async (req, res) => {
    let user = req.user;
    const {error} = validateSolve(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    if (user.role !== 'F') return res.status(401).send('Un Authorized..........');
    const question_id = req.body.question_id;
    const question = await Gquestion.findById(question_id);
    if (!question) return res.status(404).send('Guest Question Not Exits...');
    question.isSolved = true;
    question.solved_by.push(user._id);
    await question.save();
    res.status(200).send('Successfully  Marked  Solved...... :)');
});


router.put('/answer', auth, async (req, res) => {
    const user = req.user;
    const {error} = validateAnswer(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    const question_id = req.body.gquestion_id;
    if (user.role !== 'F') return res.status(401).send('Un Authorized..........');
    const question = await Gquestion.findOne({_id: question_id});
    if (!question) return res.status(404).send('Question Not Exist.....');
    if(question.isSolved===true)res.status(200).send('')
    const answer = new Ganswer({
        answer: req.body.answer,
        ans_by: user._id,
        question_id: question_id,
    });
    await answer.save();

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'wassumption@gmail.com',
            pass: 'Chandu@816'
        }
    });

    var mailOptions = {
        from: 'youremail@gmail.com',
        to: 'myfriend@yahoo.com',
        subject: 'Sending Email using Node.js',
        text: 'That was easy!'
    };

    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });


    res.status(200).send('Successfully Answered....');
});


function validateSolve(req) {
    const schema = {
        question_id: Joi.objectId().required(),
    };
    return Joi.validate(req, schema);
}

function validateAnswer(answer) {
    const schema = {
        question_id: Joi.objectId().required(),
        answer: Joi.string().min(5).required()
    };
    return Joi.validate(answer, schema);
}


module.exports = router;