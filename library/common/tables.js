const tables = {
    users: {
        phoneNo: String,
        email: String,
    },
    monitors: {
        site: String,
        range: String,
        userID: String,
        phone: String,
        email: String,
        cron: Array
    },
    crons: {
        monitorID: String,
        stat: String,
        RecordTime: String,
    }
}

module.exports = tables;