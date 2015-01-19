/**
 * Created by jovinbm on 1/18/15.
 */
var basic = require('../functions/basic.js');
var comment_handler = require('../handlers/comment_handler.js');
var userDB = require('../db/user_db.js');

module.exports = {


    getComments: function (req, res) {
        basic.consoleLogger('GET_COMMENTS event received');
        var questionIndex = req.body.questionIndex;
        var lastCommentIndex = req.body.lastCommentIndex;
        //retrieve the user
        function error(status, err) {
            if (status == -1 || status == 0) {
                res.status(500).send({msg: 'getCommentsPOST: Could not retrieve user', err: err});
                basic.consoleLogger("ERROR: getCommentsPOST: Could not retrieve user: " + err);
            }
        }

        function success(theHarvardUser) {
            if (theHarvardUser.customLoggedInStatus == 1) {
                comment_handler.getComments(req, res, theHarvardUser, questionIndex, lastCommentIndex);
            }
            //TODO -- redirect to custom login
        }

        userDB.findHarvardUser(req.user.id, error, error, success);
    },


    newComment: function (req, res) {
        basic.consoleLogger('NEW_COMMENT event received');
        var theComment = req.body;
        //get the Harvard User
        function error(status, err) {
            if (status == -1 || status == 0) {
                res.status(500).send({msg: 'ERROR: newCommentPOST: Could not retrieve user', err: err});
                basic.consoleLogger("ERROR: newCommentPOST: Could not retrieve user: " + err);
            }
        }

        function success(theHarvardUser) {
            if (theHarvardUser.customLoggedInStatus == 1) {
                comment_handler.newComment(req, res, theHarvardUser, theComment);
            }
            //TODO -- redirect to custom login
        }

        userDB.findHarvardUser(req.user.id, error, error, success);
    },


    newPromote: function (req, res) {
        basic.consoleLogger('NEW_PROMOTE event received');
        var questionIndex = req.body.questionIndex;
        var promoteIndex = req.body.commentIndex;
        var uniqueId = req.body.uniqueId;
        //retrieve the user
        function error(status, err) {
            if (status == -1 || status == 0) {
                res.status(500).send({msg: 'ERROR: newPromotePOST: Could not retrieve user', err: err});
                basic.consoleLogger("ERROR: newPromotePOST: Could not retrieve user: " + err);
            }
        }

        //only execute promote if the user has not voted on the question
        function success(theHarvardUser) {
            if (theHarvardUser.customLoggedInStatus == 1) {
                comment_handler.newPromote(req, res, theHarvardUser, questionIndex, promoteIndex, uniqueId);

            } else {
                //TODO -- redirect to login
            }
        }

        userDB.findHarvardUser(req.user.id, error, error, success);
    }

};