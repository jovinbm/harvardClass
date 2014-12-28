/**
 * Created by jovinbm on 12/27/14.
 */
var functions = require('../functions/functions.js');
var sessions = require('../functions/sessions.js');

var mongoose = require('mongoose');
//initiate the schema prototype
var Schema = mongoose.Schema;
var Question = require("../database/questions/question_model.js");

//this functions are used inside this file
var consoleLogger = function (data) {
    console.log(data);
};

//defines functions for interacting with the database
//these functions are exported
module.exports = {
    upvoteQuestion: function (index) {
        var theUpdatedVotes;
        Question.findOneAndMofidy({questionIndex: index}, {
                $inc: {
                    votes: 1
                }
            },
            function (qObject) {
                theUpdatedVotes = qObject.votes;
            });
        return theUpdatedVotes;
    },

    getFiveTopVoted: function () {
        var topFive = Question.find({votes: {$gt: 0}}).sort({questionIndex: -1}).limit(5);
    }

};