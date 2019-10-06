const config = require('config');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const mongoose = require('mongoose');
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
        default:'xyz@lpu.co.in'
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
    }
});
//
// const staffSchema = new mongoose.Schema({
//     reg_id: {
//         type: Number,
//         minlength: 4,
//         maxlength: 10,
//         required: true,
//         unique: true
//     },
//     img: {
//         type: String
//     },
//     name: {
//         type: String,
//         required: true,
//         minlength: 3,
//         maxlength: 100
//     },
//     email: {
//         type: String,
//         minlength: 5,
//         maxlength: 255,
//         default: 'abc@xyz.com'
//     },
//     mobile: {
//         type: Number,
//         default: 9999999999,
//     },
//     password: {
//         type: String,
//         required: true,
//         minlength: 5,
//         maxlength: 1024
//     },
//     createdAt: {
//         type: Date,
//         default: Date.now()
//     },
//     role: {
//         type: String,
//         minlength: 1,
//         maxlength: 1,
//     },
//     isActive: {type: Boolean, default: true},
//     access_token: {
//         type: String,
//         required: true
//     },
//     gender: {
//         type: String,
//         default: 'Male'
//     },
//     designation: {
//         type: String
//     },
//     department: {
//         type: String
//     }
// });

userSchema.methods.generateAuthtoken = function () {
    const token = jwt.sign({_id: this._id, role: this.role, reg_id: this.reg_id}, config.get('jwtprivatekey'));
    return token;
};
// staffSchema.methods.generateAuthtoken = function () {
//     const token = jwt.sign({_id: this._id, role: this.role, reg_id: this.reg_id}, config.get('jwtprivatekey'));
//     return token;
// };
const User = mongoose.model('User', userSchema, 'users');

//const UserStaff = mongoose.model('UserStaff', staffSchema, 'users_staff');

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
// exports.UserStaff = UserStaff;
exports.validate = validateUser;
//exports.validate_server = validateUserFromServer;
50

9915088875