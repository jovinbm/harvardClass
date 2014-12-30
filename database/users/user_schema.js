/**
 * Created by jovinbm on 12/29/14.
 */
//import modules
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
    userId: {type: Number, default:0, required:true, unique: true},
    customUsername: {type: String, default: "Anonymous", required: true, unique: false},
    customCode: {type: String, default: "abcde"},
    votedButtonClasses: { type : Array , "default" : [] },
    time: {type: Date, default: Date.now}
});

module.exports = userSchema;