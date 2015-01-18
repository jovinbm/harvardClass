/**
 * Created by jovinbm on 1/4/15.
 */

/*Define functions that interact with the database*/
var basic = require('../functions/basic.js');
var cuid = require('cuid');
var Question = require("../database/questions/question_model.js");
var Comment = require("../database/comments/comment_model.js");
var HarvardUser = require("../database/harvardUsers/harvard_user_model.js");

module.exports = {

    //finds a specific Harvard User
    findHarvardUser: function (openId, error_neg_1, error_0, success) {
        HarvardUser.findOne({id: openId}).exec(
            function (err, theHarvardUser) {
                if (err) {
                    error_neg_1(-1, err);
                } else if (theHarvardUser == null || theHarvardUser == undefined) {
                    error_0(0, err);
                } else {
                    success(theHarvardUser);
                }
            }
        );
    },


    saveHarvardUser: function (theUserObject, error_neg_1, error_0, success) {
        theUserObject.save(function (err, theSavedUser) {
            if (err) {
                error_neg_1(-1, err);
            } else {
                success(theSavedUser);
            }
        });
    },

    updateCuCls: function (openId, customUsername, customLoggedInStatus, error_neg_1, error_0, success) {
        HarvardUser.update({id: openId}, {
                $set: {
                    customUsername: customUsername,
                    customLoggedInStatus: customLoggedInStatus
                }
            }, function (err) {
                if (err) {
                    error_neg_1(-1, err);
                } else {
                    success();
                }
            }
        )
    },


    toggleCls: function (openId, newCustomLoggedInStatus, error_neg_1, error_0, success) {
        HarvardUser.update({id: openId}, {$set: {customLoggedInStatus: newCustomLoggedInStatus}}).exec(function (err) {
            if (err) {
                error_neg_1(-1, err);
            } else {
                success();
            }
        });
    },


    makeNewQuestion: function (questionObject, questionIndex, theHarvardUser, success) {
        var question = new Question({
            uniqueId: cuid(),
            questionIndex: questionIndex,
            senderName: theHarvardUser.customUsername,
            senderDisplayName: theHarvardUser.displayName,
            senderEmail: theHarvardUser.email,
            senderOpenId: theHarvardUser.id,
            heading: questionObject.heading,
            question: questionObject.question,
            shortQuestion: questionObject.shortQuestion,
            votes: 0
        });
        success(question);
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


    saveNewQuestion: function (questionObject, error_neg_1, error_0, success) {
        questionObject.save(function (err, savedQuestion) {
            if (err) {
                error_neg_1(-1, err);
            } else {
                success(savedQuestion);
            }
        });
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


    pushQuestionToAsker: function (openId, questionObject, error_neg_1, error_0, success) {
        HarvardUser.update({id: openId}, {
            $push: {askedQuestionsIndexes: questionObject.questionIndex}
        }, function (err) {
            if (err) {
                error_neg_1(-1, err);
            } else {
                success(questionObject);
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


    getRecentQuestions: function (sort, currentQuestionIndex, limit, error_neg_1, error_0, success) {
        Question.find({questionIndex: {$gt: currentQuestionIndex}})
            .sort({questionIndex: sort})
            .limit(limit)
            .exec(function (err, history) {
                if (err) {
                    error_neg_1(-1, err);
                } else if (history == null || history == undefined || history.length == 0) {
                    error_0(0);
                } else {
                    success(history);
                }
            });
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


    findTopVotedQuestions: function (sort, limit, error_neg_1, error_0, success) {
        Question.find({votes: {$gt: 0}}).sort({votes: sort}).limit(limit).exec(function (err, topVotedArrayOfObjects) {
            if (err) {
                error_neg_1(-1, err);
            } else if (topVotedArrayOfObjects.length == 0) {
                error_0(0);
            } else {
                success(topVotedArrayOfObjects);
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
    },



    pushUpvoteToUpvoter: function (openId, upvotedIndex, error_neg_1, error_0, success) {
        HarvardUser.update({id: openId}, {
                $push: {votedQuestionIndexes: upvotedIndex}
            }, function (err) {
                if (err) {
                    error_neg_1(-1, err);
                } else {
                    success();
                }
            }
        )
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


    incrementQuestionVotes: function (upvotedIndex, error_neg_1, error_0, success) {
        Question.update({questionIndex: upvotedIndex}, {$inc: {votes: 1}}, function (err) {
            if (err) {
                error_neg_1(-1, err);
            } else {
                success();
            }
        })
    },


    incrementCommentPromotes: function (uniqueId, error_neg_1, error_0, success) {
        Comment.update({uniqueId: uniqueId}, {$inc: {promotes: 1}}, function (err) {
            if (err) {
                error_neg_1(-1, err);
            } else {
                success();
            }
        })
    }


};