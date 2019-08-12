var express = require('express');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var app = express();

app.use(cookieParser());
app.use(session({secret: "sessions"}));

//static render for test UI
app.use(express.static("testView"));

//db config
require('./library/common/db_config');

//initialising global variables
require('./globalConfig');

expressApp = app;

//initialising routes
require("./routes/routes");

//server starts
expressApp.listen(5000, () => {
    console.log("App listening at port 5000");
})