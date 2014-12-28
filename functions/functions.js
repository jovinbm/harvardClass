/**
 * Created by jovinbm on 12/25/14.
 */

var mongoose = require('mongoose');
//initiate the schema prototype
var Schema = mongoose.Schema;
var models = require("../database/questions/question_model.js");
var consoleLogger = function (data) {
    console.log(data);
};

// ********this file defines and exports most functions used that I created
// ********* and used in the project
module.exports = {
    consoleLogger: function (data) {
        console.log(data);
    },

    redirectUser: function () {
    },

    handleError: function () {
    },

    eventEmit: function (req, serverEvent, content) {
        consoleLogger("f.eventEmit: Function 'eventEmit' called");
        req.io.emit(serverEvent, content);
    },

    eventBroadcaster: function (app, serverEvent, content) {
        consoleLogger("f.eventBroadcaster: Function 'eventBroadcaster' called");
        app.io.broadcast(serverEvent, content);
    },

    addOnline: function (onlineObject, r_username) {
        consoleLogger("f.addOnline: Function 'addOnline' called with username " + r_username);
        onlineObject.push(r_username);
    },

    removeOnline: function (onlineObject, username) {
        consoleLogger("f.removeOnline: Function 'removeOnline' called with username " + username);
        var index = onlineObject.indexOf(username);
        onlineObject.splice(index, 1);
    },


    broadcastOnlineUsers: function (app, userOnlineObject, r_username) {
        consoleLogger("f.broadcastOnlineUsers: Function 'broadcastOnlineUsers' called");
        userOnlineObject.forEach(function (name) {
            consoleLogger(name);
            app.io.broadcast('online', name);
        });
    }

};