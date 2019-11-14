const axios = require('axios');
const bcrypt = require('bcrypt');
const randomString = require('randomstring');
const express = require('express');
const {User, validate,/* validate_server*/} = require('../models/user');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const buffer = require('buffer');
const {Storage} = require('@google-cloud/storage');

router.get('/', (req, res) => {
    res.stat(200).send('Hi.. from Auth module....');
});
router.post('/', async (req, res) => {
    const {error} = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    let user = await User.findOne({reg_id: req.body.reg_id});
    if (user) {
        if (user.isActive === false) return res.send(400).send('Sorry user is Not Active please contact Admin for more details.....');
        const validPassword = await bcrypt.compare(req.body.password, user.password);
        if (!validPassword) return res.status(400).send('Wrong Password... Please Update your  UMS Password');
        const token = user.generateAuthtoken();
        res.send(token);
    } else {
        let reg_id = req.body.reg_id;
        let passw = req.body.password;
        axios.get('https://ums.lpu.in//umswebservice/umswebservice.svc/CheckVersion/b5d2f187616d3553')
            .then((response) => {
                console.log('Reinitialization Complete....');
            }, (error) => {
                res.status(500).send('Internal Api Error in Reinitialization.......');
            });
        const options = {
            headers: {
                'User-Agent': 'Mozilla/5.0',
                'Content-Type': 'application/json',
                'X-Requested-With': 'ums.lovely.university',
                'Referer': 'http://localhost:8080/',
                'Sec-Fetch-Site': 'cross-site',
            }
        };
        axios.post('https://ums.lpu.in/umswebservice/umswebservice.svc/Testing', {
            UserId: reg_id,
            password: passw,
            Identity: 'aphone',
            DeviceId: 'b5d2f187616d3553',
            PlayerId: 'eRbWwNDk7FQ:APA91bHFbi-o47DsVXwvwoUF6oewl_G-4AE5WZjtgQyztLmt6WYHj16PERtOKKUrxi9AnoNV2j9VMllTzEWG_94VQvttKcjgn_IdK9aijw3anYoZfe6PxYmZhNGOjIOYb1CskB5RAgsc'
        }, options)
            .then((response) => {
                const data = response.data.TestingResult[0];
                let user_type = data.UserType;
                let role = 'B';
                if (user_type === 'Student') {
                    role = 'S';
                    if (data.AccessToken.length === 0) return res.status(400).send('Please Enter Valid UMS User Id and Password....');
                    const access_token = data.AccessToken;
                    const device_id = 'b5d2f187616d3553';
                    const reg_id = req.body.reg_id;
                    axios.get(`https://ums.lpu.in/umswebservice/umswebservice.svc/StudentBasicInfoForService/${reg_id}/${access_token}/${device_id}`)
                        .then(async (response) => {
                            const data = response.data[0];
                            const salt = await bcrypt.genSalt(10);
                            passw = await bcrypt.hash(passw, salt);
                            const ran_user = randomString.generate({
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
                                        keyFilename: path.join(__dirname, '../config/asklpu-9bf9759956a9.json')
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
                            const user = new User({
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
                            await user
                                .save()
                                .then(result => {
                                    console.log('Woho ... Profile Created....');
                                })
                                .catch(err => {
                                    console.log(err);
                                });
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
                } else if (user_type === 'Staff') {
                    role = 'F';
                    if (data.AccessToken.length === 0) return res.status(400).send('Please Enter Valid UMS User Id and Password....');
                    const access_token = data.AccessToken;
                    const device_id = 'b5d2f187616d3553';
                    const reg_id = req.body.reg_id;
                    axios.get(`https://ums.lpu.in/umswebservice/umswebservice.svc/StaffBasicInfoForService/${reg_id}/${access_token}/${device_id}`)
                        .then(async (response) => {
                            const data = response.data[0];
                            const salt = await bcrypt.genSalt(10);
                            passw = await bcrypt.hash(passw, salt);
                            //Image Work Starts
                            const ran_user = randomString.generate({
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
                                        keyFilename: path.join(__dirname, '../config/asklpu-9bf9759956a9.json')
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
                            const user = new User({
                                'name': data.Name,
                                'reg_id': reg_id,
                                'password': passw,
                                'role': role,
                                'access_token': access_token,
                                'img': `https://storage.googleapis.com/asklpu_profile_images/${ran_user}.jpg`,
                                'designation': data.Designation,
                                'department': data.DepartmentName,
                                'program_name': data.ProgramName,
                            });
                            await user
                                .save()
                                .then(result => {
                                    console.log('Woho ... Profile Created....');
                                })
                                .catch(err => {
                                    console.log(err);
                                });
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
                } else {
                    res.status(400).send('Contact Admin Support...........')
                }
            }, (error) => {//
                console.log('Api_Error');
                return res.status(500).send('UMS API Error....In POST');
            });
    }
});

module.exports = router;