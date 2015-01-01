/** * Created by jovinbm on 12/25/14. *///import modulesvar express = require('express');var app = require('express')();var server = require('http').Server(app);var io = require('socket.io')(server);var port = process.env.PORT || 3000;var path = require('path');var favicon = require('serve-favicon');var logger = require('morgan');var cookieParser = require('cookie-parser');var bodyParser = require('body-parser');var session = require('express-session');var MongoStore = require('connect-mongo')(session);var passport = require('passport');var OpenIDStrategy = require('passport-openid').Strategy;var routes = require('./routes/router.js');// load the functions and event_handlersvar functions = require('./functions/functions.js');var event_handlers = require('./event_handlers/event_handlers.js');//defining databasevar mongoose = require('mongoose');//*YOUR DATABASE URL GOES HERE*//var dbURL = 'mongodb://localhost:27017';//var dbURL = 'mongodb://jovinbm:paka1995@ds043210.mongolab.com:43210/harvardclass';var dbURL = 'mongodb://jovinbm:paka1995@ds043200.mongolab.com:43200/harvardclassdev';mongoose.connect(dbURL);var db = mongoose.connection;db.on('error', console.error.bind(console, 'connection error:'));db.once('open', function () {    functions.consoleLogger("Succesfully connected to server");});//define modelsvar Question = require("./database/questions/question_model.js");var HarvardUser = require("./database/harvardUsers/harvard_user_model.js");// uncomment after placing your favicon in /public//app.use(favicon(__dirname + '/public/favicon.ico'));app.use(logger('dev'));app.use(bodyParser.urlencoded({extended: false}));app.use(bodyParser.json());app.use(cookieParser());app.use(session({    key: 'your.sid-key',    cookie: {path: '/', httpOnly: true, secure: false, maxAge: null},    secret: '1234567890QWERTY',    store: new MongoStore({mongooseConnection: mongoose.connection}),    saveUninitialized: false,    resave: false}));app.use(passport.initialize());app.use(passport.session());//configure passportpassport.use(new OpenIDStrategy({        returnURL: 'https://harvardclass.herokuapp.com/harvardId',        realm: 'https://harvardclass.herokuapp.com'        //returnURL: 'http://localhost:3000/harvardId',        //realm: 'http://localhost:3000/',        profile: true    },    function (identifier, profile, done) {        var id = identifier;        var displayName = profile.displayName;        var email = profile.emails[0].value;        //variable to check later if an error occurred        //0 = no error, > 0 means an error occurred        var userError = 0;        //variable to store retrieved user        var user = {};        //check if the harvard user exists, if not, add the new harvard user        HarvardUser.findOne({id: id, displayName: displayName, email: email}).exec(            function (err, theHarvardUser) {                if (err || theHarvardUser == null || theHarvardUser == undefined) {                    functions.consoleLogger("*app.js: passport: HarvardUser.findOne: " + err);                    user = new HarvardUser({                        id: id,                        displayName: displayName,                        email: email                    });                    user.save(function (err, savedUser) {                        if (err) {                            functions.consoleLogger("ERROR: app.js: passport: user.save: " + err);                            userError++;                        } else {                            //put all details of this user in the database into the user variable                            user = savedUser;                            done(null, user);                        }                    });                } else {                    //put all details of this user in the database into the user variable                    user = theHarvardUser;                    //userError will be 0 only if no error occurred                    if (userError == 0) {                        //the user object passed here will be available in the req object as req.user                        done(null, user);                    } else {                        //means error occurred                        done(new Error("ERROR: app.js: passport.use: Error saving/ retrieving info"));                    }                }            }        );    }));passport.serializeUser(function (user, done) {    //only save the userId into the session to keep the data stored low    done(null, user.id);});passport.deserializeUser(function (id, done) {    //deserialize the saved id in session and find the user with the userId    //variable to check later if an error occurred    //0 = no error, > 0 means an error occurred    var userError = 0;    //variable to store retrieved user    var user = {};    HarvardUser.findOne({id: id}).exec(        function (err, theSavedUser) {            if (err || theSavedUser == null || theSavedUser == undefined) {                functions.consoleLogger("passport.desserializeUser: findOne: " + err);                userError++;            } else {                user = theSavedUser;            }            if (userError == 0) {                done(null, user);            } else {                //means error occurred                done(new Error("ERROR: app.js: passport.deserializeUser: Error retrieving info"));            }        }    );});//function to determine authenticityfunction ensureAuthenticated(req, res, next) {    if (req.isAuthenticated()) {        next()    } else {        res.redirect('login.html');    }}//define all routing//HANDLING PASSPORT REQUESTSapp.post('/harvardId/login', passport.authenticate('openid'));app.get('/harvardId',    passport.authenticate('openid', {        successRedirect: '/login1.html',        failureRedirect: '/login.html'    }));//handling login.html and chat.html requests;app.get('/', routes.loginHtml);app.get('/login.html', routes.loginHtml);app.get('/login1.html', ensureAuthenticated, routes.login_1_Html);app.get('/chat.html', ensureAuthenticated, routes.chatHtml);//handling css requestsapp.get('/login.css', routes.loginCss);app.get('/chat.css', routes.chatCss);//handling js requestsapp.get('/login.js', routes.loginJs);app.get('/chat.js', routes.chatJs);//handling the socket.io requestapp.get('/socket.io/socket.io.js', routes.socketIo);io.on('connection', function (socket) {    //HANDLING POST EVENTS    app.post('/studentLogin', routes.studentLoginPost);    app.post('/readyToChat', function (req, res) {        functions.consoleLogger('READY_TO_CHAT event received');        var openId = req.user.id;        //retrieve the customUsername        HarvardUser.findOne({id: openId}, {customUsername: 1}).exec(function (err, theUser) {            if (err) {                functions.consoleLogger("ERROR: socket.on: readyToChat: user retrieval: " + err);            } else {                var r_username = theUser.customUsername;                event_handlers.readyToChat(req, res, r_username, openId, socket, io);            }        });    });    app.post('/getHistory', function (req, res) {        //complete the ajax request first to avoid multiple ajax requests        res.contentType('json');        res.send({ status: JSON.stringify({response:'success'}) });        functions.consoleLogger('GETHISTORY event received');        var openId = req.user.id;        //retrieve the customUsername        HarvardUser.findOne({id: openId}, {customUsername: 1}).exec(function (err, theUser) {            if (err) {                functions.consoleLogger("ERROR: socket.on: getHistory: user retrieval: " + err);            } else {                var r_username = theUser.customUsername;                //get the current question index passes by the post request                var currentQuestionIndex = req.body.currentQuestionIndex;                event_handlers.getHistory(req, res, r_username, openId, currentQuestionIndex, socket, io);            }        });    });    app.post('/clientMessage', function (req, res) {        //complete the ajax request first to avoid multiple ajax requests        res.contentType('json');        res.send({ status: JSON.stringify({response:'success'}) });        functions.consoleLogger('CLIENT_MESSAGE event received');        //the openId here is used to track who asked which questions        var openId = req.user.id;        //retrieve the customUsername        HarvardUser.findOne({id: openId}, {customUsername: 1}).exec(function (err, theUser) {            if (err) {                functions.consoleLogger("ERROR: socket.on: clientMessage: user retrieval: " + err);            } else {                var r_username = theUser.customUsername;                var theQuestion = req.body;                event_handlers.clientMessage(req, res, r_username, theQuestion, openId, socket, io);            }        });    });    app.post('/upvote', function (req, res) {        //complete the ajax request first to avoid multiple ajax requests        res.contentType('json');        res.send({ status: JSON.stringify({response:'success'}) });        functions.consoleLogger('UPVOTE event received');        var openId = req.user.id;        HarvardUser.findOne({id: openId}, {customUsername: 1}).exec(function (err, theUser) {            if (err) {                functions.consoleLogger("ERROR: socket.on: upvote: user retrieval: " + err);            } else {                var r_username = theUser.customUsername;                //r_id here = questionClass passed from the client                var r_id;                r_id = req.body.questionClass;                //make a buttonClass from r_id to be tracked per user                var buttonClass = r_id + "b";                //add the button Id to the user who upvoted the question                event_handlers.upvote(req, res, r_username, openId, r_id, buttonClass, socket, io);            }        });    });    app.post('/logout', function (req, res) {        //no need to complete the ajax request -- user will be redirected to login which has it's        //own js file        functions.consoleLogger('LOGOUT event received');        var openId = req.user.id;        //retrieve the customUsername        HarvardUser.findOne({id: openId}, {customUsername: 1}).exec(function (err, theUser) {            if (err) {                functions.consoleLogger("ERROR: socket.on: logout: user retrieval: " + err);            } else {                var r_username = theUser.customUsername;                //change the value of customLoggedInStatus of the user in database                HarvardUser.update({id: openId}, {$set: {customLoggedInStatus: 0}}).exec(function (err, theUser) {                    if (err) {                        functions.consoleLogger("ERROR: socket.on: logout: user retrieval: " + err);                    } else {                        event_handlers.logout(req, res, r_username, socket, io);                    }                });            }        });    });    //redirect every other request to home    app.get('*', routes.loginHtml);});//start serverserver.listen(port);