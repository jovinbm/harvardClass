$(document).ready(function () {

    var myUsername;
    var code;

    var socket = io.connect(window.location.hostname);

    socket.emit('readyToLogin');

    $("#toClass").click(function () {
        console.log("submit clicked");
        myUsername = $("#customUsername").val();
        console.log(myUsername);
        code = $("#customCode").val();
        console.log(code);
        socket.emit('readyInput', myUsername)

        return false;
    });

    socket.on('goToChat', function (content) {
        window.location.href = content;
    });

});
