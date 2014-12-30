/**
 * Created by jovinbm on 12/29/14.
 */
//import modules
var mongoose = require('mongoose');
var userSchema = require('./user_schema.js');

var User = mongoose.model('User', userSchema);
module.exports = User;