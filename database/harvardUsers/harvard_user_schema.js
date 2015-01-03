/**
 * Created by jovinbm on 12/29/14.
 */
//import modules
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var harvardUsersSchema = new Schema({
    id: {type: String, default: "Anonymous", required: true, unique: true, index: true},
    socketRoom: {type: String, default: "Anonymous", required: true, unique: true, index: true},
    displayName: {type: String, default: "jHarvard", required: true, unique: false},
    email: {type: String, default: "@college.harvard.edu", required: true, unique: true},
    customUsername: {type: String, default: "Anonymous", required: true, unique: false, index: true},
    customCode: {type: String, default: "abcde", unique: false, index: true},
    customLoggedInStatus: {type: Number, default:0, unique: false, index: true},
    askedQuestionsClasses: { type : Array , "default" : [], unique: false, index: true},
    votedButtonClasses: { type : Array , "default" : [], unique: false, index: true},
    time: {type: Date, default: Date.now, unique: false, index: true}
});

module.exports = harvardUsersSchema;

//TODO -- what unique thing to use to identify users uniquely --cs50 id