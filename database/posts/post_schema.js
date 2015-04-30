var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var postSchema = new Schema({
    uniqueId: {type: String, required: true, unique: true, index: true},
    postIndex: {type: Number, default: 0, required: true, unique: true, index: true},
    authorName: {type: String, required: true, unique: false, index: true},
    authorUsername: {type: String, required: true, unique: false, index: true},
    authorEmail: {type: String, required: true, unique: false, index: true},
    authorUniqueCuid: {type: String, required: true, unique: false, index: true},
    heading: {type: String, required: true},
    thePost: {type: String, required: true},
    createdAt: {type: Date, default: Date.now, index: true},
});

module.exports = postSchema;