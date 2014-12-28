var functions = require('../functions/functions.js');
var sessions = require('../functions/sessions.js');

//handling login.html and chat.html requests
exports.loginHtml = function (req, res) {
    if(sessions.checkIfLoggedIn(req)){
        res.redirect("chat.html");
    }else {
        res.sendfile("views/login.html");
    }
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
    res.sendfile("public/stylesheets/custom.css");
};

exports.loginCss = function (req, res) {
    res.sendfile("public/stylesheets/login.css");
};


//handling js requests
exports.loginJs = function (req, res) {
    res.sendfile("public/javascripts/customlogin.js");
};

exports.chatJs = function (req, res) {
    res.sendfile("public/javascripts/customchat.js");
};

//handling the socket.io request
exports.socketIo = function (req, res) {
    res.sendfile("socket.io/socket.io.js");
};