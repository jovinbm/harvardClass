/**
 * Created by jovinbm on 12/29/14.
 */
//import modules
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var harvardUsersSchema = new Schema({
    openId: {type: String, default: "Anonymous", required: true, unique: false}
});

module.exports = harvardUsersSchema;