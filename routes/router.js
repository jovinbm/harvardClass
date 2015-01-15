/**
 * Created by jovinbm on 12/25/14.
 */
var app = require('../app.js');
var io = app.io;
var path = require('path');
var basic = require('../functions/basic.js');
var dbJs = require('../functions/db.js');
var Question = require("../database/questions/question_model.js");
var HarvardUser = require("../database/harvardUsers/harvard_user_model.js");

module.exports = {
    loginHtml: function (req, res) {
        if (req.user) {
            res.redirect("login1.html");
        } else {
            res.render('login');
        }
    },


    login_1_Html: function (req, res) {
        function error(status, err) {
            if (status == -1 || status == 0) {
                basic.consoleLogger("ERROR: exports.loog_1_Html: getting customLoggedInStatus: " + err);
                res.redirect("login.html");
            }
        }

        function success(theHarvardUser) {
            //if logged in in both harvard and custom login take them to chat directly
            if (req.user && theHarvardUser.customLoggedInStatus == 1) {
                res.redirect('chat.html');
            }
            else if (req.user) {
                res.render('login1', {displayName: 'Hello, ' + theHarvardUser.displayName});
            } else {
                res.redirect("login.html");
            }
        }

        dbJs.findHarvardUser(req.user.id, error, error, success);
    },


    studentLogin: function (req, res) {
        //if user got here without doing a harvard login, redirect them back to harvard login
        if (!req.user) {
            res.redirect("login.html");
        }

        //get the customLoggedInStatus
        function error(status, err) {
            if (status == -1 || status == 0) {
                basic.consoleLogger("ERROR: exports.login_1_Html: " + err);
                res.redirect("login.html");
            }
        }

        function success(theHarvardUser) {
            function successUpdate() {
                res.redirect("chat.html");
            }

            //if logged in in both harvard and custom login take them to chat directly
            if (req.user && theHarvardUser.customLoggedInStatus == 1) {
                res.redirect('chat.html');
            } else {
                dbJs.updateCuCls(req.user.id, req.body.customUsername, 1, error, error, successUpdate)
            }
        }

        dbJs.findHarvardUser(req.user.id, error, error, success);
    },


    chatHtml: function (req, res) {
        //get the customUsername
        function error(status, err) {
            if (status == -1 || status == 0) {
                basic.consoleLogger("ERROR: exports.chatHtml: " + err);
                res.redirect("login.html");
            }
        }

        function success(theHarvardUser) {
            if (req.user && theHarvardUser.customLoggedInStatus == 1) {
                res.render('chat');
            } else if (req.user) {
                res.redirect("login1.html");
            } else {
                res.redirect("login.html");
            }
        }

        dbJs.findHarvardUser(req.user.id, error, error, success);
    }
};