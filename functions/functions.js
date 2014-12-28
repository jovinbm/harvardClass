/**
 * Created by jovinbm on 12/25/14.
 */
// this file defines most functions used int the project
var mongoose = require('mongoose');
//initiate the schema prototype
var Schema = mongoose.Schema;
var models = require("../database/questions/question_model.js");
var consoleLogger = function (data) {
    console.log(data);
};


module.exports = {
    consoleLogger: function (data) {
        console.log(data);
    },

    redirectUser: function () {
    },

    handleError: function () {
    },

    incrementVote: function (voteObject, voteId) {
        consoleLogger("f.incrementVote: Function 'incrementVote' called");
        consoleLogger("f.incrementVote: Increment " + voteId + ". Current value = " + voteObject[voteId]);

        voteObject[voteId] = voteObject[voteId] + 1;

        consoleLogger("f.incrementVote: The final value of " + voteId + " is " + voteObject[voteId]);
        consoleLogger("f.incrementVote: questionIds = " + JSON.stringify(voteObject));
    },

    eventEmit: function (req, serverEvent, content) {
        consoleLogger("f.eventEmit: Function 'eventEmit' called");
        req.io.emit(serverEvent, content);
    },

    eventBroadcaster: function (app, serverEvent, content) {
        consoleLogger("f.eventBroadcaster: Function 'eventBroadcaster' called");
        app.io.broadcast(serverEvent, content);
        consoleLogger("f.eventBroadcaster: Sent " + serverEvent + " with content " + content + " to all clients");
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
        if (r_username) {
            consoleLogger("f.broadcastOnlineUsers: Sent 'online' event to all clients to add username " + r_username);
        }
    }

};