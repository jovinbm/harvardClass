/**
 * Created by jovinbm on 12/25/14.
 */
var functions = require('../functions/functions.js');
var event_handlers = require('../event_handlers/event_handlers.js');
var Question = require("../database/questions/question_model.js");
var HarvardUser = require("../database/harvardUsers/harvard_user_model.js");

var getLatestUserId = function () {
    User.findOne().sort({userId: -1})
};

//handling login.html and chat.html requests
//check if logged in by Harvard Id
exports.loginHtml = function (req, res) {
    //if logged in in both harvard and custom login take them to chat directly
    if (req.user) {
        res.redirect("login1.html");
    } else {
        res.sendfile("views/login.html");
    }
};

//check user if they are logged in using harvard Id and send page page to inter custom
//username and class code. If not redirect them to login.html with the 'log in with Harvard
//ID' button
exports.login_1_Html = function (req, res) {
    //if logged in in both harvard and custom login take them to chat directly
    if (req.user) {
        res.sendfile("views/login1.html");
    } else {
        res.redirect("login.html");
    }
};

exports.studentLoginPost = function (req, res) {
    //if user got here without doing a harvard login, redirect them back to harvard login
    if (!req.user) {
        res.redirect("login.html");
    }
    //update the Harvard User's customUsername and redirect them
    var customUsername = req.body.customUsername;
    //get users unique CS50 id from session object stored by passport
    var userOpenId = req.user.id;
    //query to get the user, update the users customUsername, then redirect user
    HarvardUser.update({id: userOpenId}, {
        $set: {
            customUsername: customUsername,
            customLoggedInStatus: 1
        }
    }, function (err, theUser) {
        if (err || theUser == null || theUser == undefined) {
            functions.consoleLogger("ERROR: router: studentLoginPost: customUsername Update " + err);
        } else {
            //redirect user to login.html -- all checks will make sure that the user ends up in chat.html
            res.redirect("chat.html");
        }
    })
};

exports.chatHtml = function (req, res) {
    var openId = req.user.id;
    //perform checks to make sure the user is logged in
    //check the customLoggedInStatus from database
    HarvardUser.findOne({id: openId}, {customLoggedInStatus: 1}).exec(function (err, theUser) {
        if (err || theUser == null || theUser == undefined) {
            functions.consoleLogger("ERROR: exports.chatHtml: " + err);
        } else {
            if (req.user && theUser.customLoggedInStatus == 1) {
                res.sendfile("views/chat.html");
            } else if (req.user) {
                res.redirect("login1.html");
            } else {
                res.redirect("login.html");
            }
        }
    });
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