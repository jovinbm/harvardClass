/**
 * Created by jovinbm on 12/25/14.
 */
//import modules
var Question = require("../database/questions/question_model.js");

//logger function
var consoleLogger = function (data) {
    console.log(data);
};

// this file defines and exports most functions used that I created
// and used in the project
module.exports = {
    // this funtion just prints on the console
    consoleLogger: function (data) {
        console.log(data);
    },

    //this funtion emits an event to the respective users
    eventEmit: function (socket, io, serverEvent, content) {
        consoleLogger("f.eventEmit: Function 'eventEmit' called");
        io.emit(serverEvent, content);
    },

    //this function emits an event to all connected users
    eventBroadcaster: function (socket, io, serverEvent, content) {
        consoleLogger("f.eventBroadcaster: Function 'eventBroadcaster' called");
        //broadcast to all sockets
        io.sockets.emit(serverEvent, content);
    },

    //this function keeps track of an array that contains names of all online users
    addOnline: function (onlineObject, r_username) {
        consoleLogger("f.addOnline: Function 'addOnline' called with username " + r_username);
        onlineObject.push(r_username);
    },

    //this function removes a person who either logged out or connection closed from the online object
    removeOnline: function (onlineObject, username) {
        consoleLogger("f.removeOnline: Function 'removeOnline' called with username " + username);
        var index = onlineObject.indexOf(username);
        onlineObject.splice(index, 1);
    },

    //this function broadcasts all online users
    broadcastOnlineUsers: function (socket, io, userOnlineObject, r_username) {
        consoleLogger("f.broadcastOnlineUsers: Function 'broadcastOnlineUsers' called");
        userOnlineObject.forEach(function (name) {
            //broadcast to all
            io.sockets.emit('online', name);
        });
    }

};