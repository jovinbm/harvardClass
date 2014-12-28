/**
 * Created by jovinbm on 12/25/14.
 */
var functions = require('../functions/functions.js');
var mongoose = require('mongoose');
var Question = require("../database/questions/question_model.js");


//useful database functions
//var incrementLatestIndex = function () {
//    functions.consoleLogger('incrementLatestIndex: called');
//    Question.findOneAndUpdate({}, {
//        $inc: {
//            questionIndex: 1
//        }
//    }, function (err) {
//        if (err) {
//            functions.consoleLogger(err);
//            return false;
//        }
//        else {
//            return true;
//        }
//    })
//};

var makeNewQuestion = function (questionObject, thisQuestionIndex) {
    question = new Question({
        questionIndex: thisQuestionIndex,
        senderName: questionObject.senderName,
        message: questionObject.message,
        shortMessage: questionObject.shortMessage,
        messageClass: "a" + thisQuestionIndex,
        buttonClass: "a" + thisQuestionIndex + "b btn btn-info upvote",
        votes: 0
    });
    return question;
};

//holds online users
var usersOnline = [];

//define all the event handlers
module.exports = {
    readyInput: function (req, app, r_username) {
        functions.consoleLogger('readyInput: READY_INPUT event handler called');
        functions.eventEmit(req, "goToChat", "/chat.html");
        functions.consoleLogger("readyInput: Saved the new session");
        functions.consoleLogger('readyInput: r_username = ' + r_username);
        functions.consoleLogger('readyInput: req.session.loggedInStatus = ' + req.session.loggedInStatus);

        functions.consoleLogger('readyInput: DONE');
    },

    readyToChat: function (req, app, r_username) {
        functions.consoleLogger('readyToChat: READY_TO_CHAT event handler called');
        functions.consoleLogger('readyToChat: r_username = ' + r_username);
        functions.eventEmit(req, 'loggedin', r_username);
        functions.addOnline(usersOnline, r_username);
        functions.consoleLogger('readyToChat: usersOnline array =  ' + usersOnline);

        //broadcasts to all, client needs to check if user is not yet displayed
        functions.broadcastOnlineUsers(app, usersOnline, r_username);

        functions.consoleLogger('readyToChat: DONE');
    },

    clientMessage: function (req, app, r_username, theQuestion) {
        functions.consoleLogger('clientMessage: CLIENT_MESSAGE event handler called');

        var question;

        //query to get new index
        Question.findOne().sort({questionIndex: -1}).exec(function (err, theObject) {
            var thisQuestionIndex;
            if (err || theObject == null || theObject == undefined) {
                functions.consoleLogger("getNewQuestion: if statement executed");
                thisQuestionIndex = 0;
                makeNewQuestion(theQuestion, thisQuestionIndex);
            } else {
                functions.consoleLogger("getNewQuestion: else statement executed");
                functions.consoleLogger("getNewQuestion: theObject.questionIndex = " + theObject.questionIndex);
                thisQuestionIndex = theObject.questionIndex + 1;
            }

            //save the question
            functions.consoleLogger("consoleLogger: thisQuestionIndex = " + thisQuestionIndex);
            question = makeNewQuestion(theQuestion, thisQuestionIndex);
            functions.consoleLogger("Made" + question + " before proceeding");
            question.save(function (err, UpdatedQuestion) {
                if (err) {
                    console.log(err);
                } else {
                    app.io.broadcast('serverMessage', UpdatedQuestion);
                    functions.consoleLogger("makeNewQuestion: broadcasted " + UpdatedQuestion);
                    req.io.emit('serverMessage', UpdatedQuestion);
                    functions.consoleLogger("makeNewQuestion: eventEmit called");

                    functions.consoleLogger('clientMessage: DONE');
                }
            });

        });


    },

    upvote: function (req, app, r_username, r_id) {
        functions.consoleLogger('upvote: UPVOTE event handler called');
        functions.consoleLogger("upvote: Received upvote of " + r_id);
        var updatedVotes = database.upvoteQuestion(r_id);

        var topFive = database.getFiveTopVoted();
        app.io.broadcast('arrangement', topFive);

        functions.consoleLogger('upvote: DONE');
    },

    logout: function (req, app, r_username) {
        functions.consoleLogger('LOGOUT event handler called');
        functions.consoleLogger("logout: " + r_username + " is logging out");
        functions.eventBroadcaster(app, 'logoutUser', r_username);
        functions.eventEmit(req, "goToLogin", "/login.html");
        functions.consoleLogger("logout: Redirected client to login.html page due to logout");
        functions.removeOnline(usersOnline, r_username);

        functions.consoleLogger('logout: DONE');
    }

};