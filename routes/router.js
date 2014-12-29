var functions = require('../functions/functions.js');
var sessions = require('../functions/sessions.js');
var event_handlers = require('../event_handlers/event_handlers.js');

//handling login.html and chat.html requests
exports.loginHtml = function (req, res) {
    if(sessions.checkIfLoggedIn(req)){
        res.redirect("chat.html");
    }else {
        res.sendfile("views/login.html");
    }
};

exports.studentLoginPost = function(req, res){
    //perform server side login form validation
    req.session.username = req.body.customUsername;
    sessions.toggleLoggedInSession(req, 1);
    req.session.save();
    var r_username;
    r_username = req.session.username;
    functions.consoleLogger("req.session.username from POST = " +req.session.username)
    res.redirect("login.html");
};

exports.chatHtml = function (req, res) {
    if (sessions.checkIfLoggedIn(req)) {
        res.sendfile("views/chat.html");
    }else{
        res.redirect("login.html");
    }
};

//handling css requests
exports.chatCss = function (req, res) {
    res.sendfile("public/stylesheets/chat.css");
};

exports.loginCss = function (req, res) {
    res.sendfile("public/stylesheets/login.css");
};


//handling js requests
exports.loginJs = function (req, res) {
    res.sendfile("public/javascripts/login.js");
};

exports.chatJs = function (req, res) {
    res.sendfile("public/javascripts/chat.js");
};

//handling the socket.io request
exports.socketIo = function (req, res) {
    res.sendfile("socket.io/socket.io.js");
};