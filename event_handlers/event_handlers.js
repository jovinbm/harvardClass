/**
 * Created by jovinbm on 12/25/14.
 */
//import all functions
var functions = require('../functions/functions.js');
var sessions = require('../functions/sessions.js');

var usersOnline = [];
var questionIds = {};
var idIndex = 0;
var questionId;
var tempObject = [];
var tempObject5 = [];


//define all the event handlers

module.exports = {
    readyInput: function (req, app, r_username) {
        functions.consoleLogger('readyInput: READY_INPUT event handler called');
        functions.eventEmit(req, "goToChat", "/chat.html");
        functions.consoleLogger("readyInput: Saved the new session");
        functions.consoleLogger('readyInput: r_username = ' + r_username);
        functions.consoleLogger('readyInput: req.session.loggedInStatus = ' + req.session.loggedInStatus);

        functions.consoleLogger('readyInput: DONE');
    },

    readyToChat: function (req, app, r_username) {
        functions.consoleLogger('readyToChat: READY_TO_CHAT event handler called');
        functions.consoleLogger('readyToChat: r_username = ' + r_username);
        functions.eventEmit(req, 'loggedin', r_username);
        functions.addOnline(usersOnline, r_username);
        functions.consoleLogger('readyToChat: usersOnline array =  ' + usersOnline);
        functions.broadcastOnlineUsers(app, usersOnline, r_username);

        functions.consoleLogger('readyToChat: DONE');
    },

    clientMessage: function (req, app, r_username, r_question) {
        functions.consoleLogger('clientMessage: CLIENT_MESSAGE event handler called');
        functions.consoleLogger("clientMessage: Question received: " + r_question);

        functions.eventBroadcaster(app, 'sender', r_username);
        functions.eventEmit(app, 'sender', r_username);
        functions.eventBroadcaster(app, 'serverMessage', r_username);
        functions.eventEmit(app, 'serverMessage', r_username);

        questionId = functions.makeQuestionId(idIndex);
        functions.consoleLogger("clientMessage: Generated the index " + idIndex);
        functions.consoleLogger(questionId);
        idIndex++;

        //forgot what this does
        questionIds[questionId] = 0;
        functions.consoleLogger(questionIds[questionId]);

        functions.consoleLogger('clientMessage: DONE');
    },

    upvote: function (req, app, r_username, r_id) {
        functions.consoleLogger('upvote: UPVOTE event handler called');
        functions.consoleLogger("upvote: Received upvote of " + r_id);
        functions.incrementVote(questionIds, r_id);

        //this function sorts and broadcasts automatically
        functions.sortQuestionsByID(app, questionIds);

        functions.consoleLogger('upvote: DONE');
    },

    logout: function (req, app, r_username) {
        functions.consoleLogger('LOGOUT event handler called');
        functions.consoleLogger("logout: " + r_username + " is logging out");
        functions.eventBroadcaster(app, 'logoutUser', r_username);
        functions.eventEmit(req, "goToLogin", "/login.html");
        functions.consoleLogger("logout: Redirected client to login.html page due to logout");
        functions.removeOnline(usersOnline, r_username);

        functions.consoleLogger('logout: DONE');
    }

};