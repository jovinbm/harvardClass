/**
 * Created by jovinbm on 12/27/14.
 */
//import modules
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var questionSchema = new Schema({
    questionIndex: {type: Number, default:0, required:true, unique: true, index: true},
    senderName: {type: String, default: "Anonymous", required: true, unique: false, index: true},
    senderOpenId: {type: String, default: "Anonymous", required: true, unique: false, index: true},
    message: {type: String, default: "Nothing to show", required: true},
    shortMessage: {type: String, default: "Nothing to show", required: true},
    messageClass: {type: String, default: "abc", required: true, unique:true, index: true},
    buttonClass: {type: String, default: "abc", required: true, unique: true, index: true},
    votes: {type: Number, default: 0, index: true},
    votedButtonClasses: { type : Array , "default" : [], index: true},
    time: {type: Date, default: Date.now, index: true}
});

module.exports = questionSchema;