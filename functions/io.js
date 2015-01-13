/**
 * Created by jovinbm on 1/4/15.
 */

/*Defines functions to deal with emitting
 * io events*/
var app = require('../app.js');
var basic = require('../functions/basic.js');

module.exports = {

    //this funtion emits an event to the respective user
    emitToOne: function (socketRoom, serverEvent, content, success) {
        app.io.sockets.in(socketRoom).emit(serverEvent, content);
        if (success) {
            success();
        }
    },


    //this function emits an event to all connected users
    emitToAll: function (serverEvent, content, success) {
        app.io.emit(serverEvent, content);
        if (success) {
            success();
        }
    }

};