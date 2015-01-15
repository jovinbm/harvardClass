/**
 * Created by jovinbm on 12/25/14.
 */

//var dbURL = 'mongodb://localhost:27017';
var dbURL = 'mongodb://jovinbm:paka1995@ds043210.mongolab.com:43210/harvardclass';
//var dbURL = 'mongodb://jovinbm:paka1995@ds043200.mongolab.com:43200/harvardclassdev';

var historyLimit = 40;
var usersOnline = [];
/*usersOnline object looks like this
 usersOnline = [
 {customUsername: name, lastOnline: time}
 ]*/

//THE APP
var express = require('express');
var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 3000;
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var passport = require('passport');
var OpenIDStrategy = require('passport-openid').Strategy;
var routes = require('./routes/router.js');
var api = require('./routes/api.js');
var logoutApi = require('./routes/logoutApi.js');
var basic = require('./functions/basic.js');
var online = require('./functions/online.js');
var authenticate = require('./functions/authenticate.js');
var event_handlers = require('./event_handlers/event_handlers.js');
var Question = require("./database/questions/question_model.js");
var HarvardUser = require("./database/harvardUsers/harvard_user_model.js");

var mongoose = require('mongoose');
mongoose.connect(dbURL);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    basic.consoleLogger("Successfully connected to server");
});

app.use(favicon(__dirname + '/public/favicon.ico'));
app.set('view engine', 'ejs');
app.use(logger('dev'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use("/public", express.static(path.join(__dirname, '/public')));
app.use("/bower_components", express.static(path.join(__dirname, '/bower_components')));
app.use(cookieParser());
app.use(session({
    key: 'hstatickey',
    cookie: {path: '/', httpOnly: true, secure: false, maxAge: 604800000000},
    secret: 'hssjbm12234bsidh)))^Hjdsb',
    store: new MongoStore({mongooseConnection: mongoose.connection}),
    saveUninitialized: false,
    resave: false
}));
app.use(passport.initialize());
app.use(passport.session());

//configure passport
require('./passport/passport.js')(passport, OpenIDStrategy);

app.post('/harvardId/login', passport.authenticate('openid'));
app.get('/harvardId',
    passport.authenticate('openid', {
        successRedirect: '/login1.html',
        failureRedirect: '/login.html'
    }));


//handling requests that require page change
app.get('/', routes.loginHtml);
app.get('/login.html', routes.loginHtml);
app.get('/login1.html', authenticate.ensureAuthenticated, routes.login_1_Html);
app.get('/chat.html', authenticate.ensureAuthenticated, routes.chatHtml);
app.post('/studentLogin', routes.studentLogin);
app.get('/socket.io/socket.io.js', function (req, res) {
    res.sendfile("socket.io/socket.io.js");
});

//insert any new client into a unique room = to his socketID
io.on('connection', function (socket) {

    socket.on('joinRoom', function (data) {
        socket.join(data.room);
        var room = data.room;
        var user = {
            socketId: [socket.id],
            customUsername: data.customUsername,
        };
        online.addUser(room, user);

        //emit event to continue execution on client
        socket.emit('joined');
    });

    socket.on('disconnect', function () {
        online.removeUser(socket.id);
    });

});

//handling api
app.post('/sendEmail', api.sendEmail);
app.get('/api/getMyRoom', authenticate.ensureAuthenticated, api.getMyRoom);
app.post('/api/ready', authenticate.ensureAuthenticated, api.ready);
app.post('/api/getHistory', authenticate.ensureAuthenticated, api.getHistory);
app.post('/api/newQuestion', authenticate.ensureAuthenticated, api.newQuestion);
app.post('/api/newUpvote', authenticate.ensureAuthenticated, api.newUpvote);

//handling logouts
app.post('/api/logoutHarvardLogin', authenticate.ensureAuthenticated, logoutApi.logoutHarvardLogin);
app.post('/api/logoutCustomChat', authenticate.ensureAuthenticated, logoutApi.logoutCustomChat);
app.post('/api/logoutHarvardChat', authenticate.ensureAuthenticated, logoutApi.logoutHarvardChat);

app.get('*', routes.loginHtml);

//start server
server.listen(port);

exports.io = io;
exports.historyLimit = historyLimit;