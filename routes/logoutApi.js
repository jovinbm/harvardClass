/**
 * Created by jovinbm on 1/12/15.
 */
var email = require("emailjs");
var mailServer = email.server.connect({
    user: "jovinbeda@gmail.com",
    password: "uxccpufouacqxrzm",
    host: "smtp.gmail.com",
    ssl: true
});
var path = require('path');
var basic = require('../functions/basic.js');
var event_handlers = require('../event_handlers/event_handlers.js');
var dbJs = require('../functions/db.js');
var Question = require("../database/questions/question_model.js");
var Comment = require("../database/comments/comment_model.js");
var HarvardUser = require("../database/harvardUsers/harvard_user_model.js");

module.exports = {
    logoutHarvardLogin: function (req, res) {
        basic.consoleLogger('LOGOUT HARVARD LOGIN event received');
        event_handlers.logoutHarvardLogin(req, res);
    },


    logoutCustomChat: function (req, res) {
        basic.consoleLogger('LOGOUT CUSTOM CHAT event received');
        /*no need to complete the ajax request -- user will be redirected to login which has it's
         own js file*/
        //retrieve the user
        function error(status, err) {
            if (status == -1 || status == 0) {
                res.status(500).send({msg: 'ERROR: logoutCustomChatPOST: Could not retrieve user', err: err});
                basic.consoleLogger("ERROR: logoutCustomChatPOST: Could not retrieve user: " + err);
            }
        }

        function success(theHarvardUser) {
            //toggle the user's customLoggedInStatus
            function toggled() {
                event_handlers.logoutCustomChat(req, res, theHarvardUser);
            }

            dbJs.toggleCls(req.user.id, 0, error, error, toggled);
        }

        dbJs.findHarvardUser(req.user.id, error, error, success);
    },


    logoutHarvardChat: function (req, res) {
        basic.consoleLogger('LOGOUT HARVARD CHAT event received');
        /*no need to complete the ajax request -- user will be redirected to login which has it's
         own js file*/
        //retrieve the user
        function error(status, err) {
            if (status == -1 || status == 0) {
                res.status(500).send({msg: 'ERROR: logoutHarvardChatPOST: Could not retrieve user', err: err});
                basic.consoleLogger("ERROR: logoutHarvardChatPOST: Could not retrieve user: " + err);
            }
        }

        function success(theHarvardUser) {
            //toggle the user's customLoggedInStatus
            function toggled() {
                event_handlers.logoutHarvardChat(req, res, theHarvardUser);
            }

            dbJs.toggleCls(req.user.id, 0, error, error, toggled);
        }

        dbJs.findHarvardUser(req.user.id, error, error, success);
    }
};