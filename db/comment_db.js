/**
 * Created by jovinbm on 1/18/15.
 */
var basic = require('../functions/basic.js');
var Comment = require("../database/comments/comment_model.js");
var HarvardUser = require("../database/harvardUsers/harvard_user_model.js");

module.exports = {

    getLatestCommentIndex: function (questionIndex, sort, limit, error_neg_1, error_0, success) {
        Comment.find({questionIndex: questionIndex}, {commentIndex: 1})
            .sort({commentIndex: sort})
            .limit(limit)
            .exec(function (err, result) {
                if (err) {
                    error_neg_1(-1, err);
                } else if (result == null || result == undefined || result.length == 0) {
                    error_0(0);
                } else {
                    success(result);
                }
            });
    },


    makeNewComment: function (commentObject, commentIndex, theHarvardUser, success) {
        var comment = new Comment({
            uniqueId: "q" + commentObject.questionIndex + "c" + commentIndex,
            questionIndex: commentObject.questionIndex,
            commentIndex: commentIndex,
            senderName: theHarvardUser.customUsername,
            senderDisplayName: theHarvardUser.displayName,
            senderEmail: theHarvardUser.email,
            senderOpenId: theHarvardUser.id,
            comment: commentObject.comment,
            shortComment: commentObject.shortComment,
            votes: 0
        });
        success(comment);
    },


    saveNewComment: function (commentObject, error_neg_1, error_0, success) {
        commentObject.save(function (err, savedComment) {
            if (err) {
                error_neg_1(-1, err);
            } else {
                success(savedComment);
            }
        });
    },


    pushCommentToCommenter: function (openId, commentObject, error_neg_1, error_0, success) {
        HarvardUser.update({id: openId}, {
            $push: {postedCommentUniqueIds: commentObject.uniqueId}
        }, function (err) {
            if (err) {
                error_neg_1(-1, err);
            } else {
                success(commentObject);
            }

        });
    },


    pushPromoteToUser: function (openId, questionIndex, uniqueId, error_neg_1, error_0, success) {
        HarvardUser.update({id: openId}, {
                $addToSet: {promotedCommentsUniqueIds: uniqueId}
            }, function (err) {
                if (err) {
                    error_neg_1(-1, err);
                } else {
                    success();
                }
            }
        )
    },


    incrementCommentPromotes: function (uniqueId, error_neg_1, error_0, success) {
        Comment.update({uniqueId: uniqueId}, {$inc: {promotes: 1}}, function (err) {
            if (err) {
                error_neg_1(-1, err);
            } else {
                success();
            }
        })
    },


    getComments: function (sort, questionIndex, lastCommentIndex, limit, error_neg_1, error_0, success) {
        Comment
            .find({questionIndex: questionIndex, commentIndex: {$gt: lastCommentIndex}})
            .sort({commentIndex: sort})
            .limit(limit)
            .exec(function (err, comments) {
                if (err) {
                    error_neg_1(-1, err);
                } else if (comments == null || comments == undefined || comments.length == 0) {
                    error_0(0);
                } else {
                    success(comments);
                }
            });
    },



    findTopPromotedComments: function (sort, limit, questionIndex, error_neg_1, error_0, success) {
        Comment.find({questionIndex: questionIndex, promotes: {$gt: 0}}).sort({votes: sort}).limit(limit).exec(function (err, topPromotedArrayOfObjects) {
            if (err) {
                error_neg_1(-1, err);
            } else if (topPromotedArrayOfObjects.length == 0) {
                error_0(0);
            } else {
                success(topPromotedArrayOfObjects);
            }
        });
    }


};
