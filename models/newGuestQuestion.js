const mongoose = require('mongoose');
const Joi = require('joi');
const Schema = mongoose.Schema;
const {newAnswerSchema} = require('../models/newAnswer');
const {userSchema} = require('../models/user');
const newGuestSchema = new Schema({
    gquestion: {
        type: String,
        minlength: 5,
        required: true
    },
    guest_email: {
        type: String,
        required: true
    },
    guest_mobile:{
        type: Number,
        required:true
    },
    answers: [{
        type: Schema.Types.ObjectID,
        ref: 'Ganswer'
    }],
    post_date: {
        type: Date,
        default: Date.now()
    },
    viewd_by: [{
        type: Schema.Types.ObjectID,
        ref: 'User'
    }],
    answerd_by:[{
        type: Schema.Types.ObjectID,
        ref:'User'
    }],
   isSolved:{
        type: Boolean,
       default: false
   }
});

const Gquestion = mongoose.model('Gquestion', newGuestSchema, 'guestQuestions');

function validateQuestion(question) {
    const schema = {
        quest_email: Joi.string().email({ minDomainAtoms: 2 }),
        quest_mobile: Joi.number().required(),
        gquestion: Joi.string().min(5).required()
    };
    return Joi.validate(question, schema);
}

exports.Gquestion = Gquestion;
exports.validate = validateQuestion;