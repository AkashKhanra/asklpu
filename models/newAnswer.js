const mongoose = require('mongoose');
const Joi = require('joi');
const {newCommentSchema} = require('../models/newComment');
const {userSchema} = require('../models/user');
const uniqueValidator = require('mongoose-unique-validator');
const Schema = mongoose.Schema;
const newAnswerSchema = new Schema({
    answer: {
        type: String,
        required: true,
        minlength: 5,
    },
    posted_by: {
        type: Schema.Types.ObjectID,
        ref: 'User',
        required: true
    },
    post_date: {
        type: Date,
        default: Date.now()
    },
    comments: [{
        type: Schema.Types.ObjectID,
        ref: 'Comment'
    }],
    liked_by: [{
        type: Schema.Types.ObjectID,
        ref: 'User'
    }],
    disliked_by: [{
        type: Schema.Types.ObjectID,
        ref: 'User'
    }],
    sum_rate: {
        type: Number,
        default: 0
    },
    user_rated: {
        type: Number,
        default: 0,
    },
    rated_by: [{
        type: Schema.Types.ObjectID,
        ref: 'User'
    }],
    question_id: {
        type: Schema.Types.ObjectID,
        ref: 'Question',
        required: true
    }
});
newAnswerSchema.plugin(uniqueValidator);
const Answer = mongoose.model('Answer', newAnswerSchema, 'answers');

function validateAnswer(answer) {
    const schema = {
        question_id: Joi.objectId().required(),
        answer: Joi.string().min(5).required()
    };
    return Joi.validate(answer, schema);
}

exports.newAnswerSchema = newAnswerSchema;
exports.Answer = Answer;
exports.validate = validateAnswer;