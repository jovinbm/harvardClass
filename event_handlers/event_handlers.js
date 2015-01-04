/**
 * Created by jovinbm on 12/25/14.
 */
//import modules
var Question = require("../database/questions/question_model.js");
var HarvardUser = require("../database/harvardUsers/harvard_user_model.js");
var basic = require('../functions/basic.js');
var ioJs = require('../functions/io.js');
var dbJs = require('../functions/db.js');
var online = require('../functions/online.js');

var onlineMinutesLimit = 2;

//variable to hold online users
var usersOnline = [];

//define and export all the event handlers
module.exports = {
    readyToChat: function (req, res, theHarvardUser, io) {
        basic.consoleLogger('readyToChat: READY_TO_CHAT event handler called');
        var customUsername = theHarvardUser.customUsername;
        var socketRoom = theHarvardUser.socketRoom;
        ioJs.emitToOne(socketRoom, io, 'loggedin', customUsername);
        online.addToUsersOnline(usersOnline, customUsername);
        ioJs.emitToAll(io, "usersOnline", usersOnline);

        //send the user his upvoted questions and THE RECENT TOP VOTED questions
        ioJs.emitToOne(socketRoom, io, 'myUpvotedButtonClasses', theHarvardUser.votedButtonClasses);

        //find and broadcast the currently top voted
        function error(status, err) {
            if (status == -1 || status == 0) {
                basic.consoleLogger("*: ReadyToChat: failed to find top voted: " + err);
                /*complete the ajax request by sending the client their socket.io room*/
                res.contentType('json');
                res.send(JSON.stringify({"status": "success"}));
                basic.consoleLogger('readyToChat: Success');
            }
        }

        function success(topVotedObject) {
            ioJs.emitToOne(socketRoom, io, 'arrangement', topVotedObject);
            /*complete the ajax request by sending the client their socket.io room*/
            res.contentType('json');
            res.send(JSON.stringify({"status": "success"}));
            basic.consoleLogger('readyToChat: Success');
        }

        dbJs.findTopVotedQuestions(-1, 7, error, error, success);
    },


    getHistory: function (req, res, theHarvardUser, io, currentQuestionIndex) {
        basic.consoleLogger("getHistory: getHistory called");
        var socketRoom = theHarvardUser.socketRoom;
        //define limit: How many do you want?
        var historyLimit = 20;
        //retrieve the history
        function error(status, err) {
            if (status == -1 || status == 0) {
                basic.consoleLogger("ERROR: getHistory: Question.find: " + err);
            }
        }

        function success(historyArray) {
            //get this user their respective upvotes first
            function success() {
                ioJs.emitToOne(socketRoom, io, "serverHistory", historyArray);
                ioJs.emitToOne(socketRoom, io, "incrementCurrentIndex", currentQuestionIndex + historyLimit);
                basic.consoleLogger('getHistory: Success');
            }

            ioJs.emitToOne(socketRoom, io, "myUpvotedButtonClasses", theHarvardUser.votedButtonClasses, success);
        }

        dbJs.getRecentQuestions(-1, currentQuestionIndex, 20, error, error, success)
    },


    iAmOnline: function (req, res, r_username, socketRoom) {
        var date = new Date();
        var microSeconds = date.getTime();
        //find the user in the userOnline object
        var index = basic.indexArrayObject(usersOnline, "customUsername", r_username);
        if (index != -1) {
            usersOnline[index].time = microSeconds;
            basic.consoleLogger("******usersOnline = " + JSON.stringify(usersOnline));
        } else {
            online.addToUsersOnline(usersOnline, r_username);
        }

        //update the socketRoom
        /*complete the ajax request by sending the client their socket.io room
         the socketRoom is encrypted*/
        res.contentType('json');
        res.send(JSON.stringify({"socketRoom": socketRoom}));
    },

    checkOnlineUsers: function (io) {
        var date = new Date();
        var microSeconds = date.getTime();
        var tempUsersOnline = [];

        for (var i = 0, len = usersOnline.length; i < len; i++) {
            //get minutes difference since when users last checked in
            var minutes = Math.floor(((microSeconds - usersOnline[i].time) / 1000) / 60);
            if (minutes < onlineMinutesLimit) {
                tempUsersOnline.push(usersOnline[i]);
            }
        }
        usersOnline = tempUsersOnline;
        basic.consoleLogger("******usersOnline = " + JSON.stringify(usersOnline));
        ioJs.emitToAll(io, 'usersOnline', usersOnline);
    },


    clientMessage: function (req, res, theHarvardUser, io, theQuestion) {
        basic.consoleLogger('clientMessage: CLIENT_MESSAGE event handler called');
        var thisQuestionIndex;
        //query the recent question
        if (!(/^\s+$/.test(theQuestion.message))) {
            function save(index) {
                function made(question) {
                    function saved(savedQuestion) {
                        function done(questionObject) {
                            ioJs.emitToAll(io, 'serverMessage', questionObject);
                            basic.consoleLogger('clientMessage: Success');
                        }

                        dbJs.pushQuestionToAsker(req.user.id, savedQuestion, error, error, done);
                    }

                    dbJs.saveNewQuestion(question, error, error, saved);
                }

                dbJs.makeNewQuestion(theQuestion, index, theHarvardUser, made);
            }

            function error(status, err) {
                if (status == -1) {
                    basic.consoleLogger("ERROR: clientMessage event_Handler: " + err);
                } else if (status == 0) {
                    //means this is the first question. Save it
                    thisQuestionIndex = 0;
                    save(thisQuestionIndex);
                }
            }

            function success(history) {
                thisQuestionIndex = history[0].questionIndex + 1;
                save(thisQuestionIndex);
            }

            dbJs.getRecentQuestions(-1, -1, 1, error, error, success);
        }
    },


    upvote: function (req, res, theHarvardUser, io, questionClass, buttonClass) {
        basic.consoleLogger("upvote: upvote event handler called");
        //push the new upvote's button class to the respective upvoter
        function error(status, err) {
            if (status == -1 || status == 0) {
                basic.consoleLogger("ERROR: upvote: event_handlers " + err);
            }
        }

        function success() {
            function broadcastTop() {
                function broadcaster(topVotedObject) {

                    function pushed() {
                        function personalizedDone() {
                            ioJs.emitToAll(io, 'arrangement', topVotedObject);
                            basic.consoleLogger('upvote: Success');
                        }

                        //send the upvoter their current upvoted questions
                        ioJs.emitToOne(theHarvardUser.socketRoom, io, "myUpvotedButtonClasses", theHarvardUser.votedButtonClasses, personalizedDone);
                    }

                    //update theHarvardUser(to avoid retrieving) by pushing the new buttonClass
                    function pushButtonClass(pushed) {
                        theHarvardUser.votedButtonClasses.push(buttonClass);
                        pushed()
                    }

                    pushButtonClass(pushed)
                }

                dbJs.findTopVotedQuestions(-1, 7, error, error, broadcaster);
            }

            dbJs.incrementQuestionVotes(questionClass, error, error, broadcastTop);
        }

        dbJs.pushUpvoteToUpvoter(req.user.id, buttonClass, error, error, success);
    },


    logoutHarvardLogin: function (req, res) {
        basic.consoleLogger('LOGOUT HARVARD LOGIN event handler called');
        //delete the harvard cs50 ID session
        req.logout();
        //send a success so that the user will be logged out and redirected
        res.contentType('json');
        res.send({status: JSON.stringify({response: 'success'})});
        basic.consoleLogger('logoutHarvard: Success');
    },


    logoutCustomChat: function (req, res, theHarvardUser, io) {
        basic.consoleLogger('LOGOUT CUSTOM CHAT event handler called');
        ioJs.emitToAll(io, 'logoutUser', theHarvardUser.customUsername);
        online.removeFromUsersOnline(usersOnline, theHarvardUser.customUsername);
        //send a success so that the user will be logged out and redirected
        res.contentType('json');
        res.send({status: JSON.stringify({response: 'success'})});
        basic.consoleLogger('logout: Success');
    },


    logoutHarvardChat: function (req, res, theHarvardUser, io) {
        basic.consoleLogger('LOGOUT HARVARD CHAT event handler called');
        ioJs.emitToAll(io, 'logoutUser', theHarvardUser.customUsername);
        online.removeFromUsersOnline(usersOnline, theHarvardUser.customUsername);
        //delete the harvard cs50 ID session
        req.logout();
        //send a success so that the user will be logged out and redirected
        res.contentType('json');
        res.send({status: JSON.stringify({response: 'success'})});
        basic.consoleLogger('logout: Success');
    }
};