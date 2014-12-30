/**
 * Created by jovinbm on 12/25/14.
 */
//import modules
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Question = require("../database/questions/question_model.js");
var User = require("../database/users/user_model.js");
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
    functions.consoleLogger("makeNewQuestion: question = " + JSON.stringify(question));
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

        //broadcasts the currently top questions
        Question.find({votes: {$gt: 0}}).sort({votes: -1}).limit(5).exec(function (err, topFiveObject) {
            if (err) {
                functions.consoleLogger("ERROR: upvote: Question.find: " + err)
            } else {
                functions.eventEmit(req, 'arrangement', topFiveObject);
                functions.consoleLogger('upvote: Success');
            }
        });
        functions.consoleLogger('readyToChat: Success');
    },

    clientMessage: function (req, app, r_username, theQuestion) {
        functions.consoleLogger('clientMessage: CLIENT_MESSAGE event handler called');
        var question;
        functions.consoleLogger('theQuestion.message = ' + theQuestion.message);

        //only save if the question is not empty or is not a space
        if (theQuestion.message != "" && theQuestion.message != " ") {
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
                        functions.consoleLogger("ERROR: clientMessage: question.save: " + err);
                    } else {
                        functions.eventBroadcaster(app, 'serverMessage', UpdatedQuestion);
                        functions.consoleLogger('clientMessage: Success');
                    }
                });

            });
        }

    },

    //this function adds the voted question button class to the respective voter and then increments the total number of votes on the 
    //respective question, thereafter broadcasting the updated arrangement to all connected clients
    upvote: function(req, app, customUsername, userId, r_id, buttonClass){
        functions.consoleLogger("upvote: upvote event handler called");
        User.update({customUsername: customUsername, userId: userId},{
            $push: {votedButtonClasses: buttonClass}
        }, function(err, question){
            if(err){
                functions.consoleLogger("ERRO: upvote: event_handlers " + err);
            }else{
                functions.consoleLogger(JSON.stringify(question));

                //then upvote the specific question and broadcast the new top 5
                functions.consoleLogger('upvote: UPVOTE event handler called with r_id = ' + r_id);
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
            }
        });
    },

    logout: function (req, app, r_username) {
        functions.consoleLogger('LOGOUT event handler called');
        functions.eventBroadcaster(app, 'logoutUser', r_username);
        functions.eventEmit(req, "goToLogin", "/login.html");
        functions.removeOnline(usersOnline, r_username);
        functions.consoleLogger('logout: Success');
    },

    close: function (req, app, r_username) {
        functions.consoleLogger('CLOSE event handler called');
        functions.eventBroadcaster(app, 'logoutUser', r_username);
        functions.removeOnline(usersOnline, r_username);
        functions.consoleLogger('close: Success');
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