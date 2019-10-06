const axios = require('axios');
const express = require('express');
const router = express.Router();
const config = require('config');
const auth = require('../middleware/auth');
const _ = require('loadash');
const jwt = require('jsonwebtoken');
const {newQuestion, validate} = require('../models/newQuestion');
router.get('/', (req, res) => {
    res.status(200).send('Hi from newQuestion.........');
});

router.post('/', auth, async (req, res) => {
    const {error} = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    let qustion=new newQuestion({
        title: req.body.title,
        details: req.body.details
    });
    qustion=await newQuestion.save();



});