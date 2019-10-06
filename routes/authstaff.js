const Joi = require('joi');
const axios = require('axios');
const bcrypt = require('bcrypt');
const _ = require('lodash');
const express = require('express');
const randomstring = require('randomstring');
const {UserStaff, validate,/* validate_server*/} = require('../models/user');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const buffer = require('buffer');

const {Storage} = require('@google-cloud/storage');
router.get('/', (req, res) => {
    res.stat(200).send('Hi.. from Staff_auth module....');
});
router.post('/', async (req, res) => {
    const {error} = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    let user = await UserStaff.findOne({reg_id: req.body.reg_id});
    if (user) {
        if (user.isActive === false) return res.send(400).send('Sorry user is Not Active please contact Admin for more details.....');
        const validPassword = await bcrypt.compare(req.body.password, user.password);
        if (!validPassword) return res.send(400).send('Wrong Password... Please Update your  UMS Password');
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
                'Connection': 'keep-alive',
                'Content-Length': '128',
                'Accept': 'application/json, text/plain, /',
                'Origin': 'http://localhost:8080',
                'User-Agent': 'Mozilla/5.0 (Linux; Android 8.1.0; ASUS_X00TD Build/OPM1; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/77.0.3865.92 Mobile Safari/537.36',
                'Sec-Fetch-Mode': 'cors',
                'Content-Type': 'application/json',
                'X-Requested-With': 'ums.lovely.university',
                'Sec-Fetch-Site': 'cross-site',
                'Referer': 'http://localhost:8080/',
                'Accept-Encoding': 'gzip, deflate',
                'Accept-Language': 'en-US,en;q=0.9'
            }
        };
        axios.post('https://ums.lpu.in/umswebservice/umswebservice.svc/Testing', {
            'UserId': reg_id,
            'password': passw,
            'Identity': 'aphone',
            'DeviceId': 'b5d2f187616d3553',
            'PlayerId': ''
        }, options).then((response) => {
            const data = response.data.TestingResult[0];
            const user_type = data.UserType;
            let role = 'A';
            if (user_type === 'Staff') role = 'F';
            else return res.status(400).send('Sorry .. Student You have to login from student portal....');
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
                    const user = new UserStaff({
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