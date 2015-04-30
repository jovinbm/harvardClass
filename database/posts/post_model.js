var mongoose = require('mongoose');
var postSchema = require('./post_schema.js');

var Post = mongoose.model('Post', postSchema);
module.exports = Post;