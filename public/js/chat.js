/**
 * Created by jovinbm on 12/27/14.
 */
$(document).ready(function () {
    /*IMPORTANT
     examples: questionClasses have the format a7, the corresponding buttonClass = a7b*/

    //extend the date prototype to give the name of day
    (function () {
        var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

        var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

        Date.prototype.getTodayHumanReadable = function () {
            return days[this.getDay()] + " " + months[this.getMonth()] + " " + this.getDate() + ", " + this.getFullYear();
        }
    })();


    var myGlobalUsername;
    var socketRoom;
    var onlinePollTime = 30000;
    var questionFeedDate;

    /*the redirect url for logout
     the logout URL for temp production and development purposes(uncomment one)*/
    var logoutURL = "//" + window.location.hostname;
    //var logoutURL = "//" + window.location.hostname + ":3000";

    /*myUpvotedButtonClasses is an array storing button classes corresponding to all the questions this client has upvoted. It should be updated on every start and when the arrangeQuestion function is called*/
    var myUpvotedButtonClasses = [];

    var usersOnline = [];

    /*currentQuestionIndex stores the current question index. The initial value is -1
     because the server queries results greater than -1 i.e. $gt -1 means from 0 onwards*/
    var currentQuestionIndex = -1;

    var socket = io.connect('//' + window.location.hostname);

    //MAJOR EVENTS FIRED AFTER DOCUMENT IS READY

    //send a function to get socket's room
    getMyRoom();

    socket.on('joined', function () {
        //send a readyToChat event which on success will request the recent question history
        sendReadyToChat();

        //function to notify server that I am online
        setInterval(iAmOnline, onlinePollTime);
    });


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
            for (var i = 0, len = message.length; i < len; i++) {
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

        //make sure there input is not all whitespace
        if (!(/^\s+$/.test(message))) {
            sendQuestion(questionToDatabase);
        }
        $("#qfield").val("");
        return false;
    });

    //send events on logout
    $('.logoutHarvardChat').click(function () {
        sendLogoutHarvardChat();
    });

    $('.logoutCustomChat').click(function () {
        sendLogoutCustomChat();
    });


    //DEFINING FUNCTIONS

    //function to set questionFeedDate
    function setFeedDate(theVar, new_value) {
        theVar = new_value;
        $(".questionFeedDate").text(theVar);
    }


    //function gets clients socket.io room and saves it on a cookie
    function getMyRoom() {
        $.ajax({
            url: "/getMyRoom",
            type: "POST",
            dataType: "json",
            success: function (data) {
                $.cookie('socketRoom', data.socketRoom, {expires: 7, path: '/'});
                socket.emit('joinRoom', data.socketRoom);
            }
        });
    }


    //notifies the server of the initial landing on chat page
    function sendReadyToChat() {
        $.ajax({
            url: "/readyToChat",
            type: 'POST',
            dataType: "json",
            //get the history when the readyToChat event completes

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


    //sends a clientMessage event to the server containing the new question
    function sendQuestion(askedQuestion) {
        $.ajax({
            url: "/clientMessage",
            type: "POST",
            dataType: "json",
            data: askedQuestion
        });
    }


    //sends upvote event to server
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
                window.location = logoutURL;
            }
        });
    }


    //clears only custom session
    function sendLogoutCustomChat() {
        $.ajax({
            url: "/logoutCustomChat",
            type: "POST",
            success: function () {
                window.location = logoutURL;
            }
        });
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

    //sends an event to server to notify it of the clients online activity
    function iAmOnline() {
        $.ajax({
            url: "/iAmOnline",
            type: "POST",
            dataType: "json",
            success: function (data) {
                $.cookie('socketRoom', data.socketRoom, {expires: 7, path: '/'});
            }
        });
    }


    //globally bind the upvote event handler for the pulled questions
    $("table.question_feed").delegate("button", "click", function () {
        var upvoteId = "." + $(this).attr('class').split(' ')[0];
        $(upvoteId).each(function () {
            $(this).attr("disabled", "disabled");
            $(this).removeClass("btn-info").addClass("btn-warning");
        });

        /*send upvote event with the question index(representing the question class to server;
         first check if upvoteId has 4 chars(for classes like .a4b)
         5 chars(for classes like .a40b etc*/

        //here, stringLimit = questionClass;
        var stringLimit = upvoteId.length - 1;
        console.log(upvoteId.substring(1, stringLimit));
        var questionClass = {"questionClass": upvoteId.substring(1, stringLimit)};
        sendUpvote(questionClass);
    });


    //globally bind the upvote event handler for the pulled questions
    $("table.topQuestions").delegate("button", "click", function () {
        var upvoteId = "." + $(this).attr('class').split(' ')[0];
        $(upvoteId).each(function () {
            $(this).attr("disabled", "disabled");
            $(this).removeClass("btn-info").addClass("btn-warning");
        });

        //send upvote event with the question index to server
        //var questionClass = {"questionClass": upvoteId.substring(1, stringLimit)};
        socket.emit('upvote', upvoteId.substring(1, 3));
    });


    /*adds a new user to the online list;
     onlineUsers is an array of all users that are currently online*/
    function addOnline(onlineUsers) {
        console.log("addOnline called");
        $(".onlineUsers").empty();

        /*server sends all onlineUsers Array at regular intervals;
         new users are appended*/

        onlineUsers.forEach(function (user) {
            //the online list template
            var newUser = "<tr><td class='onlineUser'><i class='fa fa-user'></i>  " + user.customUsername + "</td></tr>";
            $(".onlineUsers").prepend(newUser);
        });
    }


    /*removes users from the online list -- when a user logs out;
     note: the server sends an online event with a complete array of all currently online users
     this is only called when another client disconnects or logs out somewhere*/
    function removeOnline(name) {
        console.log("removeOnline called with name " + name);
        //cycle through all online users
        $(".onlineUser").each(function () {
            if ($(this).text() == name) {
                //remove the closest tr which carries that user
                $(this).closest("tr").remove();
            }
        });
    }


    //deals with adding history
    function addHistory(historyArray) {
        console.log("addHistory called");

        //reverse array to correct prepend-ing of the function addMessage
        historyArray.reverse();
        historyArray.forEach(function (question) {
            addMessage(question);
        });
    }


    //prepends a new message to the question feed
    function addMessage(question) {

        //change time-string from mongodb to actual time
        var mongoDate = new Date(question.time);
        var questionTime = mongoDate.getHours() + ":" + mongoDate.getMinutes();

        //change the global date variable and change feed date
        setFeedDate(questionFeedDate, mongoDate.getTodayHumanReadable());


        /*deal with the issue that a user might have upvoted a certain question already;
         intelligently extracting button class by adding 'b' to question class instead of the buttonClass key;
         here, r_buttonClass = button class used for check purposes is named;
         r_buttonClassArray = array that has the users upvoted button classes is named*/

        var r_buttonClass = question.messageClass + "b";

        var nextQuestion;
        //variable to take care of the disabled attribute of the button
        var ifDisabled;
        /*if already updated, insert a new button class with a btn-warning class, and a disabled attribute*/
        if (searchArrayIfExists(r_buttonClass, myUpvotedButtonClasses)) {
            r_buttonClass = r_buttonClass + " btn btn-warning upvote";
            ifDisabled = "disabled"
        } else {
            r_buttonClass = question.buttonClass;
            ifDisabled = "";
        }

        nextQuestion = "<tr class=" + question.messageClass + ">" +
        "<td class='col-lg-1 col-md-1 col-sm-2 col-xs-1 hidden-xs senderName'>" + question.senderName + "</td>" +
        "<td class='col-lg-9 col-md-9 col-sm-8 col-xs-11'>" + question.message + "</td>" +
        "<td class='col-lg-1 col-md-1 col-sm-1 col-xs-1 hidden-xs questionTime'>" + questionTime + "</p></td>" +
        "<td class='col-lg-1 col-md-1 col-sm-1 col-xs-1' align='center'>" +
        "<button type='button btn-xs' class='" + r_buttonClass + "' " + ifDisabled + " >" +
        "<span class='glyphicon glyphicon-thumbs-up' aria-hidden='true'></span>" +
        "</button>" +
        "</td>" +
        "</tr>";

        $(".question_feed").prepend(nextQuestion);
    }


    function arrangeQuestions(theArray) {
        $(".topQuestions").empty();
        theArray.forEach(function (question) {
            /*deal with the issue that a user might have upvoted a certain question already;
             intelligently extracting button class by adding 'b' to question class instead of the buttonClass key;
             here, r_buttonClass = button class used for check purposes is named;
             r_buttonClassArray = array that has the users upvoted button classes is named*/

            var r_buttonClass = question.messageClass + "b";
            var nextTop;
            //variable to take care of the disabled attribute of the button
            var ifDisabled;
            /*if already updated, insert a new button class with a btn-warning class, and a disabled attribute*/
            if (searchArrayIfExists(r_buttonClass, myUpvotedButtonClasses)) {
                r_buttonClass = r_buttonClass + " btn btn-warning upvote";
                ifDisabled = "disabled"
            } else {
                r_buttonClass = question.buttonClass;
                ifDisabled = "";
            }

            nextTop = "<tr class='a1'>" +
            "<td class='col-lg-10 col-md-10 col-sm-10 col-xs-11'>" + question.shortMessage + "</td>" +
            "<td class='col-lg-2 col-md-2 col-sm-2 col-xs-1' align='center'>" +
            "<button type='button btn-xs' class='" + r_buttonClass + "' " + ifDisabled + ">" +
            "<span class='voteNumber'>" + question.votes + "</span>" +
            "</button>" +
            "</td>" +
            "</tr>";

            $(".topQuestions").append(nextTop);
        });
    }


    //EVENTS

    //receives a the clients customUsername and sets it as the myGlobalUsername
    socket.on('loggedin', function (name) {
        console.log("'loggedin' event received");
        myGlobalUsername = name;
    });


    /*receive an array containing the recent history(this array has objects with individual questions) and calls 'addHistory'*/
    socket.on('serverHistory', function (historyArray) {
        console.log("'serverHistory' event received");
        addHistory(historyArray);
    });


    //receives an array containing this client's upvoted questions
    socket.on('myUpvotedButtonClasses', function (buttonClassesArray) {
        if (buttonClassesArray.length != 0) {
            myUpvotedButtonClasses = buttonClassesArray;
        }
    });


    /*receives an array (at regular intervals) containing the currently online users
     then calls 'addOnline' with the array*/
    socket.on('usersOnline', function (onlineUsers) {
        console.log("'usersOnline' event received");
        usersOnline = onlineUsers;
        addOnline(onlineUsers);
    });


    //receives an array containing the top voted questions, and calls 'arrangeQuestions'
    socket.on('arrangement', function (theArray) {
        console.log("'arrangement' event received");
        arrangeQuestions(theArray);
    });


    //receives an object containing a question to be added to the feed. Calls 'addMessage'
    socket.on('serverMessage', function (messageObject) {
        console.log("'serverMessage' event received");
        addMessage(messageObject);
    });


    /*increments currentQuestionIndex which is used to keep track of the current index the user is at*/
    socket.on('incrementCurrentIndex', function (num) {
        console.log("'incrementCurrentIndex' event received");
        currentQuestionIndex = currentQuestionIndex + num;
    });


    /*receives logoutUser event from server with the name of the client who logged out;
     then it calls 'removeOnline' to remove the name from the online list;*/
    socket.on('logoutUser', function (name) {
        console.log("'logout' event received");
        removeOnline(name);
    });
});


