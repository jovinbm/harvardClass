/**
 * Created by jovinbm on 12/25/14.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var functions = require('../functions/functions.js');
var sessions = require('../functions/sessions.js');
var event_handlers = require('../event_handlers/event_handlers.js');
var Question = require("../database/questions/question_model.js");
var User = require("../database/users/user_model.js");

//function to make new user
var makeNewUser = function (customUsername, userId) {
    var newUser = new User({
        userId: userId,
        customUsername: customUsername,
        customCode: "",
        votedButtonClasses: []
    });
    return newUser;
};

var getLatestUserId = function(){
    User.findOne().sort({userId: -1})
};

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
    //query to get new userId, save new user, then redirect user
    User.findOne().sort({userId: -1}).exec(function(err, theUser){
        var thisUserIndex;
        if(err || theUser == null || theUser == undefined){
            functions.consoleLogger("ERROR: router: studentLoginPost: userId " + err);
            thisUserIndex = 0;
        }else{
            thisUserIndex = theUser.userId + 1;
        }

        req.session.userId = thisUserIndex;
        sessions.toggleLoggedInSession(req, 1);
        req.session.save();
        var r_username;
        r_username = req.session.username;

        //create new user
        var user = makeNewUser(r_username, thisUserIndex);
        //save the new user
        user.save(function(err, savedUser){
            if(err){
                functions.consoleLogger("ERROR: event_handlers: studentLoginPost: " + err)
            }else{
                functions.consoleLogger("************* savedUser = " + savedUser);
                res.redirect("login.html");
            }
        });
    });
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