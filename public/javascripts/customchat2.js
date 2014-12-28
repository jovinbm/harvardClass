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

    //disables upvoting twice
    $(".upvote").click(function () {
        var upvoteId = "." + $(this).attr('class').split(' ')[0];
        console.log(upvoteId);
        console.log($(upvoteId));
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

        //server sends all online users each time. searchArray makes sure that only
        //new users are appended
        if (searchArray(name, usersOnline)) {
            var newUser = "<tr><td><i class='fa fa-user'></i></td><td class='onlineUser'>" + name + "</td></tr>";
            $(".onlineUsers").prepend(newUser);
            usersOnline.push(name);
            console.log("addOnline finished");
        }
    }

    function removeOnline(name) {
        console.log("removeOnline called with name " + name);
        console.log(JSON.stringify(usersOnline));
        $(".onlineUser").each(function () {
            if ($(this).text() == name) {
                $(this).closest("tr").remove();
                console.log("removeOnline success");
            }
        });
        var index = usersOnline.indexOf(name);
        usersOnline.splice(index, 1);
        console.log(JSON.stringify(usersOnline));
    }

    //prepends a new message to the question feed
    function addMessage(messageObject) {
        console.log("addMessage called");
        console.log("got message: " + JSON.stringify(messageObject));

        var nextQuestion = "<tr class=" + messageObject.messageClass + "><td class='senderName'>" + messageObject.senderName + "</td><td>" + messageObject.message + "</td><td class='questionTime'>" + messageObject.time + "</p></td><td align='center'><button type='button' class='" + messageObject.buttonClass + "' style='width:100%'><span class='glyphicon glyphicon-thumbs-up' aria-hidden='true'></span></button></td></tr>";

        $(".question_feed").prepend(nextQuestion);
    }


    function arrangeQuestions(object) {
        console.log("arrangeQuestions called on " + JSON.stringify(obj));
        //$("#topQuestions").empty();
        //
        //obj.reverse();
        //
        //obj.forEach(function (entry) {
        //    if (entry) {
        //        var cloneId = entry[0].substring(0, 3);
        //        console.log(cloneId);
        //        var cloneUpVotes = entry[1];
        //        console.log(cloneUpVotes);
        //
        //        var votes = cloneUpVotes;
        //
        //        var nextp = "<p>" + $(cloneId).text() + "<span class='input-group-btn'><button class='btn btn-info btn-xs' type='button'><span class='glyphicon glyphicon-arrow-up'></span>Number of Votes<span class='input-group-btn'><button class='btn btn-info btn-warning btn-xs' type='button'>" + votes + "</button></span></button></span></p>";
        //
        //
        //        var nextTop = "<tr class='a1"><td>How much wood could a woodchuck chuck If a woodchuck could chuck wood?As much wood as a
        //            woodchuck could chuck, If a woodchuck coul...
        //            </td>
        //            <td align='center'>
        //            <button type="button" class="a1b btn btn-info upvote" style="width:100%"><span
        //        class="voteNumber">36</span></button>
        //            </td>
        //            </tr>
        //
        //
        //            $("#topQuestions").prepend(nextp);
        //
        //    }
        //});

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
        else{
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
        console.log("logout clicked");
        socket.emit('logout', myGlobalUsername);
        console.log("sent 'logout' emit to server");
    });

});


