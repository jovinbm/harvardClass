/**
 * Created by jovinbm on 1/18/15.
 */
var basic = require('../functions/basic.js');
var cuid = require('cuid');
var Question = require("../database/questions/question_model.js");
var HarvardUser = require("../database/harvardUsers/harvard_user_model.js");


module.exports = {


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
            $push: {askedQuestionsIndexes: questionObject.questionIndex}
        }, function (err) {
            if (err) {
                error_neg_1(-1, err);
            } else {
                success(questionObject);
            }

        });
    },


    getQuestions: function (sort, currentQuestionIndex, limit, error_neg_1, error_0, success) {
        Question.find({questionIndex: {$gt: currentQuestionIndex}})
            .sort({questionIndex: sort})
            .limit(limit)
            .exec(function (err, questionsArray) {
                if (err) {
                    error_neg_1(-1, err);
                } else if (questionsArray == null || questionsArray == undefined || questionsArray.length == 0) {
                    error_0(0);
                } else {
                    success(questionsArray);
                }
            });
    },


    getOneQuestion: function (questionIndex, error_neg_1, error_0, success) {
        Question.find({questionIndex: questionIndex})
            .sort({questionIndex: -1})
            .limit(1)
            .exec(function (err, question) {
                if (err) {
                    error_neg_1(-1, err);
                } else if (question == null || question == undefined || question.length == 0) {
                    error_0(0);
                } else {
                    success(question);
                }
            });
    },


    findTopVotedQuestions: function (sort, limit, error_neg_1, error_0, success) {
        Question.find({votes: {$gt: 0}})
            .sort({votes: sort})
            .limit(limit)
            .exec(function (err, topVotedArray) {
                if (err) {
                    error_neg_1(-1, err);
                } else if (topVotedArray.length == 0) {
                    error_0(0);
                } else {
                    success(topVotedArray);
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


    incrementQuestionVotes: function (upvotedIndex, error_neg_1, error_0, success) {
        Question.update({questionIndex: upvotedIndex}, {$inc: {votes: 1}}, function (err) {
            if (err) {
                error_neg_1(-1, err);
            } else {
                success();
            }
        })
    }


};
