var mongoose = require('mongoose');
var commentSchema = require('./comment_schema.js');

var Comment = mongoose.model('Comment', commentSchema);
module.exports = Comment;