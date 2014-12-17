var express = require('express');
var app = express();
var app = require('express.io')();
app.http().io();

app.use(express.cookieParser());
app.use(express.session({secret: '1234567890QWERTY'}));

var port = process.env.PORT || 3000;
var usersOnline = [];
var questionIds = {};
var idIndex = 0;
var questionId;
var tempObject = [];
var tempObject5 = [];


app.io.route('readyToLogin', function (req) {
    if (req.session.lognum == 1) {
        req.io.emit("goToChat", "/chat.html");
        console.log("redirected client to chat page - user is already logged in");
    }
});



app.io.route('readyInput', function (req) {
    req.session.username = req.data;
    console.log('got readyInput status - user not logged in. User is assigned the username ' + req.session.username);
    req.session.lognum = 1;
    req.session.save(function () {
        req.io.emit("goToChat", "/chat.html");
    });
});



app.io.route('readyToChat', function (req) {
    if (req.session.lognum != 1) {
        req.io.emit("goToLogin", "/login.html");
        console.log("redirected client to login page - user not logged in");
    } else {
        var username = req.session.username;
        req.io.emit('loggedin', username);

        usersOnline.push(username);

        console.log('sent loggedin event to client with username ' + username);
        usersOnline.forEach(function(name){
            app.io.broadcast('online', name);
        });
        console.log('sent online event to all clients to add username ' + username);
    }
});


app.io.route('upvote', function (req){
    console.log("received upvote of "+ req.data);
    var upvoteId = req.data;
    console.log("adding 1 to " + upvoteId +". Current value is " + questionIds[upvoteId]);
    questionIds[upvoteId] = questionIds[upvoteId] + 1;
    console.log("The final value of " + upvoteId + " is " + questionIds[upvoteId]);
    console.log(JSON.stringify(questionIds));

    //sort function

    tempObject = [];
    for (var id in questionIds){
        tempObject.push([id, questionIds[id]]);
        tempObject.sort(function(a, b) {return a[1] - b[1]});
    }

    console.log(JSON.stringify(tempObject));

    tempObject5 = [];
    tempObject.reverse();

    tempObject.forEach(function (entry) {
        for (var i = 0; i < 5; i++) {
            tempObject5[i] = tempObject[i];
        }
    });
    app.io.broadcast('arrangement' , tempObject5);

});


app.io.route('logout', function (req) {
    var username = req.session.username;
    console.log(username + " is logging out");
    req.session.lognum = 0;
    req.session.save(function () {
        app.io.broadcast('logoutUser', username);
        req.io.emit("goToLogin", "/login.html");
        console.log("redirected client to login page due to logout");
        console.log(username + "has been logged out");
    });

    var index = usersOnline.indexOf(username);
    usersOnline.splice(index, 1);
});

app.io.route('clientMessage', function (req) {
    var content = req.data;
    console.log("got message: " + content);
    app.io.broadcast('sender', req.session.username);
    app.io.broadcast('serverMessage', content);
    console.log('emitted server message');
    questionId = "#a" + idIndex + "a";
    idIndex++;
    console.log(questionId);
    questionIds[questionId] = 0;
    console.log(questionIds[questionId]);
});

//handling login.html and chat.html requests
app.get('/', function (req, res) {
    res.sendfile("public/login.html");
});

app.get('/login.html', function (req, res) {
    res.sendfile("public/login.html");
});

app.get('/chat.html', function (req, res) {
    res.sendfile("public/chat.html");
});


//handling css requests
app.get('/css/assets/bootstrap.min.css', function (req, res) {
    res.sendfile("css/assets/bootstrap.min.css");
});

app.get('/css/custom.css', function (req, res) {
    res.sendfile("css/custom.css");
});


//handling font requests
app.get('/css/fonts/glyphicons-halflings-regular.woff', function (req, res) {
    res.sendfile("css/fonts/glyphicons-halflings-regular.woff");
});

app.get('/css/fonts/glyphicons-halflings-regular.eot', function (req, res) {
    res.sendfile("css/fonts/glyphicons-halflings-regular.eot");
});

app.get('/css/fonts/glyphicons-halflings-regular.svg', function (req, res) {
    res.sendfile("css/fonts/glyphicons-halflings-regular.svg");
});

app.get('/css/fonts/glyphicons-halflings-regular.ttf', function (req, res) {
    res.sendfile("css/fonts/glyphicons-halflings-regular.ttf");
});


//handling js requests
app.get('/js/assets/jquery-2.1.1.min.js', function (req, res) {
    res.sendfile("js/assets/jquery-2.1.1.min.js");
});

app.get('/js/assets/bootstrap.min.js', function (req, res) {
    res.sendfile("js/assets/bootstrap.min.js");
});

app.get('/js/assets/respond.js', function (req, res) {
    res.sendfile("js/assets/respond.js");
});

app.get('/js/customlogin.js', function (req, res) {
    res.sendfile("js/customlogin.js");
});

app.get('/js/customchat.js', function (req, res) {
    res.sendfile("js/customchat.js");
});



//handling the socket.io request
app.get('/socket.io/socket.io.js', function (req, res) {
    res.sendfile("socket.io/socket.io.js");
});


//setup server to listen at port
app.listen(port);
