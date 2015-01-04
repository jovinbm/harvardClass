/**
 * Created by jovinbm on 1/4/15.
 */

/*Define functions that interact with the database*/
var basic = require('../functions/basic.js');
var Question = require("../database/questions/question_model.js");
var HarvardUser = require("../database/harvardUsers/harvard_user_model.js");

module.exports = {


    //finds a specific Harvard User
    findHarvardUser: function (openId, error_neg_1, error_0, success) {
        HarvardUser.findOne({id: openId}).exec(
            function (err, theHarvardUser) {
                if (err) {
                    error_neg_1(-1, err);
                } else if (theHarvardUser == null || theHarvardUser == undefined) {
                    error_0(0);
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
            questionIndex: questionIndex,
            senderName: theHarvardUser.customUsername,
            senderOpenId: theHarvardUser.id,
            message: questionObject.message,
            shortMessage: questionObject.shortMessage,
            messageClass: "a" + questionIndex,
            buttonClass: "a" + questionIndex + "b btn btn-info upvote",
            votes: 0
        });
        success(question);
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


    pushQuestionToAsker: function (openId, questionObject, error_neg_1, error_0, success) {
        HarvardUser.update({id: openId}, {
            $push: {askedQuestionsClasses: questionObject.messageClass}
        }, function (err) {
            if (err) {
                error_neg_1(-1, err);
            } else {
                success(questionObject);
            }

        });
    },


    getRecentQuestions: function (sort, currentQuestionIndex, limit, error_neg_1, error_0, success) {
        Question.find({questionIndex: {$gt: currentQuestionIndex}}).sort({questionIndex: sort}).limit(limit).exec(function (err, history) {
            if (err) {
                error_neg_1(-1, err);
            } else if (history == null || history == undefined || history.length == 0) {
                error_0(0);
            } else {
                success(history);
            }
        });
    },

    findTopVotedQuestions: function (sort, limit, error_neg_1, error_0, success) {
        Question.find({votes: {$gt: 0}}).sort({votes: sort}).limit(limit).exec(function (err, topVotedObject) {
            if (err) {
                error_neg_1(-1, err);
            } else {
                success(topVotedObject);
            }
        });
    },

    pushUpvoteToUpvoter: function (openId, buttonClass, error_neg_1, error_0, success) {
        HarvardUser.update({id: openId}, {
                $push: {votedButtonClasses: buttonClass}
            }, function (err) {
                if (err) {
                    error_neg_1(-1, err);
                } else {
                    success();
                }
            }
        )
    },


    incrementQuestionVotes: function (questionClass, error_neg_1, error_0, success) {
        Question.update({messageClass: questionClass}, {$inc: {votes: 1}}, function (err) {
            if (err) {
                error_neg_1(-1, err);
            } else {
                success();
            }
        })
    }


};