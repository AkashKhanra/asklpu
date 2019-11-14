const mongoose = require('mongoose');
const Joi = require('joi');
const {userSchema} = require('../models/user');
// const uniqueValidator = require('mongoose-unique-validator');
const Schema = mongoose.Schema;
const newCommentSchema = new Schema({
    posted_by: {
        type: Schema.Types.ObjectID,
        ref: 'User',
        required: true
    },
    post_date: {
        type: Date,
        default: Date.now()
    },
    comment: {
        type: String,
        minlength: 5,
        required: true
    },
    answer_id:{
        type:Schema.Types.ObjectID,
        ref:'Answer',
        required:true
    }
});
const Comment = mongoose.model('Comment', newCommentSchema, 'comments');

function validateComment(comment) {
    const schema = {
        answer_id: Joi.objectId().required(),
        comment: Joi.string().min(3).max(1000).required()
    };
    return Joi.validate(comment, schema);
}

exports.newCommentSchema = newCommentSchema;
exports.Comment = Comment;
exports.validate = validateComment;