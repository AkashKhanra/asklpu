const mongoose = require('mongoose');
const Joi = require('joi');
const config = require('config');
const Schema = mongoose.Schema;
const newCommentSchema = new Schema({
    posted_by: {
        type: Schema.Types.ObjectId,
        ref: 'user'   //refers to user Schema
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
    likes: {
        type: Number,
        default: 0,
        min: 0,
    },
    dislikes: {
        type: Number,
        default: 0,
        min: 0,
    }
});

const newComment = mongoose.model('newComment', newCommentSchema, 'comments');

function validateComment(comment) {
    const schema = {
        actual_comment: Joi.String().min(3).max(1000).required()
    };
    return Joi.validate(comment, schema);
}

exports.newCommnetSchema = newCommentSchema;
exports.newCommnet = newComment;
exports.validate = validateComment;