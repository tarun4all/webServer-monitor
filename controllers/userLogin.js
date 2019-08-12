const request = require('request');
const nodemailer = require("nodemailer");

const login = async (req, res) => {
    console.log(req.session);
    if(req && req.session && req.session.loginDone) {
        var userDetails = await DB.users.findOne({$or: [{phone: req.query.contact}, {email: req.query.contact}]});
        res.send(userDetails);
    }

    if(req.query && req.query.contact) {
        var userDetails = await DB.users.findOne({$or: [{phoneNo: req.query.contact}, {email: req.query.contact}]});

        if(!userDetails || userDetails.length < 1) {
            res.send("No user exist with this name");
        } else {
            req.session.userID = userDetails._id;
            req.session.otp = '454545';
            console.log(userDetails);
            if(userDetails.phoneNo) {
                await nodeMailerPhone(userDetails.phone);
            }

            if(userDetails.email) {
                console.log("mail");
                await nodeMailerEmail(userDetails.email);
            }
            res.send({msg: "OTP Sent"});
        }
    } else {
        res.send("invalid login");
    }
}

const verifyOTP = async (req, res) => {
    if(req && req.query.otp && req.session && req.session.otp && req.session.userID) {
        if(req.query.otp == req.session.otp) {
            var userDetails = await DB.users.findOne({'_id' : req.session.userID});
            req.session.loginDone = true;
            res.send({...userDetails, msg: 'loginDone'});
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