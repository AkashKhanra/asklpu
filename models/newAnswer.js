const mongoose = require('mongoose');
const Joi = require('joi');
const config = require('config');
const Schema = mongoose.Schema;
const {newCommentSchema} = require('./newComment');
const newAnswerSchema = new Schema({
    answer: {
        type: String,
        required: true,
        minlength: 5,
    },
    posted_by: {
        type: mongoose.Schema.Types.ObjectID,
        ref: 'user', //user Schema
        required: true,
    },
    post_date: {
        type: Date,
        default: Date.now(),
    },
    comments: [{
        type: newCommentSchema,
    }],
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

const newAnswer = mongoose.model('newAnswer', newAnswerSchema, 'answers');

function validateAnswer(answer) {
    const schema = {
        answer: Joi.String().min(5).required()
    };
    return Joi.validate(answer, schema);
}

exports.newAnswerSchema = newAnswerSchema;
exports.newAnswer = newAnswer;
exports.validate = validateAnswer;