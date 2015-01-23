/**
 * Created by jovinbm on 1/18/15.
 */
//import modules
var app = require('../app.js');
var Question = require("../database/questions/question_model.js");
var Comment = require("../database/comments/comment_model.js");
var HarvardUser = require("../database/harvardUsers/harvard_user_model.js");
var basic = require('../functions/basic.js');
var ioJs = require('../functions/io.js');
var commentDB = require('../db/comment_db.js');

module.exports = {

    newComment: function (req, res, theHarvardUser, theComment) {
        basic.consoleLogger('newComment: NEW_COMMENT event handler called');
        var thisCommentIndex;
        //query the recent question's index
        if (!(/^\s+$/.test(theComment.comment)) &&
            theComment.comment.length != 0) {
            function save(index) {
                function made(comment) {
                    function saved(savedComment) {
                        function done(commentObject) {
                            ioJs.emitToAll('newComment', {
                                "comment": commentObject,
                                "index": 1
                            });
                            res.status(200).send({msg: 'newComment success'});
                            basic.consoleLogger('newComment: Success');
                        }

                        commentDB.pushCommentToCommenter(req.user.id, savedComment, error, error, done);
                    }

                    commentDB.saveNewComment(comment, error, error, saved);
                }


                commentDB.makeNewComment(theComment, index, theHarvardUser, made);
            }

            function error(status, err) {
                if (status == -1) {
                    basic.consoleLogger("ERROR: newComment event_Handler: " + err);
                    res.status(500).send({msg: 'ERROR: newComment Event Handler: ', err: err});
                    basic.consoleLogger("newComment failed!");
                } else if (status == 0) {
                    //means this is the first comment. Save it
                    thisCommentIndex = 0;
                    save(thisCommentIndex);
                }
            }

            function success(result) {
                thisCommentIndex = result[0].commentIndex + 1;
                save(thisCommentIndex);
            }

            commentDB.getLatestCommentIndex(theComment.questionIndex, -1, 1, error, error, success);

        } else {
            //the comment does not pass the checks
            res.status(200).send({msg: 'newComment did not pass checks'});
            basic.consoleLogger('newComment: Not executed: Did not pass checks');
        }
    },


    updateComment: function (req, res, theHarvardUser, theComment) {
        basic.consoleLogger('updateComment: UPDATE_COMMENT event handler called');
        var commentUniqueId = theComment.commentUniqueId;
        //query the recent question's index
        if (!(/^\s+$/.test(theComment.comment)) &&
            theComment.comment.length != 0) {

            function error(status, err) {
                basic.consoleLogger("ERROR: updateComment event_Handler: " + err);
                res.status(500).send({msg: 'ERROR: updateComment Event Handler: ', err: err});
                basic.consoleLogger("updateComment failed!");
            }

            function made(comment) {
                function updated() {
                    function done(commentObject) {
                        ioJs.emitToAll('newComment', {
                            "comment": commentObject,
                            "index": 0
                        });
                        res.status(200).send({msg: 'updateComment success'});
                        basic.consoleLogger('updateComment: Success');
                    }

                    commentDB.getOneComment(commentUniqueId, error, error, done);
                }

                commentDB.updateComment(comment, commentUniqueId, error, error, updated);
            }

            commentDB.makeCommentUpdate(theComment, made);

        } else {
            //the comment does not pass the checks
            res.status(500).send({msg: 'updateComment did not pass checks'});
            basic.consoleLogger('updateComment: Not executed: Did not pass checks');
        }
    },


    newPromote: function (req, res, theHarvardUser, questionIndex, promoteIndex, uniqueId) {
        basic.consoleLogger("newPromote: newPromote event handler called");
        //push the new promote index to the respective upvoter
        function error(status, err) {
            if (status == -1) {
                basic.consoleLogger("ERROR: newPromote event handler: Error while executing db operations" + err);
                /*complete the request by sending the client the internal server error*/
                res.status(500).send({
                    msg: 'ERROR: newPromote event handler: Error while executing db operations',
                    err: err
                });
                basic.consoleLogger('newPromote: failed!');
            } else if (status == 0) {
                res.status(200).send({msg: "newPromote: partial ERROR: query returned null/undefined"});
                basic.consoleLogger('**partial ERROR!: newPromote event handler: failure: query returned NULL/UNDEFINED');
            }
        }

        function success() {
            function broadcastTop() {

                function done(topPromotedArrayOfObjects) {
                    ioJs.emitToAll('topPromoted', topPromotedArrayOfObjects);
                    res.status(200).send({msg: 'newPromote success'});
                    basic.consoleLogger('newPromote: Success');
                }

                commentDB.findTopPromotedComments(-1, 10, questionIndex, error, error, done);
            }

            commentDB.incrementCommentPromotes(uniqueId, error, error, broadcastTop);
        }

        commentDB.pushPromoteToUser(req.user.id, questionIndex, uniqueId, error, error, success);
    },


    getComments: function (req, res, theHarvardUser, questionIndex, lastCommentIndex) {
        var regexp = new RegExp("q" + questionIndex + "c.");
        var commentLimit = 30;
        basic.consoleLogger("getComments: getComments called");
        var socketRoom = theHarvardUser.socketRoom;
        //retrieve the comments

        function error(status, err) {
            if (status == -1) {
                basic.consoleLogger("getComments event handler: Error while retrieving history" + err);
                res.status(500).send({msg: 'getComments: Error while retrieving top voted', err: err});
                basic.consoleLogger('getComments: failed!');
            } else if (status == 0) {
                //send an empty array
                res.status(200).send({
                    "comments": [],
                    "index": 0,
                    "myPromotes": []
                });
                basic.consoleLogger('getComments: success: Did not find anything');
            }
        }


        function getComments(filteredPromoted) {

            function success(comments) {
                res.status(200).send({
                    "comments": comments,
                    "index": lastCommentIndex + commentLimit,
                    "myPromotes": filteredPromoted
                });
                basic.consoleLogger('getComments: success: Sent comments');
            }

            commentDB.getComments(-1, questionIndex, lastCommentIndex, commentLimit, error, error, success)
        }

        basic.filterArray(theHarvardUser.promotedCommentsUniqueIds, regexp, getComments)
    }

};