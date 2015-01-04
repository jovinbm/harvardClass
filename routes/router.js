/**
 * Created by jovinbm on 12/25/14.
 */
var path = require('path');
var functions = require('../functions/functions.js');
var event_handlers = require('../event_handlers/event_handlers.js');
var Question = require("../database/questions/question_model.js");
var HarvardUser = require("../database/harvardUsers/harvard_user_model.js");

//handling login.html and chat.html requests
//check if logged in by Harvard Id
exports.loginHtml = function (req, res) {
    if (req.user) {
        res.redirect("login1.html");
    } else {
        res.render('login');
    }

};

//check user if they are logged in using harvard Id and send page page to inter custom
//username and class code. If not redirect them to login.html with the 'log in with Harvard
//ID' button
exports.login_1_Html = function (req, res) {
    //first get the customLoggedInStatus and displayName for ejs template
    HarvardUser.findOne({id: req.user.id}, {customLoggedInStatus: 1, displayName: 1}).exec(
        function (err, theUser) {
            if (err || theUser == null || theUser == undefined) {
                functions.consoleLogger("ERROR: exports.loog_1_Html: getting customLoggedInStatus: " + err);
            } else {
                //if logged in in both harvard and custom login take them to chat directly
                if (req.user && theUser.customLoggedInStatus == 1) {
                    res.redirect('chat.html');
                }
                else if (req.user) {
                    res.render('login1', {displayName: 'Hello, ' + theUser.displayName});
                } else {
                    res.redirect("login.html");
                }
            }
        }
    );

};


exports.studentLoginPost = function (req, res) {
    //if user got here without doing a harvard login, redirect them back to harvard login
    if (!req.user) {
        res.redirect("login.html");
    }

    //get the customLoggedInStatus
    HarvardUser.findOne({id: req.user.id}, {customLoggedInStatus: 1}).exec(
        function (err, theUser) {
            if (err || theUser == null || theUser == undefined) {
                functions.consoleLogger("ERROR: exports.loog_1_Html: getting customLoggedInStatus: " + err);
            } else {
                //if logged in in both harvard and custom login take them to chat directly
                if (req.user && theUser.customLoggedInStatus == 1) {
                    req.redirect('chat.html');
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
                        res.redirect("chat.html");
                    }
                })
            }
        }
    );
};


exports.chatHtml = function (req, res) {
    var openId = req.user.id;
    //perform checks to make sure the user is logged in
    //check the customLoggedInStatus from database
    HarvardUser.findOne({id: openId}, {customLoggedInStatus: 1, customUsername: 1}).exec(function (err, theUser) {
        if (err || theUser == null || theUser == undefined) {
            functions.consoleLogger("ERROR: exports.chatHtml: " + err);
        } else {
            if (req.user && theUser.customLoggedInStatus == 1) {
                res.render('chat', {customUsername: theUser.customUsername});
            } else if (req.user) {
                res.redirect("login1.html");
            } else {
                res.redirect("login.html");
            }
        }
    });
};


//handling the socket.io request
exports.socketIo = function (req, res) {
    res.sendfile("socket.io/socket.io.js");
};