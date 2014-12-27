var functions = require('../functions/functions.js');
var sessions = require('../functions/sessions.js');

//handling login.html and chat.html requests
exports.loginHtml = function (req, res) {
    if(sessions.checkIfLoggedIn(req)){
        res.redirect("chat2.html");
    }else {
        res.sendfile("views/login.html");
    }
};

exports.chatHtml = function (req, res) {
    if (sessions.checkIfLoggedIn(req)) {
        res.sendfile("views/chat2.html");
    }else{
        res.redirect("login.html");
    }
};

//handling css requests
exports.customCss = function (req, res) {
    res.sendfile("public/stylesheets/custom2.css");
};

exports.loginCss = function (req, res) {
    res.sendfile("public/stylesheets/logincss.css");
};


//handling js requests
exports.loginJs = function (req, res) {
    res.sendfile("public/javascripts/customlogin.js");
};

exports.chatJs = function (req, res) {
    res.sendfile("public/javascripts/customchat2.js");
};

//handling the socket.io request
exports.socketIo = function (req, res) {
    res.sendfile("socket.io/socket.io.js");
};