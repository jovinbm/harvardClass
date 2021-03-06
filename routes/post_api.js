var basic = require('../functions/basic.js');
var post_handler = require('../handlers/post_handlers.js');
var userDB = require('../db/user_db.js');


module.exports = {


    getQuestions: function (req, res) {
        basic.consoleLogger('GET_QUESTIONS event received');
        var page = req.body.page;

        function error(status, err) {
            if (status == -1 || status == 0) {
                res.status(500).send({msg: 'getQuestionsPOST: Could not retrieve user', err: err});
                basic.consoleLogger("ERROR: getQuestionsPOST: Could not retrieve user: " + err);
            }
        }

        function success(theUser) {
            if (theUser.customLoggedInStatus == 1) {
                post_handler.getQuestions(req, res, theUser, page);
            }
            //TODO -- redirect to custom login
        }

        userDB.findUser(req.user.id, error, error, success);
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

        function success(theUser) {
            if (theUser.customLoggedInStatus == 1) {
                post_handler.retrieveQuestion(req, res, theUser, questionIndex);
            }
            //TODO -- redirect to custom login
        }

        userDB.findUser(req.user.id, error, error, success);
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

        function success(theUser) {
            if (theUser.customLoggedInStatus == 1) {
                post_handler.newQuestion(req, res, theUser, theQuestion);
            }
            //TODO -- redirect to custom login
        }

        userDB.findUser(req.user.id, error, error, success);
    },


    updateQuestion: function (req, res) {
        basic.consoleLogger('UPDATE_QUESTION event received');
        var theQuestion = req.body;

        function error(status, err) {
            if (status == -1 || status == 0) {
                res.status(500).send({msg: 'ERROR: updateQuestionPOST: Could not retrieve user', err: err});
                basic.consoleLogger("ERROR: updateQuestionPOST: Could not retrieve user: " + err);
            }
        }

        function success(theUser) {
            if (theUser.customLoggedInStatus == 1) {
                post_handler.updateQuestion(req, res, theUser, theQuestion);
            }
            //TODO -- redirect to custom login
        }

        userDB.findUser(req.user.id, error, error, success);
    },


    upvote: function (req, res) {
        basic.consoleLogger('UPVOTE event received');
        var upvotedIndex = req.body.upvoteIndex;
        var inc = req.body.inc;

        function error(status, err) {
            if (status == -1 || status == 0) {
                res.status(500).send({msg: 'ERROR: upvotePOST: Could not retrieve user', err: err});
                basic.consoleLogger("ERROR: upvotePOST: Could not retrieve user: " + err);
            }
        }

        function success(theUser) {
            if (theUser.customLoggedInStatus == 1) {
                if (inc == -1 || theUser.votedQuestionIndexes.indexOf(upvotedIndex) == -1) {
                    post_handler.upvote(req, res, theUser, upvotedIndex, inc);
                } else {
                    //upvote process did not pass checks
                    res.status(200).send({msg: 'upvote did not pass checks'});
                    basic.consoleLogger('upvote: Not executed: Did not pass checks');
                }
            } else {
                //TODO -- redirect to login
            }
        }

        userDB.findUser(req.user.id, error, error, success);
    }


};