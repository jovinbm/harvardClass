/**
 * Created by jovinbm on 1/16/15.
 */
//import modules
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var commentSchema = new Schema({
    questionIndex: {type: Number, default: 0, required: true, unique: true, index: true},
    senderName: {type: String, required: true, unique: false, index: true},
    senderDisplayName: {type: String, required: true, unique: false, index: true},
    senderEmail: {type: String, required: true, unique: false, index: true},
    senderOpenId: {type: String, required: true, unique: false, index: true},
    comment: {type: String, required: true},
    votes: {type: Number, default: 0, index: true},
    timePosted: {type: Date, default: Date.now, index: true}
});

module.exports = commentSchema;