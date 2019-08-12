const cron = require('node-cron');
const nodemailer = require("nodemailer");
const request = require('request');

const cronTasks = {};

const createMonitor = async (req, res) => {
    const queryParams = req.query;

    if(queryParams && queryParams.site && queryParams.range && (queryParams.email || queryParams.phone)) {
        console.log(queryParams);
        if (queryParams.email && (!(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(queryParams.email)))) {
            res.send("Invalid Email");
        }

        if(queryParams.phone && isNaN(Number(queryParams.phone))) {
            res.send("Invalid Phone no");
        }

        if(queryParams.range && Number(queryParams.range) == NaN) {
            res.send("Invalid Range Given");
        } else {
            if(Number(queryParams.range) < 1 || Number(queryParams.range) > 9) {
                res.send("Invalid Range Given");
            }
        }

        var userDetails = await DB.users.findOne({$or: [{phone: queryParams.phone}, {email: queryParams.email}]});

        console.log(queryParams, typeof queryParams.phone);
        if(!userDetails || userDetails.length < 1) {
            userDetails = await DB.users.create({phoneNo: queryParams.phone, email: queryParams.email});
        }

        await createCron(queryParams, userDetails);
        res.send({msg: "done"});
    } else {
        res.send("invalid params");
    }
}

const deleteCron = async (req, res) => {
    if(req.query && req.query.cronID && cronTasks[req.query.cronID]) {
        cronTasks[cronID].stop();
        res.send("Deleted");
    }
}


/***************************************
 **********Utility Function*************
 ***************************************/

const createCron = async (queryParams, userDetails) => {
    return new Promise(async (resolve, reject) => {
        var cronDetails = await DB.monitors.create({site: queryParams.site, phone: queryParams.phone, email: queryParams.email, userID: userDetails._id, range: queryParams.range});

        let pattern = '';
        switch(queryParams.range) {
            case '1': pattern = '*/10 * * * * *'; break;
            case '2': pattern = '* * * * *'; break;
            case '3': pattern = '*/5 * * * *'; break;
            case '4': pattern = '*/10 * * * *'; break;
            case '5': pattern = '*/15 * * * *'; break;
            case '6': pattern = '* * * *'; break;
            case '7': pattern = '*/4 * * *'; break;
            case '8': pattern = '*/6 * * *'; break;
            case '9': pattern = '0 0 0 * * *'; break;
        }

        let task = cron.schedule(pattern, async () => {
            request(queryParams.site, async function (error, response) {
                if(error) {
                    var status;
                    status = "Down";

                    if(cronDetails.email) {
                        nodeMailerEmail(cronDetails.email);
                    }

                    if(cronDetails.phone) {
                        nodeMailerPhone(cronDetails.phone);
                    }
                }
                console.log(cronDetails._id);
                await DB.crons.create({monitorID: cronDetails._id, stat: status ? status : 'Success', RecordTime: new Date()});
            });
        });
        cronTasks[cronDetails._id] = task;
        resolve("done");
    });
}

const nodeMailerEmail = async (emailID) => {
    return new Promise(async (resolve, reject) => {
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
            subject: `Site server cron report`,
            text: `Hi there, this email was just sent to inform you that your site is down`,
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
        request(`http://api.msg91.com/api/sendhttp.php?route=4&sender=CMONIT&mobiles=${mobileNo}&authkey=273945AksED8Sm5Zp5cc19fb6&message=Hi there, this message was just sent to inform you that your site is down&country=91`, (err, response) => {
            if(err) {
                console.log(err);
            }
        })
    });
}

module.exports = {
    createMonitor,
    deleteCron,
}