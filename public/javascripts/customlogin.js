$(document).ready(function () {

    var myUsername;
    var code;

    var socket = io.connect(window.location.hostname);

    $("#toClass").click(function () {
        myUsername = $("#customUsername").val();
        code = $("#customCode").val();
        socket.emit('readyInput', myUsername)

        return false;
    });

    socket.on('goToChat', function (content) {
        window.location.replace(content);
    });

});