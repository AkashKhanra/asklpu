const mongoose = require('mongoose');
const Joi = require('joi');
Joi.objectId=require('joi-objectid')(Joi);
const {userSchema} = require('../models/user');
const Schema = mongoose.Schema;
const newDeleteQuestionSchema = new Schema({
    question_id: {
        type: Schema.Types.ObjectID,
        ref: 'Question',
        required: true
    },
    requested_by: {
        type: Schema.Types.ObjectID,
        ref: 'User',
        required: true
    },
    requested_date: {
        type: Date,
        default: Date.now()
    },
    explanation: {
        type: String,
        minlength: 5,
        required: true
    }
});
const Requestdeletequestion = mongoose.model('Requestdeletequestion', newDeleteQuestionSchema, 'RequestedDeleteQuestions');
function validateRequestDelete(question) {
    const schema = {
        question_id: Joi.objectId().required(),
        explanation: Joi.string().min(5).required(),
    };
    return Joi.validate(question, schema);
}

exports.Requestdeletequestion = Requestdeletequestion;
exports.validate = validateRequestDelete;