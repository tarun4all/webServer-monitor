var {login, logout, verifyOTP} = require("../controllers/userLogin");
var {createMonitor, deleteCron} = require("../controllers/monitor");

//setting up routes with functions
expressApp.get('/api/login', (req, res) => login(req, res));
expressApp.get('/api/logout', (req, res) => logout(req, res));
expressApp.get('/api/createMonitor', (req, res) => createMonitor(req, res));
expressApp.get('/api/deleteMonitor', (req, res) => deleteCron(req, res));
expressApp.get('/api/verifyOTP', (req, res) => verifyOTP(req, res));

