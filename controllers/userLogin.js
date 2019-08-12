const request = require('request');
const nodemailer = require("nodemailer");
const sessions = {};

const login = async (req, res) => {
    console.log(req.session);
    if(req && req.session && req.session.loginDone) {
        var userDetails = await DB.users.findOne({$or: [{phone: req.query.contact}, {email: req.query.contact}]});
        res.send(userDetails);
    }

    if(req.query && req.query.contact) {
        var userDetails = await DB.users.findOne({$or: [{phoneNo: req.query.contact}, {email: req.query.contact}]});
        console.log(userDetails);
        if(!userDetails || userDetails.length < 1) {
            res.send("No user exist with this name");
        } else {
            var sess = '';
            for(let i=0; i< 5; i++) {
                sess += Math.floor(Math.random() * 11);
            }
            sessions[sess] = {id: userDetails._id, otp: '454545'};
            req.session.userID = userDetails._id;
            req.session.otp = '454545';
            if(userDetails.phoneNo) {
                await nodeMailerPhone(userDetails.phone);
            }

            if(userDetails.email) {
                console.log("mail");
                await nodeMailerEmail(userDetails.email);
            }
            res.send({msg: "OTP Sent", otp: sess});
        }
    } else {
        res.send("invalid login");
    }
}

const verifyOTP = async (req, res) => {
    console.log(sessions);
    if(req && req.query.otp && req.query.session) {
        if(req.query.otp == sessions[req.query.session].otp) {
            var userDetails = await DB.users.findOne({'_id' : sessions[req.query.session].id});
            req.session.loginDone = true;
            console.log(userDetails)
            res.send({id: userDetails._id, msg: 'loginDone'});
        }
    } else {
        res.send("invalid login");
    }
}

const logout = async (req, res) => {
    if(req && req.session) {
        req.session.destroy(function(err) {
            console.log(err ? err : 'Logged out');
        });
        res.send("logout");
    }
}


const nodeMailerEmail = async (emailID) => {
    return new Promise(async (resolve, reject) => {
        console.log("called");
        let transporter = nodemailer.createTransport({
            host: "smtp.mailgun.org",
            port: 465,
            secure: true,
            auth: {
              user: "admin@app.fininga.com",
              pass: "d17963a5d735597f68dba0259212b5d5-73ae490d-36617a6e"
            }
        });

        let mailOptions = {
            from: "admin@app.fininga.com",
            to: emailID,
            subject: `Login OTP`,
            text: `Your OTP is 454545`,
        };

        transporter.sendMail(mailOptions, function(error, info) {
            console.log("mails shoot");
            if (error) {
                console.log("mail error", error);
                resolve(error);
            } else {
                resolve("Email successfully sent!");
            }
        });
    });
}

const nodeMailerPhone = async (mobileNo) => {
    return new Promise(async (resolve, reject) => {
        request(`http://api.msg91.com/api/sendhttp.php?route=4&sender=CMONIT&mobiles=${mobileNo}&authkey=273945AksED8Sm5Zp5cc19fb6&message=Your OTP is 454545&country=91`, (err, response) => {
            if(err) {
                console.log(err);
                resolve("sms failed");
            }
            resolve("sms done");
        })
    });
}

module.exports = {
    login,
    logout,
    verifyOTP,
}