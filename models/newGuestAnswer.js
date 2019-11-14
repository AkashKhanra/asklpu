const mongoose = require('mongoose');
const Joi = require('joi');
const {newCommentSchema} = require('../models/newComment');
const {userSchema} = require('../models/user');
const uniqueValidator = require('mongoose-unique-validator');
const Schema = mongoose.Schema;
const newGanswerSchema = new Schema({
    answer: {
        type: String,
        required: true,
        minlength: 5,
    },
    ans_by: {
        type: Schema.Types.ObjectID,
        ref: 'User',
        required: true
    },
    ans_date: {
        type: Date,
        default: Date.now()
    },
    question_id: {
        type: Schema.Types.ObjectID,
        ref: 'Gquestion',
        required: true
    }
});
const Ganswer = mongoose.model('Ganswer', newGanswerSchema, 'guestanswers');
exports.newGanswerSchema = newGanswerSchema;
exports.Ganswer = Ganswer;