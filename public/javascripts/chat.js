/**
 * Created by jovinbm on 12/27/14.
 */
$(document).ready(function () {
    //******define global variables************

    //IMPORTANT
    //examples: questionClasses have the format a7, the corresponding buttonClass = a7b

    var myGlobalUsername;

    //myUpvotedQuestions is an array storing all my currently upvoted questions. It should be updated
    //on every start and when the arrangeQuestion function is called
    var myUpvotedQuestions = [];
    var usersOnline = [];
    //stores the current question index
    var currentQuestionIndex = 0;

    var socket = io.connect(window.location.hostname);
    socket.emit('readyToChat');

    socket.emit('getHistory', currentQuestionIndex);

    //defining functions

    //returns true only if 'name' DOESN'T exist in 'theArray
    function searchArray(name, theArray) {
        for (var j = 0; j < theArray.length; j++) {
            if (theArray[j].match(name)) {
                return false;
            }
        }
        return true;
    }

    //returns true only if 'name' EXISTS in 'theArray
    function searchArrayIfExists(name, theArray) {
        for (var j = 0; j < theArray.length; j++) {
            if (theArray[j].match(name)) {
                return true;
            }
        }
        return false;
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

        //send upvote event with the question index(representing the question class to server
        // first check if upvoteId has 4 chars(for classes like .a4b)
        //5 chars(for classes like .a40b etc

        //stringLimit = questionClass;
        var stringLimit = upvoteId.length - 1;
        console.log(upvoteId.substring(1, stringLimit));
        socket.emit('upvote', upvoteId.substring(1, stringLimit));
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

        //server sends all online users each time. searchArray makes sure that only
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

        //change timestring from mongodb to actual time
        var mongoDate = new Date(messageObject.time);
        var questionTime = mongoDate.getHours() + ":" + mongoDate.getMinutes();

        var nextQuestion = "<tr class=" + messageObject.messageClass + "><td class='senderName'>" + messageObject.senderName + "</td><td>" + messageObject.message + "</td><td class='questionTime'>" + questionTime + "</p></td><td align='center'><button type='button' class='" + messageObject.buttonClass + "' style='width:100%'><span class='glyphicon glyphicon-thumbs-up' aria-hidden='true'></span></button></td></tr>";

        $(".question_feed").prepend(nextQuestion);
    }

    //deals with adding history
    function addHistory(historyArray) {
        console.log("addHistory called");

        //reverse array to correct prepending of the function addMessage
        historyArray.reverse();
        historyArray.forEach(function (messageObject) {
            addMessage(messageObject);
        });
    }


    function arrangeQuestions(theArray) {
        $(".topQuestions").empty();
        theArray.forEach(function (key) {
            //deal with the issue that a user might have upvoted a certain question already
            //intelligently extracting button class by adding 'b' to question class instead of the buttonClass key
            //here the button class used for check purposes is named r_buttonClass
            //and the array that has the users upvoted button classes is named r_buttonClassArray
            var r_buttonClass = key.messageClass + "b";
            //check that the votedButtonClass array has something
            if(key.votedButtonClasses.length != 0) {
                myUpvotedQuestions = key.votedButtonClasses;
            }
            var nextTop;

            if(searchArrayIfExists(r_buttonClass, myUpvotedQuestions)){
               nextTop = "<tr class='a1'><td>" + key.shortMessage + "</td><td align='center'><button type='button' class='" + key.buttonClass + "' style='width:100%' disabled><span class='voteNumber'>" + key.votes + "</span></button></td></tr>";
                $(".topQuestions").append(nextTop);
            }else{
                nextTop = "<tr class='a1'><td>" + key.shortMessage + "</td><td align='center'><button type='button' class='" + key.buttonClass + "' style='width:100%'><span class='voteNumber'>" + key.votes + "</span></button></td></tr>";
                $(".topQuestions").append(nextTop);
            }
        })
    }

    //deal with events

    //receives arrangement event
    socket.on('arrangement', function (theArray) {
        console.log("'arrangement' event received");
        arrangeQuestions(theArray);
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

    //receive recent history
    socket.on('serverHistory', function (historyArray) {
        console.log("'serverHistory' event received");
        addHistory(historyArray);
    });

    //increments currentQuestionIndex
    socket.on('incrementCurrentIndex', function (num) {
        console.log("'incrementCurrentIndex' event received");
        currentQuestionIndex = currentQuestionIndex + num;
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


