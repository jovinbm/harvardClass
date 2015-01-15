/**
 * Created by jovinbm on 1/12/15.
 */
var app = require('../app.js');
var email = require("emailjs");
var mailServer = email.server.connect({
    user: "jovinbeda@gmail.com",
    password: "uxccpufouacqxrzm",
    host: "smtp.gmail.com",
    ssl: true
});
var basic = require('../functions/basic.js');
var event_handlers = require('../event_handlers/event_handlers.js');
var dbJs = require('../functions/db.js');
var Question = require("../database/questions/question_model.js");
var HarvardUser = require("../database/harvardUsers/harvard_user_model.js");

module.exports = {
    sendEmail: function (req, res) {
        res.redirect('login.html');
        var message = {
            text: "Name: " + req.body.name + ", Email: " + req.body.email + ", Message: " + req.body.message,
            from: req.body.email,
            to: "jovinbeda@gmail.com",
            subject: "HARVARDCLASS WEBSITE"
        };
        mailServer.send(message, function (err) {
            basic.consoleLogger(err || "EMAIL: Message sent to jovinbeda@gmail.com");
        });
    },


    getMyRoom: function (req, res) {
        //retrieve the socketRoom and customUsername
        function error(status, err) {
            if (status == -1 || status == 0) {
                res.status(500).send({msg: "ERROR: getMyRoomGET: Could not retrieve user:"});
                basic.consoleLogger("ERROR: getMyRoomGET: Could not retrieve user: " + err);
            }
        }

        function success(theHarvardUser) {
            if (theHarvardUser.customLoggedInStatus == 1) {
                res.send({
                    socketRoom: theHarvardUser.socketRoom,
                    customUsername: theHarvardUser.customUsername
                });
            }
        }

        dbJs.findHarvardUser(req.user.id, error, error, success);
    },


    ready: function (req, res) {
        basic.consoleLogger('READY event received');
        //retrieve the customUsername
        function error(status, err) {
            if (status == -1 || status == 0) {
                res.status(500).send({msg: 'readyPOST: Could not retrieve user', err: err});
                basic.consoleLogger("ERROR: readyPOST: Could not retrieve user: " + err);
            }
        }

        function success(theHarvardUser) {
            if (theHarvardUser.customLoggedInStatus == 1) {
                event_handlers.ready(req, res, theHarvardUser);
            }
        }

        dbJs.findHarvardUser(req.user.id, error, error, success);
    },

    getHistory: function (req, res) {
        basic.consoleLogger('GET_HISTORY event received');
        var currentQuestionIndex = req.body.currentQuestionIndex;
        //retrieve the customUsername
        function error(status, err) {
            if (status == -1 || status == 0) {
                res.status(500).send({msg: 'getHistoryPOST: Could not retrieve user', err: err});
                basic.consoleLogger("ERROR: getHistoryPOST: Could not retrieve user: " + err);
            }
        }

        function success(theHarvardUser) {
            if (theHarvardUser.customLoggedInStatus == 1) {
                event_handlers.getHistory(req, res, theHarvardUser, currentQuestionIndex);
            }
        }

        dbJs.findHarvardUser(req.user.id, error, error, success);
    },


    newQuestion: function (req, res) {
        basic.consoleLogger('NEW_QUESTION event received');
        var theQuestion = req.body;
        //get the Harvard User
        function error(status, err) {
            if (status == -1 || status == 0) {
                res.status(500).send({msg: 'ERROR: newQuestionPOST: Could not retrieve user', err: err});
                basic.consoleLogger("ERROR: newQuestionPOST: Could not retrieve user: " + err);
            }
        }

        function success(theHarvardUser) {
            if (theHarvardUser.customLoggedInStatus == 1) {
                event_handlers.newQuestion(req, res, theHarvardUser, theQuestion);
            }
        }

        dbJs.findHarvardUser(req.user.id, error, error, success);
    },


    newUpvote: function (req, res) {
        basic.consoleLogger('NEW_UPVOTE event received');
        var upvotedIndex = req.body.upvoteIndex;
        //retrieve the user
        function error(status, err) {
            if (status == -1 || status == 0) {
                res.status(500).send({msg: 'ERROR: newUpvotePOST: Could not retrieve user', err: err});
                basic.consoleLogger("ERROR: newUpvotePOST: Could not retrieve user: " + err);
            }
        }

        //only execute upvote if the user has not voted on the question
        function success(theHarvardUser) {
            if (theHarvardUser.votedQuestionIndexes.indexOf(upvotedIndex) == -1 && theHarvardUser.customLoggedInStatus == 1) {
                event_handlers.newUpvote(req, res, theHarvardUser, upvotedIndex);
            }
        }

        dbJs.findHarvardUser(req.user.id, error, error, success);
    }
};