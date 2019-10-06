const mongoose = require('mongoose');
const Joi = require('joi');
const config = require('config');
const Schema = mongoose.Schema;
const mongooseUniqueVaidator = require('mongoose-unique-validator');
const UserStudent = require('../models/user');
const {newAnswerSchema} = require('./newAnswer');
//
const newQuestionSchema = new Schema({
    question_id: {
        type: Number,
        unique: true,
        autoIncrement: true,
        default: 1000,

    },
    title: {
        type: String,
        minlength: 5,
        required: true
    },
    posted_by: {
        type: Schema.Types.ObjectId,
        //ref: '' // refers to User model
    },
    answers: [{
        type: newAnswerSchema
        //  ref: 'newAnswer'
    }],
    post_date: {
        type: Date,
        default: Date.now()
    },
    details: {
        type: String,
        minlength: 5,
        required: true
    },
    views: {
        type: Number,
        default: 0,
        min: 0
    },
    likes: {
        type: Number,
        default: 0,
        min: 0,
    },
    dislikes: {
        type: Number,
        default: 0,
        min: 0,
    },
    rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    }
});

newQuestionSchema.plugin(mongooseUniqueVaidator());
const newQuestion = mongoose.model('newQuestion', newQuestionSchema, 'questions');

function validateQuestion(question) {
    const schema = {
        'title': Joi.string().min(5).required(),
        'details': Joi.string().min(5).required(),
    };
    return Joi.validate(question, schema);
}

exports.newQuestion = newQuestion;
exports.validate = validateQuestion;