/**
 * Created by jovinbm on 12/25/14.
 */
//import modules
var express = require('express.io');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var passport = require('passport');
var OpenIDStrategy = require('passport-openid').Strategy;
var routes = require('./routes/router.js');
var app = express().http().io();

// load the functions and event_handlers
var functions = require('./functions/functions.js');
var sessions = require('./functions/sessions.js');
var event_handlers = require('./event_handlers/event_handlers.js');

//defining database
var mongoose = require('mongoose');
//*YOUR DATABASE URL GOES HERE*
//var dbURL = 'mongodb://localhost:27017';
//var dbURL = 'mongodb://jovinbm:paka1995@ds043210.mongolab.com:43210/harvardclass';
var dbURL = 'mongodb://jovinbm:paka1995@ds043200.mongolab.com:43200/harvardclassdev';
mongoose.connect(dbURL);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function (callback) {
    console.log("Succesfully connected to server");
});
//define models
var Question = require("./database/questions/question_model.js");
var User = require("./database/users/user_model.js");
var HarvardUser = require("./database/harvardUsers/harvard_user_model.js");

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(cookieParser());
//app.use(express.session({secret: '1234567890QWERTY'}));
app.use(session({
    secret: 'no peeking',
    resave: false,
    saveUninitialized: true
}));

//require and configure passport
app.use(passport.initialize());
app.use(passport.session());
passport.use(new OpenIDStrategy({
        //returnURL: 'https://harvardclass.herokuapp.com/harvardId',
        //realm: 'https://harvardclass.herokuapp.com'

        returnURL: 'http://localhost:3000/harvardId',
        realm: 'http://localhost:3000',
        profile: true
    },
    function (identifier, profile, done) {
        console.log("*********IDENTIFIER = " + identifier);
        console.log("*********PROFILE = " + JSON.stringify(profile));
        done(null, {id: identifier, emails: profile.email, name: profile.name });
    }
));

passport.serializeUser(function (user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done){
    done(null, {id: id});
});


//define all routing
//HANDLING PASSPORT REQUESTS
app.post('/harvardId/login', passport.authenticate('openid'));
app.get('/harvardId',
    passport.authenticate('openid', {
        successRedirect: '/success',
        failureRedirect: '/failure'
    }));
app.get('/success', function (req, res, next) {
    res.send('Successfully logged in.');
});
app.get('/failure', function (req, res, next) {
    res.send("Error logging in.");
});


//handling login.html and chat.html requests
app.get('/', routes.loginHtml);
app.get('/login.html', routes.loginHtml);
app.post('/studentLogin', routes.studentLoginPost);
//app.post('/instructorLogin', routes.instructorLoginPost);
app.get('/chat.html', routes.chatHtml);

//handling css requests
app.get('/login.css', routes.loginCss);
app.get('/chat.css', routes.chatCss);

//handling js requests
app.get('/login.js', routes.loginJs);
app.get('/chat.js', routes.chatJs);

//handling the socket.io request
app.get('/socket.io/socket.io.js', routes.socketIo);

//redirect every other request to home
//app.get('*', routes.loginHtml);

//handling events
app.io.route('readyInput', function (req) {
    functions.consoleLogger('READY_INPUT event received');
    req.session.username = req.data;
    sessions.toggleLoggedInSession(req, 1);
    req.session.save();
    var r_username;
    r_username = req.session.username;
    event_handlers.readyInput(req, app, r_username);
});

app.io.route('readyToChat', function (req) {
    functions.consoleLogger('READY_TO_CHAT event received');
    var r_username;
    r_username = req.session.username;
    var r_userId = req.session.userId;
    functions.consoleLogger("r_userId = " + req.session.userId);
    event_handlers.readyToChat(req, app, r_username, r_userId);
});

app.io.route('getHistory', function (req) {
    functions.consoleLogger('READY_TO_CHAT event received');
    var r_username;
    r_username = req.session.username;
    var r_userId = req.session.userId;
    var currentQuestionIndex = req.data;
    event_handlers.getHistory(req, app, r_username, r_userId, currentQuestionIndex);
});

app.io.route('clientMessage', function (req) {
    functions.consoleLogger('CLIENT_MESSAGE event received');
    var r_username;
    r_username = req.session.username;
    var theQuestion;
    theQuestion = req.data;
    event_handlers.clientMessage(req, app, r_username, theQuestion);
});

app.io.route('upvote', function (req) {
    functions.consoleLogger('UPVOTE event received');
    var r_username;
    r_username = req.session.username;
    var r_userId = req.session.userId;

    //r_id passed from client is the questionClass
    var r_id;
    r_id = req.data;

    //make a buttonClass from r_id to be tracked per user
    var buttonClass = r_id + "b";

    //add the button Id to the user who upvoted the question
    event_handlers.upvote(req, app, r_username, r_userId, r_id, buttonClass);
});

app.io.route('logout', function (req) {
    functions.consoleLogger('LOGOUT event received');
    sessions.toggleLoggedInSession(req, 0);
    req.session.save();
    var r_username;
    r_username = req.data;
    event_handlers.logout(req, app, r_username);
});

//handle disconnections
//closed unexpectedly
app.io.route('close', function (req) {
    functions.consoleLogger('CLOSE event received');
    var r_username;
    r_username = req.session.username;
    event_handlers.close(req, app, r_username);
});

//request ended normally
app.io.route('end', function (req) {
    functions.consoleLogger('END event received');
    var r_username;
    r_username = req.session.username;
    event_handlers.close(req, app, r_username);
});


//start the server
var port = process.env.PORT || 3000;
//setup server to listen at port
app.listen(port, function () {
    console.log("Server listening on port : " + port);
});