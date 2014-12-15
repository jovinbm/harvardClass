$(document).ready(function () {

    var myUsername;
    var atrributeId;
    var whichUpvote;

    var usersOnline = [];
    var index = 0;

    function searchArray(name, theArray) {
        for (var j = 0; j < theArray.length; j++) {
            if (theArray[j].match(name)) {
                return false;
            }
        }
        return true;
    }


    function addMessage(message) {
        console.log("addMessage called");
        console.log("got message: " + message);

        attributeId2 = "a" + index + "a";

        var nextq = "<tr><td width = '103.156px'><button class='btn btn-info btn-xs' type='button'>" + myUsername + "</button></td><td id='a" + index + "'>" + message + "</td><td width='12px'><button id='" + attributeId2 + "' class='btn btn-info btn-xs buttonglyph' type='button'><span class='glyphicon glyphicon-arrow-up'></span></button></td></tr>";

        attributeId2 = "#a" + index + "a";

        $("#thomas").prepend(nextq);

        attributeId = "#a" + index;

        console.log(attributeId);
        console.log(attributeId2);
        $(attributeId2).bind("click", function () {
            $(this).removeClass("btn-info");
            $(this).addClass("btn-warning");
            $(this).attr("disabled", "disabled");
            console.log("upvote clicked");
            whichUpvote = "#" + $(this).attr("id");
            console.log(whichUpvote);

            socket.emit("upvote", whichUpvote);
            console.log("sent upvote to server");
        });

        index++;
    }

    function addOnline(username) {
        console.log("addOnline called");
        if (searchArray(username, usersOnline)) {
            var newUser = "<p><span class='glyphicon glyphicon-user online'></span>" + username + "</p>";
            $("#onlineUsers").prepend(newUser);

            usersOnline.push(username);

            console.log("addOnline finished");
        }
    }

    function removeOnline(username) {
        console.log("removeOnline called");
        $(".glyphicon-user").each(function () {
            if ($(this).parent().text() == username) {
                $(this).parent().remove();
                console.log("removeOnline success");
            }

        });
        var index = usersOnline.indexOf(username);
        usersOnline.splice(index, 1);
    }

    function arrangeQuestions(obj) {
        console.log("arrangeQuestions called on " + JSON.stringify(obj));
        $("#topQuestions").empty();

        obj.reverse();

        obj.forEach(function (entry) {
            if (entry) {
                var cloneId = entry[0].substring(0, 3);
                console.log(cloneId);
                var cloneUpVotes = entry[1];
                console.log(cloneUpVotes);

                var votes = cloneUpVotes;

                var nextp = "<p>" + $(cloneId).text() + "<span class='input-group-btn'><button class='btn btn-info btn-xs' type='button'><span class='glyphicon glyphicon-arrow-up'></span>Number of Votes<span class='input-group-btn'><button class='btn btn-info btn-warning btn-xs' type='button'>" + votes + "</button></span></button></span></p>";


                $("#topQuestions").prepend(nextp);

            }
        });

    }


    function loggedIn(content) {
        console.log("loggedIn called");
        var name = content;
        $('#signInName').html(content);
        $('#logout').html("Logout");
    }

    var socket = io.connect('http://localhost:3000');
    socket.emit('readyToChat');


    socket.on('arrangement', function (content) {
        console.log("arrangement event received from server");
        arrangeQuestions(content);
    });

    socket.on('serverMessage', function (content) {
        addMessage(content);
    });

    socket.on('online', function (content) {
        addOnline(content);
        myUsername = content;
    });

    socket.on('sender', function(content){
        myUsername = content;
    });

    socket.on('loggedin', function (content) {
        loggedIn(content);
    });

    socket.on('logoutUser', function (content) {
        console.log("logout emit received from server");
        removeOnline(content);
    });

    socket.on('goToLogin', function (content) {
        window.location.href = content;
    });


    $('#ask').click(function () {
        console.log("Clicked");

        var toServer = $("#qfield").val();

        socket.emit('clientMessage', toServer);
        console.log("sent " + toServer + " to server");
        $("#qfield").val("");
        return false;
    });

    $('#logout').click(function () {
        console.log("logout clicked");
        socket.emit('logout', myUsername);
        console.log("sent logout emit to server");
    });

});
