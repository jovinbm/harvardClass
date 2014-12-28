/**
 * Created by jovinbm on 12/27/14.
 */
$(document).ready(function () {
    var socket = io.connect(window.location.hostname);
    socket.emit('readyToChat');

    //******define global variables************
    var myGlobalUsername;
    var usersOnline = [];

    function searchArray(name, theArray) {
        for (var j = 0; j < theArray.length; j++) {
            if (theArray[j].match(name)) {
                return false;
            }
        }
        return true;
    }

    //globally bind the upvote event hanlder for the pulled questions
    $("table.question_feed").delegate("button", "click", function () {
        console.log("TRIGGERED DELEGATE FEED!");
        console.log(this);
        var upvoteId = "." + $(this).attr('class').split(' ')[0];
        $(upvoteId).each(function () {
            $(this).attr("disabled", "disabled");
            $(this).removeClass("btn-info").addClass("btn-warning");
        });

        //send upvote event with the question index to server
        socket.emit('upvote', upvoteId.substring(1, 3));
    });

    $("table.topQuestions").delegate("button", "click", function () {
        console.log("TRIGGERED DELEGATE TOP");
        console.log(this);
        var upvoteId = "." + $(this).attr('class').split(' ')[0];
        $(upvoteId).each(function () {
            $(this).attr("disabled", "disabled");
            $(this).removeClass("btn-info").addClass("btn-warning");
        });

        //send upvote event with the question index to server
        socket.emit('upvote', upvoteId.substring(1, 3));
    });


    function loggedIn(name) {
        console.log("loggedIn called");
        var myName = "<a href='#'>" + name + "</a>";
        $('#signInName').html(myName);
        $('#logout').html("<a href='#'>Logout</a>");
    }

    //adds a new user to the onlinne list
    function addOnline(name) {
        console.log("addOnline called");

        //server sends all online users each time. searchArray makes sure           //that only
        //new users are appended
        if (searchArray(name, usersOnline)) {
            var newUser = "<tr><td><i class='fa fa-user'></i></td><td class='onlineUser'>" + name + "</td></tr>";
            $(".onlineUsers").prepend(newUser);
            usersOnline.push(name);
        }
    }

    function removeOnline(name) {
        console.log("removeOnline called with name " + name);
        $(".onlineUser").each(function () {
            if ($(this).text() == name) {
                $(this).closest("tr").remove();
            }
        });
        var index = usersOnline.indexOf(name);
        usersOnline.splice(index, 1);
    }

    //prepends a new message to the question feed
    function addMessage(messageObject) {
        var nextQuestion = "<tr class=" + messageObject.messageClass + "><td class='senderName'>" + messageObject.senderName + "</td><td>" + messageObject.message + "</td><td class='questionTime'>" + messageObject.time + "</p></td><td align='center'><button type='button' class='" + messageObject.buttonClass + "' style='width:100%'><span class='glyphicon glyphicon-thumbs-up' aria-hidden='true'></span></button></td></tr>";

        $(".question_feed").prepend(nextQuestion);
    }


    function arrangeQuestions(object) {
        $(".topQuestions").empty();
        object.forEach(function (key) {
            var nextTop = "<tr class='a1'><td>" + key.shortMessage + "</td><td align='center'><button type='button' class='" + key.buttonClass + "' style='width:100%'><span class='voteNumber'>" + key.votes + "</span></button></td></tr>";
            $(".topQuestions").append(nextTop);
        })
    }

    //deal with events

    //receives arrangement event
    socket.on('arrangement', function (object) {
        console.log("'arrangement' event received");
        arrangeQuestions(object);
    });

    //receives online event
    socket.on('online', function (name) {
        console.log("'online' event received");
        addOnline(name);
        varUsername = name;
    });

    socket.on('serverMessage', function (messageObject) {
        console.log("'serverMessage' event received");
        addMessage(messageObject);
    });

    //receives logoutUser event from server
    socket.on('logoutUser', function (name) {
        console.log("'logout' event received");
        removeOnline(name);
    });

    socket.on('loggedin', function (name) {
        myGlobalUsername = name;
        console.log("'loggedin' event received");
        loggedIn(name);
    });

    socket.on('goToLogin', function (content) {
        console.log("'goToLogin' event received");
        window.location.href = content;
    });

    //emit events on interactions
    $('#ask').click(function () {
        console.log("Clicked");
        var message = $("#qfield").val();
        var shortMessage = "";
        //trim 130 characters to be used for top voted
        if (message.length > 130) {
            for (var i = 0; i < 130; i++) {
                shortMessage = shortMessage + message[i];
            }
            shortMessage = shortMessage + "...";
        }
        else {
            for (var i = 0; i < message.length; i++) {
                shortMessage = shortMessage + message[i];
            }
        }
        var questionToDatabase = {
            'senderName': myGlobalUsername,
            'message': message,
            'shortMessage': shortMessage,
            'messageClass': '',
            'buttonClass': '',
            'votes': 0
        };

        socket.emit('clientMessage', questionToDatabase);
        $("#qfield").val("");
        return false;
    });

    $('#logout').click(function () {
        socket.emit('logout', myGlobalUsername);
    });

});


