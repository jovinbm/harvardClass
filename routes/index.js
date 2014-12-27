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
exports.bootstrapCss = function (req, res) {
    res.sendfile("public/stylesheets/assets/bootstrap.min.css");
};

exports.customCss = function (req, res) {
    res.sendfile("public/stylesheets/custom.css");
};


//handling js requests
exports.jqueryJs = function (req, res) {
    res.sendfile("public/javascripts/assets/jquery-2.1.1.min.js");
};

exports.bootstrapJs = function (req, res) {
    res.sendfile("public/javascripts/assets/bootstrap.min.js");
};

exports.respondJs = function (req, res) {
    res.sendfile("public/javascripts/assets/respond.js");
};
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