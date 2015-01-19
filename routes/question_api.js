/**
 * Created by jovinbm on 1/18/15.
 */
var basic = require('../functions/basic.js');
var question_handler = require('../handlers/question_handler.js');
var userDB = require('../db/user_db.js');


module.exports = {


    getQuestions: function (req, res) {
        basic.consoleLogger('GET_QUESTIONS event received');
        var currentQuestionIndex = req.body.currentQuestionIndex;

        function error(status, err) {
            if (status == -1 || status == 0) {
                res.status(500).send({msg: 'getQuestionsPOST: Could not retrieve user', err: err});
                basic.consoleLogger("ERROR: getQuestionsPOST: Could not retrieve user: " + err);
            }
        }

        function success(theHarvardUser) {
            if (theHarvardUser.customLoggedInStatus == 1) {
                question_handler.getQuestions(req, res, theHarvardUser, currentQuestionIndex);
            }
            //TODO -- redirect to custom login
        }

        userDB.findHarvardUser(req.user.id, error, error, success);
    },


    retrieveQuestion: function (req, res) {
        basic.consoleLogger('RETRIEVE_QUESTION event received');
        var questionIndex = req.body.index;

        function error(status, err) {
            if (status == -1 || status == 0) {
                res.status(500).send({msg: 'retrieveQuestionPOST: Could not retrieve user', err: err});
                basic.consoleLogger("ERROR: retrieveQuestionPOST: Could not retrieve user: " + err);
            }
        }

        function success(theHarvardUser) {
            if (theHarvardUser.customLoggedInStatus == 1) {
                question_handler.retrieveQuestion(req, res, theHarvardUser, questionIndex);
            }
            //TODO -- redirect to custom login
        }

        userDB.findHarvardUser(req.user.id, error, error, success);
    },


    newQuestion: function (req, res) {
        basic.consoleLogger('NEW_QUESTION event received');
        var theQuestion = req.body;

        function error(status, err) {
            if (status == -1 || status == 0) {
                res.status(500).send({msg: 'ERROR: newQuestionPOST: Could not retrieve user', err: err});
                basic.consoleLogger("ERROR: newQuestionPOST: Could not retrieve user: " + err);
            }
        }

        function success(theHarvardUser) {
            if (theHarvardUser.customLoggedInStatus == 1) {
                question_handler.newQuestion(req, res, theHarvardUser, theQuestion);
            }
            //TODO -- redirect to custom login
        }

        userDB.findHarvardUser(req.user.id, error, error, success);
    },


    newUpvote: function (req, res) {
        basic.consoleLogger('NEW_UPVOTE event received');
        var upvotedIndex = req.body.upvoteIndex;

        function error(status, err) {
            if (status == -1 || status == 0) {
                res.status(500).send({msg: 'ERROR: newUpvotePOST: Could not retrieve user', err: err});
                basic.consoleLogger("ERROR: newUpvotePOST: Could not retrieve user: " + err);
            }
        }

        function success(theHarvardUser) {
            if (theHarvardUser.customLoggedInStatus == 1) {
                if (theHarvardUser.votedQuestionIndexes.indexOf(upvotedIndex) == -1) {
                    question_handler.newUpvote(req, res, theHarvardUser, upvotedIndex);
                } else {
                    //upvote process did not pass checks
                    //respond to avoid further upvote posts
                    res.status(200).send({msg: 'upvote did not pass checks'});
                    basic.consoleLogger('upvote: Not executed: Did not pass checks');
                }
            } else {
                //TODO -- redirect to login
            }
        }

        userDB.findHarvardUser(req.user.id, error, error, success);
    }


};