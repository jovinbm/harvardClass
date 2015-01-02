/**
 * Created by jovinbm on 12/25/14.
 */
//import modules
var Question = require("../database/questions/question_model.js");
var functions = require('../functions/functions.js');
var HarvardUser = require("../database/harvardUsers/harvard_user_model.js");

var onlineMinutesLimit = 2;

//function to make new question
var makeNewQuestion = function (questionObject, thisQuestionIndex, openId, r_username) {
    var question = new Question({
        questionIndex: thisQuestionIndex,
        senderName: r_username,
        senderOpenId: openId,
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

//function to return index of userObject in an array
function indexArrayObject(myArray, property, value) {
    for (var i = 0, len = myArray.length; i < len; i++) {
        if (myArray[i][property] === value) return i;
    }
    return -1;
}

//define and export all the event handlers
module.exports = {
    readyToChat: function (req, res, r_username, openId, socket, io) {
        functions.consoleLogger('readyToChat: READY_TO_CHAT event handler called');

        functions.eventEmit(socket, io, 'loggedin', r_username);

        HarvardUser.findOne({id: openId}).exec(function (err, theUser) {
            if (err) {
                functions.consoleLogger("ERROR: readyToChat: - in retrieving user")
            } else {
                //send the user his upvoted questions and THE RECENT TOP VOTED questions
                var myUpvotedQuestions = theUser.votedButtonClasses;
                functions.eventEmit(socket, io, 'myUpvotedQuestions', myUpvotedQuestions);

                functions.addOnline(usersOnline, r_username);

                //broadcasts to all, client needs to check if user is not yet displayed
                functions.broadcastOnlineUsers(socket, io, usersOnline, r_username);

                //BROADCASTS CURRENTLY TOP VOTED
                Question.find({votes: {$gt: 0}}).sort({votes: -1}).limit(5).exec(function (err, topFiveObject) {
                    if (err) {
                        functions.consoleLogger("ERROR: upvote: Question.find: " + err)
                        functions.consoleLogger('readyToChat: Success');
                    } else {
                        functions.eventEmit(socket, io, 'arrangement', topFiveObject);
                        functions.consoleLogger('readyTochat: query votes: Success');
                        functions.consoleLogger('readyToChat: Success');

                        //complete the ajax request here so that the next 'getHistory' can wait
                        res.contentType('json');
                        res.send({status: JSON.stringify({response: 'success'})});
                    }
                });
            }
        });
    },


    getHistory: function (req, res, r_username, openId, currentQuestionIndex, socket, io) {
        //define limit: How many do you want?
        var historyLimit = 20;

        functions.consoleLogger("getHistory: getHistory called");
        Question.find({questionIndex: {$gt: currentQuestionIndex}}).sort({questionIndex: -1}).limit(historyLimit).exec(function (err, historyArray) {
            if (err) {
                console.log("ERROR: getHistory: Question.find: " + err);
            } else {
                //find this users respective upvoted questions
                HarvardUser.findOne({id: openId}).exec(function (err, theUser) {
                    if (err) {
                        functions.consoleLogger("ERROR: getHistory: - in retrieving user who updated")
                    } else {
                        //insert the users upvotes into the ultimate object
                        var usersUpvotes = theUser.votedButtonClasses;
                        historyArray.forEach(function (question) {
                            question.votedButtonClasses = usersUpvotes;
                        });
                        io.emit("serverHistory", historyArray);
                        io.emit("incrementCurrentIndex", currentQuestionIndex + historyLimit);
                        functions.consoleLogger('getHistory: Success');
                    }
                });
            }
        });
    },


    iAmOnline: function (req, res, r_username) {
        var date = new Date();
        var microSeconds = date.getTime();

        //find the user in the userOnline object
        var index = indexArrayObject(usersOnline, "customUsername", r_username);

        if (index != -1) {
            usersOnline[index].time = microSeconds;
            functions.consoleLogger("******usersOnline = " + JSON.stringify(usersOnline));
        } else {
            //add the user back to the online object
            functions.addOnline(usersOnline, r_username);
        }
    },

    checkOnlineUsers: function (io) {

        var date = new Date();
        var microSeconds = date.getTime();
        var tempUsersOnline = [];

        for (var i = 0, len = usersOnline.length; i < len; i++) {
            //get minutes difference since when users last checked in
            var minutes = Math.floor(((microSeconds - usersOnline[i].time) / 1000) / 60);
            functions.consoleLogger("******minutes = " + minutes);
            if (minutes < onlineMinutesLimit) {
                tempUsersOnline.push(usersOnline[i]);
            }
        }
        usersOnline = tempUsersOnline;
        functions.consoleLogger("******usersOnline = " + JSON.stringify(usersOnline));
        io.sockets.emit('usersOnline', usersOnline);
    },


    clientMessage: function (req, res, r_username, theQuestion, openId, socket, io) {
        functions.consoleLogger('clientMessage: CLIENT_MESSAGE event handler called');
        //only save if the question is not empty or is not a space
        if (theQuestion.message != "" && theQuestion.message != " ") {
            var question;
            //query to get new index by adding one to the previous question's index
            Question.findOne().sort({questionIndex: -1}).exec(function (err, theObject) {
                var thisQuestionIndex;
                if (err || theObject == null || theObject == undefined) {
                    functions.consoleLogger("*(new)ERROR: getNewQuestion: " + err);
                    thisQuestionIndex = 0;

                    //still save the new question
                    //save the question using the new unique index and the senders openId(for tracking who
                    //asked which question
                    question = makeNewQuestion(theQuestion, thisQuestionIndex, openId, r_username);
                    question.save(function (err, UpdatedQuestion) {
                        if (err) {
                            functions.consoleLogger("ERROR: clientMessage: question.save: " + err);
                        } else {

                            //insert the question class to the respective harvard user for tracking
                            HarvardUser.update({id: openId}, {
                                $push: {askedQuestionsClasses: UpdatedQuestion.messageClass}
                            }, function (err, theUser) {
                                if (err || theUser == null || theUser == undefined) {
                                    functions.consoleLogger("ERROR: clientMessage: HarvardUser.findone: " + err);
                                } else {
                                    functions.eventBroadcaster(socket, io, 'serverMessage', UpdatedQuestion);
                                    functions.consoleLogger('clientMessage: Success');
                                }

                            });
                        }
                    });

                } else {
                    thisQuestionIndex = theObject.questionIndex + 1;

                    //save the question using the new unique index and the senders openId(for tracking who
                    //asked which question
                    question = makeNewQuestion(theQuestion, thisQuestionIndex, openId, r_username);
                    question.save(function (err, UpdatedQuestion) {
                        if (err) {
                            functions.consoleLogger("ERROR: clientMessage: question.save: " + err);
                        } else {

                            //insert the question class to the respective harvard user for tracking
                            HarvardUser.update({id: openId}, {
                                $push: {askedQuestionsClasses: UpdatedQuestion.messageClass}
                            }, function (err, theUser) {
                                if (err || theUser == null || theUser == undefined) {
                                    functions.consoleLogger("ERROR: clientMessage: HarvardUser.findone: " + err);
                                } else {
                                    functions.eventBroadcaster(socket, io, 'serverMessage', UpdatedQuestion);
                                    functions.consoleLogger('clientMessage: Success');
                                }

                            });
                        }
                    });
                }
            });
        }
    },


    //this function adds the voted question button class to the respective voter and then increments the total number of votes on the 
    //respective question, thereafter broadcasting the updated arrangement to all connected clients
    upvote: function (req, res, customUsername, openId, r_id, buttonClass, socket, io) {
        functions.consoleLogger("upvote: upvote event handler called");
        HarvardUser.update({id: openId}, {
            $push: {votedButtonClasses: buttonClass}
        }, function (err, question) {
            if (err) {
                functions.consoleLogger("ERROR: upvote: event_handlers " + err);
            } else {
                //then upvote the specific question and broadcast the new top 5
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
                                        //broadcast to all but the user who upvoted the question
                                        socket.broadcast.emit('arrangement', topFiveObject);

                                        //find the respective user who upvoted the question so that you can send them
                                        //a personalized arrangement with an update of what he upvoted
                                        HarvardUser.findOne({id: openId}).exec(function (err, theUser) {
                                            if (err) {
                                                functions.consoleLogger("ERROR: upvote: - in retrieving user who updated")
                                            } else {
                                                var usersUpvotes = theUser.votedButtonClasses;
                                                topFiveObject.forEach(function (question) {
                                                    question.votedButtonClasses = usersUpvotes;
                                                });
                                                socket.emit('arrangement', topFiveObject);
                                                functions.consoleLogger('upvote: Success');
                                            }
                                        });
                                    }
                                });

                            }
                        });
                };
                incrementVotes(r_id);
            }
        });
    },


    logoutHarvardLogin: function (req, res, socket, io) {
        functions.consoleLogger('LOGOUT HARVARD LOGIN event handler called');
        //delete the harvard cs50 ID session
        req.logout();
        //send a success so that the user will be logged out and redirected
        res.contentType('json');
        res.send({status: JSON.stringify({response: 'success'})});
        functions.consoleLogger('logoutHarvard: Success');
    },


    logoutCustomChat: function (req, res, r_username, socket, io) {
        functions.consoleLogger('LOGOUT CUSTOM CHAT event handler called');
        functions.eventBroadcaster(socket, io, 'logoutUser', r_username);
        functions.removeOnline(usersOnline, r_username);
        //delete the harvard cs50 ID session
        //send a success so that the user will be logged out and redirected
        res.contentType('json');
        res.send({status: JSON.stringify({response: 'success'})});
        functions.consoleLogger('logout: Success');
    },


    logoutHarvardChat: function (req, res, r_username, socket, io) {
        functions.consoleLogger('LOGOUT HARVARD CHAT event handler called');
        functions.eventBroadcaster(socket, io, 'logoutUser', r_username);
        functions.removeOnline(usersOnline, r_username);
        //delete the harvard cs50 ID session
        req.logout();
        //send a success so that the user will be logged out and redirected
        res.contentType('json');
        res.send({status: JSON.stringify({response: 'success'})});
        functions.consoleLogger('logout: Success');
    }
};