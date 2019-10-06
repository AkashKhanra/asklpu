const axios = require('axios');
const bcrypt = require('bcrypt');
const _ = require('lodash');
const config = require('config');
const randomstring = require('randomstring');
const express = require('express');
const {UserStudent, validate,/* validate_server*/} = require('../models/user');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const buffer = require('buffer');
const {Storage} = require('@google-cloud/storage');

router.get('/', (req, res) => {
    res.stat(200).send('Hi.. from Student_Auth module....');
});
router.post('/', async (req, res) => {
    const {error} = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    let user = await UserStudent.findOne({reg_id: req.body.reg_id});
    if (user) {
        if (user.isActive === false) return res.send(400).send('Sorry user is Not Active please contact Admin for more details.....');
        const validPassword = await bcrypt.compare(req.body.password, user.password);
        if (!validPassword) return res.send(400).send('Wrong Password... Please Update your  UMS Password');
        ///need to work....
        const token = user.generateAuthtoken();
        res.send(token);
    } else {
        let reg_id = req.body.reg_id;
        let passw = req.body.password;
        axios.get('https://ums.lpu.in//umswebservice/umswebservice.svc/CheckVersion/b5d2f187616d3553')
            .then((response) => {
                console.log('Reinitialization Complete....');
            }, (error) => {
                res.status(500).send('Internal Api Error');
            });
        const options = {
            headers: {
                'X-Requested-With': 'ums.lovely.university',
                'Content-Type': 'application/json',
                'User-Agent': 'Mozilla/5.0',
                'Content-Length': 132
            }
        };
        axios.post('https://ums.lpu.in/umswebservice/umswebservice.svc/Testing', {
            'UserId': reg_id,
            'password': passw,
            'Identity': 'aphone',
            'DeviceId': 'b5d2f187616d3553',
            'PlayerId': ''
        }, options).then((response) => {
            console.log(response.data);
            const data = response.data.TestingResult[0];
            const user_type = data.UserType;
            let role = 'A';
            if (user_type === 'Student') role = 'S';
            else return res.status(400).send('Sorry .. Staff You have to login from staff portal....');
            if (data.AccessToken.length === 0) return res.status(400).send('Please Enter Valid UMS User Id and Password....');
            const access_token = data.AccessToken;
            const device_id = 'b5d2f187616d3553';
            const reg_id = req.body.reg_id;
            axios.get(`https://ums.lpu.in/umswebservice/umswebservice.svc/StudentBasicInfoForService/${reg_id}/${access_token}/${device_id}`)
                .then(async (response) => {
                    const data = response.data[0];
                    const salt = await bcrypt.genSalt(10);
                    passw = await bcrypt.hash(passw, salt);
                    //Image Work Starts
                    const ran_user = randomstring.generate({
                        length: 30,
                    });
                    const base64str = data.Picture;
                    const buf = Buffer.from(base64str, 'base64');
                    fs.writeFile(path.join(__dirname, '../public/images/', `${ran_user}.jpg`), buf, function (error) {
                        if (error) return res.status(400).send('Error while converting....');
                        else {
                            console.log('File Created....');
                            const gC = new Storage({
                                projectId: 'asklpu',
                                keyFilename: path.join(__dirname, '../config/asklpu-2e0d442a244a.json')
                            });
                            const askLpuProfileImageBucket = gC.bucket('asklpu_profile_images');
                            let localReadStream = fs.createReadStream(`/Users/apple/WebstormProjects/asklpu/public/images/${ran_user}.jpg`);
                            const remoteWriteStream = askLpuProfileImageBucket.file(`${ran_user}.jpg`).createWriteStream();
                            localReadStream.pipe(remoteWriteStream)
                                .on('error', function () {
                                    return res.status(500).send('Internal Server Error while deleting the image...');
                                })
                                .on('finish', function () {
                                    console.log('Upload Finish....');
                                    fs.unlink(`/Users/apple/WebstormProjects/asklpu/public/images/${ran_user}.jpg`, function (err) {
                                        if (err) return res.status(500).send('Internal Server Error while deleting the image...');
                                        console.log('File Deleted....');
                                    });
                                });
                        }
                    });
                    //Image work done.....
                    const user = new UserStudent({
                        'email': data.StudentEmail,
                        'section': data.Section,
                        'name': data.StudentName,
                        'reg_id': reg_id,
                        'password': passw,
                        'role': role,
                        'access_token': access_token,
                        'img': `https://storage.googleapis.com/asklpu_profile_images/${ran_user}.jpg`,
                        'gender': data.Gender,
                        'program_name': data.ProgramName,
                        'mobile': data.StudentMobile
                    });
                    await user.save();
                    axios.get('https://ums.lpu.in//umswebservice/umswebservice.svc/CheckVersion/b5d2f187616d3553')
                        .then((response) => {
                            console.log('Reinitialization Complete....');
                        }, (error) => {
                            res.status(500).send('Internal Api Error');
                        });

                    res.status(200).send('Woho ... Profile Created....');
                }, (error) => {
                    return res.status(500).send('UMS APi Error...in Fetch');
                });
        }, (error) => {
            console.log('Api_Error');
            return res.status(500).send('UMS API Error....In POST');
        });
    }
});

module.exports = router;