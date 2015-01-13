/**
 * Created by jovinbm on 12/25/14.
 */
//import modules
var app = require('../app.js');
var Question = require("../database/questions/question_model.js");
var HarvardUser = require("../database/harvardUsers/harvard_user_model.js");
var basic = require('../functions/basic.js');
var ioJs = require('../functions/io.js');
var dbJs = require('../functions/db.js');
var online = require('../functions/online.js');
var historyLimit = app.historyLimit;

//define and export all the event handlers
module.exports = {

    ready: function (req, res, theHarvardUser) {
        basic.consoleLogger('ready: READY event handler called');
        var customUsername = theHarvardUser.customUsername;
        var socketRoom = theHarvardUser.socketRoom;
        ioJs.emitToOne(socketRoom, 'logged-in', customUsername);
        ioJs.emitToAll("usersOnline", online.getUsersOnline());

        function success() {
            res.status(200).send({msg: "ready: success"});
            basic.consoleLogger('ready: success');
        }

        //send the user his upvoted questionIndexes and THE RECENT TOP VOTED questions
        ioJs.emitToOne(socketRoom, 'myUpvotedIndexes', theHarvardUser.votedQuestionIndexes, success);
    },


    getHistory: function (req, res, theHarvardUser, currentQuestionIndex) {
        basic.consoleLogger("getHistory: getHistory called");
        var socketRoom = theHarvardUser.socketRoom;
        //retrieve the history

        function error(status, err) {
            if (status == -1) {
                basic.consoleLogger("getHistory event handler: Error while retrieving history" + err);
                /*complete the ajax request by sending the client the internal server error*/
                res.status(500).send({msg: 'getHistory: Error while retrieving top voted', err: err});
                basic.consoleLogger('getHistory: failed!');
            } else if (status == 0) {
                //send an empty array
                ioJs.emitToOne(socketRoom, 'topVoted', []);
                res.status(200).send({msg: "getHistory: success: Did not find anything"});
                basic.consoleLogger('getHistory: success: Did not find anything');
            }
        }

        function success(historyArray) {
            //get this user their respective upvotes first
            function doneEmitting() {
                function doneQuestionHistory() {
                    function doneQuestionIndex() {
                        //find and broadcast the currently top voted
                        function success(topVotedArrayOfObjects) {
                            function doneTopVoted() {
                                res.status(200).send({msg: "getHistory: success: Sent questionHistory + topVoted"});
                                basic.consoleLogger('getHistory: success: Sent questionHistory + topVoted');
                            }

                            ioJs.emitToOne(socketRoom, 'topVoted', topVotedArrayOfObjects, doneTopVoted);
                        }

                        dbJs.findTopVotedQuestions(-1, 7, error, error, success);

                    }

                    ioJs.emitToOne(socketRoom, "incrementCurrentIndex", currentQuestionIndex + historyLimit, doneQuestionIndex);
                }

                ioJs.emitToOne(socketRoom, "questionHistory", historyArray, doneQuestionHistory);
            }

            ioJs.emitToOne(socketRoom, "myUpvotedIndexes", theHarvardUser.votedQuestionIndexes, doneEmitting);
        }

        dbJs.getRecentQuestions(-1, currentQuestionIndex, historyLimit, error, error, success)
    },


    newQuestion: function (req, res, theHarvardUser, theQuestion) {
        basic.consoleLogger('newQuestion: NEW_QUESTION event handler called');
        var thisQuestionIndex;
        //query the recent question's index
        if (!(/^\s+$/.test(theQuestion.question)) && theQuestion.length != 0) {
            function save(index) {
                function made(question) {
                    function saved(savedQuestion) {
                        function done(questionObject) {
                            ioJs.emitToAll('newQuestion', questionObject);
                            res.status(200).send({msg: 'newQuestion success'});
                            basic.consoleLogger('newQuestion: Success');
                        }

                        dbJs.pushQuestionToAsker(req.user.id, savedQuestion, error, error, done);
                    }

                    dbJs.saveNewQuestion(question, error, error, saved);
                }

                dbJs.makeNewQuestion(theQuestion, index, theHarvardUser, made);
            }

            function error(status, err) {
                if (status == -1) {
                    basic.consoleLogger("ERROR: newQuestion event_Handler: " + err);
                    res.status(500).send({msg: 'ERROR: newQuestion Event Handler: ', err: err});
                    basic.consoleLogger("newQuestion failed!")
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


    newUpvote: function (req, res, theHarvardUser, upvotedIndex) {
        basic.consoleLogger("newUpvote: newUpvote event handler called");
        //push the new upvote's index to the respective upvoter
        function error(status, err) {
            if (status == -1) {
                basic.consoleLogger("ERROR: newUpvote event handler: Error while executing db operations" + err);
                /*complete the ajax request by sending the client the internal server error*/
                res.status(500).send({
                    msg: 'ERROR: newUpvote event handler: Error while executing db operations',
                    err: err
                });
                basic.consoleLogger('newUpvote: failed!');
            } else if (status == 0) {
                //send an empty array ==> the client js handles empty array of upvote indexes very well
                ioJs.emitToOne(theHarvardUser.socketRoom, "myUpvotedIndexes", []);
                res.status(500).send({msg: "newUpvote: partial ERROR: query returned null/undefined"});
                basic.consoleLogger('**partial ERROR!: newUpvote event handler: failure: query returned NULL/UNDEFINED');
            }
        }

        function success() {
            function broadcastTop() {
                function broadcaster(topVotedArrayOfObjects) {

                    function pushed(votedQuestionIndexes) {
                        function personalizedDone() {
                            ioJs.emitToAll('topVoted', topVotedArrayOfObjects);
                            res.status(200).send({msg: 'newUpvote success'});
                            basic.consoleLogger('upvote: Success');
                        }

                        //send the upvoter their current upvoted question Indexes
                        ioJs.emitToOne(theHarvardUser.socketRoom, "myUpvotedIndexes", votedQuestionIndexes, personalizedDone);
                    }

                    //update theHarvardUser(to avoid retrieving) by pushing the votedQuestionIndexes
                    function pushUpvotedIndex(pushed) {
                        var votedQuestionIndexes = theHarvardUser.votedQuestionIndexes;
                        votedQuestionIndexes.push(upvotedIndex);
                        pushed(votedQuestionIndexes);
                    }

                    pushUpvotedIndex(pushed)
                }

                dbJs.findTopVotedQuestions(-1, 7, error, error, broadcaster);
            }

            dbJs.incrementQuestionVotes(upvotedIndex, error, error, broadcastTop);
        }

        dbJs.pushUpvoteToUpvoter(req.user.id, upvotedIndex, error, error, success);
    },


    logoutHarvardLogin: function (req, res) {
        basic.consoleLogger('LOGOUT HARVARD LOGIN event handler called');
        //delete the harvard cs50 ID session
        req.logout();
        //send a success so that the user will be logged out and redirected
        res.status(200).send({msg: 'LogoutHarvardLogin success'});
        basic.consoleLogger('logoutHarvardLogin: Success');
    },


    logoutCustomChat: function (req, res, theHarvardUser) {
        basic.consoleLogger('LOGOUT CUSTOM CHAT event handler called');

        function success() {
            res.status(200).send({msg: 'LogoutCustomChat success'});
            basic.consoleLogger('logoutCustomChat: Success');
        }

        online.removeUser(null, theHarvardUser.socketRoom, success)
    },


    logoutHarvardChat: function (req, res, theHarvardUser) {
        basic.consoleLogger('LOGOUT HARVARD CHAT event handler called');

        function success() {
            req.logout();
            res.status(200).send({msg: 'LogoutCustomChat success'});
            basic.consoleLogger('logoutCustomChat: Success');
        }

        online.removeUser(null, theHarvardUser.socketRoom, success);
    }
};