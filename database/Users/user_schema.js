var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
    uniqueCuid: {type: String, unique: true, index: true},
    isAdmin: {type: String, unique: false, "default": "no"},
    email: {type: String, unique: false},
    username: {type: String, unique: false},
    firstName: {type: String, unique: false},
    lastName: {type: String, unique: false},
    password: {type: String, unique: false},
    isRegistered: {type: String, unique: false, "default": "no"},
    askedQuestionsIndexes: {type: Array, "default": [], unique: false, index: true},
    postedCommentUniqueIds: {type: Array, "default": [], unique: false, index: true},
    votedQuestionIndexes: {type: Array, "default": [], unique: false, index: true},
    promotedCommentsUniqueIds: {type: Array, "default": [], unique: false, index: true},
    joinDate: {type: Date, default: Date.now, unique: false, index: true},
    lastActivity: {type: Date, default: Date.now, index: true}
});

module.exports = userSchema;