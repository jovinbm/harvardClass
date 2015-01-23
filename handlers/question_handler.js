/**
 * Created by jovinbm on 1/18/15.
 */
var basic = require('../functions/basic.js');
var ioJs = require('../functions/io.js');
var questionDB = require('../db/question_db.js');

module.exports = {


    newQuestion: function (req, res, theHarvardUser, theQuestion) {
        basic.consoleLogger('newQuestion: NEW_QUESTION event handler called');
        var thisQuestionIndex;
        //query the recent question's index
        if (!(/^\s+$/.test(theQuestion.heading)) &&
            theQuestion.heading.length != 0 && !(/^\s+$/.test(theQuestion.question)) &&
            theQuestion.question.length != 0) {
            function save(index) {
                function made(question) {
                    function saved(savedQuestion) {
                        function done(questionObject) {
                            ioJs.emitToAll('newQuestion', {
                                "question": questionObject,
                                "index": 1
                            });
                            res.status(200).send({msg: 'newQuestion success'});
                            basic.consoleLogger('newQuestion: Success');
                        }

                        questionDB.pushQuestionToAsker(req.user.id, savedQuestion, error, error, done);
                    }

                    questionDB.saveNewQuestion(question, error, error, saved);
                }

                questionDB.makeNewQuestion(theQuestion, index, theHarvardUser, made);
            }

            function error(status, err) {
                if (status == -1) {
                    basic.consoleLogger("ERROR: newQuestion event_Handler: " + err);
                    res.status(500).send({msg: 'ERROR: newQuestion Event Handler: ', err: err});
                    basic.consoleLogger("newQuestion failed!")
                } else if (status == 0) {
                    //means this is the first question. Save it
                    basic.consoleLogger("FIRST Q");
                    thisQuestionIndex = 0;
                    save(thisQuestionIndex);
                }
            }

            function success(history) {
                thisQuestionIndex = history[0].questionIndex + 1;
                save(thisQuestionIndex);
            }

            questionDB.getQuestions(-1, -1, 1, error, error, success);

        } else {
            //the question does not pass the checks
            res.status(200).send({msg: 'newQuestion did not pass checks'});
            basic.consoleLogger('newQuestion: Not executed: Did not pass checks');
        }
    },

    updateQuestion: function (req, res, theHarvardUser, theQuestion) {
        basic.consoleLogger('updateQuestion: UPDATE_QUESTION event handler called');
        var thisQuestionIndex = theQuestion.questionIndex;
        if (!(/^\s+$/.test(theQuestion.heading)) &&
            theQuestion.heading.length != 0 && !(/^\s+$/.test(theQuestion.question)) &&
            theQuestion.question.length != 0) {

            function error(status, err) {
                basic.consoleLogger("ERROR: updateQuestion event_Handler: " + err);
                res.status(500).send({msg: 'ERROR: updateQuestion Event Handler: ', err: err});
                basic.consoleLogger("updateQuestion failed!")
            }

            function made(question) {
                function updated() {
                    function done(questionObject) {
                        ioJs.emitToAll('newQuestion', {
                            "question": questionObject,
                            "index": 0
                        });
                        res.status(200).send({msg: 'updateQuestion success'});
                        basic.consoleLogger('updateQuestion: Success');
                    }

                    questionDB.getOneQuestion(thisQuestionIndex, error, error, done);
                }

                questionDB.updateQuestion(question, thisQuestionIndex, error, error, updated);
            }

            questionDB.makeQuestionUpdate(theQuestion, theHarvardUser, made);

        } else {
            //the question does not pass the checks
            res.status(500).send({msg: 'updateQuestion did not pass checks'});
            basic.consoleLogger('updateQuestion: Not executed: Did not pass checks');
        }
    },


    newUpvote: function (req, res, theHarvardUser, upvotedIndex) {
        basic.consoleLogger("newUpvote: newUpvote event handler called");
        var newUpvotedArray = theHarvardUser.votedQuestionIndexes;
        newUpvotedArray.push(upvotedIndex);
        //push the new upvote's index to the respective upvoter

        function error(status, err) {
            if (status == -1) {
                basic.consoleLogger("ERROR: newUpvote event handler: Error while executing db operations" + err);
                res.status(500).send({
                    msg: 'ERROR: newUpvote event handler: Error while executing db operations',
                    err: err
                });
                basic.consoleLogger('newUpvote: failed!');
            } else if (status == 0) {
                ioJs.emitToOne(theHarvardUser.socketRoom, "upvotedIndexes", []);
                res.status(200).send({msg: "newUpvote: partial ERROR: query returned null/undefined"});
                basic.consoleLogger('**partial ERROR!: newUpvote event handler: failure: query returned NULL/UNDEFINED');
            }
        }

        function success() {
            function incremented() {
                function found(topVotedArrayOfObjects) {

                    ioJs.emitToAll('topVoted', topVotedArrayOfObjects);
                    ioJs.emitToOne(theHarvardUser.socketRoom, 'upvotedIndexes', newUpvotedArray);
                    res.status(200).send({msg: 'newUpvote success'});
                    basic.consoleLogger('upvote: Success');
                }

                questionDB.findTopVotedQuestions(-1, 10, error, error, found);
            }

            questionDB.incrementQuestionVotes(upvotedIndex, error, error, incremented);
        }

        questionDB.pushUpvoteToUpvoter(req.user.id, upvotedIndex, error, error, success);
    }

    ,


    getQuestions: function (req, res, theHarvardUser, currentQuestionIndex) {
        basic.consoleLogger("getQuestions: getQuestions called");
        var temp = {};
        var limit = 30;

        function error(status, err) {
            if (status == -1) {
                basic.consoleLogger("getQuestions handler: GetQuestions: Error while retrieving questions" + err);
                res.status(500).send({
                    msg: 'getQuestions: GetQuestions: Error while retrieving questions',
                    err: err
                });
                basic.consoleLogger('getQuestions: failed!');
            } else if (status == 0) {
                temp['questionsArray'] = [];
                temp['currentQuestionIndex'] = 0;
                basic.consoleLogger('getQuestions: Did not find any questions');
            }
        }


        function success(questionArray) {
            temp['questionArray'] = questionArray;
            temp['currentQuestionIndex'] = questionArray.length;
            res.status(200).send(temp);
        }

        questionDB.getQuestions(-1, currentQuestionIndex, limit, error, error, success)
    },


    retrieveQuestion: function (req, res, theHarvardUser, questionIndex) {
        basic.consoleLogger("getQuestions: getQuestions called");
        var temp = {};

        function error(status, err) {
            if (status == -1) {
                basic.consoleLogger("retrieveQuestion handler: GetQuestions: Error while retrieving questions" + err);
                res.status(500).send({
                    msg: 'retrieveQuestion: retrieveQuestion: Error while retrieving questions',
                    err: err
                });
                basic.consoleLogger('retrieveQuestion: failed!');
            } else if (status == 0) {
                temp['question'] = [];
                temp['upvotedIndexes'] = theHarvardUser.votedQuestionIndexes;
                res.status(200).send(temp);
                basic.consoleLogger('retrieveQuestion: Did not find any questions');
            }
        }


        function success(question) {
            temp['question'] = question;
            temp['upvotedIndexes'] = theHarvardUser.votedQuestionIndexes;
            res.status(200).send(temp);
        }

        questionDB.getOneQuestion(questionIndex, error, error, success)
    }


};