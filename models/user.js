const config = require('config');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
const Schema = mongoose.Schema;
const userSchema = new Schema({
    reg_id: {
        type: Number,
        minlength: 4,
        maxlength: 10,
        required: true,
        unique: true
    },
    section: {
        type: String,
        default: 'Teacher',
    },
    img: {
        type: String
    },
    name: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 100
    },
    email: {
        type: String,
        minlength: 5,
        maxlength: 255,
        default: 'xyz@lpu.co.in'
    },
    password: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 1024
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    role: {
        type: String,
        minlength: 1,
        maxlength: 1
    },
    isActive: {type: Boolean, default: true},
    access_token: {
        type: String,
        required: true
    },
    mobile: {
        type: Number,
        default: 9999999999,
    },
    program_name: {
        type: String,
        default: 'Teacher'
    },
    gender: {
        type: String,
        default: 'Male'
    },
    batch_year: {
        type: Number,
        maxlength: 4,
        default: '0000',
    },
    designation: {
        type: String,
        default: 'Student'
    },
    department: {
        type: String,
        default: 'Student'
    },
    posted_questions:[{
        type: Schema.Types.ObjectID,
        ref:'Question'
    }]
});

userSchema.methods.generateAuthtoken = function () {
    const token = jwt.sign({_id:this._id ,reg_id: this.reg_id, role: this.role,}, config.get('jwtPrivateKey'));
    return token;
};
userSchema.plugin(uniqueValidator);
const User = mongoose.model('User', userSchema, 'users');

function validateUser(user) {
    const schema = {
        reg_id: Joi.number().integer().min(1100).max(99999999).required(),
        password: Joi.string().required()
    };
    return Joi.validate(user, schema);
}

// function validateUserFromServer(user) {
//     const schema = {
//         'access_token': data.AccessToken,
//         'batch_year': data.BatchYear,
//         'img': data.Picture,
//         'gender': data.Gender,
//         'program_name': data.ProgramName,
//         'mobile': data.StudentMobile
//     };
//     return Joi.validate(user, schema);
//
// }

exports.User = User;
exports.userSchema = userSchema;
// exports.UserStaff = UserStaff;
exports.validate = validateUser;
//exports.validate_server = validateUserFromServer;