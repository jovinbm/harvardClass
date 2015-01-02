/**
 * Created by jovinbm on 12/27/14.
 */
$(document).ready(function () {
    //IMPORTANT
    //examples: questionClasses have the format a7, the corresponding buttonClass = a7b

    var myGlobalUsername;
    var onlinePollTime = 30000;

    //myUpvotedQuestions is an array storing all my currently upvoted questions. It should be updated
    //on every start and when the arrangeQuestion function is called
    var myUpvotedQuestions = [];

    var usersOnline = [];

    // currentQuestionIndexstores the current question index. The initial value is -1
    // because the server queries results greater than -1 i.e. $gt -1 means from 0 onwards
    var currentQuestionIndex = -1;

    var socket = io.connect('//' + window.location.hostname);

    //send a readyToChat event which on succes will request the recent
    //question history
    sendReadyToChat();

    setInterval(iAmOnline, onlinePollTime);


    //INTERACTIONS
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
            "senderName": myGlobalUsername,
            "message": message,
            "shortMessage": shortMessage,
            "messageClass": "",
            "buttonClass": "",
            "votes": 0
        };

        sendQuestion(questionToDatabase);
        $("#qfield").val("");
        return false;
    });

    $('.logoutHarvardChat').click(function () {
        sendLogoutHarvardChat();
    });

    $('.logoutCustomChat').click(function () {
        sendLogoutCustomChat();
    });


    //DEFINING FUNCTIONS

    function sendReadyToChat() {
        $.ajax({
            url: "/readyToChat",
            type: 'POST',
            dataType: "json",
            data: {"name": "jovin"},
            complete: function sendGetHistory() {
                $.ajax({
                    url: "/getHistory",
                    type: 'POST',
                    dataType: "json",
                    data: {"currentQuestionIndex": currentQuestionIndex}
                });
            }
        })
    }


    function sendQuestion(askedQuestion) {
        $.ajax({
            url: "/clientMessage",
            type: "POST",
            dataType: "json",
            data: askedQuestion
        });
    }


    function sendUpvote(questionClass) {
        $.ajax({
            url: "/upvote",
            type: "POST",
            dataType: "json",
            data: questionClass
        });
    }


    //clears both custom and harvard session
    function sendLogoutHarvardChat() {
        $.ajax({
            url: "/logoutHarvardChat",
            type: "POST",
            success: function () {
                window.location = '//' + window.location.hostname;
                //window.location = '//' + window.location.hostname + ':3000';
            }
        });
    }


    //clears only custom session
    function sendLogoutCustomChat() {
        $.ajax({
            url: "/logoutCustomChat",
            type: "POST",
            success: function () {
                window.location = '//' + window.location.hostname;
                //window.location = '//' + window.location.hostname + ':3000';
            }
        });
    }


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

    function iAmOnline(){
        $.ajax({
            url: "/iAmOnline",
            type: "POST"
        });
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
        var questionClass = {"questionClass": upvoteId.substring(1, stringLimit)};
        sendUpvote(questionClass);
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
    function addOnline(onlineUsers) {
        console.log("addOnline called");
        $(".onlineUsers").empty();
        //server sends all onlineUsers Array at regular intervals
        //new users are appended
        onlineUsers.forEach(function(user){
            var newUser = "<tr><td><i class='fa fa-user'></i></td><td class='onlineUser'>" + user.customUsername + "</td></tr>";
            $(".onlineUsers").prepend(newUser);
        });
    }


    function removeOnline(name) {
        console.log("removeOnline called with name " + name);
        $(".onlineUser").each(function () {
            if ($(this).text() == name) {
                $(this).closest("tr").remove();
            }
        });
    }


    //prepends a new message to the question feed
    function addMessage(key) {

        //change timestring from mongodb to actual time
        var mongoDate = new Date(key.time);
        var questionTime = mongoDate.getHours() + ":" + mongoDate.getMinutes();

        //deal with the issue that a user might have upvoted a certain question already
        //intelligently extracting button class by adding 'b' to question class instead of the buttonClass key
        //here the button class used for check purposes is named r_buttonClass
        //and the array that has the users upvoted button classes is named r_buttonClassArray
        var r_buttonClass = key.messageClass + "b";
        //check that the votedButtonClass array has something
        if (key.votedButtonClasses.length != 0) {
            myUpvotedQuestions = key.votedButtonClasses;
        }

        var nextQuestion;
        //if already updated, insert a new button class with a btn-warning class, and a disabled attribute
        if (searchArrayIfExists(r_buttonClass, myUpvotedQuestions)) {
            r_buttonClass = r_buttonClass + " btn btn-warning upvote";

            nextQuestion = "<tr class=" + key.messageClass + "><td class='col-md-2 senderName'>" + key.senderName + "</td><td class='col-md-8'>" + key.message + "</td><td class='col-md-1 questionTime'>" + questionTime + "</p></td><td class='col-md-1' align='center'><button type='button' class='" + r_buttonClass + "' style='width:100%' disabled><span class='glyphicon glyphicon-thumbs-up' aria-hidden='true'></span></button></td></tr>";
            $(".question_feed").prepend(nextQuestion);
        } else {
            nextQuestion = "<tr class=" + key.messageClass + "><td class='col-md-2 senderName'>" + key.senderName + "</td><td class='col-md-8'>" + key.message + "</td><td class='col-md-1 questionTime'>" + questionTime + "</p></td><td class='col-md-1' align='center'><button type='button' class='" + key.buttonClass + "' style='width:100%'><span class='glyphicon glyphicon-thumbs-up' aria-hidden='true'></span></button></td></tr>";
            $(".question_feed").prepend(nextQuestion);
        }
    }


    //deals with adding history
    function addHistory(historyArray) {
        console.log("addHistory called");

        //reverse array to correct prepending of the function addMessage
        historyArray.reverse();
        historyArray.forEach(function (key) {
            addMessage(key);
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
            if (key.votedButtonClasses.length != 0) {
                myUpvotedQuestions = key.votedButtonClasses;
            }
            var nextTop;

            //if already updated, insert a new button class with a btn-warning class, and a disabled attribute
            if (searchArrayIfExists(r_buttonClass, myUpvotedQuestions)) {
                r_buttonClass = r_buttonClass + " btn btn-warning upvote";
                nextTop = "<tr class='a1'><td>" + key.shortMessage + "</td><td align='center'><button type='button' class='" + r_buttonClass + "' style='width:100%' disabled><span class='voteNumber'>" + key.votes + "</span></button></td></tr>";
                $(".topQuestions").append(nextTop);
            } else {
                nextTop = "<tr class='a1'><td>" + key.shortMessage + "</td><td align='center'><button type='button' class='" + key.buttonClass + "' style='width:100%'><span class='voteNumber'>" + key.votes + "</span></button></td></tr>";
                $(".topQuestions").append(nextTop);
            }
        })
    }


    //EVENTS

    socket.on('myUpvotedQuestions', function (myUpvoted) {
        if (myUpvoted.length != 0) {
            myUpvotedQuestions = myUpvoted;
        }
    });


    socket.on('arrangement', function (theArray) {
        console.log("'arrangement' event received");
        arrangeQuestions(theArray);
    });


    //receives online event
    socket.on('usersOnline', function (onlineUsers) {
        console.log("'usersOnline' event received");
        usersOnline = onlineUsers;
        addOnline(onlineUsers);
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
});


