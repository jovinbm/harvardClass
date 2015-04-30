var basic = require('../functions/basic.js');
var consoleLogger = require('../functions/basic.js').consoleLogger;
var ioJs = require('../functions/io.js');
var postDB = require('../db/post_db.js');

module.exports = {


    newQuestion: function (req, res, theUser, theQuestion) {
        consoleLogger('newQuestion: NEW_QUESTION event handler called');
        var thisQuestionIndex;
        var savedQuestion;
        //query the recent question's index
        if (!(/^\s+$/.test(theQuestion.heading)) &&
            theQuestion.heading.length != 0 && !(/^\s+$/.test(theQuestion.question)) &&
            theQuestion.question.length != 0) {
            function save(index) {
                function made(question) {
                    function saved(question) {
                        function done() {
                            ioJs.emitToAll('newQuestion', {
                                "question": savedQuestion,
                                "update": false,
                                "index": savedQuestion.questionIndex,
                                "questionCount": thisQuestionIndex + 1
                            });
                            res.status(200).send({msg: 'newQuestion success'});
                            consoleLogger('newQuestion: Success');
                        }

                        savedQuestion = question;
                        postDB.pushQuestionToAsker(req.user.id, thisQuestionIndex, error, error, done);
                    }

                    postDB.saveNewQuestion(question, error, error, saved);
                }

                postDB.makeNewQuestion(theQuestion, index, theUser, made);
            }

            function error(status, err) {
                if (status == -1) {
                    consoleLogger("ERROR: newQuestion event_Handler: " + err);
                    res.status(500).send({msg: 'ERROR: newQuestion Event Handler: ', err: err});
                    consoleLogger("newQuestion failed!")
                } else if (status == 0) {
                    consoleLogger("partial ERROR: newQuestion event_Handler: Status = 0");
                }
            }

            function success(questionCount) {
                thisQuestionIndex = questionCount;
                save(thisQuestionIndex);
            }

            postDB.getCount(error, error, success);

        } else {
            //the question does not pass the checks
            res.status(200).send({msg: 'newQuestion did not pass checks'});
            consoleLogger('newQuestion: Not executed: Did not pass checks');
        }
    },

    updateQuestion: function (req, res, theUser, theQuestion) {
        consoleLogger('updateQuestion: UPDATE_QUESTION event handler called');
        var thisQuestionIndex = theQuestion.questionIndex;
        if (!(/^\s+$/.test(theQuestion.heading)) &&
            theQuestion.heading.length != 0 && !(/^\s+$/.test(theQuestion.question)) &&
            theQuestion.question.length != 0) {

            function error(status, err) {
                consoleLogger("ERROR: updateQuestion event_Handler: " + err);
                res.status(500).send({msg: 'ERROR: updateQuestion Event Handler: ', err: err});
                consoleLogger("updateQuestion failed!")
            }

            function made(question) {
                function updated() {
                    function done(questionObject) {
                        ioJs.emitToAll('newQuestion', {
                            "question": questionObject,
                            "index": questionObject.questionIndex,
                            "update": true,
                            "questionCount": null
                        });
                        res.status(200).send({msg: 'updateQuestion success'});
                        consoleLogger('updateQuestion: Success');
                    }

                    postDB.getOneQuestion(thisQuestionIndex, error, error, done);
                }

                postDB.updateQuestion(question, thisQuestionIndex, error, error, updated);
            }

            postDB.makeQuestionUpdate(theQuestion, theUser, made);

        } else {
            //the question does not pass the checks
            res.status(500).send({msg: 'updateQuestion did not pass checks'});
            consoleLogger('updateQuestion: Not executed: Did not pass checks');
        }
    },


    upvote: function (req, res, theUser, upvotedIndex, inc) {
        consoleLogger("upvote: upvote event handler called");
        var upvotedArray = theUser.votedQuestionIndexes;
        var errorCounter = 0;
        switch (inc) {
            case 1:
                //check to see if the user already upvoted this question to avoid repetition
                if (upvotedArray.indexOf(upvotedIndex) > -1) {
                    repetitionResponse();
                    errorCounter++;
                } else {
                    upvotedArray.push(upvotedIndex);
                }
                break;
            case -1:
                //check to see if the user already upvoted this question to avoid repetition
                if (upvotedArray.indexOf(upvotedIndex) == -1) {
                    repetitionResponse();
                    errorCounter++;
                } else if (upvotedArray.indexOf(upvotedIndex) != -1) {
                    upvotedArray.splice(upvotedArray.indexOf(upvotedIndex), 1);
                }
                break;
            default:
                errorCounter++;
                consoleLogger("ERROR: upvote event handler: switch statement got unexpected value");
                res.status(500).send({
                    msg: 'ERROR: upvote event handler: switch statement got unexpected value'
                });
                consoleLogger('upvote: failed!');
        }

        function error(status, err) {
            if (status == -1) {
                consoleLogger("ERROR: upvote event handler: Error while executing db operations" + err);
                res.status(500).send({
                    msg: 'ERROR: upvote event handler: Error while executing db operations',
                    err: err
                });
                consoleLogger('upvote: failed!');
            } else if (status == 0) {
                //this will mostly be returned be the findTopVotedQuestions query
                ioJs.emitToOne(theUser.socketRoom, "upvotedIndexes", upvotedArray);
                ioJs.emitToAll('topVoted', []);
                res.status(200).send({msg: "upvote: partial ERROR: Status:200: query returned null/undefined: There might also be no top voted object"});
                consoleLogger('**partial ERROR!: Status:200 upvote event handler: failure: query returned NULL/UNDEFINED: There might be no top voted object');
            }
        }

        function success() {
            function done() {
                function found(topVotedArrayOfObjects) {

                    ioJs.emitToAll('topVoted', topVotedArrayOfObjects);
                    ioJs.emitToOne(theUser.socketRoom, 'upvotedIndexes', upvotedArray);
                    res.status(200).send({msg: 'upvote success'});
                    consoleLogger('upvote: Success');
                }

                postDB.findTopVotedQuestions(-1, 10, error, error, found);
            }

            postDB.changeQuestionVotes(upvotedIndex, inc, error, error, done);
        }

        function repetitionResponse() {
            res.status(200).send({msg: 'upvote success: There was an upvote/downvote repetition'});
            consoleLogger('upvote success: There was an upvote/downvote repetition');
        }

        if (errorCounter == 0) {
            switch (inc) {
                case 1:
                    postDB.pushUpvoteToUpvoter(req.user.id, upvotedIndex, error, error, success);
                    break;
                case -1:
                    postDB.pullUpvoteFromUpvoter(req.user.id, upvotedIndex, error, error, success);
                    break;
            }
        }
    }

    ,


    getQuestions: function (req, res, theUser, page) {
        consoleLogger("getQuestions: getQuestions called");
        var temp = {};
        var limit = 10;

        function error(status, err) {
            if (status == -1) {
                consoleLogger("getQuestions handler: GetQuestions: Error while retrieving questions" + err);
                res.status(500).send({
                    msg: 'getQuestions: GetQuestions: Error while retrieving questions',
                    err: err
                });
            }
        }


        function success(questionsArray, questionCount) {
            if (questionsArray == []) {
                consoleLogger("getQuestions handler: no  questions found");
            }
            temp['questionCount'] = questionCount;
            temp['questionArray'] = questionsArray;
            res.status(200).send(temp);
            consoleLogger("getQuestions: Success")
        }

        postDB.getQuestions(-1, page, limit, error, error, success)
    },


    retrieveQuestion: function (req, res, theUser, questionIndex) {
        consoleLogger("getQuestions: getQuestions called");
        var temp = {};

        function error(status, err) {
            if (status == -1) {
                consoleLogger("retrieveQuestion handler: GetQuestions: Error while retrieving questions" + err);
                res.status(500).send({
                    msg: 'retrieveQuestion: retrieveQuestion: Error while retrieving questions',
                    err: err
                });
                consoleLogger('retrieveQuestion: failed!');
            } else if (status == 0) {
                temp['question'] = [];
                temp['upvotedIndexes'] = theUser.votedQuestionIndexes;
                res.status(200).send(temp);
                consoleLogger('retrieveQuestion: Did not find any questions');
            }
        }


        function success(question) {
            temp['question'] = question;
            temp['upvotedIndexes'] = theUser.votedQuestionIndexes;
            res.status(200).send(temp);
        }

        postDB.getOneQuestion(questionIndex, error, error, success)
    }


};