/**
 * Created by jovinbm on 12/29/14.
 */
//import modules
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var harvardUsersSchema = new Schema({
    id: {type: String, default: "Anonymous", required: true, unique: true},
    displayName: {type: String, default: "jHarvard", required: true, unique: false},
    email: {type: String, default: "@college.harvard.edu", required: true, unique: true},
    customUsername: {type: String, default: "Anonymous", required: true, unique: false},
    customCode: {type: String, default: "abcde", unique: false},
    customLoggedInStatus: {type: Number, default:0, unique: false},
    askedQuestionsClasses: { type : Array , "default" : [], unique: false},
    votedButtonClasses: { type : Array , "default" : [], unique: false},
    time: {type: Date, default: Date.now, unique: false}
});

module.exports = harvardUsersSchema;