/**
 * Created by jovinbm on 12/25/14.
 */
var functions = require('../functions/functions.js');
var mongoose = require('mongoose');
var Question = require("../database/questions/question_model.js");

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
                        console.log(err);
                    } else {
                        Question.find({votes: {$gt: 0}}).sort({votes: -1}).limit(5).exec(function (err, topFiveObject) {
                            if (err) {
                                functions.consoleLogger(err)
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
    }

};