/**
 * Created by jovinbm on 12/27/14.
 */
$(document).ready(function () {

    var socket = io.connect(window.location.hostname);
    socket.emit('readyToChat');

    //define global variables
    var r_username;
    var senderName;
    var atrributeId;

    var usersOnline = [];
    var index = 14;

    //disable upvote when user clicks the upvote button on newsfeed and on on top voted column
    //they both have an upvote class
    $(".upvote").click(function () {
        var upvoteId = "." + $(this).attr('class').split(' ')[0];
        console.log(upvoteId);
        console.log($(upvoteId));
        $(upvoteId).each(function () {
            $(this).attr("disabled", "disabled");
            $(this).removeClass("btn-info").addClass("btn-warning");
        });
    });


    //makes the complete new question class
    var makeQuestionclass = function (index) {
        return "a" + index;
    };

    //makes the complete new upvote button class
    var makeUpvoteButtonClass = function (index) {
        return "a" + index + "b btn btn-info upvote";
    };

    //prepends a new message to the question feed
    function addMessage(message, questionClass, buttonclass) {
        console.log("addMessage called");
        console.log("got message: " + message);

        var nextQuestion = "<tr class=" + questionClass + "><td class='senderName'>" + senderName + "</td><td>" + message + "</td><td class='questionTime'>20:10</p></td><td align='center'><button type='button' class='" + buttonclass + "' style='width:100%'><span class='glyphicon glyphicon-thumbs-up' aria-hidden='true'></span></button></td></tr>";

        $(".question_feed").prepend(nextQuestion);
    }

    //adds a new user to the onlinne list
    function addOnline(name) {
        console.log("addOnline called");
        var newUser = "<tr><td><i class='fa fa-user'></i></td><td>" + name + "</td></tr>";
        $(".onlineUsers").prepend(newUser);
        usersOnline.push(name);
        console.log("addOnline finished");
    }

    function removeOnline(name) {
        console.log("removeOnline called");
        $(".onlineUser").each(function () {
            if ($(this).text() == name) {
                $(this).closest("tr").remove();
                console.log("removeOnline success");
            }

        });
        var index = usersOnline.indexOf(name);
        usersOnline.splice(index, 1);
    }


    function arrangeQuestions(object) {
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


            //var nextTop = "<tr class='a1"><td>How much wood could a woodchuck chuck If a woodchuck could chuck wood?As much wood as a
            //    woodchuck could chuck, If a woodchuck coul...
            //    </td>
            //    <td align='center'>
            //    <button type="button" class="a1b btn btn-info upvote" style="width:100%"><span
            //class="voteNumber">36</span></button>
            //    </td>
            //    </tr>
            //
            //
            //    $("#topQuestions").prepend(nextp);

            }
        });

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

    socket.on('serverMessage', function (content) {
        console.log("'serverMessage' event received");
        var questionIndex = makeQuestionIndex(index);
        var buttonIndex = makeUpvoteButtonIndex()
        addMessage(content, questionIndex, buttonIndex);
    });

    //receives logoutUser event from server
    socket.on('logoutUser', function (name) {
        console.log("'logout' event received");
        removeOnline(name);
    });
});