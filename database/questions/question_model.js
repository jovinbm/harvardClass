/**
 * Created by jovinbm on 12/27/14.
 */
var mongoose = require('mongoose');
//initiate the schema prototype
var Schema = mongoose.Schema;

var questionSchema = require('./question_schema.js');

var Question = mongoose.model('Question', questionSchema);

module.exports = Question;