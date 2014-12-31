/**
 * Created by jovinbm on 12/27/14.
 */
//import modules
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var questionSchema = new Schema({
    questionIndex: {type: Number, default:0, required:true, unique: true},
    senderName: {type: String, default: "Anonymous", required: true, unique: false},
    senderOpenId: {type: String, default: "Anonymous", required: true, unique: true},
    message: {type: String, default: "Nothing to show", required: true},
    shortMessage: {type: String, default: "Nothing to show", required: true},
    messageClass: {type: String, default: "abc", required: true, unique:true},
    buttonClass: {type: String, default: "abc", required: true, unique: true},
    votes: {type: Number, default: 0},
    votedButtonClasses: { type : Array , "default" : [] },
    time: {type: Date, default: Date.now}
});

module.exports = questionSchema;