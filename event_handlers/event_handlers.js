/**
 * Created by jovinbm on 12/25/14.
 */
//import modules
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Question = require("../database/questions/question_model.js");
var functions = require('../functions/functions.js');

//function to make new question
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

//variable to hold online users
var usersOnline = [];

//define and export all the event handlers
module.exports = {
    readyInput: function (req, app, r_username) {
        functions.consoleLogger('readyInput: READY_INPUT event handler called');
        functions.eventEmit(req, "goToChat", "/chat.html");
        functions.consoleLogger('readyInput: Success');
    },

    readyToChat: function (req, app, r_username) {
        functions.consoleLogger('readyToChat: READY_TO_CHAT event handler called');
        functions.eventEmit(req, 'loggedin', r_username);
        functions.addOnline(usersOnline, r_username);

        //broadcasts to all, client needs to check if user is not yet displayed
        functions.broadcastOnlineUsers(app, usersOnline, r_username);
        functions.consoleLogger('readyToChat: Success');
    },

    clientMessage: function (req, app, r_username, theQuestion) {
        functions.consoleLogger('clientMessage: CLIENT_MESSAGE event handler called');
        var question;

        //query to get new index
        Question.findOne().sort({questionIndex: -1}).exec(function (err, theObject) {
            var thisQuestionIndex;
            if (err || theObject == null || theObject == undefined) {
                functions.consoleLogger("ERROR: getNewQuestion: " + err);
                thisQuestionIndex = 0;
            } else {
                thisQuestionIndex = theObject.questionIndex + 1;
            }

            //save the question
            question = makeNewQuestion(theQuestion, thisQuestionIndex);
            question.save(function (err, UpdatedQuestion) {
                if (err) {
                    console.log("ERROR: clientMessage: question.save: " + err);
                } else {
                    functions.eventBroadcaster(app, 'serverMessage', UpdatedQuestion);
                    functions.consoleLogger('clientMessage: Success');
                }
            });

        });


    },

    upvote: function (req, app, r_username, r_id) {
        functions.consoleLogger('upvote: UPVOTE event handler called');
        var incrementVotes = function (r_id) {
            Question.update({"messageClass": r_id}, {"$inc": {"votes": 1}},
                function (err, qObject) {
                    if (err) {
                        console.log("ERROR: upvote: Question.update: " + err);
                    } else {
                        Question.find({votes: {$gt: 0}}).sort({votes: -1}).limit(5).exec(function (err, topFiveObject) {
                            if (err) {
                                functions.consoleLogger("ERROR: upvote: Question.find: " + err)
                            } else {
                                app.io.broadcast('arrangement', topFiveObject);
                                functions.consoleLogger('upvote: Success');
                            }
                        });

                    }
                });
        };
        incrementVotes(r_id);


    },

    logout: function (req, app, r_username) {
        functions.consoleLogger('LOGOUT event handler called');
        functions.eventBroadcaster(app, 'logoutUser', r_username);
        functions.eventEmit(req, "goToLogin", "/login.html");
        functions.removeOnline(usersOnline, r_username);
        functions.consoleLogger('logout: Success');
    },

    getHistory: function (req, app, r_username, currentQuestionIndex) {
        //define limit: How many do you want?
        var historyLimit = 10;

        functions.consoleLogger("getHistory: getHistory called");
        Question.find({questionIndex: {$gt: currentQuestionIndex}}).sort({questionIndex: -1}).limit(historyLimit).exec(function (err, historyArray) {
            if (err) {
                console.log("ERROR: getHistory: Question.find: " + err);
            } else {
                functions.eventEmit(req, "serverHistory", historyArray);
                functions.eventEmit(req, "incrementCurrentIndex", currentQuestionIndex + historyLimit);
            }
            functions.consoleLogger('getHistory: Success');
        });
    }

};